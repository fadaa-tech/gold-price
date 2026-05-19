import { fmtMoney, KARAT_AR } from "./format";
import { TrendBadge } from "./TrendBadge";
import type { KaratRow } from "./types";

export function HeroCard({
  row,
  highlight = false,
}: {
  row: KaratRow;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition ${
        highlight
          ? "border-[var(--gold)] bg-gradient-to-br from-[var(--gold)]/20 via-[var(--surface)] to-[var(--surface)] shadow-[0_0_40px_-12px_rgba(212,160,23,0.45)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--gold)]/40"
      }`}
    >
      {highlight ? (
        <span className="absolute right-3 top-3 rounded-full border border-[var(--gold)]/50 bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--gold-soft)]">
          الأكثر شيوعاً · most common
        </span>
      ) : null}

      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-mono text-3xl font-bold text-[var(--gold)]">
            {row.label}
          </div>
          <div className="mt-0.5 text-xs text-[var(--foreground)]/55" dir="rtl">
            {KARAT_AR[row.karat]}
          </div>
        </div>
        <TrendBadge trend={row.trend} size="sm" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--foreground)]/50">
            Sell · بيع
          </div>
          <div className="mt-0.5 font-mono text-2xl font-semibold tabular-nums text-[var(--gold-soft)]">
            {fmtMoney(row.sellPerGram)}
          </div>
          <div className="text-[10px] text-[var(--foreground)]/40">
            EGP / gram
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--foreground)]/50">
            Buy · شراء
          </div>
          <div className="mt-0.5 font-mono text-2xl font-semibold tabular-nums text-emerald-300">
            {fmtMoney(row.buyPerGram)}
          </div>
          <div className="text-[10px] text-[var(--foreground)]/40">
            EGP / gram
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-[10px] text-[var(--foreground)]/45">
        <span>Jewelry retail: {fmtMoney(row.retailSellPerGram)}</span>
        <span>Spread: {fmtMoney(row.sellPerGram - row.buyPerGram)}</span>
      </div>
    </div>
  );
}
