export function fmtMoney(n: number, fractionDigits = 2) {
  return new Intl.NumberFormat("en-EG", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}

export function fmtMoneyAr(n: number, fractionDigits = 2) {
  return new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}

export function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function relativeFromNow(iso: string, now: number = Date.now()) {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Math.round((now - then) / 1000));
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const KARAT_AR: Record<number, string> = {
  24: "عيار ٢٤",
  22: "عيار ٢٢",
  21: "عيار ٢١",
  20: "عيار ٢٠",
  18: "عيار ١٨",
  16: "عيار ١٦",
  14: "عيار ١٤",
  10: "عيار ١٠",
};
