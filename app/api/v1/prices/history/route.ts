import { isAuthorized, unauthorizedResponse } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) return unauthorizedResponse();

  const url = new URL(req.url);
  const limit = Math.min(
    Math.max(1, Number(url.searchParams.get("limit") ?? "50")),
    500,
  );

  const rows = await prisma.goldSnapshot.findMany({
    orderBy: { fetchedAt: "desc" },
    take: limit,
    select: {
      id: true,
      fetchedAt: true,
      goldApiTimestamp: true,
      pricePerOunceEgp: true,
      pricePerGram24k: true,
      pricePerGram22k: true,
      pricePerGram21k: true,
      pricePerGram18k: true,
      pricePerGram14k: true,
    },
  });

  return Response.json({
    currency: "EGP",
    count: rows.length,
    snapshots: rows.map((r) => ({
      id: r.id,
      fetchedAt: r.fetchedAt.toISOString(),
      goldApiTimestamp: r.goldApiTimestamp.toISOString(),
      pricePerOunceEgp: Number(r.pricePerOunceEgp),
      pricePerGram24k: Number(r.pricePerGram24k),
      pricePerGram22k: Number(r.pricePerGram22k),
      pricePerGram21k: Number(r.pricePerGram21k),
      pricePerGram18k: Number(r.pricePerGram18k),
      pricePerGram14k: Number(r.pricePerGram14k),
    })),
  });
}
