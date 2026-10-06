import { getSession } from "../_lib/auth.js";
import { findAccount } from "../_lib/accounts.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const session = getSession(req);
  // A client session whose account has since been unconfigured is signed out.
  const account = session?.role === "client" ? findAccount(session.account) : undefined;
  if (!session || (session.role === "client" && !account)) {
    res.status(200).json({ authenticated: false, role: null });
    return;
  }
  res.status(200).json({ authenticated: true, role: session.role, clientName: account?.name ?? null });
}
