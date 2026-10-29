/**
 * ZamHelper Automated Unit Tests
 * Testing pure logic, SDLC models, algorithms, pricing, concurrency and scheduling.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { calculatePrice, formatKwacha } from '../core/pricing';
import { validateBookingSlot, windowsOverlap, generateAvailableSlots } from '../core/scheduling';
import { BookingMutexRegistry } from '../core/concurrency';
import { haversineDistance, SpatialHashGrid, findShortestRoute, MinHeapPriorityQueue } from '../core/algorithms';
import { roleCan } from '../core/access';
import { Helper } from '../types';

// ============================================================================
// 1. Pricing Engine Tests
// ============================================================================

test('pricing: calculates base fee only when perKmRate is 0', () => {
  const result = calculatePrice(180, 0, 15, false);
  assert.equal(result.baseFee, 180);
  assert.equal(result.travelFee, 0);
  assert.equal(result.subtotal, 180);
  assert.equal(result.total, 180);
  assert.equal(result.urgencyFee, 0);
});

test('pricing: calculates base fee + travel rate correctly for errands/delivery', () => {
  // 100 base + 8 ZMW/km * 10km = 180 ZMW
  const result = calculatePrice(100, 8, 10, false);
  assert.equal(result.travelFee, 80);
  assert.equal(result.subtotal, 180);
  assert.equal(result.total, 180);
});

test('pricing: applies 1.25x urgency multiplier to subtotal', () => {
  // subtotal 180 * 1.25 = 225 ZMW
  const result = calculatePrice(100, 8, 10, true);
  assert.equal(result.subtotal, 180);
  assert.equal(result.urgencyMultiplier, 1.25);
  assert.equal(result.total, 225);
  assert.equal(result.urgencyFee, 45);
});

test('pricing: formats Kwacha with symbol', () => {
  assert.equal(formatKwacha(180, false), 'K180');
  assert.ok(formatKwacha(225.5).includes('K225.50'));
});

// ============================================================================
// 2. Scheduling & Operating Hours Tests
// ============================================================================

test('scheduling: rejects bookings with under 1 hour notice', () => {
  const now = new Date('2030-05-17T09:00:00Z');
  const shortNotice = new Date('2030-05-17T09:30:00Z'); // 30 mins notice
  const check = validateBookingSlot(shortNotice, now);
  assert.equal(check.isValid, false);
  assert.ok(check.errors.some((e) => e.includes('1 hour advance notice')));
});

test('scheduling: accepts valid slot 2 hours ahead during operating hours', () => {
  const now = new Date('2030-05-17T09:00:00');
  const validSlot = new Date('2030-05-17T11:00:00');
  const check = validateBookingSlot(validSlot, now);
  assert.equal(check.isValid, true);
  assert.equal(check.errors.length, 0);
});

test('scheduling: rejects slot before 06:00 opening time', () => {
  const now = new Date('2030-05-17T00:00:00');
  const earlySlot = new Date('2030-05-17T05:30:00');
  const check = validateBookingSlot(earlySlot, now);
  assert.equal(check.isValid, false);
  assert.ok(check.errors.some((e) => e.includes('06:00 and 21:00')));
});

test('scheduling: rejects slot at 21:00 (past 20:45 latest start)', () => {
  const now = new Date('2030-05-17T10:00:00');
  const lateSlot = new Date('2030-05-17T21:00:00');
  const check = validateBookingSlot(lateSlot, now);
  assert.equal(check.isValid, false);
  assert.ok(check.errors.some((e) => e.includes('20:45')));
});

test('scheduling: accepts 20:30 start time', () => {
  const now = new Date('2030-05-17T10:00:00');
  const eveningSlot = new Date('2030-05-17T20:30:00');
  const check = validateBookingSlot(eveningSlot, now);
  assert.equal(check.isValid, true);
});

test('scheduling: rejects slots more than 90 days in advance', () => {
  const now = new Date('2030-05-01T10:00:00');
  const farFuture = new Date('2030-08-30T10:00:00'); // > 90 days
  const check = validateBookingSlot(farFuture, now);
  assert.equal(check.isValid, false);
  assert.ok(check.errors.some((e) => e.includes('90 days')));
});

test('scheduling: back-to-back jobs do not overlap', () => {
  const overlap = windowsOverlap(
    '2030-01-01T10:00:00',
    '2030-01-01T12:00:00',
    '2030-01-01T12:00:00',
    '2030-01-01T14:00:00'
  );
  assert.equal(overlap, false);
});

test('scheduling: intersecting intervals overlap', () => {
  const overlap = windowsOverlap(
    '2030-01-01T10:00:00',
    '2030-01-01T12:00:00',
    '2030-01-01T11:00:00',
    '2030-01-01T13:00:00'
  );
  assert.equal(overlap, true);
});

// ============================================================================
// 3. Concurrency Mutex & Collision Tests (CSMA/CD Concept)
// ============================================================================

test('concurrency: acquires and releases lock for helper', () => {
  const registry = new BookingMutexRegistry();
  const res1 = registry.acquireLock(101, 'ZAM-1001', 5000);
  assert.equal(res1.acquired, true);
  assert.equal(res1.collisionDetected, false);
  assert.ok(res1.lockId);

  // Second user trying to lock same helper within active window gets collision
  const res2 = registry.acquireLock(101, 'ZAM-1002', 5000);
  assert.equal(res2.acquired, false);
  assert.equal(res2.collisionDetected, true);
  assert.ok((res2.backoffMs ?? 0) > 0);

  // Release lock
  const released = registry.releaseLock(101, res1.lockId);
  assert.equal(released, true);

  // Second user can now acquire lock
  const res3 = registry.acquireLock(101, 'ZAM-1002', 5000);
  assert.equal(res3.acquired, true);
});

// ============================================================================
// 4. Algorithmic Data Structures Tests (Spatial Grid, Dijkstra, Min-Heap)
// ============================================================================

test('algorithms: Haversine distance calculates reasonable km', () => {
  // Kabulonga to Rhodes Park is ~4.5 km
  const dist = haversineDistance(-15.422, 28.345, -15.412, 28.305);
  assert.ok(dist >= 4.0 && dist <= 5.5, `Distance was ${dist}`);
});

test('algorithms: SpatialHashGrid indexes and queries radius in O(1)', () => {
  const sampleHelpers: Helper[] = [
    {
      id: 1,
      name: 'Chanda Bwalya',
      phone: '+260971111111',
      city: 'Lusaka',
      area: 'Kabulonga',
      skills: 'Cleaning',
      serviceKeys: ['cleaning'],
      rating: 4.9,
      reviewCount: 28,
      isVerified: true,
      verificationStatus: 'verified',
      isAvailable: true,
      isBusyNow: false,
      coords: { lat: -15.422, lng: 28.345 },
      completedJobsCount: 42,
      policeClearance: true,
      nationalIdVerified: true,
      joinedDate: '2024-01-15',
      avatarBg: 'bg-emerald-600'
    },
    {
      id: 2,
      name: 'Mutale Musonda',
      phone: '+260972222222',
      city: 'Lusaka',
      area: 'Rhodes Park',
      skills: 'Repairs',
      serviceKeys: ['repairs'],
      rating: 4.8,
      reviewCount: 31,
      isVerified: true,
      verificationStatus: 'verified',
      isAvailable: true,
      isBusyNow: false,
      coords: { lat: -15.412, lng: 28.305 },
      completedJobsCount: 38,
      policeClearance: true,
      nationalIdVerified: true,
      joinedDate: '2024-02-10',
      avatarBg: 'bg-blue-600'
    },
    {
      id: 3,
      name: 'Joseph Banda',
      phone: '+260973333333',
      city: 'Kitwe',
      area: 'Parklands',
      skills: 'Gardening',
      serviceKeys: ['gardening'],
      rating: 4.7,
      reviewCount: 19,
      isVerified: true,
      verificationStatus: 'verified',
      isAvailable: true,
      isBusyNow: false,
      coords: { lat: -12.802, lng: 28.213 }, // ~300km away in Copperbelt
      completedJobsCount: 22,
      policeClearance: true,
      nationalIdVerified: true,
      joinedDate: '2024-03-01',
      avatarBg: 'bg-amber-600'
    }
  ];

  const grid = new SpatialHashGrid(3.0);
  grid.buildIndex(sampleHelpers);

  // Search in Kabulonga with 6km radius (should find Chanda and Mutale, but NOT Joseph in Kitwe)
  const nearby = grid.queryRadius(-15.422, 28.345, 6.0);
  assert.equal(nearby.length, 2);
  assert.equal(nearby[0].helper.name, 'Chanda Bwalya');
  assert.equal(nearby[1].helper.name, 'Mutale Musonda');
});

test('algorithms: Dijkstra finds shortest route through network graph', () => {
  const route = findShortestRoute('kabulonga', 'cbd');
  assert.ok(route.totalDistanceKm > 0);
  assert.equal(route.path[0], 'kabulonga');
  assert.equal(route.path[route.path.length - 1], 'cbd');
  assert.ok(route.segments.length >= 2);
});

test('algorithms: MinHeapPriorityQueue maintains lowest urgency score on top', () => {
  const queue = new MinHeapPriorityQueue();
  queue.enqueue({ bookingId: 'B3', urgencyScore: 30, customerName: 'Alice', serviceKey: 'cleaning', createdAt: 1 });
  queue.enqueue({ bookingId: 'B1', urgencyScore: 10, customerName: 'Bob', serviceKey: 'delivery', createdAt: 2 });
  queue.enqueue({ bookingId: 'B2', urgencyScore: 20, customerName: 'Carol', serviceKey: 'repairs', createdAt: 3 });

  assert.equal(queue.size, 3);
  const first = queue.dequeue();
  assert.equal(first?.bookingId, 'B1'); // score 10

  const second = queue.dequeue();
  assert.equal(second?.bookingId, 'B2'); // score 20

  const third = queue.dequeue();
  assert.equal(third?.bookingId, 'B3'); // score 30
  assert.equal(queue.isEmpty(), true);
});

// ============================================================================
// 5. Access Control (RBAC) Tests
// ============================================================================

test('access: customer and admin can access booking and dashboard', () => {
  assert.equal(roleCan('customer', 'dashboard'), true);
  assert.equal(roleCan('admin', 'dashboard'), true);
  assert.equal(roleCan('customer', 'book'), true);
});

test('access: only helper can access helper_workspace', () => {
  assert.equal(roleCan('helper', 'helper_workspace'), true);
  assert.equal(roleCan('customer', 'helper_workspace'), false);
  assert.equal(roleCan('admin', 'helper_workspace'), false);
});

test('access: unknown permission throws error', () => {
  assert.throws(() => {
    roleCan('customer', 'super_secret_action');
  }, /Unknown access permission key/);
});
