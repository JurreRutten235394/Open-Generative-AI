"""Build timeline.json/js from script.json + words_proc.json + config.json (highlights and word cues)."""
import difflib, json, re
GAP, START, END_HOLD = 0.22, 0.05, 0.6
script = json.load(open("script.json")); words = json.load(open("words_proc.json")); cfg = json.load(open("config.json"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def align(cap, toks):
    cw = cap.split(); a, b = [norm(w) for w in cw], [norm(t[0]) for t in toks]; times = [None] * len(cw)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i2 - i1): times[i1 + k] = toks[j1 + k][1:3]
        elif op == "replace":
            s, e, n = toks[j1][1], toks[j2 - 1][2], i2 - i1
            for k in range(n): times[i1 + k] = (s + (e - s) * k / n, s + (e - s) * (k + 1) / n)
    for i, t in enumerate(times):
        if t is None: p = times[i - 1][1] if i else 0.0; times[i] = (p, p + 0.15)
    return cw, times
t, lines, chunks = START, [], []
for l in script:
    toks = words[l["id"]]; cw, tm = align(l["cap"], toks); hi = [False] * len(cw)
    for ph in cfg["highlight"]:
        p = [norm(x) for x in ph.split()]
        for i in range(len(cw) - len(p) + 1):
            if [norm(x) for x in cw[i:i + len(p)]] == p:
                for j in range(i, i + len(p)): hi[j] = True
    ws = [{"w": w, "s": round(t + s, 3), "e": round(t + e, 3), "hi": h} for w, (s, e), h in zip(cw, tm, hi)]
    end = t + toks[-1][2]
    lines.append({"id": l["id"], "start": round(t, 3), "end": round(end, 3), "words": ws})
    cur = []
    for w in ws:
        cur.append(w)
        if len(cur) == 3 or re.search(r"[.,?!:]$", w["w"]): chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    t = end + GAP
TOTAL = lines[-1]["end"] + END_HOLD
caps = [{"s": ch[0]["s"], "e": round(min(chunks[k + 1][0]["s"] if k + 1 < len(chunks) else TOTAL, ch[-1]["e"] + 0.6), 3), "words": [{"w": w["w"], "hi": w["hi"]} for w in ch]} for k, ch in enumerate(chunks)]
L = {x["id"]: x for x in lines}
def cue(line, word):
    return next(w["s"] for w in L[line]["words"] if norm(w["w"]) == norm(word))
cues = {k: cue(*v) for k, v in cfg["cues"].items()}
for k in L: cues[k] = L[k]["start"]; cues[k + "end"] = L[k]["end"]
TLD = {"total": round(TOTAL, 3), "lines": lines, "captions": caps, "cues": cues}
json.dump(TLD, open("timeline.json", "w"), indent=1)
open("timeline.js", "w").write("const TL = " + json.dumps(TLD) + ";\n")
print(f"total {TOTAL:.2f}s"); print({k: round(v, 2) for k, v in cues.items()})
