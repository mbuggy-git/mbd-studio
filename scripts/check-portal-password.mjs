#!/usr/bin/env node
// Checks whether a password matches a portal password hash (e.g. the value
// saved in Vercel), without sending either anywhere.
// Usage: node scripts/check-portal-password.mjs   (then answer the prompts)
import { scryptSync, timingSafeEqual } from "node:crypto";
import { createInterface } from "node:readline";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const lines = rl[Symbol.asyncIterator]();
async function ask(prompt) {
  process.stdout.write(prompt);
  const { value } = await lines.next();
  return value ?? "";
}
const password = await ask("Password: ");
const stored = (await ask("Hash (the scrypt:... value from Vercel): ")).trim();
rl.close();

const parts = stored.split(":");
if (parts.length !== 3 || parts[0] !== "scrypt") {
  console.log("✗ That hash isn't in the right format — it should look like scrypt:<salt>:<hash>.");
  process.exit(1);
}
const [, saltHex, hashHex] = parts;
const expected = Buffer.from(hashHex, "hex");
const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length, { N: 16384, r: 8, p: 1 });
if (actual.length === expected.length && timingSafeEqual(actual, expected)) {
  console.log("✓ Match — the password and hash are fine.");
} else {
  console.log("✗ No match — regenerate the hash with this exact password.");
  process.exit(1);
}
