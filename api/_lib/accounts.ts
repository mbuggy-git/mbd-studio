// Client portal accounts. Each client login is locked to one Harvest client ID.
// To add a client: add an entry here and set its env vars (see .env.example).
import { getSession } from "./auth.js";

export interface PortalAccount {
  key: string;
  name: string;
  email: string;
  passwordHash: string;
  clientId: string;
  earliestDate?: string;
}

const ACCOUNT_DEFS = [
  {
    key: "default",
    name: "Design in Mind",
    email: "CLIENT_LOGIN_EMAIL",
    hash: "CLIENT_PASSWORD_HASH",
    clientId: "HARVEST_CLIENT_ID",
    earliest: "PORTAL_EARLIEST_DATE",
  },
  {
    key: "exabeam",
    name: "Exabeam",
    email: "EXABEAM_LOGIN_EMAIL",
    hash: "EXABEAM_PASSWORD_HASH",
    clientId: "EXABEAM_HARVEST_CLIENT_ID",
    earliest: "EXABEAM_EARLIEST_DATE",
  },
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Env values are trimmed so a stray space or newline pasted into Vercel
// doesn't silently disable an account.
function env(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

// Accounts with a login email, password hash, and Harvest client ID all set.
export function configuredAccounts(): PortalAccount[] {
  const accounts: PortalAccount[] = [];
  for (const def of ACCOUNT_DEFS) {
    const email = env(def.email);
    const passwordHash = env(def.hash);
    const clientId = env(def.clientId);
    if (!email || !passwordHash || !clientId || !/^\d+$/.test(clientId)) continue;
    const earliest = env(def.earliest);
    accounts.push({
      key: def.key,
      name: def.name,
      email,
      passwordHash,
      clientId,
      earliestDate: earliest && DATE_PATTERN.test(earliest) ? earliest : undefined,
    });
  }
  return accounts;
}

// Which account env vars are missing or malformed — names only, never values.
// Logged on failed logins to diagnose configuration problems.
export function accountConfigProblems(): Record<string, string[]> {
  const problems: Record<string, string[]> = {};
  for (const def of ACCOUNT_DEFS) {
    const list: string[] = [];
    if (!env(def.email)) list.push(`${def.email} missing`);
    const hash = env(def.hash);
    if (!hash) list.push(`${def.hash} missing`);
    else if (!/^scrypt:[0-9a-f]+:[0-9a-f]+$/.test(hash)) list.push(`${def.hash} malformed`);
    const clientId = env(def.clientId);
    if (!clientId) list.push(`${def.clientId} missing`);
    else if (!/^\d+$/.test(clientId)) list.push(`${def.clientId} not a plain number`);
    if (list.length) problems[def.key] = list;
  }
  return problems;
}

export function findAccount(key: string): PortalAccount | undefined {
  return configuredAccounts().find((a) => a.key === key);
}

// PORTAL_EARLIEST_DATE-style clamps mark when a client's hourly billing began;
// they apply to that client however it's viewed (client or admin session).
function earliestDateFor(clientId: string): string | undefined {
  return configuredAccounts().find((a) => a.clientId === clientId)?.earliestDate;
}

// Resolves which Harvest client a data request may see. Client sessions are
// locked to their account's client ID; only an admin session may choose a
// different client via the `client` query param.
export function resolvePortalClient(
  req: any
): { clientId: string; earliestDate?: string } | { status: number; error: string } {
  const session = getSession(req);
  if (!session) return { status: 401, error: "Not signed in" };

  let clientId: string | undefined;
  if (session.role === "admin") {
    const requested = req.query?.client;
    if (requested != null && requested !== "") {
      if (!/^\d+$/.test(String(requested))) return { status: 400, error: "Invalid client id" };
      clientId = String(requested);
    } else {
      clientId = findAccount("default")?.clientId ?? process.env.HARVEST_CLIENT_ID;
    }
  } else {
    clientId = findAccount(session.account)?.clientId;
    if (!clientId) return { status: 401, error: "Not signed in" };
  }
  if (!clientId) return { status: 500, error: "Portal is not configured" };
  return { clientId, earliestDate: earliestDateFor(clientId) };
}
