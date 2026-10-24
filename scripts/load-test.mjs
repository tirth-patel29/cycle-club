/**
 * Anand Cycling Club — Registration Load Testing Script
 * Simulates concurrent registration requests with synthetic rider profiles,
 * canonical bicycle types, and idempotency guarantees.
 *
 * Usage:
 *   node scripts/load-test.mjs [concurrency] [totalRequests] [baseUrl]
 * Example:
 *   node scripts/load-test.mjs 50 500 http://localhost:3000
 */

const BICYCLE_TYPES = ['Road', 'Hybrid', 'MTB', 'City Bike', 'Gravel Cycle'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const SIZES = ['S', 'M', 'L', 'XL', '2XL'];

async function main() {
  const concurrency = parseInt(process.argv[2] || '20', 10);
  const totalRequests = parseInt(process.argv[3] || '100', 10);
  const baseUrl = process.argv[4] || 'http://localhost:3000';

  console.log(`\n======================================================`);
  console.log(`   ANAND CYCLING CLUB — CONCURRENT LOAD SIMULATOR    `);
  console.log(`======================================================`);
  console.log(`Target URL:      ${baseUrl}/api/registrations`);
  console.log(`Total Requests:  ${totalRequests}`);
  console.log(`Concurrency:     ${concurrency}`);
  console.log(`------------------------------------------------------\n`);

  let completed = 0;
  let succeeded = 0;
  let failed = 0;
  const latencies = [];

  const startTime = Date.now();

  async function sendRegistration(index) {
    const idempotencyKey = `load-test-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 8)}`;
    const randomBicycle = BICYCLE_TYPES[index % BICYCLE_TYPES.length];
    const randomGender = GENDERS[index % GENDERS.length];
    const randomSize = SIZES[index % SIZES.length];

    const payload = {
      event_id: 'evt-001',
      full_name: `Synthetic Rider ${index + 1}`,
      mobile_number: `9825${String(100000 + index).slice(-6)}`,
      email: `synthetic.rider.${index + 1}@acc-loadtest.org`,
      age: 20 + (index % 45),
      gender: randomGender,
      bicycle_type: randomBicycle,
      bicycle_brand: 'Trek',
      bicycle_model: 'Domane AL 2',
      jersey_size: randomSize,
      terms_accepted: true,
      idempotency_key: idempotencyKey
    };

    const reqStart = Date.now();
    try {
      const res = await fetch(`${baseUrl}/api/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': idempotencyKey
        },
        body: JSON.stringify(payload)
      });

      const latency = Date.now() - reqStart;
      latencies.push(latency);

      if (res.ok) {
        succeeded++;
      } else {
        failed++;
      }
    } catch {
      failed++;
      latencies.push(Date.now() - reqStart);
    } finally {
      completed++;
      if (completed % 25 === 0 || completed === totalRequests) {
        process.stdout.write(`\rProgress: ${completed}/${totalRequests} (${Math.round((completed / totalRequests) * 100)}%)`);
      }
    }
  }

  // Pool execution
  const queue = Array.from({ length: totalRequests }, (_, i) => i);
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const idx = queue.shift();
      if (idx !== undefined) {
        await sendRegistration(idx);
      }
    }
  });

  await Promise.all(workers);

  const totalTimeSec = (Date.now() - startTime) / 1000;
  latencies.sort((a, b) => a - b);

  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length || 0;
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = totalRequests / totalTimeSec;

  console.log(`\n\n================ LOAD TEST RESULTS ================`);
  console.log(`Total Requests:      ${totalRequests}`);
  console.log(`Successful:          ${succeeded}`);
  console.log(`Failed:              ${failed}`);
  console.log(`Success Rate:        ${((succeeded / totalRequests) * 100).toFixed(1)}%`);
  console.log(`Elapsed Time:        ${totalTimeSec.toFixed(2)}s`);
  console.log(`Throughput:          ${rps.toFixed(1)} req/sec`);
  console.log(`Avg Latency:         ${avgLatency.toFixed(1)}ms`);
  console.log(`p50 Latency:         ${p50}ms`);
  console.log(`p95 Latency:         ${p95}ms`);
  console.log(`p99 Latency:         ${p99}ms`);
  console.log(`====================================================\n`);
}

main().catch(console.error);
