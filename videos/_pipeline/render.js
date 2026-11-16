// Render anim.html frames: `node render.js` for all frames, `node render.js 0,3.5,9` for test PNGs.
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const path = require("path"), fs = require("fs");
const TL = JSON.parse(fs.readFileSync("timeline.json"));
const FPS = 30, N = Math.ceil(TL.total * FPS), WORKERS = 4;
const only = process.argv[2] ? process.argv[2].split(",").map(Number) : null;
(async () => {
  const browser = await chromium.launch({ args: ["--allow-file-access-from-files"] });
  fs.mkdirSync("frames", { recursive: true });
  const jobs = only ? only.map(s => Math.round(s * FPS)) : [...Array(N).keys()];
  const t0 = Date.now();
  await Promise.all([...Array(WORKERS).keys()].map(async w => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    page.on("pageerror", e => console.log("PAGEERR", e.message));
    await page.goto("file://" + path.resolve("anim.html")); await page.evaluate(() => window.ready);
    for (let k = w; k < jobs.length; k += WORKERS) {
      const i = jobs[k];
      await page.evaluate(t => window.render(t), i / FPS);
      await page.screenshot({ path: only ? `frames/test_${(i / FPS).toFixed(2)}.png` : `frames/${String(i).padStart(5, "0")}.jpg`, type: only ? "png" : "jpeg", ...(only ? {} : { quality: 93 }) });
    }
  }));
  await browser.close();
  console.log(`rendered ${jobs.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
})();
