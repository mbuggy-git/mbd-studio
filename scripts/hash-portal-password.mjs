#!/usr/bin/env node
// Generates a CLIENT_PASSWORD_HASH value for the client portal.
// Usage: node scripts/hash-portal-password.mjs "the-password"
import { scryptSync, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-portal-password.mjs "the-password"');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
console.log(`scrypt:${salt.toString("hex")}:${hash.toString("hex")}`);
