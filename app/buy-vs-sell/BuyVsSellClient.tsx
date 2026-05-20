"use client";

import { useMemo, useState } from "react";
import { usePrices } from "../_components/LivePricesProvider";
import { fmtMoney, KARAT_AR } from "../_components/format";
import { EGYPT_VAT_RATE } from "@/lib/egyptian-rates";

type PriceMode = "today-retail" | "manual";

export function BuyVsSellClient() {
  const { data, refresh, refreshing } = usePrices();
  const karatRows = data.prices.karats;
  const availableKarats = useMemo(() => karatRows.map((k) => k.karat), [karatRows]);

  const [karat, setKarat] = useState<number>(21);
  const [grams, setGrams] = useState<string>("10");
  const [priceMode, setPriceMode] = useState<PriceMode>("today-retail");
  const [paidTotal, setPaidTotal] = useState<string>("");

  const row = useMemo(
    () => karatRows.find((k) => k.karat === karat),
    [karatRows, karat],
  );

  // All four numbers come straight from the live snapshot. No hardcoded
  // fallbacks — if a karat is missing from the DB the API drops it from
  // the payload, and we won't render it.
  const internationalPerGram = row?.internationalPerGram ?? 0;
  const buybackPerGram = row?.buyPerGram ?? 0;
  const sellBullionPerGram = row?.sellPerGram ?? 0;
  const masnaiyaPerGram = row?.workmanshipPerGram ?? 0;
  const todayRetailPerGram = row?.retailSellPerGram ?? 0;

  const activeGrams = Number(grams) || 0;
  const todayRetailTotal = todayRetailPerGram * activeGrams;

  const paidTotalNum = useMemo(() => {
    if (priceMode === "manual") return Math.max(0, Number(paidTotal) || 0);
    return todayRetailTotal;
  }, [priceMode, paidTotal, todayRetailTotal]);

  const buybackTotal = buybackPerGram * activeGrams;

  const loss = paidTotalNum - buybackTotal;
  const lossPct = paidTotalNum > 0 ? (loss / paidTotalNum) * 100 : 0;

  // Break-even: how much does intl per-gram need to rise so that the
  // *future* buyback (which still applies the same deal-bid offset
  // relative to intl) recovers the price paid?
  //   buybackPerGram = intl - buySpread
  //   buySpread = intl - buybackPerGram  (constant offset)
  //   future_buyback × grams = paid
  //     ⇒ (intl_future - buySpread) × grams = paid
  //     ⇒ intl_future = paid/grams + buySpread
  const buySpread = internationalPerGram - buybackPerGram;
  const breakevenIntlPerGram =
    activeGrams > 0 ? paidTotalNum / activeGrams + buySpread : 0;
  const breakevenRisePct =
    internationalPerGram > 0
      ? ((breakevenIntlPerGram - internationalPerGram) / internationalPerGram) *
        100
      : 0;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-5 sm:py-12">
      <header className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)]/80">
          Buy vs Sell
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl" dir="rtl">
          البيع والشراء — كم تخسر لو بعت دلوقتي؟
        </h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/70">
          The hidden cost of Egyptian jewelry: shops sell with masnaiya + 14%
          VAT, but buy back at raw gold value. Numbers below are live from
          the database — change <code>KaratConfig</code> and they update.
        </p>
        <button
          type="button"
          onClick={() => void refresh({ force: true })}
          disabled={refreshing}
          className="mt-3 inline-flex cursor-pointer items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs text-[var(--gold-soft)] hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "↻ Refresh prices"}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--gold-soft)]">
            Your piece · القطعة بتاعتك
          </h2>

          <Field label="Karat · العيار">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {availableKarats.map((k) => (
                <Toggle
                  key={k}
                  active={karat === k}
                  onClick={() => setKarat(k)}
                >
                  <span className="block text-sm font-semibold">{k}K</span>
                  <span className="block text-[10px] opacity-70" dir="rtl">
                    {KARAT_AR[k]}
                  </span>
                </Toggle>
              ))}
            </div>
          </Field>

          <Field label="Weight (grams) · الوزن">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 font-mono text-sm focus:border-[var(--gold)]/50 focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[5, 10, 20, 50].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrams(String(g))}
                  className="cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] text-[var(--foreground)]/70 hover:border-[var(--gold)]/50 hover:text-[var(--gold-soft)]"
                >
                  {g}g
                </button>
              ))}
            </div>
          </Field>

          <Field label="Purchase price source · مصدر سعر الشراء">
            <div className="grid grid-cols-2 gap-2">
              <Toggle
                active={priceMode === "today-retail"}
                onClick={() => setPriceMode("today-retail")}
              >
                <span className="block text-sm">Use today&rsquo;s retail</span>
                <span className="block text-[10px] opacity-70">
                  سعر السوق اليوم
                </span>
              </Toggle>
              <Toggle
                active={priceMode === "manual"}
                onClick={() => setPriceMode("manual")}
              >
                <span className="block text-sm">I paid …</span>
                <span className="block text-[10px] opacity-70">أنا دفعت</span>
              </Toggle>
            </div>
          </Field>

          {priceMode === "manual" ? (
            <Field label="What you paid (total EGP) · المبلغ الكلي">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                placeholder={String(Math.round(todayRetailTotal))}
                value={paidTotal}
                onChange={(e) => setPaidTotal(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 font-mono text-sm focus:border-[var(--gold)]/50 focus:outline-none"
              />
              <p className="mt-2 text-[11px] text-[var(--foreground)]/55">
                Leave blank to assume today&rsquo;s retail (
                <span className="font-mono">{fmtMoney(todayRetailTotal)}</span>{" "}
                EGP for {activeGrams}g of {karat}K).
              </p>
            </Field>
          ) : null}

          <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/60 p-3 text-[11px] text-[var(--foreground)]/65">
            <div>
              <strong className="text-[var(--gold-soft)]">Rates used:</strong>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-1">
              <span>International {karat}K</span>
              <span className="text-right font-mono">
                {fmtMoney(internationalPerGram)} EGP/g
              </span>
              <span>Shop masnaiya (live)</span>
              <span className="text-right font-mono">
                {fmtMoney(masnaiyaPerGram)} EGP/g
              </span>
              <span>Buy-back vs intl</span>
              <span className="text-right font-mono">
                {buySpread >= 0 ? "−" : "+"}
                {fmtMoney(Math.abs(buySpread))} EGP/g
              </span>
              <span>VAT on masnaiya</span>
              <span className="text-right font-mono">
                {Math.round(EGYPT_VAT_RATE * 100)}%
              </span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard
              tone="gold"
              label="You pay (retail today)"
              labelAr="السعر للمستهلك"
              value={fmtMoney(paidTotalNum)}
              hint={`${fmtMoney(
                activeGrams > 0 ? paidTotalNum / activeGrams : 0,
              )} EGP/g · includes masnaiya + VAT`}
            />
            <StatCard
              tone="amber"
              label="Shop pays you (buy-back)"
              labelAr="سعر الشراء من المحل"
              value={fmtMoney(buybackTotal)}
              hint={`${fmtMoney(buybackPerGram)} EGP/g · raw gold only, no VAT`}
            />
          </div>

          <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/8 to-transparent p-5">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-red-300/80">
                  Instant resale loss · الخسارة الفورية
                </p>
                <p className="mt-1 text-[11px] text-[var(--foreground)]/65">
                  Difference between retail and what the shop pays you back.
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono text-3xl font-semibold text-red-300">
                  −{fmtMoney(loss)}
                </div>
                <div className="text-xs text-red-300/80">
                  {lossPct.toFixed(1)}% of price · EGP
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
            <p className="text-[10px] uppercase tracking-wider text-emerald-300/80">
              Break-even gold price · سعر الذهب للتعادل
            </p>
            <p className="mt-1 text-[11px] text-[var(--foreground)]/70">
              For you to get your money back when selling, the international{" "}
              {karat}K per-gram price would need to climb to:
            </p>
            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="font-mono text-3xl font-semibold text-emerald-200">
                {fmtMoney(breakevenIntlPerGram)}{" "}
                <span className="text-base opacity-60">EGP/g</span>
              </span>
              <span className="text-right text-xs text-emerald-200/85">
                {breakevenRisePct >= 0 ? "+" : ""}
                {breakevenRisePct.toFixed(2)}% from{" "}
                <span className="font-mono">
                  {fmtMoney(internationalPerGram)}
                </span>
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[12px] leading-relaxed text-[var(--foreground)]/70">
            <p className="font-medium text-[var(--gold-soft)]">
              Why does this happen?
            </p>
            <p className="mt-1">
              When you buy gold jewelry the shop charges you the gold value{" "}
              <em>plus</em> masnaiya (workmanship) <em>plus</em> 14% VAT on
              the masnaiya. When you sell back, the piece is melted down —
              the workmanship is worth zero, so the shop only pays you for
              the gold content. Coins and bullion don&rsquo;t carry jewelry
              workmanship and are VAT-exempt, so their resale value is much
              closer to the purchase price. For an example, switch the
              Calculator to <strong>Coin / Bullion</strong> and compare.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-[var(--foreground)]/55">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-lg border px-2 py-1.5 text-center transition ${
        active
          ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
          : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)]/75 hover:border-[var(--gold)]/40 hover:text-[var(--gold-soft)]"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({
  tone,
  label,
  labelAr,
  value,
  hint,
}: {
  tone: "gold" | "amber";
  label: string;
  labelAr: string;
  value: string;
  hint?: string;
}) {
  const palette =
    tone === "gold"
      ? "border-[var(--gold)]/30 from-[var(--gold)]/8 text-[var(--gold)]"
      : "border-amber-500/25 from-amber-500/8 text-amber-300";
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br to-transparent p-4 ${palette}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider opacity-80">
          {label}
        </span>
        <span dir="rtl" className="text-[10px] w-[100px] text-[var(--foreground)]/55">
          {labelAr}
        </span>
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold tabular-nums">
        {value} <span className="text-sm opacity-60">EGP</span>
      </div>
      {hint ? (
        <div className="mt-1 text-[10px] w-[100px] text-[var(--foreground)]/55">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
