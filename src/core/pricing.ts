/**
 * ZamHelper Pricing Engine
 * Handles base rates, distance fees, urgency multiplier, and currency formatting.
 */

export interface PriceBreakdown {
  baseFee: number;
  travelFee: number;
  subtotal: number;
  urgencyMultiplier: number;
  urgencyFee: number;
  total: number;
  currency: string;
}

/**
 * Calculates the complete booking price following the ZamHelper specification:
 * - baseFee: flat starting rate for service
 * - distanceKm: customer estimated travel distance
 * - perKmRate: rate per kilometer
 * - isUrgent: applies 1.25x (25% surcharge) to the subtotal
 *
 * Formula:
 * travelFee = distanceKm * perKmRate
 * subtotal = baseFee + travelFee
 * total = isUrgent ? Math.round(subtotal * 1.25 * 100) / 100 : subtotal
 */
export function calculatePrice(
  baseFee: number,
  perKmRate: number,
  distanceKm: number,
  isUrgent: boolean = false
): PriceBreakdown {
  const safeBase = Math.max(0, Number(baseFee) || 0);
  const safeRate = Math.max(0, Number(perKmRate) || 0);
  const safeKm = Math.max(0, Number(distanceKm) || 0);

  const travelFee = Math.round(safeKm * safeRate * 100) / 100;
  const subtotal = Math.round((safeBase + travelFee) * 100) / 100;
  const urgencyMultiplier = isUrgent ? 1.25 : 1.0;
  const total = isUrgent
    ? Math.round(subtotal * 1.25 * 100) / 100
    : subtotal;
  const urgencyFee = Math.round((total - subtotal) * 100) / 100;

  return {
    baseFee: safeBase,
    travelFee,
    subtotal,
    urgencyMultiplier,
    urgencyFee,
    total,
    currency: 'ZMW'
  };
}

/**
 * Formats a number as Zambian Kwacha (e.g. "K180.00" or "K 180")
 */
export function formatKwacha(amount: number, includeDecimals = true): string {
  if (isNaN(amount)) return 'K0.00';
  if (includeDecimals) {
    return `K${amount.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `K${Math.round(amount).toLocaleString('en-ZM')}`;
}
