import {
  clearLoginFailures,
  createSessionToken,
  loginThrottled,
  recordLoginFailure,
  sessionCookie,
  verifyPassword,
  type SessionRole,
} from "../_lib/auth.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const configuredEmail = process.env.CLIENT_LOGIN_EMAIL;
  const configuredHash = process.env.CLIENT_PASSWORD_HASH;
  const adminEmail = process.env.ADMIN_LOGIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  const clientConfigured = Boolean(configuredEmail && configuredHash);
  const adminConfigured = Boolean(adminEmail && adminHash);
  if ((!clientConfigured && !adminConfigured) || !process.env.SESSION_SECRET) {
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
  if (
    adminConfigured &&
    normalized === adminEmail!.trim().toLowerCase() &&
    verifyPassword(password, adminHash!)
  ) {
    role = "admin";
  } else if (
    clientConfigured &&
    normalized === configuredEmail!.trim().toLowerCase() &&
    verifyPassword(password, configuredHash!)
  ) {
    role = "client";
  }
  if (!role) {
    recordLoginFailure(ip);
    res.status(401).json({ error: "Incorrect email or password" });
    return;
  }

  clearLoginFailures(ip);
  res.setHeader("Set-Cookie", sessionCookie(createSessionToken(role)));
  res.status(200).json({ ok: true, role });
}
