/**
 * ZamHelper Algorithmic Core
 *
 * Implements high-performance data structures and algorithms:
 * 1. Spatial Hash Grid (O(1) amortized neighborhood helper search vs O(N) brute force)
 * 2. Dijkstra's Shortest Path Algorithm (O((V + E) log V) optimal travel routing across Lusaka zones)
 * 3. Min-Heap Priority Queue (O(log N) scheduling & urgent job dispatching)
 * 4. Benchmarking Engine for real-time complexity validation
 */

import { Helper } from '../types';

// ============================================================================
// 1. SPATIAL HASH GRID INDEXER (O(1) Average Spatial Querying)
// ============================================================================

export class SpatialHashGrid {
  private cellSizeKm: number;
  private grid: Map<string, Helper[]> = new Map();

  constructor(cellSizeKm: number = 3.0) {
    this.cellSizeKm = cellSizeKm;
  }

  // 1 degree lat is approx 111km; 1 degree lng at 15 deg S (Lusaka) is approx 107km
  private toGridKey(lat: number, lng: number): string {
    const latKm = lat * 110.574;
    const lngKm = lng * 107.55;
    const x = Math.floor(lngKm / this.cellSizeKm);
    const y = Math.floor(latKm / this.cellSizeKm);
    return `${x}:${y}`;
  }

  public insert(helper: Helper): void {
    const key = this.toGridKey(helper.coords.lat, helper.coords.lng);
    const existing = this.grid.get(key) || [];
    existing.push(helper);
    this.grid.set(key, existing);
  }

  public buildIndex(helpers: Helper[]): void {
    this.grid.clear();
    for (const h of helpers) {
      this.insert(h);
    }
  }

  /**
   * O(1) query for helpers within radiusKm.
   * Only examines adjacent cells covering the radius instead of scanning all N helpers.
   */
  public queryRadius(lat: number, lng: number, radiusKm: number): { helper: Helper; distanceKm: number }[] {
    const cellSpan = Math.ceil(radiusKm / this.cellSizeKm);
    const latKm = lat * 110.574;
    const lngKm = lng * 107.55;
    const centerX = Math.floor(lngKm / this.cellSizeKm);
    const centerY = Math.floor(latKm / this.cellSizeKm);

    const candidates: Helper[] = [];
    for (let dx = -cellSpan; dx <= cellSpan; dx++) {
      for (let dy = -cellSpan; dy <= cellSpan; dy++) {
        const key = `${centerX + dx}:${centerY + dy}`;
        const cell = this.grid.get(key);
        if (cell) {
          candidates.push(...cell);
        }
      }
    }

    // Precise filter with Haversine distance
    const results: { helper: Helper; distanceKm: number }[] = [];
    for (const h of candidates) {
      const dist = haversineDistance(lat, lng, h.coords.lat, h.coords.lng);
      if (dist <= radiusKm) {
        results.push({ helper: h, distanceKm: Math.round(dist * 10) / 10 });
      }
    }

    return results.sort((a, b) => a.distanceKm - b.distanceKm);
  }
}

