"use server";

import { revalidatePath } from "next/cache";
import { getLocalPriceSet } from "@/lib/pricing";

export async function refreshNow() {
  // `getLocalPriceSet` is now resilient to upstream failures (it falls back
  // to the latest cached snapshot if goldapi.io is unavailable). We still
  // guard the action so a fresh DB with zero snapshots doesn't surface as
  // an unhandled runtime error in the user's browser.
  try {
    await getLocalPriceSet(true);
  } catch (err) {
    console.error("[refreshNow] upstream refresh failed:", (err as Error).message);
  }
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/calculator");
  revalidatePath("/buy-vs-sell");
}
