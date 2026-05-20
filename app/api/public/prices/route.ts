import { getLocalPriceSet, getCoinPrices } from "@/lib/pricing";

export const dynamic = "force-dynamic";

// Public, unauthenticated read used by the landing page's auto-refresh.
// The authenticated /api/v1/* endpoints remain the contract for the mobile app.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  try {
    // Resolve prices first so the (forced) snapshot fetch happens once,
    // then coins reuse the now-fresh cached snapshot.
    const prices = await getLocalPriceSet(force);
    const coins = await getCoinPrices(false);
    return Response.json(
      { currency: "EGP", prices, coins },
      {
        headers: {
          // Manual refresh must bypass the browser cache; auto-refresh can be cached briefly.
          "Cache-Control": force
            ? "no-store"
            : "public, max-age=30, s-maxage=30",
        },
      },
    );
  } catch (err) {
    return Response.json(
      { error: "fetch_failed", message: (err as Error).message },
      { status: 502 },
    );
  }
}
