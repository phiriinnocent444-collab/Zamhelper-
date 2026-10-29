/**
 * CSMA/CD-Inspired Concurrency & Collision Resolution Engine
 *
 * In high-concurrency helper booking environments (e.g. multiple clients trying
 * to book the last available verified plumber or cleaner in Kabulonga simultaneously):
 *
 * 1. Carrier Sense: Checks whether the helper resource is currently busy/locked.
 * 2. Collision Detection: Detects if two transactions concurrently attempt to claim
 *    the same helper in the same time window.
 * 3. Exponential Backoff: Simulates randomized slot backoff for retry attempts
 *    before escalating or proposing alternate verified helpers.
 */

export interface LockAttemptResult {
  acquired: boolean;
  lockId?: string;
  helperId: number;
  message: string;
  collisionDetected: boolean;
  backoffMs?: number;
}

export class BookingMutexRegistry {
  private activeLocks: Map<number, { lockId: string; expiresAt: number; bookingCode: string }> = new Map();

  /**
   * Attempts to acquire an exclusive lock on a helper for a booking session.
   * Lock auto-expires after ttlMs (default 60 seconds) to prevent starvation.
   */
  public acquireLock(helperId: number, bookingCode: string, ttlMs: number = 60000): LockAttemptResult {
    const now = Date.now();
    const existing = this.activeLocks.get(helperId);

    // If locked and not expired
    if (existing && existing.expiresAt > now) {
      if (existing.bookingCode === bookingCode) {
        // Re-entrant lock for same booking
        existing.expiresAt = now + ttlMs;
        return {
          acquired: true,
          lockId: existing.lockId,
          helperId,
          message: 'Lock renewed for session.',
          collisionDetected: false
        };
      }

      // Collision detected! Calculate truncated binary exponential backoff
      const collisionDetected = true;
      const slotTimeMs = 50;
      const k = Math.min(6, Math.floor(Math.random() * 4) + 1);
      const backoffMs = (Math.floor(Math.random() * Math.pow(2, k)) + 1) * slotTimeMs;

      return {
        acquired: false,
        helperId,
        message: `Helper #${helperId} is currently undergoing assignment checkout by another user.`,
        collisionDetected,
        backoffMs
      };
    }

    // Lock granted
    const lockId = `LOCK-${helperId}-${now}-${Math.random().toString(36).substring(2, 7)}`;
    this.activeLocks.set(helperId, {
      lockId,
      expiresAt: now + ttlMs,
      bookingCode
    });

    return {
      acquired: true,
      lockId,
      helperId,
      message: 'Resource lock successfully acquired.',
      collisionDetected: false
    };
  }

  /**
   * Release lock upon completed checkout or explicit cancellation.
   */
  public releaseLock(helperId: number, lockId?: string): boolean {
    const existing = this.activeLocks.get(helperId);
    if (!existing) return true;

    if (!lockId || existing.lockId === lockId) {
      this.activeLocks.delete(helperId);
      return true;
    }

    return false;
  }

  /**
   * Clean expired locks.
   */
  public sweep(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [helperId, lock] of this.activeLocks.entries()) {
      if (lock.expiresAt <= now) {
        this.activeLocks.delete(helperId);
        cleaned++;
      }
    }
    return cleaned;
  }

  public isLocked(helperId: number): boolean {
    const existing = this.activeLocks.get(helperId);
    if (!existing) return false;
    if (existing.expiresAt <= Date.now()) {
      this.activeLocks.delete(helperId);
      return false;
    }
    return true;
  }
}

export const globalMutexRegistry = new BookingMutexRegistry();
