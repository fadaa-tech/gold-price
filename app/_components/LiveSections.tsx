"use client";

import { usePrices } from "./LivePricesProvider";
import { HeroCard } from "./HeroCard";
import { KaratTable } from "./KaratTable";
import { CoinGrid } from "./CoinGrid";
import type { KaratRow } from "./types";

function pickKarat(karats: KaratRow[], k: number) {
  return karats.find((r) => r.karat === k);
}

export function LiveHeroCards() {
  const { data } = usePrices();
  const k = data.prices.karats;
  const k24 = pickKarat(k, 24);
  const k21 = pickKarat(k, 21);
  const k18 = pickKarat(k, 18);
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {k24 ? <HeroCard row={k24} /> : null}
      {k21 ? <HeroCard row={k21} highlight /> : null}
      {k18 ? <HeroCard row={k18} /> : null}
    </section>
  );
}

export function LiveKaratTable() {
  const { data } = usePrices();
  return <KaratTable rows={data.prices.karats} />;
}

export function LiveCoinGrid() {
  const { data } = usePrices();
  return <CoinGrid coins={data.coins.coins} />;
}
