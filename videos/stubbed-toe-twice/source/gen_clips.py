"""Three short stylized (clearly animated, non-photoreal) AI background clips via Seedance Pro Fast, 720p 9:16, 5 s each."""
import sys
sys.path.insert(0, "/home/user/Open-Generative-AI/videos/_pipeline")
from concurrent.futures import ThreadPoolExecutor
import mu
STYLE = "Stylized 3D cartoon animation in the style of a family animated film, clearly non-photorealistic, soft rounded clay-like shapes, bold saturated colors, smooth camera, no text, no letters, no logos."
CLIPS = {
 "stub": "Low close-up at floor level in a cozy cartoon living room at night: a cartoon character's bare foot steps forward across a wooden floor and bumps its toes into the leg of a wooden coffee table, the foot jerks back, a small comic impact. " + STYLE,
 "hop": "A cartoon character in striped pajamas hopping on one leg in a cozy cartoon living room at night, holding the other foot with both hands, comic exaggerated pained expression, camera slowly pushes in. " + STYLE,
 "road": "Side view of a cartoon city street at night: a small red cartoon car zooms past from left to right with motion streaks, while a cartoon person walks slowly along the sidewalk in the foreground, camera tracking sideways. " + STYLE,
}
def go(kv):
    k, prompt = kv
    try: mu.run("seedance-pro-t2v-fast", {"prompt": prompt, "aspect_ratio": "9:16", "duration": 5, "resolution": "720p"}, f"ai/{k}.mp4", f"clip-{k}", max_cost=0.2, timeout=900)
    except SystemExit as e: print(e, flush=True)
with ThreadPoolExecutor(3) as ex: list(ex.map(go, CLIPS.items()))
print("balance", mu.balance())
