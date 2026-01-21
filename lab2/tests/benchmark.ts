const CONSUMER_URL = 'http://localhost:3000';
const REQUEST_COUNT = 100;
const FIB_NUMBER = 35;

interface ComputeRequest {
  taskType: 'fib' | 'pow';
  data: number[];
}

interface ComputeResult {
  result: number;
  taskType: string;
  internalComputationTimeMs: number;
  internalNetworkLatencyMs: number;
  internalTotalTimeMs: number;
}

interface BenchmarkResult {
  totalRequests: number;
  totalTimeMs: number;
  averageTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  requestsPerSecond: number;
}

async function makeRequest(
  endpoint: string,
  body: ComputeRequest,
): Promise<{ result: ComputeResult; timeMs: number }> {
  const start = performance.now();

  const response = await fetch(`${CONSUMER_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = (await response.json()) as ComputeResult;
  const timeMs = performance.now() - start;

  return { result, timeMs };
}

function calculateStats(times: number[]): BenchmarkResult {
  const totalTimeMs = times.reduce((a, b) => a + b, 0);
  return {
    totalRequests: times.length,
    totalTimeMs: Math.round(totalTimeMs),
    averageTimeMs: Math.round(totalTimeMs / times.length),
    minTimeMs: Math.round(Math.min(...times)),
    maxTimeMs: Math.round(Math.max(...times)),
    requestsPerSecond:
      Math.round((times.length / totalTimeMs) * 1000 * 100) / 100,
  };
}

async function runSequential(
  endpoint: string,
  requests: ComputeRequest[],
): Promise<number[]> {
  const times: number[] = [];

  for (const req of requests) {
    const { timeMs } = await makeRequest(endpoint, req);
    times.push(timeMs);
  }

  return times;
}

interface ParallelResult {
  times: number[];
  results: ComputeResult[];
}

async function runParallel(
  endpoint: string,
  requests: ComputeRequest[],
): Promise<ParallelResult> {
  const responses = await Promise.all(
    requests.map((req) => makeRequest(endpoint, req)),
  );

  return {
    times: responses.map((r) => r.timeMs),
    results: responses.map((r) => r.result),
  };
}

function calculateInternalStats(results: ComputeResult[]) {
  const avgComputation = Math.round(
    results.reduce((a, r) => a + r.internalComputationTimeMs, 0) /
      results.length,
  );
  const avgNetwork = Math.round(
    results.reduce((a, r) => a + r.internalNetworkLatencyMs, 0) /
      results.length,
  );
  const avgTotal = Math.round(
    results.reduce((a, r) => a + r.internalTotalTimeMs, 0) / results.length,
  );

  return { avgComputation, avgNetwork, avgTotal };
}

async function main() {
  // Generate test requests
  const requests: ComputeRequest[] = Array.from(
    { length: REQUEST_COUNT },
    () => ({
      taskType: 'fib' as const,
      data: [FIB_NUMBER],
    }),
  );

  console.log('=== Lab2: Parallel Processing Benchmark ===\n');
  console.log(`Requests: ${REQUEST_COUNT} x Fibonacci(${FIB_NUMBER})\n`);

  // --- SYNC Parallel ---
  console.log('--- SYNC (HTTP) Parallel (Promise.all) ---');
  const syncParStart = performance.now();
  const syncParData = await runParallel('/compute', requests);
  const syncParTotal = performance.now() - syncParStart;
  const syncParStats = calculateStats(syncParData.times);
  const syncInternalStats = calculateInternalStats(syncParData.results);
  console.log(`Total wall time: ${Math.round(syncParTotal)}ms`);
  console.log(syncParStats);
  console.log(
    `Internal avg: computation=${syncInternalStats.avgComputation}ms, network=${syncInternalStats.avgNetwork}ms, total=${syncInternalStats.avgTotal}ms`,
  );
  console.log('');

  // --- ASYNC Parallel ---
  console.log('--- ASYNC (RabbitMQ) Parallel (Promise.all) ---');
  const asyncParStart = performance.now();
  const asyncParData = await runParallel('/async/compute', requests);
  const asyncParTotal = performance.now() - asyncParStart;
  const asyncParStats = calculateStats(asyncParData.times);
  const asyncInternalStats = calculateInternalStats(asyncParData.results);
  console.log(`Total wall time: ${Math.round(asyncParTotal)}ms`);
  console.log(asyncParStats);
  console.log(
    `Internal avg: computation=${asyncInternalStats.avgComputation}ms, network=${asyncInternalStats.avgNetwork}ms, total=${asyncInternalStats.avgTotal}ms`,
  );
  console.log('');

  // --- Summary ---
  console.log('=== SUMMARY ===');
  console.log(`SYNC Parallel:  ${Math.round(syncParTotal)}ms`);
  console.log(`ASYNC Parallel: ${Math.round(asyncParTotal)}ms`);

  const diff = syncParTotal - asyncParTotal;
  if (diff > 0) {
    console.log(
      `\nASYNC is ${Math.round(diff)}ms faster (${Math.round((syncParTotal / asyncParTotal) * 100) / 100}x)`,
    );
  } else {
    console.log(
      `\nSYNC is ${Math.round(-diff)}ms faster (${Math.round((asyncParTotal / syncParTotal) * 100) / 100}x)`,
    );
  }
}

main().catch(console.error);
