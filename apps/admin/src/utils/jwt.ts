import crypto from "node:crypto";

function getEnvJwtSecret() {
  try {
    const secret = process.env.JWT_SECRET?.trim();

    if (secret) {
      return secret;
    }
  } catch {
    // ignore process env access errors and fall through
  }

  return undefined;
}

export async function getJwtSecret() {
  try {
    const { env } = await import("@repo/env/admin");

    if (env.JWT_SECRET?.trim()) {
      return env.JWT_SECRET;
    }
  } catch {
    // fall back for local/test if env validation import fails
  }

  return getEnvJwtSecret() || "local-test-jwt-secret";
}// User real secret if available, else safe fallback for local tests. This prevented creashes

function toBase64Url(value: string) { //encodes JWT pieces
  return Buffer.from(value, "utf8").toString("base64url");
}// JWT structure: header.payload.signature

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

async function createSignature(header: string, payload: string) {
  const secret = await getJwtSecret();

  return crypto
    .createHmac("sha256", secret) // Create secure signature
    .update(`${header}.${payload}`)
    .digest("base64url");
}

export async function createAuthToken() { // Create token
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" })); //Header
  const payload = toBase64Url(JSON.stringify({ password: "123" }));//Payload
  const signature = await createSignature(header, payload);

  return `${header}.${payload}.${signature}`;
}

export async function verifyAuthToken(token: string) {
  const parts = token.split(".");

  if (parts.length !== 3) { // check format valid
    throw new Error("Invalid token format");
  }

  const [header, payload, signature] = parts;

  if (!header || !payload || !signature) {
    throw new Error("Invalid token structure");
  }

  const expectedSignature = await createSignature(header, payload);// Recompute signature
  const providedSignature = Buffer.from(signature, "utf8");
  const computedSignature = Buffer.from(expectedSignature, "utf8");

  if (providedSignature.length !== computedSignature.length) {
    throw new Error("Invalid token signature");
  }

  if (!crypto.timingSafeEqual(providedSignature, computedSignature)) { // Compare safely
    throw new Error("Invalid token signature");
  }

  const decodedPayload = JSON.parse(fromBase64Url(payload)) as {
    password?: string;
  };

  if (decodedPayload.password !== "123") { //Decode payload
    throw new Error("Invalid token payload");
  }

  return decodedPayload;
}
