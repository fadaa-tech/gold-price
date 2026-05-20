/**
 * Egyptian retail-gold reference data.
 *
 * Live values for karat-level spread/workmanship and per-coin workmanship
 * are loaded from the database (`KaratConfig`, `CoinConfig`) and surfaced
 * via the API. This file holds only what is NOT dynamic per-snapshot:
 *   - the legally-fixed VAT rate
 *   - the Tax Authority's official "minimum" manufacturing-cost averages
 *     used as the VAT floor (effective July 1, 2025; reviewed annually)
 *   - the pricing math helpers
 */

export const EGYPT_VAT_RATE = 0.14;

/**
 * Egyptian Tax Authority manufacturing-cost averages per gram, used as the
 * legal VAT floor regardless of what a shop actually charges. Reviewed
 * annually by the Tax Authority + Federation of Gold and Jewelry.
 * Current values effective from July 1, 2025.
 */
export const OFFICIAL_MASNAIYA_PER_GRAM: Record<number, number> = {
  24: 58.56,
  22: 58.56,
  21: 58.56,
  20: 73.15,
  18: 87.85,
  16: 80.5,
  14: 73.15,
  12: 65.88,
  10: 54.9,
};

export type PriceBreakdown = {
  goldValue: number;
  masnaiyaTotal: number;
  vatTotal: number;
  total: number;
  perGramRetail: number;
};

/**
 * Standard Egyptian retail formula:
 *   total = grams × international + grams × masnaiya × (1 + VAT)
 *
 * `applyVat` lets coin/bullion callers opt out (coins are VAT-exempt under
 * Egyptian tax law).
 */
export function computeRetail(
  internationalPerGram: number,
  grams: number,
  masnaiyaPerGram: number,
  applyVat = true,
  vatRate = EGYPT_VAT_RATE,
): PriceBreakdown {
  const safeGrams = Math.max(0, grams);
  const goldValue = internationalPerGram * safeGrams;
  const masnaiyaTotal = masnaiyaPerGram * safeGrams;
  const vatTotal = applyVat ? masnaiyaTotal * vatRate : 0;
  const total = goldValue + masnaiyaTotal + vatTotal;
  const perGramRetail = safeGrams > 0 ? total / safeGrams : 0;
  return {
    goldValue: round2(goldValue),
    masnaiyaTotal: round2(masnaiyaTotal),
    vatTotal: round2(vatTotal),
    total: round2(total),
    perGramRetail: round2(perGramRetail),
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