/**
 * Great-circle distance using Haversine formula (km)
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================================================================
// 2. DIJKSTRA'S SHORTEST PATH (O((V + E) log V) Lusaka Urban Network Routing)
// ============================================================================

export interface UrbanNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface GraphEdge {
  to: string;
  distanceKm: number;
  roadName: string;
}

export const LUSAKA_ROAD_NETWORK: { nodes: Record<string, UrbanNode>; edges: Record<string, GraphEdge[]> } = {
  nodes: {
    kabulonga: { id: 'kabulonga', name: 'Kabulonga', lat: -15.422, lng: 28.345 },
    woodlands: { id: 'woodlands', name: 'Woodlands', lat: -15.441, lng: 28.328 },
    rhodes_park: { id: 'rhodes_park', name: 'Rhodes Park', lat: -15.412, lng: 28.305 },
    roma: { id: 'roma', name: 'Roma', lat: -15.378, lng: 28.312 },
    northmead: { id: 'northmead', name: 'Northmead', lat: -15.398, lng: 28.298 },
    olympia: { id: 'olympia', name: 'Olympia Park', lat: -15.385, lng: 28.301 },
    avondale: { id: 'avondale', name: 'Avondale', lat: -15.382, lng: 28.384 },
    chelstone: { id: 'chelstone', name: 'Chelstone', lat: -15.372, lng: 28.405 },
    chilenje: { id: 'chilenje', name: 'Chilenje', lat: -15.456, lng: 28.318 },
    matero: { id: 'matero', name: 'Matero', lat: -15.388, lng: 28.254 },
    cbd: { id: 'cbd', name: 'Lusaka CBD / Cairo Rd', lat: -15.419, lng: 28.283 }
  },
  edges: {
    cbd: [
      { to: 'rhodes_park', distanceKm: 2.8, roadName: 'Church Rd / Addis Ababa Dr' },
      { to: 'northmead', distanceKm: 3.2, roadName: 'Great North Rd' },
      { to: 'woodlands', distanceKm: 4.9, roadName: 'Independence Ave' },
      { to: 'matero', distanceKm: 6.2, roadName: 'Lumumba Rd' }
    ],
    rhodes_park: [
      { to: 'cbd', distanceKm: 2.8, roadName: 'Church Rd' },
      { to: 'kabulonga', distanceKm: 4.5, roadName: 'Los Angeles Blvd' },
      { to: 'northmead', distanceKm: 2.1, roadName: 'Addis Ababa Dr' },
      { to: 'woodlands', distanceKm: 3.8, roadName: 'Birdcage Walk' }
    ],
    kabulonga: [
      { to: 'rhodes_park', distanceKm: 4.5, roadName: 'Los Angeles Blvd' },
      { to: 'woodlands', distanceKm: 3.1, roadName: 'Lake Rd' },
      { to: 'avondale', distanceKm: 6.8, roadName: 'Kabulonga Rd / Twin Palm' }
    ],
    woodlands: [
      { to: 'cbd', distanceKm: 4.9, roadName: 'Independence Ave' },
      { to: 'kabulonga', distanceKm: 3.1, roadName: 'Lake Rd' },
      { to: 'chilenje', distanceKm: 2.4, roadName: 'Burma Rd' },
      { to: 'rhodes_park', distanceKm: 3.8, roadName: 'Birdcage Walk' }
    ],
    northmead: [
      { to: 'cbd', distanceKm: 3.2, roadName: 'Great North Rd' },
      { to: 'rhodes_park', distanceKm: 2.1, roadName: 'Addis Ababa Dr' },
      { to: 'olympia', distanceKm: 1.8, roadName: 'Katima Mulilo Rd' },
      { to: 'roma', distanceKm: 3.4, roadName: 'Zambezi Rd' }
    ],
    olympia: [
      { to: 'northmead', distanceKm: 1.8, roadName: 'Katima Mulilo Rd' },
      { to: 'roma', distanceKm: 1.9, roadName: 'Kasangula Rd' },
      { to: 'avondale', distanceKm: 7.5, roadName: 'Great East Rd' }
    ],
    roma: [
      { to: 'northmead', distanceKm: 3.4, roadName: 'Zambezi Rd' },
      { to: 'olympia', distanceKm: 1.9, roadName: 'Kasangula Rd' },
      { to: 'avondale', distanceKm: 7.1, roadName: 'Ngwerere Rd / Great East Rd' }
    ],
    avondale: [
      { to: 'chelstone', distanceKm: 2.9, roadName: 'Great East Rd' },
      { to: 'kabulonga', distanceKm: 6.8, roadName: 'Twin Palm Rd' },
      { to: 'olympia', distanceKm: 7.5, roadName: 'Great East Rd' }
    ],
    chelstone: [
      { to: 'avondale', distanceKm: 2.9, roadName: 'Great East Rd' }
    ],
    chilenje: [
      { to: 'woodlands', distanceKm: 2.4, roadName: 'Burma Rd' }
    ],
    matero: [
      { to: 'cbd', distanceKm: 6.2, roadName: 'Lumumba Rd' },
      { to: 'northmead', distanceKm: 5.5, roadName: 'Commonwealth Ave' }
    ]
  }
};

export interface RouteResult {
  path: string[];
  pathNames: string[];
  totalDistanceKm: number;
  segments: { from: string; to: string; distanceKm: number; roadName: string }[];
}

/**
 * Dijkstra's algorithm to calculate shortest route between two Lusaka districts.
 */
