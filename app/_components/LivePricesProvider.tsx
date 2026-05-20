"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PricesPayload } from "./types";

type Ctx = {
  data: PricesPayload;
  refreshing: boolean;
  refresh: (opts?: { force?: boolean }) => Promise<void>;
  lastUpdatedAt: number;
  flashKey: number;
};

const PricesCtx = createContext<Ctx | null>(null);

export function usePrices() {
  const ctx = useContext(PricesCtx);
  if (!ctx) throw new Error("usePrices must be used within LivePricesProvider");
  return ctx;
}

export function LivePricesProvider({
  initial,
  intervalMs = 60_000,
  children,
}: {
  initial: PricesPayload;
  intervalMs?: number;
  children: React.ReactNode;
}) {
  const [data, setData] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const [flashKey, setFlashKey] = useState(0);
  const inflight = useRef(false);
  const latestFetchedAt = useRef(initial.prices.fetchedAt);

  const refresh = useCallback(async (opts?: { force?: boolean }) => {
    if (inflight.current) return;
    inflight.current = true;
    setRefreshing(true);
    try {
      const url = opts?.force
        ? "/api/public/prices?force=1"
        : "/api/public/prices";
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const next = (await res.json()) as PricesPayload;
        if (next.prices.fetchedAt !== latestFetchedAt.current) {
          setFlashKey((k) => k + 1);
          latestFetchedAt.current = next.prices.fetchedAt;
        }
        setData(next);
        setLastUpdatedAt(Date.now());
      }
    } catch {
      // swallow — next tick will retry
    } finally {
      inflight.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  // Refresh when tab returns to focus
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refresh]);

  const value = useMemo<Ctx>(
    () => ({ data, refreshing, refresh, lastUpdatedAt, flashKey }),
    [data, refreshing, refresh, lastUpdatedAt, flashKey],
  );

  return <PricesCtx.Provider value={value}>{children}</PricesCtx.Provider>;
}
