import "server-only";
import { prisma } from "./db";
import { fetchEgyptGoldSpot, type GoldApiResponse } from "./goldapi";

export const KARAT_KEYS = [24, 22, 21, 20, 18, 16, 14, 10] as const;
export type Karat = (typeof KARAT_KEYS)[number];

const TROY_OUNCE_GRAMS = 31.1034768;

function gramFieldFor(karat: Karat): keyof GoldApiResponse {
  return `price_gram_${karat}k` as keyof GoldApiResponse;
}

export type Trend = {
  delta: number; // current - previous, in EGP
  pct: number; // delta / previous * 100
  direction: "up" | "down" | "flat";
};

export type LocalKaratPrice = {
  karat: Karat;
  label: string;
  internationalPerGram: number;
  buyPerGram: number;
  sellPerGram: number;
  retailSellPerGram: number;
  workmanshipPerGram: number;
  vatOnWorkmanship: number;
  trend: Trend | null; // change in international per-gram vs previous snapshot
};

export type LocalPriceSet = {
  fetchedAt: string;
  goldApiTimestamp: string;
  pricePerOunceEgp: number;
  ask: number;
  bid: number;
  ounceTrend: Trend | null;
  karats: LocalKaratPrice[];
};

function trendFrom(current: number, previous: number | null | undefined): Trend | null {
  if (previous == null || !Number.isFinite(previous) || previous <= 0) return null;
  const delta = current - previous;
  const pct = (delta / previous) * 100;
  const direction = delta > 0.005 ? "up" : delta < -0.005 ? "down" : "flat";
  return { delta: round2(delta), pct: Math.round(pct * 1000) / 1000, direction };
}

