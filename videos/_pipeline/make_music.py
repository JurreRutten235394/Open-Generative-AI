"""Generate the shared instrumental music bed used under every Short."""
import mu
mu.run("minimax-music-3.0", {"prompt": "Instrumental only. Curious, upbeat ambient electronic track for a space science explainer video: soft plucky synth arpeggios, warm pads, light modern percussion, gentle sense of wonder, steady 100 bpm, clean mix, no vocals.",
       "lyrics": "[Intro]\n##\n[Instrumental]\n##\n[Build]\n##\n[Instrumental]\n##\n[Outro]\n##", "is_instrumental": True},
       "music/bed.mp3", "music-bed", max_cost=0.25, timeout=2400)
