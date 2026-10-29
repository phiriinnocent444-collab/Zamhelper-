/**
 * ZamHelper Scheduling Engine
 * Validates requested booking slots against business rules:
 * - Minimum advance notice: 1 hour (60 minutes)
 * - Operating hours: 06:00 to 21:00 (latest allowed start is 20:45)
 * - Maximum forward horizon: 90 days
 * - Concurrency & slot overlap analysis
 */

export interface SlotValidationResult {
  isValid: boolean;
  errors: string[];
  parsedDate?: Date;
}

/**
 * Validates a target start time against business constraints.
 */
export function validateBookingSlot(
  slotInput: string | Date,
  referenceNow: Date = new Date()
): SlotValidationResult {
  const errors: string[] = [];

  let date: Date;
  if (typeof slotInput === 'string') {
    date = new Date(slotInput);
  } else {
    date = slotInput;
  }

  if (isNaN(date.getTime())) {
    return { isValid: false, errors: ['Invalid date/time format.'] };
  }

  // 1. Advance Notice Check (at least 60 minutes)
  const diffMs = date.getTime() - referenceNow.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes < 60) {
    errors.push('Bookings require at least 1 hour advance notice.');
  }

  // 2. Maximum Horizon (90 days)
  const maxHorizonMs = 90 * 24 * 60 * 60 * 1000;
  if (diffMs > maxHorizonMs) {
    errors.push('Bookings cannot be scheduled more than 90 days in advance.');
  }

  // 3. Operating Hours Check (06:00 to 20:45 start time)
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const openingMinutes = 6 * 60; // 06:00
  const closingMinutes = 20 * 60 + 45; // 20:45 (last start time)

  if (totalMinutes < openingMinutes || totalMinutes > closingMinutes) {
    errors.push('Helpers operate between 06:00 and 21:00 (latest start time is 20:45).');
  }

  return {
    isValid: errors.length === 0,
    errors,
    parsedDate: date
  };
}

/**
 * Evaluates whether two service time windows overlap.
 * - Back-to-back intervals do NOT overlap: [10:00, 12:00] and [12:00, 14:00] is valid.
 * - Open-ended jobs (end2 is null) ongoing from start2 block subsequent overlaps.
 */
export function windowsOverlap(
  start1: Date | string,
  end1: Date | string | null,
  start2: Date | string,
  end2: Date | string | null
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = end1 ? new Date(end1).getTime() : s1 + 120 * 60 * 1000; // default 2hr if open
  const s2 = new Date(start2).getTime();
  const e2 = end2 ? new Date(end2).getTime() : Number.POSITIVE_INFINITY;

  // If one ends exactly when or before the other starts, they do NOT overlap
  if (e1 <= s2 || e2 <= s1) {
    return false;
  }

  return true;
}

/**
 * Generates available upcoming time slots for a given date.
 */
export function generateAvailableSlots(targetDate: Date, referenceNow: Date = new Date()): string[] {
  const slots: string[] = [];
  const base = new Date(targetDate);
  base.setSeconds(0, 0);

  // From 06:00 to 20:30 in 30-min increments
  for (let h = 6; h <= 20; h++) {
    for (const m of [0, 30]) {
      if (h === 20 && m > 30) continue;
      const slot = new Date(base);
      slot.setHours(h, m, 0, 0);

      const validation = validateBookingSlot(slot, referenceNow);
      if (validation.isValid) {
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
  }

  return slots;
}