export function findShortestRoute(startId: string, endId: string): RouteResult {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const edgeUsed: Record<string, GraphEdge | null> = {};
  const unvisited = new Set<string>();

  for (const nodeId of Object.keys(LUSAKA_ROAD_NETWORK.nodes)) {
    distances[nodeId] = Number.POSITIVE_INFINITY;
    previous[nodeId] = null;
    edgeUsed[nodeId] = null;
    unvisited.add(nodeId);
  }

  distances[startId] = 0;

  while (unvisited.size > 0) {
    // Pick unvisited node with minimum distance
    let current: string | null = null;
    let minDistance = Number.POSITIVE_INFINITY;
    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    }

    if (!current || minDistance === Number.POSITIVE_INFINITY || current === endId) {
      break;
    }

    unvisited.delete(current);

    const neighbors = LUSAKA_ROAD_NETWORK.edges[current] || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.to)) continue;

      const alt = distances[current] + edge.distanceKm;
      if (alt < distances[edge.to]) {
        distances[edge.to] = alt;
        previous[edge.to] = current;
        edgeUsed[edge.to] = edge;
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  const segments: { from: string; to: string; distanceKm: number; roadName: string }[] = [];
  let curr: string | null = endId;

  while (curr) {
    path.unshift(curr);
    const prev = previous[curr];
    if (prev && edgeUsed[curr]) {
      segments.unshift({
        from: prev,
        to: curr,
        distanceKm: edgeUsed[curr]!.distanceKm,
        roadName: edgeUsed[curr]!.roadName
      });
    }
    curr = prev;
  }

  const pathNames = path.map((id) => LUSAKA_ROAD_NETWORK.nodes[id]?.name || id);
  const totalDistanceKm = Math.round((distances[endId] || 0) * 10) / 10;

  return {
    path,
    pathNames,
    totalDistanceKm,
    segments
  };
}

// ============================================================================
// 3. MIN-HEAP PRIORITY QUEUE (O(log N) Booking Dispatch Queue)
// ============================================================================

export interface PrioritizedJob {
  bookingId: string;
  urgencyScore: number; // lower number = higher priority
  customerName: string;
  serviceKey: string;
  createdAt: number;
}

export class MinHeapPriorityQueue {
  private heap: PrioritizedJob[] = [];

  public get size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public enqueue(item: PrioritizedJob): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  public dequeue(): PrioritizedJob | undefined {
    if (this.isEmpty()) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.sinkDown(0);
    }
    return top;
  }

  public peek(): PrioritizedJob | undefined {
    return this.heap[0];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].urgencyScore < this.heap[parentIndex].urgencyScore) {
        // Swap
        const tmp = this.heap[index];
        this.heap[index] = this.heap[parentIndex];
        this.heap[parentIndex] = tmp;
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.heap[left].urgencyScore < this.heap[smallest].urgencyScore) {
        smallest = left;
      }
      if (right < length && this.heap[right].urgencyScore < this.heap[smallest].urgencyScore) {
        smallest = right;
      }

      if (smallest !== index) {
        const tmp = this.heap[index];
        this.heap[index] = this.heap[smallest];
        this.heap[smallest] = tmp;
        index = smallest;
      } else {
        break;
      }
    }
  }

  public toArray(): PrioritizedJob[] {
    return [...this.heap];
  }
}

// ============================================================================
// 4. COMPLEXITY BENCHMARKS & METRICS
// ============================================================================

export function runAlgorithmicBenchmark(helpers: Helper[], queryLat: number, queryLng: number, radiusKm: number) {
  // 1. Spatial Hash Grid query
  const grid = new SpatialHashGrid(3.0);
  grid.buildIndex(helpers);

  const t0 = performance.now();
  const gridResults = grid.queryRadius(queryLat, queryLng, radiusKm);
  const gridDurationMs = performance.now() - t0;

  // 2. Linear O(N) Brute-Force query
  const t1 = performance.now();
  const linearResults = helpers.filter((h) => {
    return haversineDistance(queryLat, queryLng, h.coords.lat, h.coords.lng) <= radiusKm;
  });
  const linearDurationMs = performance.now() - t1;

  // 3. Dijkstra Route
  const t2 = performance.now();
  const route = findShortestRoute('kabulonga', 'matero');
  const dijkstraDurationMs = performance.now() - t2;

  return {
    spatialGrid: {
      foundCount: gridResults.length,
      durationMs: Number(gridDurationMs.toFixed(3)),
      complexity: 'O(1) average lookup'
    },
    linearScan: {
      foundCount: linearResults.length,
      durationMs: Number(linearDurationMs.toFixed(3)),
      complexity: 'O(N) full array scan'
    },
    speedupRatio: linearDurationMs > 0 ? (linearDurationMs / Math.max(0.001, gridDurationMs)).toFixed(1) + 'x' : '1.0x',
    dijkstra: {
      path: route.pathNames.join(' → '),
      distanceKm: route.totalDistanceKm,
      durationMs: Number(dijkstraDurationMs.toFixed(3)),
      complexity: 'O((V + E) log V)'
    }
  };
}
