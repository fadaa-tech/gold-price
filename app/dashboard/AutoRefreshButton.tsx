"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { refreshNow } from "./actions";

const AUTO_REFRESH_MS = 60_000;

export function AutoRefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lastRefreshAt, setLastRefreshAt] = useState<number>(Date.now());
  const [now, setNow] = useState<number | null>(null);
  const inflight = useRef(false);

  const trigger = () => {
    if (inflight.current) return;
    inflight.current = true;
    startTransition(async () => {
      try {
        await refreshNow();
        setLastRefreshAt(Date.now());
        router.refresh();
      } finally {
        inflight.current = false;
      }
    });
  };

  // Tick once a second so the countdown label updates.
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-trigger every 60 seconds.
  useEffect(() => {
    const id = setInterval(trigger, AUTO_REFRESH_MS);
    return () => clearInterval(id);
    // trigger is intentionally stable via the inflight ref — no deps needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const secondsSince = now === null ? 0 : Math.floor((now - lastRefreshAt) / 1000);
  const secondsUntil = Math.max(0, Math.ceil(AUTO_REFRESH_MS / 1000) - secondsSince);

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={trigger}
        disabled={pending}
        aria-busy={pending}
        className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-medium text-[#1a1408] hover:bg-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75 ${
              pending ? "animate-ping" : ""
            }`}
          />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
        </span>
        {pending ? "Refreshing…" : "Refresh now"}
      </button>
      <span
        className="text-[10px] w-[100px] text-[var(--foreground)]/55"
        suppressHydrationWarning
      >
        Auto-refresh every 60s · next in {secondsUntil}s
      </span>
    </div>
  );
}
