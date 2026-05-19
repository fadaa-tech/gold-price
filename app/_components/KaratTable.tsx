import { fmtMoney, KARAT_AR } from "./format";
import { TrendBadge } from "./TrendBadge";
import type { KaratRow } from "./types";

export function KaratTable({ rows }: { rows: KaratRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--surface-2)] text-[10px] uppercase tracking-wider text-[var(--gold-soft)]/80">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                Karat<br />
                <span className="opacity-60" dir="rtl">العيار</span>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                Sell · بيع<br />
                <span className="font-normal normal-case opacity-60">EGP/g · bullion</span>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                Buy · شراء<br />
                <span className="font-normal normal-case opacity-60">EGP/g</span>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                Jewelry · مشغول<br />
                <span className="font-normal normal-case opacity-60">+ مصنعية + ضريبة</span>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                Trend<br />
                <span className="font-normal normal-case opacity-60">vs prev snapshot</span>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                Spot<br />
                <span className="font-normal normal-case opacity-60">int&apos;l reference</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.map((k) => (
              <tr
                key={k.karat}
                className="transition odd:bg-transparent even:bg-white/[0.02] hover:bg-[var(--gold)]/5"
              >
                <td className="px-4 py-3 align-middle">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-lg font-bold text-[var(--gold)]">
                      {k.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--foreground)]/50" dir="rtl">
                    {KARAT_AR[k.karat]}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-base font-semibold tabular-nums text-[var(--gold-soft)]">
                  {fmtMoney(k.sellPerGram)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-base font-semibold tabular-nums text-emerald-300">
                  {fmtMoney(k.buyPerGram)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--foreground)]/80">
                  {fmtMoney(k.retailSellPerGram)}
                </td>
                <td className="px-4 py-3 text-right">
                  <TrendBadge trend={k.trend} size="sm" />
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--foreground)]/55">
                  {fmtMoney(k.internationalPerGram)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
