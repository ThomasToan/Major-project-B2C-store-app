import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const envPath = path.join(packageRoot, ".env");

function parseEnvValue(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function readDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return env;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        return env;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1);

      if (key) {
        env[key] = parseEnvValue(value);
      }

      return env;
    }, {});
}

const fileEnv = readDotEnv(envPath);
const testDatabaseUrl = process.env.TEST_DATABASE_URL || fileEnv.TEST_DATABASE_URL;
const testDirectUrl = process.env.TEST_DIRECT_URL || fileEnv.TEST_DIRECT_URL;
const commandArgs = process.argv.slice(2);

if (commandArgs[0] === "--") {
  commandArgs.shift();
}

const [command, ...args] = commandArgs;

if (!command) {
  console.error("Usage: node scripts/with-test-database-env.mjs <command> [...args]");
  process.exit(1);
}

if (!testDatabaseUrl || !testDirectUrl) {
  console.error(
    "TEST_DATABASE_URL and TEST_DIRECT_URL are required in the environment or packages/db/.env.",
  );
  process.exit(1);
}

const child = spawn(command, args, {
  cwd: process.cwd(),
  env: {
    ...fileEnv,
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
    DIRECT_URL: testDirectUrl,
    TEST_DATABASE_URL: testDatabaseUrl,
    TEST_DIRECT_URL: testDirectUrl,
  },
  shell: process.platform === "win32",
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
