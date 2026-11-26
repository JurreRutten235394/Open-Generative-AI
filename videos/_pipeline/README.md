# Shorts pipeline

Builds the drawn, narrated 9:16 Shorts in `videos/`. Each video keeps its own `source/` folder
(`script.json`, `config.json`, `scenes.js`); everything shared lives here.

Work in a scratch folder that holds a video's three source files, then run, from that folder:

1. `python3 <pipeline>/tts.py`: narration (ElevenLabs "Bradford" via MuAPI; needs `MUAPI_API_KEY`) into `vo/`
2. `<venv>/python <pipeline>/align_all.py vo words.json mp3`, then `prep.py` (trims pauses, +6% tempo),
   then `align_all.py vo_proc words_proc.json wav` (word timings; needs `pip install faster-whisper numpy`)
3. `python3 <pipeline>/timeline.py`: captions, highlights and word cues (from `config.json`)
4. `python3 <pipeline>/make_html.py` and `node <pipeline>/render.js` (Playwright, 30 fps frames; `render.js 0,3.5` renders test PNGs)
5. `python3 <pipeline>/mix.py`: narration + ducked `music/bed.mp3` + synthesized sound effects, loudness -14 LUFS
6. `<venv>/python <pipeline>/qa.py video.mp4`: transcript check

Opening rules learned from the channel's data: the hook is complete on the first frame, no part numbers,
and the ending returns to the opening shot so the Short loops.

Optional AI background clips: render with `ALPHA=1` (transparent PNG frames, `make_html.py alpha`) and list the clips in
`config.json` as `"bg_clips": [{"file": "ai/x.mp4", "at": "l2" or seconds, "off": -0.3, "dur": 5.5, "speed": 1.2, "ss": 0, "y": 0}]`
(`speed` > 1 slows a clip down, `ss` skips into the source, `y` shifts it vertically). `mix.py` grades them (posterized, more
saturated) and composites the drawn frames on top. Keep the clips clearly stylized and non-photoreal, with no text or logos.
