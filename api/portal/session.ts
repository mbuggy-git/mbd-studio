import { getSessionRole } from "../_lib/auth.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const role = getSessionRole(req);
  res.status(200).json({ authenticated: role !== null, role: role ?? null });
}
