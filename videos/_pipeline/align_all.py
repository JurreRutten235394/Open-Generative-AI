"""Word timestamps with faster-whisper. Usage: align_all.py <dir> <out.json> <ext>"""
import json, sys, subprocess
import numpy as np
from faster_whisper import WhisperModel
VO, OUTW, EXT = sys.argv[1], sys.argv[2], sys.argv[3]
m = WhisperModel("base.en", device="cpu", compute_type="int8")
out = {}
for l in json.load(open("script.json")):
    vid = l["id"]
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{VO}/{vid}.{EXT}", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
    segs, _ = m.transcribe(np.frombuffer(pcm, np.float32), word_timestamps=True, beam_size=5)
    words = [(w.word.strip(), round(w.start, 2), round(w.end, 2)) for s in segs for w in s.words]
    out[vid] = words
    print(vid, " ".join(w[0] for w in words), "|", words[0][1], "-", words[-1][2], flush=True)
json.dump(out, open(OUTW, "w"), indent=0)
