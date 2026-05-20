import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Egyptian local-market defaults, calibrated against Cairo newspaper quotes
// (Al-Masry Al-Youm, Youm7, Dostor) as of May 2026.
//
// Notes on the numbers:
//   - goldapi.io's international per-gram is consistently 40–60 EGP/g BELOW
//     what Egyptian newspapers quote as the "raw" gold price, because the
//     Federation of Gold and Jewelry publishes its own daily reference that
//     includes a small local-market premium. We absorb this into the spreads.
//   - buy spread can be NEGATIVE: that means shops pay slightly MORE than
//     goldapi's intl per-gram (because the local market sits above it).
//   - workmanship for 21K is the typical Cairo plain-piece rate (~175 EGP/g);
//     designed pieces run higher and users override via the calculator.
//   - 24K is mostly bullion in Egypt, so its workmanship is low.
// All amounts in EGP per gram.
const KARATS = [
  { karat: 24, label: "24K", buy: -30, sell: 60, workmanship: 90 },
  { karat: 22, label: "22K", buy: -25, sell: 70, workmanship: 140 },
  { karat: 21, label: "21K", buy: -20, sell: 80, workmanship: 175 },
  { karat: 20, label: "20K", buy: -15, sell: 80, workmanship: 170 },
  { karat: 18, label: "18K", buy: -10, sell: 75, workmanship: 175 },
  { karat: 16, label: "16K", buy: 0, sell: 70, workmanship: 160 },
  { karat: 14, label: "14K", buy: 10, sell: 65, workmanship: 140 },
  { karat: 10, label: "10K", buy: 25, sell: 60, workmanship: 120 },
];

// Egyptian gold coins & bullion. Workmanship is per-coin (NOT karat-level)
// and matches published rates from gold-era.eg (Cairo's largest bullion
// retailer). Coins & bullion are VAT-exempt under Egyptian tax law.
//
// Note: the historical Rashadi pound is 22K (not 24K) — corrected here.
const COINS = [
  { slug: "pound", labelEn: "Gold Pound", labelAr: "جنيه ذهب", karat: 21, grams: 8, workmanship: 55, sortOrder: 1 },
  { slug: "half-pound", labelEn: "Half Pound", labelAr: "نصف جنيه", karat: 21, grams: 4, workmanship: 60, sortOrder: 2 },
  { slug: "quarter-pound", labelEn: "Quarter Pound", labelAr: "ربع جنيه", karat: 21, grams: 2, workmanship: 63, sortOrder: 3 },
  { slug: "rashadi-pound", labelEn: "Rashadi Pound", labelAr: "جنيه رشادي", karat: 22, grams: 8, workmanship: 70, sortOrder: 4 },
  { slug: "ingot-50g", labelEn: "Bullion Ingot 50g", labelAr: "سبيكة 50 جرام", karat: 24, grams: 50, workmanship: 65, sortOrder: 5 },
  { slug: "ingot-100g", labelEn: "Bullion Ingot 100g", labelAr: "سبيكة 100 جرام", karat: 24, grams: 100, workmanship: 59, sortOrder: 6 },
  { slug: "ingot-1kg", labelEn: "Bullion Ingot 1kg", labelAr: "سبيكة كيلو", karat: 24, grams: 1000, workmanship: 26.05, sortOrder: 7 },
];

async function main() {
  for (const k of KARATS) {
    await prisma.karatConfig.upsert({
      where: { karat: k.karat },
      update: {
        label: k.label,
        buySpreadEgpGram: k.buy,
        sellSpreadEgpGram: k.sell,
        workmanshipEgpGram: k.workmanship,
        vatRate: 0.14,
        enabled: true,
      },
      create: {
        karat: k.karat,
        label: k.label,
        buySpreadEgpGram: k.buy,
        sellSpreadEgpGram: k.sell,
        workmanshipEgpGram: k.workmanship,
        vatRate: 0.14,
        enabled: true,
      },
    });
  }

  for (const c of COINS) {
    await prisma.coinConfig.upsert({
      where: { slug: c.slug },
      update: {
        labelEn: c.labelEn,
        labelAr: c.labelAr,
        karat: c.karat,
        grams: c.grams,
        workmanshipEgpGram: c.workmanship,
        sortOrder: c.sortOrder,
        enabled: true,
      },
      create: {
        slug: c.slug,
        labelEn: c.labelEn,
        labelAr: c.labelAr,
        karat: c.karat,
        grams: c.grams,
        workmanshipEgpGram: c.workmanship,
        sortOrder: c.sortOrder,
      },
    });
  }

  console.log("seeded karat configs:", KARATS.length);
  console.log("seeded coin configs:", COINS.length);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
