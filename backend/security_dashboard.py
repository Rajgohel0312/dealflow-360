import urllib.request
import urllib.error
import json
import time
import subprocess
import os

BASE_URL = "http://localhost:5000"

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def make_request(path, method="GET", headers=None, payload=None):
    url = f"{BASE_URL}{path}"
    if headers is None:
        headers = {}
    data = None
    if payload:
        data = json.dumps(payload).encode('utf-8')
        headers['Content-Type'] = 'application/json'

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    start_time = time.time()
    try:
        with urllib.request.urlopen(req) as response:
            elapsed = (time.time() - start_time) * 1000
            resp_body = response.read().decode('utf-8')
            try:
                body = json.loads(resp_body)
            except Exception:
                body = resp_body
            return {"status": response.status, "ms": round(elapsed, 1), "body": body, "headers": dict(response.headers)}
    except urllib.error.HTTPError as e:
        elapsed = (time.time() - start_time) * 1000
        resp_body = e.read().decode('utf-8')
        try:
            body = json.loads(resp_body)
        except Exception:
            body = resp_body
        return {"status": e.code, "ms": round(elapsed, 1), "body": body, "headers": dict(e.headers)}
    except Exception as e:
        return {"status": 0, "ms": 0, "error": str(e)}

def get_memurai_keys():
    try:
        output = subprocess.check_output(
            ['C:\\Program Files\\Memurai\\memurai-cli.exe', 'keys', 'dealflow:*'],
            stderr=subprocess.STDOUT
        ).decode('utf-8')
        keys = [line.strip() for line in output.splitlines() if line.strip()]
        return keys
    except Exception:
        return []

def display_dashboard():
    clear_screen()
    print("=" * 70)
    print("      DEALFLOW 360 - PYTHON SECURITY & PERFORMANCE DASHBOARD      ")
    print("=" * 70)

    # 1. System Health Status
    health = make_request("/health")
    if health.get("status") == 200 and isinstance(health.get("body"), dict):
        h_body = health["body"]
        serv = h_body.get("services", {})
        sys_info = h_body.get("system", {})
        print("\n[SYSTEM STATUS]")
        print(f"  Server State:     ONLINE (HTTP 200)")
        print(f"  Database Status:  {serv.get('database', 'unknown').upper()}")
        print(f"  Redis (Memurai): {serv.get('redis', 'unknown').upper()}")
        hdrs = {k.lower(): v for k, v in health.get('headers', {}).items()}
        print(f"  Rate Limit Quota: {hdrs.get('x-ratelimit-remaining', 'N/A')}/{hdrs.get('x-ratelimit-limit', 'N/A')}")

    else:
        print("\n[SYSTEM STATUS]")
        print("  Server State:     OFFLINE or Rate Limited")

    # 2. Redis Key Inspector
    keys = get_memurai_keys()
    print("\n[MEMURAI REDIS LIVE CACHE KEYS]")
    if keys:
        for idx, k in enumerate(keys[:8], 1):
            print(f"  {idx}. {k}")
        if len(keys) > 8:
            print(f"  ... and {len(keys) - 8} more keys")
    else:
        print("  No active dealflow:* keys currently stored.")

    # 3. Cache Latency Benchmark
    print("\n[CACHE LATENCY COMPARISON]")
    cat1 = make_request("/api/v1/categories")
    cat2 = make_request("/api/v1/categories")
    print(f"  1st Request (Database Fetch): {cat1.get('ms', 0)} ms")
    print(f"  2nd Request (Redis Hit):       {cat2.get('ms', 0)} ms")

    print("\n" + "=" * 70)
    print("  ACTIONS:")
    print("  [1] Refresh Dashboard Status")
    print("  [2] Run Burst Stress Test (Simulate 50 Requests)")
    print("  [3] Run Auth Progressive Delay Test")
    print("  [4] Inspect Full Memurai Key List")
    print("  [5] Exit Dashboard")
    print("=" * 70)

def run_stress_test():
    print("\n--> Running 50-Request Burst Stress Test on /health...")
    success = 0
    blocked = 0
    for i in range(1, 51):
        res = make_request("/health")
        if res["status"] == 200:
            success += 1
        elif res["status"] == 429:
            blocked += 1
    print(f"    Completed: 200 OK: {success} | 429 Rate Limited: {blocked}")
    input("\nPress Enter to return to Dashboard...")

def run_auth_test():
    print("\n--> Testing Auth Progressive Delay on /api/v1/auth/login...")
    email = f"test_{int(time.time())}@example.com"
    for i in range(1, 6):
        res = make_request("/api/v1/auth/login", method="POST", payload={"email": email, "password": "wrong"})
        print(f"    Attempt {i}: Status={res['status']} | Elapsed={res['ms']} ms")
    input("\nPress Enter to return to Dashboard...")

def show_full_keys():
    print("\n--> Full Memurai Key Inventory:")
    keys = get_memurai_keys()
    for k in keys:
        print(f"  - {k}")
    input("\nPress Enter to return to Dashboard...")

def main():
    while True:
        display_dashboard()
        choice = input("Select an option (1-5): ").strip()
        if choice == '1':
            continue
        elif choice == '2':
            run_stress_test()
        elif choice == '3':
            run_auth_test()
        elif choice == '4':
            show_full_keys()
        elif choice == '5':
            print("Exiting Dashboard. Goodbye!")
            break

if __name__ == "__main__":
    main()
