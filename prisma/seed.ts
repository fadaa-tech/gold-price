import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Egyptian local-market defaults. These match the typical Cairo dealer
// numbers as of mid-2026 and can be tuned later via DB or admin UI.
// All amounts in EGP per gram.
const KARATS = [
  { karat: 24, label: "24K", buy: 50, sell: 70, workmanship: 40 },
  { karat: 22, label: "22K", buy: 50, sell: 70, workmanship: 50 },
  { karat: 21, label: "21K", buy: 50, sell: 70, workmanship: 60 },
  { karat: 20, label: "20K", buy: 50, sell: 70, workmanship: 70 },
  { karat: 18, label: "18K", buy: 60, sell: 80, workmanship: 80 },
  { karat: 16, label: "16K", buy: 60, sell: 80, workmanship: 90 },
  { karat: 14, label: "14K", buy: 60, sell: 80, workmanship: 100 },
  { karat: 10, label: "10K", buy: 70, sell: 90, workmanship: 110 },
];

// Egyptian gold coins — all 21K.
const COINS = [
  { slug: "pound", labelEn: "Gold Pound", labelAr: "جنيه ذهب", karat: 21, grams: 8, sortOrder: 1 },
  { slug: "half-pound", labelEn: "Half Pound", labelAr: "نصف جنيه", karat: 21, grams: 4, sortOrder: 2 },
  { slug: "quarter-pound", labelEn: "Quarter Pound", labelAr: "ربع جنيه", karat: 21, grams: 2, sortOrder: 3 },
  { slug: "rashadi-pound", labelEn: "Rashadi Pound", labelAr: "جنيه رشادي", karat: 24, grams: 8, sortOrder: 4 },
  { slug: "ingot-50g", labelEn: "Bullion Ingot 50g", labelAr: "سبيكة 50 جرام", karat: 24, grams: 50, sortOrder: 5 },
  { slug: "ingot-100g", labelEn: "Bullion Ingot 100g", labelAr: "سبيكة 100 جرام", karat: 24, grams: 100, sortOrder: 6 },
  { slug: "ingot-1kg", labelEn: "Bullion Ingot 1kg", labelAr: "سبيكة كيلو", karat: 24, grams: 1000, sortOrder: 7 },
];

async function main() {
  for (const k of KARATS) {
    await prisma.karatConfig.upsert({
      where: { karat: k.karat },
      update: {},
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
      update: {},
      create: c,
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
