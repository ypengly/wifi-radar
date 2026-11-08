# API v1
Errors: `{ "error": string }`. Web endpoints use the `wr_session` cookie; agent endpoints use `Authorization: Bearer <device token>`.

| Method & path | Auth | Purpose |
|---|---|---|
| POST `/api/v1/auth/login` `{email,password}` | – | Sets session cookie |
| POST `/api/v1/devices/pair-code` | session | `{code, expiresInSeconds}`; 10 min, single use |
| POST `/api/v1/devices/pair` `{code,name,platform}` | – | Returns `{token}` once |
| POST `/api/v1/scans` | device | Ingest a scan (below) |
| GET `/api/v1/networks` | session | APs from the latest scan + `lastScanAt`, `source`, `connectedBssid` |
| DELETE `/api/v1/history` | session | Permanently deletes all scan data |

## Scan payload
```json
{ "source": "LINUX|ANDROID|WINDOWS|MACOS", "startedAt": "ISO-8601", "connectedBssid": "aa:bb:..",
  "position": { "lat": 0, "lon": 0, "accuracyM": 12 },
  "results": [{ "ssid": "Home", "bssid": "aa:bb:cc:dd:ee:ff", "dbm": -55, "frequency": 5180, "security": "WPA2-PSK" }] }
```
`position` is the *scanner's* location and is stored on the scan session only, never on an access point. Band, channel and normalized security are derived server-side. Max 500 results per scan.
