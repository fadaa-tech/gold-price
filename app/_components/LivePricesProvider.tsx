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
  refresh: () => Promise<void>;
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

  const refresh = useCallback(async () => {
    if (inflight.current) return;
    inflight.current = true;
    setRefreshing(true);
    try {
      const res = await fetch("/api/public/prices", { cache: "no-store" });
      if (res.ok) {
        const next = (await res.json()) as PricesPayload;
        // Only flash if the snapshot actually changed
        if (next.prices.fetchedAt !== data.prices.fetchedAt) {
          setFlashKey((k) => k + 1);
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
  }, [data.prices.fetchedAt]);

  useEffect(() => {
    const id = setInterval(() => {
      refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  // Refresh when tab returns to focus, throttled
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
