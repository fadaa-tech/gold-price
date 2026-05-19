import { getLocalPriceSet, getCoinPrices } from "@/lib/pricing";

export const dynamic = "force-dynamic";

// Public, unauthenticated read used by the landing page's auto-refresh.
// The authenticated /api/v1/* endpoints remain the contract for the mobile app.
export async function GET() {
  try {
    const [prices, coins] = await Promise.all([
      getLocalPriceSet(false),
      getCoinPrices(false),
    ]);
    return Response.json(
      { currency: "EGP", prices, coins },
      {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=30",
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
