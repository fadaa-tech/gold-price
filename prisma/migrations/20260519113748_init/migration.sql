-- CreateTable
CREATE TABLE "GoldSnapshot" (
    "id" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "goldApiTimestamp" TIMESTAMP(3) NOT NULL,
    "pricePerOunceEgp" DECIMAL(14,4) NOT NULL,
    "ask" DECIMAL(14,4) NOT NULL,
    "bid" DECIMAL(14,4) NOT NULL,
    "pricePerGram24k" DECIMAL(14,4) NOT NULL,
    "pricePerGram22k" DECIMAL(14,4) NOT NULL,
    "pricePerGram21k" DECIMAL(14,4) NOT NULL,
    "pricePerGram20k" DECIMAL(14,4) NOT NULL,
    "pricePerGram18k" DECIMAL(14,4) NOT NULL,
    "pricePerGram16k" DECIMAL(14,4) NOT NULL,
    "pricePerGram14k" DECIMAL(14,4) NOT NULL,
    "pricePerGram10k" DECIMAL(14,4) NOT NULL,
    "raw" JSONB NOT NULL,

    CONSTRAINT "GoldSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KaratConfig" (
    "karat" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "buySpreadEgpGram" DECIMAL(10,4) NOT NULL,
    "sellSpreadEgpGram" DECIMAL(10,4) NOT NULL,
    "workmanshipEgpGram" DECIMAL(10,4) NOT NULL,
    "vatRate" DECIMAL(6,4) NOT NULL DEFAULT 0.14,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KaratConfig_pkey" PRIMARY KEY ("karat")
);

-- CreateTable
CREATE TABLE "CoinConfig" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "karat" INTEGER NOT NULL,
    "grams" DECIMAL(10,4) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoldSnapshot_fetchedAt_idx" ON "GoldSnapshot"("fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CoinConfig_slug_key" ON "CoinConfig"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_token_key" ON "ApiKey"("token");
