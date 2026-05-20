import { headers } from "next/headers";
import Link from "next/link";
import { AutoRefreshButton } from "./AutoRefreshButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PricesResponse = {
  currency: string;
  unit: string;
  fetchedAt: string;
  goldApiTimestamp: string;
  pricePerOunceEgp: number;
  ask: number;
  bid: number;
  karats: {
    karat: number;
    label: string;
    internationalPerGram: number;
    buyPerGram: number;
    sellPerGram: number;
    retailSellPerGram: number;
    workmanshipPerGram: number;
    vatOnWorkmanship: number;
  }[];
};

function firstEnvToken() {
  return (process.env.API_AUTH_TOKENS ?? "").split(",")[0]?.trim() ?? "";
}

async function fetchPricesViaApi(): Promise<{
  data: PricesResponse | null;
  error: string | null;
  origin: string;
}> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;
  const token = firstEnvToken();
  if (!token) {
    return {
      data: null,
      error: "API_AUTH_TOKENS env var is empty",
      origin,
    };
  }

  try {
    const res = await fetch(`${origin}/api/v1/prices`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text();
      return {
        data: null,
        error: `HTTP ${res.status}: ${body.slice(0, 200)}`,
        origin,
      };
    }
    return { data: await res.json(), error: null, origin };
  } catch (e) {
    return { data: null, error: (e as Error).message, origin };
  }
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(iso));
}

export default async function Dashboard() {
  const { data, error, origin } = await fetchPricesViaApi();
  const token = firstEnvToken();
  const tokenPreview = token
    ? `${token.slice(0, 8)}…${token.slice(-4)}`
    : "(none)";

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--gold-soft)]/70">
            API Dashboard · v1
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Gold Egypt API
          </h1>
          <p className="mt-2 text-sm text-[var(--foreground)]/70">
            This page consumes <code>/api/v1/prices</code> exactly like your
            mobile app will. Refresh forces a fresh pull from goldapi.io.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <AutoRefreshButton />
          <Link
            href="/"
            className="text-xs text-[var(--gold-soft)] hover:underline"
          >
            ← Back to landing
          </Link>
        </div>
      </header>

      {error ? (
        <div className="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-medium">API request failed.</p>
          <p className="mt-1 font-mono opacity-80">{error}</p>
        </div>
      ) : null}

      {data ? (
        <>
          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card label="1 ounce (EGP)" value={fmt(data.pricePerOunceEgp)} />
            <Card label="Bid · شراء سوق" value={fmt(data.bid)} />
            <Card label="Ask · بيع سوق" value={fmt(data.ask)} />
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-lg font-medium text-[var(--gold-soft)]">
              Live response from <code>{origin}/api/v1/prices</code>
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <table className="min-w-full text-sm">
                <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-wider text-[var(--gold-soft)]/80">
                  <tr>
                    <th className="px-4 py-3 text-left">Karat</th>
                    <th className="px-4 py-3 text-right">Intl spot</th>
                    <th className="px-4 py-3 text-right">Buy</th>
                    <th className="px-4 py-3 text-right">Sell (bullion)</th>
                    <th className="px-4 py-3 text-right">Sell (jewelry)</th>
                    <th className="px-4 py-3 text-right">Workmanship</th>
                    <th className="px-4 py-3 text-right">VAT</th>
                  </tr>
                </thead>
                <tbody>
                  {data.karats.map((k) => (
                    <tr
                      key={k.karat}
                      className="border-t border-[var(--border)] hover:bg-[var(--surface-2)]/60"
                    >
                      <td className="px-4 py-3 font-medium">{k.label}</td>
                      <td className="px-4 py-3 text-right font-mono text-[var(--foreground)]/70">
                        {fmt(k.internationalPerGram)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-300">
                        {fmt(k.buyPerGram)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[var(--gold-soft)]">
                        {fmt(k.sellPerGram)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-[var(--gold)]">
                        {fmt(k.retailSellPerGram)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[var(--foreground)]/60">
                        {fmt(k.workmanshipPerGram)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[var(--foreground)]/60">
                        {fmt(k.vatOnWorkmanship)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-[var(--foreground)]/45">
              Snapshot fetched at {fmtTime(data.fetchedAt)} · goldapi timestamp{" "}
              {fmtTime(data.goldApiTimestamp)}
            </p>
          </section>
        </>
      ) : null}

      <section className="mt-12">
        <h2 className="mb-3 text-lg font-medium text-[var(--gold-soft)]">
          Endpoints (for the mobile app)
        </h2>
        <div className="grid grid-cols-1 gap-3">
          <Endpoint method="GET" path="/api/v1/prices" desc="All karats — per-gram local prices" />
          <Endpoint method="GET" path="/api/v1/prices/coins" desc="Egyptian pound + bullion ingots" />
          <Endpoint method="GET" path="/api/v1/prices/history?limit=50" desc="Snapshot history" />
          <Endpoint
            method="GET"
            path="/api/v1/calculate?karat=21&grams=10&workmanship=true"
            desc="Value of any gold piece. workmanship=true applies مصنعية + VAT"
          />
          <Endpoint method="POST" path="/api/v1/refresh" desc="Force-refresh from goldapi.io (auth required)" />
          <Endpoint method="GET" path="/api/v1/health" desc="Health check (no auth)" />
        </div>

        <h3 className="mt-6 mb-2 text-sm font-medium text-[var(--gold-soft)]">
          Bearer token (from <code>.env.local</code>)
        </h3>
        <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs">
          <code>{`Authorization: Bearer ${tokenPreview}`}</code>
        </pre>

        <h3 className="mt-6 mb-2 text-sm font-medium text-[var(--gold-soft)]">
          curl example
        </h3>
        <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs">
          <code>{`curl ${origin}/api/v1/prices \\
  -H "Authorization: Bearer ${tokenPreview}"

curl "${origin}/api/v1/calculate?karat=21&grams=10&workmanship=true" \\
  -H "Authorization: Bearer ${tokenPreview}"`}</code>
        </pre>
      </section>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="text-xs uppercase tracking-wider text-[var(--foreground)]/55">
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold text-[var(--gold)]">
        {value}
      </div>
    </div>
  );
}

function Endpoint({
  method,
  path,
  desc,
}: {
  method: string;
  path: string;
  desc: string;
}) {
  const color =
    method === "GET"
      ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
      : "text-amber-300 border-amber-500/30 bg-amber-500/10";
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:gap-4">
      <span
        className={`inline-block w-fit rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${color}`}
      >
        {method}
      </span>
      <code className="font-mono text-sm text-[var(--gold-soft)]">{path}</code>
      <span className="text-xs text-[var(--foreground)]/55 sm:ml-auto">
        {desc}
      </span>
    </div>
  );
}
