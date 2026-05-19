import "server-only";
import { prisma } from "./db";

function envTokens(): string[] {
  return (process.env.API_AUTH_TOKENS ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Returns true if the request carries a valid Bearer token. */
export async function isAuthorized(req: Request): Promise<boolean> {
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const token = match[1].trim();
  if (!token) return false;

  if (envTokens().includes(token)) return true;

  const row = await prisma.apiKey.findUnique({ where: { token } });
  if (row?.enabled) {
    prisma.apiKey
      .update({ where: { token }, data: { lastUsed: new Date() } })
      .catch(() => {});
    return true;
  }
  return false;
}

export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: "unauthorized", message: "missing or invalid Bearer token" }),
    { status: 401, headers: { "content-type": "application/json" } },
  );
}
