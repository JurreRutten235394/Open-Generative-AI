"""Trim long pauses and speed narration up 6%: vo/*.mp3 -> vo_proc/*.wav (uses words.json gaps)."""
import json, subprocess, os
TEMPO = 1.06
w = json.load(open("words.json")); os.makedirs("vo_proc", exist_ok=True)
for k, ws in w.items():
    cuts = []
    for i in range(len(ws) - 1):
        if ws[i + 1][1] - ws[i][2] > 0.6:
            a = ws[i][2] + 0.35; b = ws[i + 1][1] - 0.30
            if b - a > 0.08: cuts.append(f"between(t,{a:.3f},{b:.3f})")
    af = f"atempo={TEMPO}"
    if cuts: af = f"aselect='not({'+'.join(cuts)})',asetpts=N/SR/TB," + af
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"vo/{k}.mp3", "-af", af + ",aresample=48000", "-ac", "1", f"vo_proc/{k}.wav"], check=True)
    print(k, "cuts", len(cuts))
