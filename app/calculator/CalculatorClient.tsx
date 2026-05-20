"use client";

import { useMemo, useState } from "react";
import { usePrices } from "../_components/LivePricesProvider";
import { fmtMoney, KARAT_AR } from "../_components/format";
import {
  computeRetail,
  EGYPT_VAT_RATE,
  OFFICIAL_MASNAIYA_PER_GRAM,
} from "@/lib/egyptian-rates";

type ItemType = "jewelry-typical" | "jewelry-official" | "coin" | "custom";

export function CalculatorClient() {
  const { data, refresh, refreshing } = usePrices();
  const karatRows = data.prices.karats;
  const coins = data.coins.coins;

  // Karats with an enabled DB config are surfaced by the API. We render
  // whatever the live snapshot has, in payload order.
  const availableKarats = useMemo(() => karatRows.map((k) => k.karat), [karatRows]);

  const [karat, setKarat] = useState<number>(21);
  const [grams, setGrams] = useState<string>("10");
  const [itemType, setItemType] = useState<ItemType>("jewelry-typical");
  const [coinSlug, setCoinSlug] = useState<string>(coins[0]?.slug ?? "");
  const [customMasnaiya, setCustomMasnaiya] = useState<string>("");

  const activeCoin = useMemo(
    () => coins.find((c) => c.slug === coinSlug),
    [coins, coinSlug],
  );

  const activeKarat = useMemo(() => {
    if (itemType === "coin") return activeCoin?.karat ?? karat;
    return karat;
  }, [karat, itemType, activeCoin]);

  const activeGrams = useMemo(() => {
    if (itemType === "coin") return activeCoin?.grams ?? 0;
    return Number(grams) || 0;
  }, [grams, itemType, activeCoin]);

  const activeKaratRow = useMemo(
    () => karatRows.find((k) => k.karat === activeKarat),
    [karatRows, activeKarat],
  );
  const internationalPerGram = activeKaratRow?.internationalPerGram ?? 0;
  const liveKaratWorkmanship = activeKaratRow?.workmanshipPerGram ?? 0;

  const masnaiyaPerGram = useMemo(() => {
    switch (itemType) {
      case "jewelry-typical":
        // Live per-karat workmanship from DB-backed KaratConfig.
        return liveKaratWorkmanship;
      case "jewelry-official":
        return OFFICIAL_MASNAIYA_PER_GRAM[activeKarat] ?? 58.56;
      case "coin":
        // Live per-coin workmanship from DB-backed CoinConfig.
        return activeCoin?.workmanshipPerGram ?? 0;
      case "custom":
        return Math.max(0, Number(customMasnaiya) || 0);
    }
  }, [itemType, activeKarat, liveKaratWorkmanship, activeCoin, customMasnaiya]);

  // Coins & bullion are VAT-exempt in Egypt. Everything else gets 14%.
  const applyVat = itemType !== "coin";

  const breakdown = useMemo(
    () =>
      computeRetail(
        internationalPerGram,
        activeGrams,
        masnaiyaPerGram,
        applyVat,
      ),
    [internationalPerGram, activeGrams, masnaiyaPerGram, applyVat],
  );

  const buybackPerGram = activeKaratRow?.buyPerGram ?? 0;
  const buybackTotal = buybackPerGram * activeGrams;
  const lossOnBuyback = breakdown.total - buybackTotal;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-5 sm:py-12">
      <header className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)]/80">
          Calculator
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl" dir="rtl">
          حاسبة سعر الذهب في مصر
        </h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/70">
          Live gold price · Egyptian retail formula:{" "}
          <span className="text-[var(--gold-soft)]">
            (gold + masnaiya) × grams + 14% VAT on masnaiya
          </span>
          . All rates pulled live from the DB — no hardcoded values.
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr]">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--gold-soft)]">
            Inputs · المدخلات
          </h2>

          <Field label="Item type · نوع القطعة">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Toggle
                active={itemType === "jewelry-typical"}
                onClick={() => setItemType("jewelry-typical")}
              >
                <span className="block text-sm">Jewelry (shop)</span>
                <span className="block text-[10px] opacity-70">
                  مصنعية المحلات
                </span>
              </Toggle>
              <Toggle
                active={itemType === "jewelry-official"}
                onClick={() => setItemType("jewelry-official")}
              >
                <span className="block text-sm">Tax min.</span>
                <span className="block text-[10px] opacity-70">
                  الحد الأدنى الرسمي
                </span>
              </Toggle>
              <Toggle
                active={itemType === "coin"}
                onClick={() => setItemType("coin")}
              >
                <span className="block text-sm">Coin / Bullion</span>
                <span className="block text-[10px] opacity-70">
                  جنيهات وسبائك
                </span>
              </Toggle>
              <Toggle
                active={itemType === "custom"}
                onClick={() => setItemType("custom")}
              >
                <span className="block text-sm">Custom</span>
                <span className="block text-[10px] opacity-70">مخصص</span>
              </Toggle>
            </div>
          </Field>

          {itemType === "coin" ? (
            <Field label="Coin · القطعة">
              <select
                value={coinSlug}
                onChange={(e) => setCoinSlug(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm focus:border-[var(--gold)]/50 focus:outline-none"
              >
                {coins.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.labelEn} ({c.grams}g · {c.karat}K) — {c.labelAr}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <>
              <Field label="Karat · العيار">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
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

              <Field label="Weight (grams) · الوزن بالجرام">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 font-mono text-sm focus:border-[var(--gold)]/50 focus:outline-none"
                  />
                  <span className="text-xs text-[var(--foreground)]/50">g</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[1, 5, 10, 25, 50, 100].map((g) => (
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
            </>
          )}

          {itemType === "custom" ? (
            <Field label="Custom masnaiya (EGP per gram) · مصنعية مخصصة">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                placeholder={String(liveKaratWorkmanship)}
                value={customMasnaiya}
                onChange={(e) => setCustomMasnaiya(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 font-mono text-sm focus:border-[var(--gold)]/50 focus:outline-none"
              />
              <p className="mt-2 text-[11px] text-[var(--foreground)]/55">
                Tax Authority floor for {activeKarat}K:{" "}
                <span className="font-mono text-[var(--gold-soft)]">
                  {fmtMoney(OFFICIAL_MASNAIYA_PER_GRAM[activeKarat] ?? 0)} EGP/g
                </span>
                . Current DB default for {activeKarat}K shops:{" "}
                <span className="font-mono text-[var(--gold-soft)]">
                  {fmtMoney(liveKaratWorkmanship)} EGP/g
                </span>
                .
              </p>
            </Field>
          ) : null}

          <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/60 p-3 text-[11px] text-[var(--foreground)]/65">
            <strong className="text-[var(--gold-soft)]">Active rate:</strong>{" "}
            International {activeKarat}K ={" "}
            <span className="font-mono">
              {fmtMoney(internationalPerGram)} EGP/g
            </span>
            {" · "}
            Masnaiya ={" "}
            <span className="font-mono">{fmtMoney(masnaiyaPerGram)} EGP/g</span>
            {" · "}
            VAT {applyVat ? `${Math.round(EGYPT_VAT_RATE * 100)}%` : "exempt"}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--gold)]/30 bg-gradient-to-br from-[var(--gold)]/8 to-transparent p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--gold-soft)]">
            Breakdown · التفاصيل
          </h2>

          <div className="space-y-2">
            <Row
              label="Gold value · قيمة الذهب"
              hint={`${fmtMoney(internationalPerGram)} × ${activeGrams}g`}
              value={breakdown.goldValue}
            />
            <Row
              label="Masnaiya · المصنعية"
              hint={`${fmtMoney(masnaiyaPerGram)} × ${activeGrams}g`}
              value={breakdown.masnaiyaTotal}
            />
            <Row
              label={`VAT (${Math.round(EGYPT_VAT_RATE * 100)}% on masnaiya) · ضريبة`}
              hint={
                applyVat
                  ? `14% × ${fmtMoney(breakdown.masnaiyaTotal)}`
                  : "Coins & bullion: VAT-exempt under Egyptian tax law"
              }
              value={breakdown.vatTotal}
              muted={!applyVat}
            />
          </div>

          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-[var(--foreground)]/70">
                Total · المجموع
              </span>
              <span className="font-mono text-3xl font-semibold tabular-nums text-[var(--gold)]">
                {fmtMoney(breakdown.total)}{" "}
                <span className="text-base opacity-60">EGP</span>
              </span>
            </div>
            <div className="mt-1 text-right text-[11px] text-[var(--foreground)]/55">
              ≈{" "}
              <span className="font-mono">
                {fmtMoney(breakdown.perGramRetail)}
              </span>{" "}
              EGP / gram retail
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-[11px] text-amber-200/85">
            <strong className="text-amber-200">Shop buy-back today:</strong>{" "}
            <span className="font-mono">
              {fmtMoney(buybackPerGram)} EGP/g
            </span>{" "}
            ≈ <span className="font-mono">{fmtMoney(buybackTotal)}</span> EGP
            total. If you bought now and sold back immediately you&rsquo;d
            lose{" "}
            <span className="font-mono text-amber-100">
              {fmtMoney(lossOnBuyback)} EGP
            </span>
            .
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5 text-xs leading-relaxed text-[var(--foreground)]/65 sm:p-6">
        <h3 className="mb-2 text-sm font-semibold text-[var(--gold-soft)]">
          How this is calculated
        </h3>
        <p>
          Egyptian retail follows the formula{" "}
          <span className="font-mono text-[var(--foreground)]/80">
            (intl + masnaiya) × grams + 14% × masnaiya × grams
          </span>
          . VAT applies <em>only</em> to the workmanship, never to the gold
          itself — Egyptian tax law. Gold coins and bullion bars are exempt
          from VAT under the same protocol.
        </p>
        <p className="mt-2">
          The <strong>Jewelry (shop)</strong> preset uses the per-karat
          workmanship from the <code>KaratConfig</code> table (live DB). The{" "}
          <strong>Tax min.</strong> preset uses the Egyptian Tax Authority
          official manufacturing-cost averages (effective July 2025).{" "}
          <strong>Coin / Bullion</strong> reads per-piece workmanship from
          the <code>CoinConfig</code> table and skips VAT. Edit either table
          to retune for your shop.
        </p>
      </section>
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

function Row({
  label,
  hint,
  value,
  muted = false,
}: {
  label: string;
  hint?: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/50 px-3 py-2">
      <div className="min-w-0">
        <div
          className={`text-sm ${
            muted ? "text-[var(--foreground)]/45" : "text-[var(--foreground)]/85"
          }`}
        >
          {label}
        </div>
        {hint ? (
          <div className="text-[10px] text-[var(--foreground)]/45">{hint}</div>
        ) : null}
      </div>
      <div
        className={`font-mono text-sm tabular-nums ${
          muted ? "text-[var(--foreground)]/40" : "text-[var(--gold-soft)]"
        }`}
      >
        {fmtMoney(value)} EGP
      </div>
    </div>
  );
}
