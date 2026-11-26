"""Tiny MuAPI client: estimate, submit, poll, download. Logs every paid call to ledger.jsonl next to the caller's working folder."""
import json, os, time, pathlib
import requests

BASE = "https://api.muapi.ai/api/v1"
KEY = os.environ["MUAPI_API_KEY"]
LEDGER = pathlib.Path("ledger.jsonl")
H = {"Content-Type": "application/json", "x-api-key": KEY}


def balance():
    return requests.get(f"{BASE}/account/balance", headers=H, timeout=30).json()["balance"]


def estimate(endpoint, payload):
    r = requests.post(f"{BASE}/models/{endpoint}/estimate-cost", json=payload, timeout=30)
    r.raise_for_status()
    return r.json()["cost"]


def run(endpoint, payload, out_path, label, max_cost, poll_every=4, timeout=900):
    out_path = pathlib.Path(out_path)
    if out_path.exists():
        print(f"[{label}] already have {out_path.name}, skipping")
        return out_path
    cost = estimate(endpoint, payload)
    if cost > max_cost:
        raise SystemExit(f"[{label}] estimate ${cost} exceeds cap ${max_cost}")
    r = requests.post(f"{BASE}/{endpoint}", json=payload, headers=H, timeout=60)
    if not r.ok:
        raise SystemExit(f"[{label}] submit failed {r.status_code}: {r.text[:300]}")
    sub = r.json()
    rid = sub.get("request_id") or sub.get("id")
    with open(LEDGER, "a") as f:
        f.write(json.dumps({"t": time.time(), "label": label, "endpoint": endpoint, "est_cost": cost, "request_id": rid, "payload": payload}) + "\n")
    print(f"[{label}] submitted {rid} (est ${cost})", flush=True)
    t0 = time.time()
    while time.time() - t0 < timeout:
        time.sleep(poll_every)
        p = requests.get(f"{BASE}/predictions/{rid}/result", headers=H, timeout=60)
        if p.status_code >= 500:
            continue
        res = p.json()
        if isinstance(res.get("detail"), dict):   # failures (e.g. moderation) come back wrapped in "detail"
            res = res["detail"]
        st = (res.get("status") or "").lower()
        if st in ("completed", "succeeded", "success"):
            url = (res.get("outputs") or [None])[0] or res.get("url")
            out_path.write_bytes(requests.get(url, timeout=300).content)
            print(f"[{label}] done in {time.time()-t0:.0f}s -> {out_path.name}", flush=True)
            return out_path
        if st in ("failed", "error", "cancelled", "canceled"):
            raise SystemExit(f"[{label}] failed: {json.dumps(res)[:500]}")
    raise SystemExit(f"[{label}] timed out, request {rid}")


if __name__ == "__main__":
    print("balance", balance())
