# Scanner platforms
- **Linux**: `agents/linux/wifi_agent.py` (nmcli) — included.
- **Android** (Kotlin, WifiManager.startScan + foreground service, location permission, throttled): planned, Stage 6.
- **Windows** (WLAN API / `netsh wlan show networks mode=bssid`) and **macOS** (CoreWLAN, needs Location permission): planned, Stage 6.
- **iOS**: no public API for scanning nearby networks. Use Demo mode or view data from another paired device.
Agents must never store Wi-Fi passwords, connect to networks, or attempt to bypass security.
