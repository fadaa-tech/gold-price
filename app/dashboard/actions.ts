"use server";

import { revalidatePath } from "next/cache";
import { getLocalPriceSet } from "@/lib/pricing";

export async function refreshNow() {
  await getLocalPriceSet(true);
  revalidatePath("/dashboard");
  revalidatePath("/");
}
