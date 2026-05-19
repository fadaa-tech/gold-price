import "server-only";

export type GoldApiResponse = {
  timestamp: number;
  metal: string;
  currency: string;
  exchange: string;
  symbol: string;
  open_time: number;
  price: number;
  ch: number;
  ask: number;
  bid: number;
  prev_close_price: number | null;
  open_price: number | null;
  low_price: number | null;
  high_price: number | null;
  chp: number | null;
  price_gram_24k: number;
  price_gram_22k: number;
  price_gram_21k: number;
  price_gram_20k: number;
  price_gram_18k: number;
  price_gram_16k: number;
  price_gram_14k: number;
  price_gram_10k: number;
};

export async function fetchEgyptGoldSpot(): Promise<GoldApiResponse> {
  const apiKey = process.env.GOLDAPI_KEY;
  if (!apiKey) throw new Error("GOLDAPI_KEY is not set");

  const res = await fetch("https://www.goldapi.io/api/XAU/EGP", {
    headers: {
      "x-access-token": apiKey,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`goldapi.io ${res.status}: ${body.slice(0, 200)}`);
  }

  return (await res.json()) as GoldApiResponse;
}
