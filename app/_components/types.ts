export type Trend = {
  delta: number;
  pct: number;
  direction: "up" | "down" | "flat";
};

export type KaratRow = {
  karat: number;
  label: string;
  internationalPerGram: number;
  buyPerGram: number;
  sellPerGram: number;
  retailSellPerGram: number;
  workmanshipPerGram: number;
  vatOnWorkmanship: number;
  trend: Trend | null;
};

export type Coin = {
  slug: string;
  labelEn: string;
  labelAr: string;
  karat: number;
  grams: number;
  buyPrice: number;
  sellPrice: number;
  retailSellPrice: number;
};

export type PricesPayload = {
  currency: string;
  prices: {
    fetchedAt: string;
    goldApiTimestamp: string;
    pricePerOunceEgp: number;
    ask: number;
    bid: number;
    ounceTrend: Trend | null;
    karats: KaratRow[];
  };
  coins: {
    fetchedAt: string;
    goldApiTimestamp: string;
    coins: Coin[];
  };
};
