"""Transcribe a finished video with faster-whisper small.en. Usage: qa.py video.mp4"""
import subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
segs, _ = WhisperModel("small.en", device="cpu", compute_type="int8").transcribe(np.frombuffer(pcm, np.float32), beam_size=5)
print(" ".join(s.text.strip() for s in segs))
