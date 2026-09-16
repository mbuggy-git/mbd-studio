import { isAuthenticated } from "../_lib/auth.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  // Temporary diagnostics while debugging the deploy — remove once stable.
  try {
    res.status(200).json({ authenticated: isAuthenticated(req) });
  } catch (err: any) {
    res.status(500).json({ diag: String(err?.message ?? err) });
  }
}
