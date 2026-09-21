// Shared auth helpers for the client portal API routes.
// Files/dirs prefixed with "_" inside /api are not exposed as endpoints by Vercel.
import { createHmac, scryptSync, timingSafeEqual, randomBytes } from "node:crypto";

const COOKIE_NAME = "mbd_portal_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET is not configured (needs at least 16 characters)");
  }
  return secret;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", getSessionSecret()).update(payload).digest());
}

export type SessionRole = "client" | "admin";

export function createSessionToken(role: SessionRole = "client"): string {
  const payload = b64url(
    Buffer.from(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS, role })
    )
  );
  return `${payload}.${sign(payload)}`;
}

// Returns the session's role, or null if the token is missing/invalid/expired.
// Tokens issued before roles existed have no role field and count as "client".
export function verifySessionToken(token: string | undefined): SessionRole | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { exp, role } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof exp !== "number" || exp <= Math.floor(Date.now() / 1000)) return null;
    return role === "admin" ? "admin" : "client";
  } catch {
    return null;
  }
}

function isProduction(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

export function sessionCookie(token: string): string {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (isProduction()) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookie(): string {
  const parts = [`${COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (isProduction()) parts.push("Secure");
  return parts.join("; ");
}

export function readSessionToken(req: { headers: Record<string, string | string[] | undefined> }): string | undefined {
  const header = req.headers["cookie"];
  const cookieStr = Array.isArray(header) ? header.join("; ") : header;
  if (!cookieStr) return undefined;
  for (const part of cookieStr.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE_NAME) return rest.join("=");
  }
  return undefined;
}

export function getSessionRole(req: { headers: Record<string, string | string[] | undefined> }): SessionRole | null {
  return verifySessionToken(readSessionToken(req));
}

export function isAuthenticated(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  return getSessionRole(req) !== null;
}

// Password hashes use the format: scrypt:<saltHex>:<hashHex>
// Generate one with: node scripts/hash-portal-password.mjs
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, saltHex, hashHex] = parts;
  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, salt, expected.length, { N: 16384, r: 8, p: 1 });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

// Best-effort login throttling (per serverless instance).
const failures = new Map<string, { count: number; last: number }>();

export function loginThrottled(ip: string): boolean {
  const entry = failures.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.last > 15 * 60 * 1000) {
    failures.delete(ip);
    return false;
  }
  return entry.count >= 8;
}

export function recordLoginFailure(ip: string): void {
  const entry = failures.get(ip) ?? { count: 0, last: 0 };
  entry.count += 1;
  entry.last = Date.now();
  failures.set(ip, entry);
}

export function clearLoginFailures(ip: string): void {
  failures.delete(ip);
}
