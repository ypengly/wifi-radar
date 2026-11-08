#!/usr/bin/env python3
"""WiFi Radar Linux agent. Reads nearby networks with nmcli and posts them to the server.
Usage:  wifi_agent.py pair --server http://host:3000 --code 123456
        wifi_agent.py run  --interval 30
Needs NetworkManager (nmcli). Reads only what the OS reports; never connects to networks."""
import argparse, json, os, re, subprocess, sys, time, urllib.request
from datetime import datetime, timezone

CFG = os.path.expanduser("~/.config/wifi-radar-agent.json")

def post(url, body, token=None):
    h = {"Content-Type": "application/json"}
    if token: h["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, json.dumps(body).encode(), h)
    with urllib.request.urlopen(req, timeout=20) as r: return json.load(r)

def scan():
    out = subprocess.run(["nmcli", "-t", "-f", "IN-USE,SSID,BSSID,FREQ,SIGNAL,SECURITY", "dev", "wifi", "list", "--rescan", "yes"],
                         capture_output=True, text=True, check=True).stdout
    results, connected = [], None
    for line in out.splitlines():
        m = re.match(r"^(\*| ?):(.*?):((?:[0-9A-F]{2}\\:){5}[0-9A-F]{2}):(\d+) MHz:(\d+):(.*)$", line)
        if not m: continue
        use, ssid, bssid, freq, sig, sec = m.groups()
        bssid = bssid.replace("\\:", ":").lower()
        ssid = ssid.replace("\\:", ":")
        if use == "*": connected = bssid
        # nmcli reports quality 0-100; convert to approximate dBm (the inverse of the common dBm->% formula)
        results.append({"ssid": ssid, "bssid": bssid, "dbm": int(sig) // 2 - 100, "frequency": int(freq), "security": sec})
    return {"source": "LINUX", "startedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"), "connectedBssid": connected, "results": results}

def main():
    ap = argparse.ArgumentParser(); sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("pair"); p.add_argument("--server", required=True); p.add_argument("--code", required=True); p.add_argument("--name", default=os.uname().nodename)
    r = sub.add_parser("run"); r.add_argument("--interval", type=int, default=30)
    a = ap.parse_args()
    if a.cmd == "pair":
        t = post(a.server.rstrip("/") + "/api/v1/devices/pair", {"code": a.code, "name": a.name, "platform": "LINUX"})["token"]
        os.makedirs(os.path.dirname(CFG), exist_ok=True)
        with open(os.open(CFG, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600), "w") as f: json.dump({"server": a.server.rstrip("/"), "token": t}, f)
        print("Paired."); return
    cfg = json.load(open(CFG))
    while True:
        try:
            payload = scan(); payload = {k: v for k, v in payload.items() if v is not None}
            print(datetime.now().strftime("%H:%M:%S"), post(cfg["server"] + "/api/v1/scans", payload, cfg["token"]))
        except Exception as e: print("scan failed:", e, file=sys.stderr)
        time.sleep(a.interval)

if __name__ == "__main__": main()
