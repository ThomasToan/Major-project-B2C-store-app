import { revalidatePath } from "next/cache";
import { cookies } from "next/headers"; // impports server-side cookies access
import { createAuthToken, verifyAuthToken } from "./jwt";

export async function isLoggedIn() { // auth checking
  const userCookies = await cookies(); // get the current cookie store

  // check that auth_token cookie exists and is valid
  const token = userCookies.get("auth_token")?.value;

  if (!token) {
    return false;
  }

  try {
    return Boolean(await verifyAuthToken(token));
  } catch {
    return false;
  }
}

export async function login(formData: FormData) {
  "use server";

  const password = formData.get("password");

  if (password !== "123") {
    return;
  }

  const userCookies = await cookies();
  userCookies.set("auth_token", await createAuthToken(), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  revalidatePath("/");
}

export async function logout() {
  "use server";

  const userCookies = await cookies();
  userCookies.delete("auth_token");
  revalidatePath("/");
}
