"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePrices } from "./LivePricesProvider";
import { fmtMoney, fmtTime, relativeFromNow } from "./format";
import { TrendBadge } from "./TrendBadge";

export function LiveHeader() {
  const { data, refreshing, refresh, lastUpdatedAt, flashKey } = usePrices();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const p = data.prices;
  const updatedLabel = now === null ? "…" : relativeFromNow(p.fetchedAt, now);
  const clientCheckLabel =
    now === null
      ? "…"
      : relativeFromNow(new Date(lastUpdatedAt).toISOString(), now);

  return (
    <header className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4 backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 ${
                  refreshing ? "" : "hidden"
                }`}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-emerald-300/90">
              LIVE · Cairo
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl" dir="rtl">
            أسعار الذهب في مصر اليوم
          </h1>
          <p className="mt-1 text-sm text-[var(--foreground)]/70">
            Gold prices in Egypt — buy &amp; sell rates per gram, with
            workmanship (مصنعية) and 14% VAT applied to retail jewelry prices.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div
            key={flashKey}
            className="rounded-xl border border-[var(--gold)]/30 bg-gradient-to-br from-[var(--gold)]/10 to-transparent px-4 py-2.5 [animation:flash_0.6s_ease-out]"
          >
            <div className="text-[10px] uppercase tracking-wider text-[var(--foreground)]/55">
              1 oz · EGP
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-bold tabular-nums text-[var(--gold)]">
                {fmtMoney(p.pricePerOunceEgp, 0)}
              </span>
              <TrendBadge trend={p.ounceTrend} size="sm" showDelta={false} />
            </div>
          </div>

          <div className="flex flex-col items-start gap-1 text-[11px] text-[var(--foreground)]/55 sm:items-end">
            <span suppressHydrationWarning>
              Updated {updatedLabel} · spot {fmtTime(p.goldApiTimestamp)}
            </span>
            <span suppressHydrationWarning>
              Auto-refresh: 60s · client check: {clientCheckLabel}
            </span>
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => void refresh({ force: true })}
                disabled={refreshing}
                aria-busy={refreshing}
                className="rounded-md border cursor-pointer border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs text-[var(--gold-soft)] transition hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {refreshing ? "Refreshing…" : "↻ Refresh"}
              </button>
              <Link
                href="/dashboard"
                className="rounded-md border border-[var(--gold)]/40 px-2.5 py-1 text-xs text-[var(--gold-soft)] hover:bg-[var(--gold)]/10"
              >
                API →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
