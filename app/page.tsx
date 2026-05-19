import { getLocalPriceSet, getCoinPrices } from "@/lib/pricing";
import { LivePricesProvider } from "./_components/LivePricesProvider";
import { LiveHeader } from "./_components/LiveHeader";
import {
  LiveCoinGrid,
  LiveHeroCards,
  LiveKaratTable,
} from "./_components/LiveSections";
import type { PricesPayload } from "./_components/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
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
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:space-y-10 sm:px-5 sm:py-12">
        <LiveHeader />

        <section className="space-y-3">
          <SectionTitle
            en="Most Common Karats"
            ar="العيارات الأكثر شيوعاً"
            hint="The three karats that move 90% of the Egyptian market."
          />
          <LiveHeroCards />
        </section>

        <section className="space-y-3">
          <SectionTitle
            en="All Karats · Per Gram"
            ar="جميع العيارات · سعر الجرام"
            hint="Sell is bullion price. Jewelry adds workmanship (مصنعية) + 14% VAT on the workmanship — Egyptian VAT law."
          />
          <LiveKaratTable />
        </section>

        <section className="space-y-3">
          <SectionTitle
            en="Coins & Bullion"
            ar="الجنيهات والسبائك"
            hint="Egyptian gold pound = 8 g of 21K. Bullion-grade pricing — no jewelry workmanship."
          />
          <LiveCoinGrid />
        </section>

        <footer className="border-t border-[var(--border)] pt-6 text-xs text-[var(--foreground)]/40">
          Spot prices from{" "}
          <span className="text-[var(--gold-soft)]/80">goldapi.io</span>, EGP
          quoted directly. Local pricing applies configurable dealer spreads,
          workmanship per karat, and the 14% Egyptian VAT on workmanship only.
          Tune everything in the <code>KaratConfig</code> &amp;{" "}
          <code>CoinConfig</code> tables.
        </footer>
      </main>
    </LivePricesProvider>
  );
}

function SectionTitle({
  en,
  ar,
  hint,
}: {
  en: string;
  ar: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
      <div className="flex items-baseline gap-3">
        <h2 className="text-lg font-semibold text-[var(--gold-soft)]">{en}</h2>
        <span className="text-sm text-[var(--foreground)]/45" dir="rtl">
          · {ar}
        </span>
      </div>
      {hint ? (
        <p className="max-w-md text-[11px] text-[var(--foreground)]/45 sm:text-right">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
