"""Mux frames with narration, ducked music bed and synthesized sound effects listed in config.json ("sfx": [[name, cue_or_seconds, offset], ...])."""
import json, os, subprocess
P = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open("timeline.json")); cfg = json.load(open("config.json"))
C, TOTAL = TL["cues"], TL["total"]
def sh(*a): subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)
SYN = {
 "pop": ["-f", "lavfi", "-i", "sine=f=1250:d=0.12:r=48000", "-af", "afade=t=out:st=0:d=0.12:curve=exp,volume=0.5"],
 "whoosh": ["-f", "lavfi", "-i", "anoisesrc=d=0.5:c=pink:a=0.8:r=48000", "-af", "highpass=f=500,lowpass=f=6000,afade=t=in:d=0.32:curve=exp,afade=t=out:st=0.32:d=0.18,volume=0.45"],
 "chime": ["-f", "lavfi", "-i", "sine=f=1318.5:d=1.2:r=48000", "-f", "lavfi", "-i", "sine=f=1975.5:d=1.2:r=48000", "-filter_complex", "[0][1]amix=inputs=2:normalize=0,afade=t=out:st=0:d=1.2:curve=exp,volume=0.35"],
 "thud": ["-f", "lavfi", "-i", "sine=f=58:d=0.6:r=48000", "-af", "afade=t=out:st=0:d=0.6:curve=exp,volume=1.2"],
 "rise": ["-f", "lavfi", "-i", "aevalsrc=exprs='0.28*sin(2*PI*(260*t+380*t*t))':d=0.9:s=48000", "-af", "afade=t=in:d=0.15,afade=t=out:st=0.6:d=0.3"],
 "drop": ["-f", "lavfi", "-i", "aevalsrc=exprs='0.28*sin(2*PI*(900*t-330*t*t))':d=0.8:s=48000", "-af", "afade=t=in:d=0.1,afade=t=out:st=0.5:d=0.3"],
 "beat": ["-f", "lavfi", "-i", "sine=f=70:d=0.18:r=48000", "-af", "afade=t=out:st=0:d=0.18:curve=exp,volume=1.5"],
 "splash": ["-f", "lavfi", "-i", "anoisesrc=d=0.5:c=white:a=0.9:r=48000", "-af", "bandpass=f=1800:w=2500,afade=t=in:d=0.02,afade=t=out:st=0.05:d=0.45:curve=exp,volume=0.5"],
}
sfx = []
for name, at, off in cfg.get("sfx", []):
    when = (C[at] if isinstance(at, str) else at) + off
    sfx.append((f"sfx_{name}.wav", when))
for name in {n for n, _, _ in cfg.get("sfx", [])}:
    sh(*SYN[name], "-ac", "2", f"sfx_{name}.wav")
vin = ["-framerate", "30", "-i", "frames/%05d.jpg"]
if cfg.get("bg_clips"):   # stylized AI clips under transparent drawn frames, given a neon posterized grade
    ins, fc, prev = ["-f", "lavfi", "-i", f"color=c=black:s=1080x1920:r=30:d={TOTAL:.3f}"], [], "0:v"
    for k, c in enumerate(cfg["bg_clips"]):
        st = (C[c["at"]] if isinstance(c["at"], str) else c["at"]) + c.get("off", 0); ins += ["-i", c["file"]]
        fc.append(f"[{k+1}:v]trim=start={c.get('ss', 0)},setpts=(PTS-STARTPTS)*{c.get('speed', 1)},fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
                  f"lutrgb=r='floor(val/40)*40':g='floor(val/40)*40':b='floor(val/40)*40',eq=saturation=1.35:contrast=1.08,trim=0:{c['dur']},setpts=PTS+{max(0, st):.3f}/TB[c{k}]")
        fc.append(f"[{prev}][c{k}]overlay=0:{c.get('y', 0)}:eof_action=pass:enable='between(t,{max(0, st):.3f},{max(0, st) + c['dur']:.3f})'[b{k}]"); prev = f"b{k}"
    ins += ["-framerate", "30", "-i", "frames/%05d.png"]; nf = len(cfg["bg_clips"]) + 1
    fc.append(f"[{prev}][{nf}:v]overlay=0:0:format=auto,format=yuv420p[v]")
    sh(*ins, "-filter_complex", ";".join(fc), "-map", "[v]", "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-t", f"{TOTAL:.3f}", "composite.mp4")
    vin = ["-i", "composite.mp4"]
cmd = ["ffmpeg", "-v", "error", "-y", *vin]
for L in TL["lines"]: cmd += ["-i", f"vo_proc/{L['id']}.wav"]
cmd += ["-ss", str(cfg.get("music_start", 20)), "-t", f"{TOTAL + 0.5:.2f}", "-i", f"{P}/music/bed.mp3"]
for f, _ in sfx: cmd += ["-i", f]
nl = len(TL["lines"]); im = 1 + nl; s0 = im + 1; fc = []
for j, L in enumerate(TL["lines"]):
    ms = int(L["start"] * 1000); fc.append(f"[{1+j}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[v{j}]")
fc.append("".join(f"[v{j}]" for j in range(nl)) + f"amix=inputs={nl}:normalize=0,apad=whole_dur={TOTAL:.3f},asplit=2[vo][vokey]")
fc.append(f"[{im}:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.32,afade=t=in:d=0.3,afade=t=out:st={TOTAL-1.0:.2f}:d=1.0[mus]")
fc.append("[mus][vokey]sidechaincompress=threshold=0.04:ratio=6:attack=15:release=350[duck]")
for k, (_, at) in enumerate(sfx):
    ms = max(0, int(at * 1000)); fc.append(f"[{s0+k}:a]aresample=48000,adelay={ms}|{ms}[x{k}]")
fc.append("[vo][duck]" + "".join(f"[x{k}]" for k in range(len(sfx))) + f"amix=inputs={2+len(sfx)}:normalize=0,atrim=0:{TOTAL:.3f},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[aout]")
cmd += ["-filter_complex", ";".join(fc), "-map", "0:v", "-map", "[aout]", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", "30",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", f"{TOTAL:.3f}", cfg["out"]]
subprocess.run(cmd, check=True); print("rendered", cfg["out"])
