import type { Trend } from "./types";

export function TrendBadge({
  trend,
  size = "md",
  showDelta = true,
}: {
  trend: Trend | null;
  size?: "sm" | "md";
  showDelta?: boolean;
}) {
  if (!trend) {
    return (
      <span className="inline-flex items-center gap-1 text-[var(--foreground)]/40">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <rect x="1" y="4" width="8" height="2" rx="1" />
        </svg>
        <span className={size === "sm" ? "text-[10px]" : "text-xs"}>—</span>
      </span>
    );
  }

  const color =
    trend.direction === "up"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
      : trend.direction === "down"
        ? "text-rose-300 bg-rose-500/10 border-rose-500/30"
        : "text-[var(--foreground)]/55 bg-white/5 border-white/10";

  const arrow =
    trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "■";

  const fontSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono ${color} ${fontSize}`}
    >
      <span aria-hidden>{arrow}</span>
      {showDelta ? (
        <>
          <span>
            {trend.delta > 0 ? "+" : ""}
            {trend.delta.toFixed(2)}
          </span>
          <span className="opacity-70">
            ({trend.pct > 0 ? "+" : ""}
            {trend.pct.toFixed(2)}%)
          </span>
        </>
      ) : (
        <span>
          {trend.pct > 0 ? "+" : ""}
          {trend.pct.toFixed(2)}%
        </span>
      )}
    </span>
  );
}
