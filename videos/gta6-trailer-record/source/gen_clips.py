"""Three short stylized (clearly animated, non-photoreal) AI background clips via Seedance Pro Fast, 720p 9:16, 5 s each."""
import sys, os
sys.path.insert(0, "/home/user/Open-Generative-AI/videos/_pipeline")
from concurrent.futures import ThreadPoolExecutor
import mu
STYLE = "Stylized 3D animation, clearly cartoon-like and non-photorealistic, synthwave neon color palette of pink, purple and cyan, smooth slow camera move, no text, no letters, no logos, no brand names."
CLIPS = {
 "city": "Aerial flyover of a fictional neon tropical city at sunset, glowing pink and purple skyscrapers, palm trees along the beach, light trails on the highways. " + STYLE,
 "crowd": "A huge crowd of cartoon-style young people in a dark arena looking up at a giant glowing blank screen, faces lit by pink and cyan light, cheering with arms raised, confetti falling, camera slowly pushing in. " + STYLE,
 "phones": "Close-up of dozens of glowing smartphones held up in the dark by cartoon hands, blank screens emitting pink and cyan light, floating bokeh particles, gentle camera drift. " + STYLE,
}
def go(kv):
    k, prompt = kv
    try: mu.run("seedance-pro-t2v-fast", {"prompt": prompt, "aspect_ratio": "9:16", "duration": 5, "resolution": "720p"}, f"ai/{k}.mp4", f"clip-{k}", max_cost=0.2, timeout=900)
    except SystemExit as e: print(e, flush=True)
with ThreadPoolExecutor(3) as ex: list(ex.map(go, CLIPS.items()))
print("balance", mu.balance())