/** Egyptian local price formula. All inputs/outputs in EGP. */
export function computeLocal(
  internationalPerGram: number,
  cfg: { buy: number; sell: number; workmanship: number; vatRate: number },
): Omit<LocalKaratPrice, "karat" | "label" | "internationalPerGram" | "trend"> {
  const buyPerGram = Math.max(0, internationalPerGram - cfg.buy);
  const sellPerGram = internationalPerGram + cfg.sell;
  const vatOnWorkmanship = cfg.workmanship * cfg.vatRate;
  const retailSellPerGram = sellPerGram + cfg.workmanship + vatOnWorkmanship;
  return {
    buyPerGram: round2(buyPerGram),
    sellPerGram: round2(sellPerGram),
    retailSellPerGram: round2(retailSellPerGram),
    workmanshipPerGram: round2(cfg.workmanship),
    vatOnWorkmanship: round2(vatOnWorkmanship),
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function freshnessWindowMs() {
  const minutes = Number(process.env.PRICE_CACHE_MINUTES ?? "5");
  return minutes * 60 * 1000;
}

/**
 * Returns the latest snapshot, refreshing from goldapi.io if the cached one
 * is older than PRICE_CACHE_MINUTES. Always persists a new snapshot when it
 * refreshes so we have a history trail.
 */
export async function getOrRefreshSnapshot(force = false) {
  const latest = await prisma.goldSnapshot.findFirst({
    orderBy: { fetchedAt: "desc" },
  });

  const isStale =
    !latest || Date.now() - latest.fetchedAt.getTime() > freshnessWindowMs();

  if (force || isStale) {
    const data = await fetchEgyptGoldSpot();
    const created = await prisma.goldSnapshot.create({
      data: {
        goldApiTimestamp: new Date(data.timestamp * 1000),
        pricePerOunceEgp: data.price,
        ask: data.ask,
        bid: data.bid,
        pricePerGram24k: data.price_gram_24k,
        pricePerGram22k: data.price_gram_22k,
        pricePerGram21k: data.price_gram_21k,
        pricePerGram20k: data.price_gram_20k,
        pricePerGram18k: data.price_gram_18k,
        pricePerGram16k: data.price_gram_16k,
        pricePerGram14k: data.price_gram_14k,
        pricePerGram10k: data.price_gram_10k,
        raw: data as unknown as object,
      },
    });
    return created;
  }
  return latest;
}

export async function getLocalPriceSet(force = false): Promise<LocalPriceSet> {
  const snap = await getOrRefreshSnapshot(force);

  const [previous, configs] = await Promise.all([
    prisma.goldSnapshot.findFirst({
      where: { id: { not: snap.id }, goldApiTimestamp: { not: snap.goldApiTimestamp } },
      orderBy: { fetchedAt: "desc" },
    }),
    prisma.karatConfig.findMany({ where: { enabled: true } }),
  ]);

  const cfgByKarat = new Map(configs.map((c) => [c.karat, c]));

  const karats: LocalKaratPrice[] = [];
  for (const k of KARAT_KEYS) {
    const cfg = cfgByKarat.get(k);
    if (!cfg) continue;

    const intl = Number(
      (snap as unknown as Record<string, unknown>)[`pricePerGram${k}k`] as unknown,
    );
    const prevIntl = previous
      ? Number((previous as unknown as Record<string, unknown>)[`pricePerGram${k}k`])
      : null;
    const local = computeLocal(intl, {
      buy: Number(cfg.buySpreadEgpGram),
      sell: Number(cfg.sellSpreadEgpGram),
      workmanship: Number(cfg.workmanshipEgpGram),
      vatRate: Number(cfg.vatRate),
    });
    karats.push({
      karat: k,
      label: cfg.label,
      internationalPerGram: round2(intl),
      ...local,
      trend: trendFrom(intl, prevIntl),
    });
  }

  return {
    fetchedAt: snap.fetchedAt.toISOString(),
    goldApiTimestamp: snap.goldApiTimestamp.toISOString(),
    pricePerOunceEgp: round2(Number(snap.pricePerOunceEgp)),
    ask: round2(Number(snap.ask)),
    bid: round2(Number(snap.bid)),
    ounceTrend: trendFrom(
      Number(snap.pricePerOunceEgp),
      previous ? Number(previous.pricePerOunceEgp) : null,
    ),
    karats,
  };
}

export type CoinPrice = {
  slug: string;
  labelEn: string;
  labelAr: string;
  karat: number;
  grams: number;
  buyPrice: number;
  sellPrice: number;
  retailSellPrice: number;
};

export async function getCoinPrices(force = false): Promise<{
  fetchedAt: string;
  goldApiTimestamp: string;
  coins: CoinPrice[];
}> {
  const [prices, coins] = await Promise.all([
    getLocalPriceSet(force),
    prisma.coinConfig.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const byKarat = new Map(prices.karats.map((k) => [k.karat, k]));

  return {
    fetchedAt: prices.fetchedAt,
    goldApiTimestamp: prices.goldApiTimestamp,
    coins: coins.map((c) => {
      const k = byKarat.get(c.karat as Karat);
      const grams = Number(c.grams);
      const buy = k ? k.buyPerGram * grams : 0;
      const sell = k ? k.sellPerGram * grams : 0;
      const retail = k ? k.retailSellPerGram * grams : 0;
      return {
        slug: c.slug,
        labelEn: c.labelEn,
        labelAr: c.labelAr,
        karat: c.karat,
        grams,
        buyPrice: round2(buy),
        sellPrice: round2(sell),
        retailSellPrice: round2(retail),
      };
    }),
  };
}

export type CalculateInput = {
  karat: Karat;
  grams: number;
  workmanship?: boolean;
};

export async function calculatePrice(input: CalculateInput) {
  if (!KARAT_KEYS.includes(input.karat)) {
    throw new Error("invalid karat");
  }
  if (!Number.isFinite(input.grams) || input.grams <= 0) {
    throw new Error("grams must be > 0");
  }

  const prices = await getLocalPriceSet(false);
  const row = prices.karats.find((k) => k.karat === input.karat);
  if (!row) throw new Error("karat not enabled");

  const sellUnit = input.workmanship ? row.retailSellPerGram : row.sellPerGram;
  return {
    karat: row.karat,
    grams: input.grams,
    withWorkmanship: Boolean(input.workmanship),
    perGram: {
      international: row.internationalPerGram,
      buy: row.buyPerGram,
      sell: sellUnit,
    },
    totals: {
      buy: round2(row.buyPerGram * input.grams),
      sell: round2(sellUnit * input.grams),
    },
    fetchedAt: prices.fetchedAt,
  };
}

export { TROY_OUNCE_GRAMS };
