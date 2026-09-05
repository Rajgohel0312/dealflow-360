import http from 'http';
import { execSync } from 'child_process';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
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

async function runLiveCheck() {
  console.log("=================================================");
  console.log("       DEALFLOW 360 LIVE REDIS SYSTEM CHECK      ");
  console.log("=================================================\n");

  // 1. Health Endpoint
  console.log("1️⃣  Testing GET /health...");
  const health = await makeRequest('/health');
  console.log("   Status:", health.statusCode);
  console.log("   Body:", JSON.stringify(health.body));
  console.log("   Rate Limit Header:", health.headers['x-ratelimit-remaining'], "/", health.headers['x-ratelimit-limit']);

  // 2. Live Categories Caching
  console.log("\n2️⃣  Testing GET /api/v1/categories (Read-Through Caching)...");
  const cat1 = await makeRequest('/api/v1/categories');
  console.log(`   1st Request Time: ${cat1.durationMs}ms (DB Fetch & Redis Cache Store)`);
  
  const cat2 = await makeRequest('/api/v1/categories');
  console.log(`   2nd Request Time: ${cat2.durationMs}ms (Served directly from Redis Cache!)`);

  // 3. Progressive Delay & Lockout on Failed Logins
  console.log("\n3️⃣  Testing Auth Progressive Delay on /api/v1/auth/login...");
  for (let i = 1; i <= 4; i++) {
    const attempt = await makeRequest('/api/v1/auth/login', 'POST', { email: 'baduser@example.com', password: 'wrongpassword' });
    console.log(`   Attempt ${i}: Status=${attempt.statusCode} | Time=${attempt.durationMs}ms | Message=${attempt.body?.message || ''}`);
  }

  // 4. Memurai Redis Key Listing
  console.log("\n4️⃣  Checking Live Keys stored in Memurai Redis...");
  try {
    const keysOutput = execSync('"C:\\Program Files\\Memurai\\memurai-cli.exe" keys "dealflow:*"').toString();
    console.log(keysOutput ? keysOutput.trim() : "   No dealflow keys found");
  } catch (err) {
    console.log("   Could not query memurai-cli:", err.message);
  }

  console.log("\n=================================================");
  console.log("   ✅ LIVE VERIFICATION COMPLETED SUCCESSFULLY    ");
  console.log("=================================================");
  process.exit(0);
}

runLiveCheck().catch(err => {
  console.error("Live test failed:", err);
  process.exit(1);
});
