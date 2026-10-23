/**
 * Anand Cycling Club - Event Platform Load Testing Script
 * 
 * Simulates concurrent participant traffic accessing the homepage,
 * event detail, and submitting registrations.
 * 
 * Usage:
 *   node scripts/load-test.mjs --concurrency 50 --requests 200 --url http://localhost:3000
 */

import { randomUUID } from 'crypto';

const args = process.argv.slice(2);
function getArg(flag, defaultValue) {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
}

const BASE_URL = getArg('--url', 'http://localhost:3000');
const CONCURRENCY = parseInt(getArg('--concurrency', '50'), 10);
const TOTAL_REQUESTS = parseInt(getArg('--requests', '200'), 10);

console.log(`====================================================`);
console.log(`🚴 Anand Cycling Club - Load Testing Harness`);
console.log(`Target URL:        ${BASE_URL}`);
console.log(`Concurrency Level: ${CONCURRENCY} virtual users`);
console.log(`Total Requests:    ${TOTAL_REQUESTS}`);
console.log(`====================================================\n`);

const latencies = [];
let successful = 0;
let failed = 0;

async function executeSingleJourney(userId) {
  const start = performance.now();
  const idempotencyKey = randomUUID();

  try {
    // 1. Fetch Homepage
    const resHome = await fetch(`${BASE_URL}/`);
    if (!resHome.ok) throw new Error(`Home failed with status ${resHome.status}`);

    // 2. Fetch Event Detail
    const resEvent = await fetch(`${BASE_URL}/events/amul-heritage-city-ride-2026`);
    if (!resEvent.ok) throw new Error(`Event detail failed with status ${resEvent.status}`);

    // 3. Submit Registration
    const regPayload = {
      event_id: 'evt-001',
      full_name: `Test Rider ${userId}`,
      mobile_number: `9825${String(100000 + (userId % 900000))}`,
      age: 20 + (userId % 50),
      gender: 'Male',
      bicycle_type: 'Hybrid',
      terms_accepted: true,
      idempotency_key: idempotencyKey
    };

    const resReg = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload)
    });

    if (!resReg.ok) throw new Error(`Registration failed with status ${resReg.status}`);
    const regData = await resReg.json();

    // 4. Simulate Demo Payment
    const resPay = await fetch(`${BASE_URL}/api/payments/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registration_reference: regData.public_reference,
        outcome: 'success',
        payment_method: 'upi_qr'
      })
    });

    if (!resPay.ok) throw new Error(`Payment failed with status ${resPay.status}`);

    const duration = performance.now() - start;
    latencies.push(duration);
    successful++;
  } catch (err) {
    failed++;
  }
}

async function runPool() {
  const startTime = performance.now();
  let completed = 0;
  let running = 0;
  let requestIndex = 0;

  return new Promise((resolve) => {
    function launchNext() {
      if (completed >= TOTAL_REQUESTS) {
        resolve();
        return;
      }

      while (running < CONCURRENCY && requestIndex < TOTAL_REQUESTS) {
        const id = requestIndex++;
        running++;

        executeSingleJourney(id).finally(() => {
          running--;
          completed++;
          if (completed % 25 === 0 || completed === TOTAL_REQUESTS) {
            process.stdout.write(`\rProgress: ${completed}/${TOTAL_REQUESTS} completed (${failed} errors)`);
          }
          launchNext();
        });
      }
    }

    launchNext();
  }).then(() => {
    const totalDurationSec = (performance.now() - startTime) / 1000;
    latencies.sort((a, b) => a - b);

    const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
    const rps = (successful / totalDurationSec).toFixed(2);

    console.log(`\n\n================ Load Test Report ================`);
    console.log(`Total Time Elapsed:    ${totalDurationSec.toFixed(2)}s`);
    console.log(`Successful Journeys:   ${successful}`);
    console.log(`Failed Requests:       ${failed}`);
    console.log(`Throughput:            ${rps} req/sec`);
    console.log(`Latency p50 (Median):  ${p50.toFixed(1)}ms`);
    console.log(`Latency p95:           ${p95.toFixed(1)}ms`);
    console.log(`Latency p99:           ${p99.toFixed(1)}ms`);
    console.log(`====================================================\n`);
  });
}

runPool();
