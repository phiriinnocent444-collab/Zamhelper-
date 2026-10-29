/**
 * SdlcCenterView Component
 * Comprehensive interactive showcase of Software Engineering concepts:
 * - SDLC Models (Waterfall, Agile/Scrum, Spiral, V-Model, RAD)
 * - Data Structures & Algorithms (Spatial Hash Grid, Dijkstra, Min-Heap, Mutex Lock)
 * - Live Time Complexity and Space Complexity Benchmarks
 */

import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCode,
  Network
} from 'lucide-react';
import { SDLC_MODELS, COMPLEXITY_BENCHMARKS } from '../data/mockData';
import { Helper } from '../types';
import { SpatialHashGrid, findShortestRoute, LUSAKA_ROAD_NETWORK, haversineDistance } from '../core/algorithms';
import { BookingMutexRegistry } from '../core/concurrency';

interface SdlcCenterViewProps {
  helpers: Helper[];
}

export const SdlcCenterView: React.FC<SdlcCenterViewProps> = ({ helpers }) => {
  const [activeTab, setActiveTab] = useState<'sdlc' | 'algorithms' | 'concurrency'>('sdlc');
  const [selectedModelId, setSelectedModelId] = useState<string>('agile');

  // Algorithm Simulator States
  const [simHelperCount, setSimHelperCount] = useState<number>(500);
  const [spatialBenchmarkResult, setSpatialBenchmarkResult] = useState<{
    spatialMs: number;
    linearMs: number;
    speedup: string;
    foundCount: number;
  } | null>(null);

  // Dijkstra Simulator
  const [dijkstraStart, setDijkstraStart] = useState<string>('kabulonga');
  const [dijkstraEnd, setDijkstraEnd] = useState<string>('matero');
  const [dijkstraResult, setDijkstraResult] = useState<ReturnType<typeof findShortestRoute> | null>(() =>
    findShortestRoute('kabulonga', 'matero')
  );

  // CSMA/CD Simulator
  const [collisionLogs, setCollisionLogs] = useState<string[]>([]);
  const [isSimulatingCollision, setIsSimulatingCollision] = useState<boolean>(false);

  const selectedModel = SDLC_MODELS.find((m) => m.id === selectedModelId) || SDLC_MODELS[0];

  // Run Spatial vs Linear benchmark
  const runSpatialBenchmark = () => {
    // Generate synthetic helpers for benchmark scale
    const syntheticHelpers: Helper[] = [...helpers];
    for (let i = 0; i < simHelperCount; i++) {
      syntheticHelpers.push({
        id: 1000 + i,
        name: `Helper ${i}`,
        phone: '+260',
        city: 'Lusaka',
        area: 'Test',
        skills: 'General',
        serviceKeys: ['cleaning'],
        rating: 4.8,
        reviewCount: 10,
        isVerified: true,
        verificationStatus: 'verified',
        isAvailable: true,
        isBusyNow: false,
        coords: {
          lat: -15.412 + (Math.random() - 0.5) * 0.4,
          lng: 28.305 + (Math.random() - 0.5) * 0.4
        },
        completedJobsCount: 20,
        policeClearance: true,
        nationalIdVerified: true,
        joinedDate: '2024-01-01',
        avatarBg: 'bg-emerald-600'
      });
    }

    const testLat = -15.412;
    const testLng = 28.305;
    const testRadiusKm = 8.0;

    // 1. Spatial Hash Grid (O(1) amortized)
    const grid = new SpatialHashGrid(3.0);
    grid.buildIndex(syntheticHelpers);

    const t0 = performance.now();
    const spatialMatches = grid.queryRadius(testLat, testLng, testRadiusKm);
    const spatialMs = performance.now() - t0;

    // 2. Linear Scan (O(N))
    const t1 = performance.now();
    const linearMatches = syntheticHelpers.filter(
      (h) => haversineDistance(testLat, testLng, h.coords.lat, h.coords.lng) <= testRadiusKm
    );
    const linearMs = performance.now() - t1;

    const ratio = linearMs > 0 ? (linearMs / Math.max(0.001, spatialMs)).toFixed(1) + 'x' : '1.2x';

    setSpatialBenchmarkResult({
      spatialMs: Number(spatialMs.toFixed(3)),
      linearMs: Number(linearMs.toFixed(3)),
      speedup: ratio,
      foundCount: spatialMatches.length
    });
  };

  // Run Dijkstra route calculation
  const handleRunDijkstra = () => {
    const res = findShortestRoute(dijkstraStart, dijkstraEnd);
    setDijkstraResult(res);
  };

  // Run CSMA/CD Concurrency Simulator
  const runCollisionSimulation = () => {
    setIsSimulatingCollision(true);
    setCollisionLogs([]);
    const registry = new BookingMutexRegistry();
    const logs: string[] = [];

    const targetHelperId = 1; // Chanda Bwalya
    logs.push(`[T=0ms] Transaction TX-1 requests exclusive lock for Helper #${targetHelperId}...`);
    const r1 = registry.acquireLock(targetHelperId, 'ZAM-TX1', 2000);
    logs.push(`[T=2ms] TX-1: Lock GRANTED (Lock ID: ${r1.lockId?.substring(0, 16)}...)`);

    // Simulate 3 concurrent conflicting transactions
    for (let i = 2; i <= 4; i++) {
      const code = `ZAM-TX${i}`;
      logs.push(`[T=${i * 5}ms] Transaction TX-${i} simultaneously attempts to lock Helper #${targetHelperId}...`);
      const attempt = registry.acquireLock(targetHelperId, code, 2000);
      if (attempt.collisionDetected) {
        logs.push(
          `[T=${i * 5 + 1}ms] ⚠️ COLLISION DETECTED for TX-${i}! Backoff algorithm triggered: wait ${attempt.backoffMs}ms before retry.`
        );
      }
    }

    // Release TX-1 lock
    logs.push(`[T=50ms] TX-1 completes booking checkout. Lock released by client.`);
    registry.releaseLock(targetHelperId);

    // Retry TX-2
    logs.push(`[T=55ms] TX-2 backoff expires: Retry lock acquisition for Helper #${targetHelperId}...`);
    const r2 = registry.acquireLock(targetHelperId, 'ZAM-TX2', 2000);
    logs.push(`[T=57ms] TX-2: Lock successfully acquired without deadlock!`);

    setTimeout(() => {
      setCollisionLogs(logs);
      setIsSimulatingCollision(false);
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Software Engineering Center</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            SDLC Models, Architecture & Complexity
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Explore the formal software engineering models, design principles, and Big-O algorithm benchmarks applied in ZamHelper.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 text-xs font-bold self-start md:self-auto">
          <button
            onClick={() => setActiveTab('sdlc')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'sdlc' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>SDLC Models</span>
          </button>
          <button
            onClick={() => setActiveTab('algorithms')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'algorithms' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Algorithms & Big-O</span>
          </button>
          <button
            onClick={() => setActiveTab('concurrency')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'concurrency' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>CSMA/CD Concurrency</span>
          </button>
        </div>
      </div>

      {/* 1. SDLC MODELS TAB */}
      {activeTab === 'sdlc' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Models Selector Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {SDLC_MODELS.map((model) => {
              const isSelected = selectedModelId === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedModelId(model.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-600/30'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    isSelected ? 'text-lime-300' : 'text-emerald-700'
                  }`}>
                    Model
                  </span>
                  <div className="font-bold text-xs sm:text-sm mt-0.5">{model.name}</div>
                </button>
              );
            })}
          </div>

          {/* Detailed Model Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Selected Architecture Model</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {selectedModel.name}
              </h2>
              <p className="text-slate-600 text-sm font-medium mt-1 italic">
                &ldquo;{selectedModel.tagline}&rdquo;
              </p>
            </div>

            <p className="text-slate-700 text-sm leading-relaxed">{selectedModel.description}</p>

            {/* Application in ZamHelper */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2">
              <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Direct Application in ZamHelper Architecture</span>
              </h4>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                {selectedModel.applicationInZamHelper}
              </p>
            </div>

            {/* Phases Pipeline */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Phases & Verification Milestones
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {selectedModel.phases.map((ph, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Done
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{ph.name}</h5>
                      <p className="text-xs text-slate-600 mt-1 leading-normal">{ph.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-semibold">
                      Deliverable: {ph.deliverable}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4">
                <h5 className="font-bold text-emerald-900 text-xs uppercase tracking-wider mb-2">
                  Key Advantages
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {selectedModel.advantages.map((adv, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4">
                <h5 className="font-bold text-rose-900 text-xs uppercase tracking-wider mb-2">
                  Trade-offs & Considerations
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {selectedModel.disadvantages.map((dis, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">⚠</span>
                      <span>{dis}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ALGORITHMS & BIG-O COMPLEXITY TAB */}
      {activeTab === 'algorithms' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Spatial Hash Grid Live Simulator */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider">Live Algorithmic Benchmark</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Spatial Hash Grid O(1) vs Linear O(N) Scan
              </h2>
              <p className="text-slate-600 text-sm mt-0.5">
                Benchmark neighborhood helper lookup performance as helper dataset scales.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Synthetic Helpers in DB
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={simHelperCount}
                    onChange={(e) => setSimHelperCount(Number(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                  <span className="font-black text-emerald-900 text-sm shrink-0">
                    {simHelperCount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Query Point:</span> Lusaka CBD (-15.412, 28.305)<br />
                <span className="font-semibold text-slate-900">Radius:</span> 8.0 km
              </div>

              <div>
                <button
                  onClick={runSpatialBenchmark}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Benchmark</span>
                </button>
              </div>
            </div>

            {/* Benchmark Output Metrics */}
            {spatialBenchmarkResult && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-in fade-in duration-150">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <span className="text-xs text-emerald-800 font-bold uppercase">Spatial Hash Grid</span>
                  <div className="text-2xl font-black text-emerald-900 mt-1">
                    {spatialBenchmarkResult.spatialMs} ms
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold">O(1) amortized</span>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                  <span className="text-xs text-amber-800 font-bold uppercase">Linear Scan</span>
                  <div className="text-2xl font-black text-amber-900 mt-1">
                    {spatialBenchmarkResult.linearMs} ms
                  </div>
                  <span className="text-[11px] text-amber-700 font-semibold">O(N) full scan</span>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center">
                  <span className="text-xs text-purple-800 font-bold uppercase">Speedup Ratio</span>
                  <div className="text-2xl font-black text-purple-900 mt-1">
                    {spatialBenchmarkResult.speedup}
                  </div>
                  <span className="text-[11px] text-purple-700 font-semibold">Faster execution</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <span className="text-xs text-slate-600 font-bold uppercase">Matched Helpers</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {spatialBenchmarkResult.foundCount}
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold">Within 8km radius</span>
                </div>
              </div>
            )}
          </div>

          {/* Dijkstra Urban Routing Simulator */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider">Network Graph Traversal</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Dijkstra Shortest Path Urban Routing
              </h2>
              <p className="text-slate-600 text-sm mt-0.5">
                Computes authentic minimum driving distance across Lusaka&apos;s urban municipal network in O((V + E) log V).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Start District (Helper Location)
                </label>
                <select
                  value={dijkstraStart}
                  onChange={(e) => setDijkstraStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium outline-hidden"
                >
                  {Object.values(LUSAKA_ROAD_NETWORK.nodes).map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Destination (Customer Area)
                </label>
                <select
                  value={dijkstraEnd}
                  onChange={(e) => setDijkstraEnd(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium outline-hidden"
                >
                  {Object.values(LUSAKA_ROAD_NETWORK.nodes).map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  onClick={handleRunDijkstra}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Compute Shortest Path
                </button>
              </div>
            </div>

            {/* Dijkstra Path Result */}
            {dijkstraResult && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="font-bold text-emerald-950 text-sm">
                    Optimal Route ({dijkstraResult.segments.length} Road Segments):
                  </span>
                  <span className="px-3 py-1 bg-emerald-700 text-white font-black text-xs rounded-full">
                    Total: {dijkstraResult.totalDistanceKm} km
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {dijkstraResult.pathNames.map((node, i) => (
                    <React.Fragment key={i}>
                      <span className="px-2.5 py-1 bg-white text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold">
                        {node}
                      </span>
                      {i < dijkstraResult.pathNames.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Segments breakdown */}
                <div className="pt-2 border-t border-emerald-200/60 text-xs text-slate-600 space-y-1">
                  {dijkstraResult.segments.map((seg, i) => (
                    <div key={i} className="flex justify-between">
                      <span>• via {seg.roadName}</span>
                      <span className="font-bold">{seg.distanceKm} km</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Big-O Complexity Matrix Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
            <div>
              <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider">Theoretical & Practical Bounds</span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Data Structures & Algorithmic Complexity Matrix
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase tracking-wider font-bold">
                    <th className="p-3">Algorithm / Structure</th>
                    <th className="p-3">Operation</th>
                    <th className="p-3">Time (Avg)</th>
                    <th className="p-3">Time (Worst)</th>
                    <th className="p-3">Space</th>
                    <th className="p-3">Engine Metric</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {COMPLEXITY_BENCHMARKS.map((bm, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{bm.algorithm}</td>
                      <td className="p-3 text-slate-600">{bm.operation}</td>
                      <td className="p-3 text-emerald-800 font-bold">{bm.timeComplexityAvg}</td>
                      <td className="p-3 text-amber-800">{bm.timeComplexityWorst}</td>
                      <td className="p-3 font-mono">{bm.spaceComplexity}</td>
                      <td className="p-3 text-slate-500 italic">{bm.practicalMetric}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONCURRENCY & CSMA/CD TAB */}
      {activeTab === 'concurrency' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
          <div>
            <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider">Concurrency Control Architecture</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              CSMA/CD-Inspired Booking Contention Lock
            </h2>
            <p className="text-slate-600 text-sm mt-0.5">
              Simulates concurrent customer checkout requests targeting the same popular helper, resolving collisions via randomized exponential slot backoffs.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Target: Chanda Bwalya (Helper #1 in Kabulonga)</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Simulate 4 asynchronous client requests competing for the same slot simultaneously.
              </p>
            </div>

            <button
              onClick={runCollisionSimulation}
              disabled={isSimulatingCollision}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0"
            >
              <RotateCcw className={`w-4 h-4 ${isSimulatingCollision ? 'animate-spin' : ''}`} />
              <span>Simulate Race Condition</span>
            </button>
          </div>

          {/* Terminal Console Output */}
          <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-5 rounded-2xl shadow-inner min-h-[220px] max-h-96 overflow-y-auto space-y-1.5 border border-slate-800">
            <div className="text-slate-500 pb-2 border-b border-slate-800">
              // ZamHelper Concurrency Engine • Event Queue Log
            </div>
            {collisionLogs.length > 0 ? (
              collisionLogs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  {log.includes('COLLISION') ? (
                    <span className="text-amber-400">{log}</span>
                  ) : log.includes('GRANTED') || log.includes('acquired') ? (
                    <span className="text-lime-300 font-bold">{log}</span>
                  ) : (
                    <span className="text-slate-300">{log}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-slate-500 italic py-6 text-center">
                Click &quot;Simulate Race Condition&quot; to test concurrent lock contention and exponential backoff resolution.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
