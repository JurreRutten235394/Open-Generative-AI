"""Write anim.html for the video in the current folder (engine + fonts from this pipeline folder)."""
import os
P = os.path.dirname(os.path.abspath(__file__))
open("anim.html", "w").write(f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face {{ font-family: "Righteous"; src: url("file://{P}/fonts/Righteous.woff2"); }}
  @font-face {{ font-family: "Oswald"; font-weight: 500; src: url("file://{P}/fonts/Oswald_wght_500.woff2"); }}
  @font-face {{ font-family: "Oswald"; font-weight: 700; src: url("file://{P}/fonts/Oswald_wght_700.woff2"); }}
  html, body {{ margin: 0; padding: 0; background: #0B102A; overflow: hidden; }} canvas {{ display: block; }}
</style></head><body><canvas id="c" width="1080" height="1920"></canvas>
<script src="timeline.js"></script><script src="file://{P}/engine.js"></script><script src="scenes.js"></script>
<script>window.render = render;</script></body></html>
""")
print("anim.html written")
