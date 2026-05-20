import { getLocalPriceSet, getCoinPrices } from "@/lib/pricing";
import { LivePricesProvider } from "../_components/LivePricesProvider";
import type { PricesPayload } from "../_components/types";
import { BuyVsSellClient } from "./BuyVsSellClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "البيع والشراء · Buy vs Sell · Gold Egypt",
  description:
    "See the true cost of buying gold jewelry in Egypt: what shops will pay you back, the hidden loss from masnaiya & VAT, and the break-even gold price.",
};

export default async function BuyVsSellPage() {
  let initial: PricesPayload | null = null;
  let error: string | null = null;
  try {
    const [prices, coins] = await Promise.all([
      getLocalPriceSet(),
      getCoinPrices(),
    ]);
    initial = { currency: "EGP", prices, coins };
  } catch (e) {
    error = (e as Error).message;
  }

  if (!initial) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-14">
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200">
          <p className="font-medium">Couldn&rsquo;t load live prices.</p>
          <p className="mt-1 opacity-80">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <LivePricesProvider initial={initial}>
      <BuyVsSellClient />
    </LivePricesProvider>
  );
}
