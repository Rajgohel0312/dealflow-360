import CacheService from './infrastructure/redis/redis.service.js';
import { isRedisReady } from './infrastructure/redis/redis.client.js';
import { sendSuccess, sendError } from './shared/utils/response.js';

async function testArchitecture() {
  console.log("=== DEALFLOW 360 REDIS & SCALABILITY VERIFICATION ===");
  
  // Wait for initial connection handshake
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("1. Redis Client Status:", isRedisReady() ? "ONLINE" : "OFFLINE (Fallback Active)");

  // Test Set & Get
  console.log("\n2. Testing Cache Set & Get...");
  const setOk = await CacheService.set('test:key', { foo: 'bar' }, 30);
  console.log("   Set status:", setOk);

  const val = await CacheService.get('test:key');
  console.log("   Get result:", val);

  // Test Remember (Read-through)
  console.log("\n3. Testing Cache Remember...");
  let dbCallCount = 0;
  const fetchFn = async () => {
    dbCallCount++;
    return { data: "from_db" };
  };

  const firstCall = await CacheService.remember('test:remember', 30, fetchFn);
  const secondCall = await CacheService.remember('test:remember', 30, fetchFn);

  console.log("   First call result:", firstCall);
  console.log("   Second call result:", secondCall);
  console.log("   DB fetch function executed count:", dbCallCount, "(Expected: 1 if Redis online, 2 if fallback)");

  // Test Distributed Lock
  console.log("\n4. Testing Distributed Mutex Lock...");
  const lock1 = await CacheService.acquireLock('test:lock', 5000);
  console.log("   Lock 1 acquired:", lock1.acquired);

  if (isRedisReady()) {
    const lock2 = await CacheService.acquireLock('test:lock', 5000);
    console.log("   Lock 2 (concurrent attempt) acquired:", lock2.acquired, "(Expected: false)");
  }

  await CacheService.releaseLock('test:lock', lock1.lockValue);
  console.log("   Lock 1 released.");

  // Test Cleanup
  await CacheService.del('test:key');
  await CacheService.del('test:remember');

  console.log("\n✅ All Architecture Verification Steps Executed Successfully!");
  process.exit(0);
}

testArchitecture().catch(err => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
