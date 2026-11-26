"""Narrate script.json lines with the ElevenLabs "Bradford" voice via MuAPI. Usage: python3 tts.py [line ids...]"""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from concurrent.futures import ThreadPoolExecutor
import mu
ids = sys.argv[1:] or None
lines = [l for l in json.load(open("script.json")) if not ids or l["id"] in ids]
os.makedirs("vo", exist_ok=True)
def go(l):
    p = {"prompt": l["vo"], "voice_id": "NNl6r8mD7vthiJatiJt1", "stability": 0.55, "similarity_boost": 0.75, "speed": 1.0, "language_code": "en"}
    try: mu.run("elevenlabs-tts-turbo-2-5", p, f"vo/{l['id']}.mp3", f"vo-{l['id']}", max_cost=0.02, timeout=150)
    except SystemExit as e: print(e, flush=True)
with ThreadPoolExecutor(3) as ex: list(ex.map(go, lines))
print("balance", mu.balance())
