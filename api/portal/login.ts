import {
  clearLoginFailures,
  createSessionToken,
  loginThrottled,
  recordLoginFailure,
  sessionCookie,
  verifyPassword,
  type SessionRole,
} from "../_lib/auth.js";
import { accountConfigProblems, configuredAccounts } from "../_lib/accounts.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const accounts = configuredAccounts();
  const adminEmail = process.env.ADMIN_LOGIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  const adminConfigured = Boolean(adminEmail && adminHash);
  if ((!accounts.length && !adminConfigured) || !process.env.SESSION_SECRET) {
    res.status(500).json({ error: "Portal is not configured" });
    return;
  }

  const ip =
    (typeof req.headers["x-forwarded-for"] === "string"
      ? req.headers["x-forwarded-for"].split(",")[0].trim()
      : "") || "unknown";
  if (loginThrottled(ip)) {
    res.status(429).json({ error: "Too many attempts. Please try again in a few minutes." });
    return;
  }

  const { email, password } = (req.body ?? {}) as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const normalized = email.trim().toLowerCase();
  let role: SessionRole | null = null;
  let account = "default";
  if (
    adminConfigured &&
    normalized === adminEmail!.trim().toLowerCase() &&
    verifyPassword(password, adminHash!)
  ) {
    role = "admin";
  } else {
    const match = accounts.find(
      (a) => normalized === a.email.trim().toLowerCase() && verifyPassword(password, a.passwordHash)
    );
    if (match) {
      role = "client";
      account = match.key;
    }
  }
  if (!role) {
    // Diagnostics only — no emails, passwords, or hashes are logged.
    const emailMatch = accounts.find((a) => normalized === a.email.trim().toLowerCase());
    console.warn("Portal login failed", {
      configuredAccounts: accounts.map((a) => a.key),
      emailMatchedAccount: emailMatch?.key ?? null,
      configProblems: accountConfigProblems(),
    });
    recordLoginFailure(ip);
    res.status(401).json({ error: "Incorrect email or password" });
    return;
  }

  clearLoginFailures(ip);
  res.setHeader("Set-Cookie", sessionCookie(createSessionToken(role, account)));
  res.status(200).json({ ok: true, role });
}
