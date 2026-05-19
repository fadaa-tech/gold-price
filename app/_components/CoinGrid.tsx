import { fmtMoney } from "./format";
import type { Coin } from "./types";

export function CoinGrid({ coins }: { coins: Coin[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {coins.map((c) => (
        <article
          key={c.slug}
          className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--gold)]/40"
        >
          <header className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                {c.labelEn}
              </h3>
              <p
                className="mt-0.5 text-sm text-[var(--gold-soft)]/80"
                dir="rtl"
              >
                {c.labelAr}
              </p>
            </div>
            <div className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-center">
              <div className="font-mono text-xs font-bold text-[var(--gold)]">
                {c.karat}K
              </div>
              <div className="text-[9px] text-[var(--foreground)]/50">
                {c.grams}g
              </div>
            </div>
          </header>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--foreground)]/50">
                Sell · بيع
              </div>
              <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-[var(--gold-soft)]">
                {fmtMoney(c.sellPrice, 0)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--foreground)]/50">
                Buy · شراء
              </div>
              <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-emerald-300">
                {fmtMoney(c.buyPrice, 0)}
              </div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-[var(--foreground)]/40">
            EGP · spread {fmtMoney(c.sellPrice - c.buyPrice, 0)}
          </div>
        </article>
      ))}
    </div>
  );
}
