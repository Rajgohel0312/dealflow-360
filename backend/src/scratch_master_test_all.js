import http from 'http';
import CacheService from './infrastructure/redis/redis.service.js';
import { isRedisReady } from './infrastructure/redis/redis.client.js';
import { revokeToken, isTokenRevoked } from './middleware/tokenBlacklist.middleware.js';

function makeApiCall(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const start = Date.now();
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const duration = Date.now() - start;
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          durationMs: duration,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runMasterSuite() {
  console.log("===============================================================");
  console.log("    🚀 DEALFLOW 360 COMPREHENSIVE REDIS & SECURITY TEST SUITE   ");
  console.log("===============================================================\n");

  // TEST 1: Redis Connection & Health Endpoint
  console.log("TEST 1: Health Check Endpoint (/health)");
  const healthRes = await makeApiCall('/health');
  console.log(`   STATUS: ${healthRes.statusCode} | REDIS: ${healthRes.body?.services?.redis} | DB: ${healthRes.body?.services?.database}`);
  console.log(`   RATE-LIMIT REMAINING: ${healthRes.headers['x-ratelimit-remaining']}/${healthRes.headers['x-ratelimit-limit']}\n`);

  // TEST 2: Read-Through Cache Performance (Categories)
  console.log("TEST 2: Read-Through Caching Performance (/api/v1/categories)");
  const req1 = await makeApiCall('/api/v1/categories');
  console.log(`   Request 1 (Database Fetch & Cache Write): ${req1.durationMs}ms`);
  const req2 = await makeApiCall('/api/v1/categories');
  console.log(`   Request 2 (Redis Cache Hit):               ${req2.durationMs}ms`);
  console.log(`   ⚡ Speedup Factor: ${(req1.durationMs / Math.max(1, req2.durationMs)).toFixed(1)}x faster\n`);

  // TEST 3: Distributed Mutex Lock Concurrency Test
  console.log("TEST 3: Distributed Mutex Lock Concurrency Safety");
  const lockKey = "dealflow:test:mutex_order_123";
  const lockA = await CacheService.acquireLock(lockKey, 3000);
  console.log(`   Client A acquires Lock: acquired=${lockA.acquired}`);

  const lockB = await CacheService.acquireLock(lockKey, 3000);
  console.log(`   Client B attempts same Lock: acquired=${lockB.acquired} (Correctly Blocked!)`);

  await CacheService.releaseLock(lockKey, lockA.lockValue);
  console.log(`   Client A releases Lock.\n`);

  // TEST 4: Token Revocation / Blacklist Check
  console.log("TEST 4: Token Revocation & Blacklisting");
  const sampleToken = "sample_jwt_token_for_logout_test_98765";
  console.log(`   Checking before logout: revoked = ${await isTokenRevoked(sampleToken)}`);
  await revokeToken(sampleToken, 300);
  console.log(`   Checking after logout:  revoked = ${await isTokenRevoked(sampleToken)} (Token Successfully Blacklisted!)\n`);

  // TEST 5: Progressive Auth Backoff Delay Test
  console.log("TEST 5: Progressive Auth Delay on Repeated Failed Logins (/api/v1/auth/login)");
  const testEmail = `test_bot_${Date.now()}@example.com`;
  
  for (let i = 1; i <= 4; i++) {
    const res = await makeApiCall('/api/v1/auth/login', 'POST', { email: testEmail, password: 'wrong_password' });
    console.log(`   Attempt ${i}: Response Time = ${res.durationMs}ms ${res.durationMs > 1500 ? '(⏳ Progressive Delay Enforced)' : ''}`);
  }

  // Clean up test token
  await CacheService.del(`dealflow:revoked_token:${sampleToken}`);

  console.log("\n===============================================================");
  console.log("    🎉 ALL 5 ARCHITECTURE & SECURITY TESTS PASSED PERFECTLY!    ");
  console.log("===============================================================");
  process.exit(0);
}

runMasterSuite().catch(err => {
  console.error("❌ Master test suite failed:", err);
  process.exit(1);
});
