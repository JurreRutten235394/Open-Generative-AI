// Shared drawing engine for the 9:16 Shorts (1080x1920 canvas). Each video adds its own scenes.js with render(t).
const W = 1080, H = 1920;
const cv = document.getElementById("c"); let ctx = cv.getContext("2d");
const NAVY = "#0B102A", TEAL = "#2EE6C5", PINK = "#FF4D8D", YEL = "#FFD640", WHITE = "#FFFFFF",
      DIM = "#96A0C8", DARK = "#0A0C1E", RIM = "#E8EEFF", RED = "#E8434F", SKY = "#7CC8FF";
const C = TL.cues;
const T1 = 255, T2 = 372;   // headline rows

// ---------- timing helpers ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const P = (t, t0, d) => clamp((t - t0) / d);
// draw-on progress that can also "undraw" (reverse) later
function io(t, tin, din, tout, dout = 0.3) {
  let p = eo(P(t, tin, din));
  if (tout != null && t > tout) p = Math.min(p, 1 - eio(P(t, tout, dout)));
  return p;
}
const ON = (t, out) => io(t, -10, 0.1, out);   // already complete on the very first frame
const fmt = n => Math.round(n).toLocaleString("en-US");

// ---------- drawing helpers ----------
function polyLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]); return L; }
function polyPartial(pts, p, color, w, dash) {
  if (p <= 0) return;
  const L = polyLen(pts) * p; let acc = 0;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]);
    if (acc + seg >= L) { const f = (L - acc) / seg; ctx.lineTo(pts[i-1][0] + (pts[i][0] - pts[i-1][0]) * f, pts[i-1][1] + (pts[i][1] - pts[i-1][1]) * f); break; }
    ctx.lineTo(pts[i][0], pts[i][1]); acc += seg;
  }
  ctx.stroke(); ctx.restore();
}
function lineP(x1, y1, x2, y2, p, color, w, dash) { polyPartial([[x1, y1], [x2, y2]], p, color, w, dash); }
function arcP(cx, cy, r, p, color, w, a0 = -Math.PI / 2, span = Math.PI * 2) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + span * p); ctx.stroke(); ctx.restore();
}
function disc(cx, cy, r, color, alpha = 1, glow = 0) {
  if (alpha <= 0 || r <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
  if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function roundRectPts(x, y, w, h, r) {
  const pts = [], seg = 10;
  const corner = (cx, cy, a0) => { for (let i = 0; i <= seg; i++) { const a = a0 + (Math.PI / 2) * i / seg; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  pts.push([x + w / 2, y]); pts.push([x + w - r, y]); corner(x + w - r, y + r, -Math.PI / 2);
  pts.push([x + w, y + h - r]); corner(x + w - r, y + h - r, 0);
  pts.push([x + r, y + h]); corner(x + r, y + h - r, Math.PI / 2);
  pts.push([x, y + r]); corner(x + r, y + r, Math.PI); pts.push([x + w / 2, y]);
  return pts;
}
// Headline: letters pop in one by one, with the channel's double outline (light rim, dark stroke, fill).
function title(text, cx, y, size, fill, p, rot = 0, maxW = 960) {
  if (p <= 0) return;
  ctx.save(); ctx.translate(cx, y); ctx.rotate(rot);
  ctx.font = `${size}px Righteous`;
  const w0 = ctx.measureText(text).width;
  if (w0 > maxW) { size *= maxW / w0; ctx.font = `${size}px Righteous`; }
  ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  const chars = [...text], widths = chars.map(ch => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0);
  const n = chars.length, k = p * (n + 2);
  for (const pass of [0, 1, 2]) {
    let x = -total / 2;
    chars.forEach((ch, i) => {
      const q = clamp(k - i);
      if (q > 0 && ch !== " ") {
        const s = 0.55 + 0.45 * eo(q), cxh = x + widths[i] / 2;
        ctx.save(); ctx.globalAlpha = clamp(q * 1.6); ctx.translate(cxh, 0); ctx.scale(s, s);
        if (pass === 0) { ctx.strokeStyle = RIM; ctx.lineWidth = size * 0.22; ctx.strokeText(ch, -widths[i] / 2, 0); }
        if (pass === 1) { ctx.strokeStyle = DARK; ctx.lineWidth = size * 0.13; ctx.strokeText(ch, -widths[i] / 2, 0); }
        if (pass === 2) { ctx.fillStyle = fill; ctx.fillText(ch, -widths[i] / 2, 0); }
        ctx.restore();
      }
      x += widths[i];
    });
  }
  ctx.restore();
}
// Label: typewriter reveal in Oswald.
function label(text, x, y, size, color, p, align = "left", weight = 500) {
  if (p <= 0) return;
  const n = Math.ceil(text.length * clamp(p * 1.15));
  ctx.save(); ctx.font = `${weight} ${size}px Oswald`; ctx.textBaseline = "middle"; ctx.fillStyle = color;
  ctx.textAlign = "left";
  const full = ctx.measureText(text).width;
  const x0 = align === "center" ? x - full / 2 : align === "right" ? x - full : x;
  ctx.globalAlpha = clamp(p * 3); ctx.fillText(text.slice(0, n), x0, y); ctx.restore();
}
function bigNumber(text, x, y, size, color, alpha = 1, align = "center", scale = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.font = `${size}px Righteous`; ctx.textBaseline = "middle"; ctx.textAlign = align; ctx.lineJoin = "round";
  ctx.strokeStyle = DARK; ctx.lineWidth = size * 0.12; ctx.strokeText(text, 0, 0);
  ctx.fillStyle = color; ctx.fillText(text, 0, 0); ctx.restore();
}
function led(text, x, y, size, color, a = 1, align = "center") {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px Righteous`; ctx.textAlign = align; ctx.textBaseline = "middle";
  ctx.shadowColor = color; ctx.shadowBlur = 26; ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.restore();
}
function shadowed(fn, blur = 34, oy = 14, a = 0.5) { ctx.save(); ctx.shadowColor = `rgba(0,0,0,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = oy; fn(); ctx.restore(); }
// glossy panel: drawn border first, then gradient body fades in
function panel(x, y, w, h, r, p, top = "#1D2A55", bot = "#111936", border = "rgba(255,255,255,0.85)") {
  if (p <= 0) return;
  const fa = eo(clamp(p * 1.6 - 0.5));
  if (fa > 0) shadowed(() => {
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.globalAlpha = fa; ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
  });
  if (fa > 0) { ctx.save(); ctx.globalAlpha = fa * 0.35; ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + r, y + 3); ctx.lineTo(x + w - r, y + 3); ctx.stroke(); ctx.restore(); }
  polyPartial(roundRectPts(x, y, w, h, r), clamp(p * 1.3), border, 5);
}
function stamp(text, x, y, p, color = PINK, w = 600, size = 84, rot = -0.08) {
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const s = 1 + 0.5 * (1 - eo(p)); ctx.scale(s, s); ctx.globalAlpha = clamp(p * 2);
  ctx.shadowColor = color; ctx.shadowBlur = 24; ctx.strokeStyle = color; ctx.lineWidth = 10; ctx.beginPath(); ctx.roundRect(-w / 2, -size * 0.8, w, size * 1.6, 22); ctx.stroke(); ctx.restore();
  title(text, x, y, size, color, eo(p), rot, w - 60);
}
function burst(cx, cy, t0, t, color = YEL, n = 14, R = 120) {
  const q = P(t, t0, 0.6); if (q <= 0 || q >= 1) return;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + t0; const d = R * eo(q); disc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 7 * (1 - q), color, 1 - q, 14); }
  arcP(cx, cy, 30 + R * 0.8 * eo(q), 1, `rgba(255,255,255,${0.6 * (1 - q)})`, 4);
}
function sweep(t, t0) {   // light sweep across the frame at a scene change
  const q = P(t, t0 - 0.15, 0.55); if (q <= 0 || q >= 1) return;
  const x = -400 + q * (W + 800);
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  const g = ctx.createLinearGradient(x - 160, 0, x + 160, 0); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(200,230,255,0.20)"); g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.translate(x, H / 2); ctx.rotate(0.25); ctx.fillRect(-160, -H, 320, H * 2); ctx.restore();
}
function camera(t, t0, t1, fn) {   // slow push-in for each scene
  if (t < t0 - 0.4 || t > t1 + 0.4) return;
  const s = 1 + 0.035 * clamp((t - t0) / Math.max(0.1, t1 - t0));
  ctx.save(); ctx.translate(540, 900); ctx.scale(s, s); ctx.translate(-540, -900); fn(); ctx.restore();
}
function hbar(x, y, w, h, frac, color, a, glow = 0) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a * 0.22; ctx.fillStyle = WHITE; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill(); ctx.restore();
  if (frac > 0.003) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color; if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
    ctx.beginPath(); ctx.roundRect(x, y, Math.max(h, w * frac), h, h / 2); ctx.fill(); ctx.restore(); }
}
function tick(x, y, r, p, ok = true) {
  if (p <= 0) return; disc(x, y, r * eo(p), ok ? TEAL : RED, 1, 24);
  ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = ok ? DARK : WHITE; ctx.lineWidth = r * 0.2; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath();
  if (ok) { ctx.moveTo(x - r * 0.45, y + r * 0.04); ctx.lineTo(x - r * 0.12, y + r * 0.36); ctx.lineTo(x + r * 0.48, y - r * 0.3); }
  else { ctx.moveTo(x - r * 0.38, y - r * 0.38); ctx.lineTo(x + r * 0.38, y + r * 0.38); ctx.moveTo(x + r * 0.38, y - r * 0.38); ctx.lineTo(x - r * 0.38, y + r * 0.38); }
  ctx.stroke(); ctx.restore();
}
function icon(x, y, s, color, a = 1) {   // little person pictogram
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y - 30 * s, 15 * s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(x - 20 * s, y - 10 * s, 40 * s, 56 * s, 14 * s); ctx.fill(); ctx.restore();
}
function subscribePill(t, t0, y = 1395) {   // small closing call to action (no narration)
  const ps = io(t, t0, 0.4, null); if (ps <= 0) return;
  ctx.save(); ctx.globalAlpha = ps; ctx.fillStyle = "#D9283A"; ctx.beginPath(); ctx.roundRect(340, y, 400, 60, 30); ctx.fill(); ctx.restore();
  label("SUBSCRIBE FOR MORE", 540, y + 31, 30, WHITE, ps, "center", 700);
}

// ================= space look =================
let seed = 41; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const grain = document.createElement("canvas"); grain.width = 540; grain.height = 960;
{ const g = grain.getContext("2d"), im = g.createImageData(540, 960);
  for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0); }
const stars = Array.from({ length: 280 }, () => ({ x: rnd() * W, y: rnd() * 1700, r: 0.6 + rnd() * 1.7, a: 0.2 + rnd() * 0.55 }));
const twinkle = Array.from({ length: 44 }, () => ({ x: rnd() * W, y: rnd() * 1600, r: 1.3 + rnd() * 1.6, ph: rnd() * 6.28, sp: 1 + rnd() * 2.2 }));
const floaters = Array.from({ length: 26 }, () => ({ x: 260 + rnd() * 640, y: rnd() * 900, s: 14 + rnd() * 26, r: 2 + rnd() * 3, ph: rnd() * 6.28 }));
const continents = Array.from({ length: 14 }, () => ({ a: rnd() * 6.28, y: (rnd() - 0.5) * 1.6, rx: 0.1 + rnd() * 0.2, ry: 0.08 + rnd() * 0.16 }));
let BG = null, VIG = null;
function staticBg() {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#050920"); g.addColorStop(0.6, "#0B102A"); g.addColorStop(1, "#0E1636");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, c] of [[160, 560, 560, "rgba(124,72,230,0.17)"], [960, 1180, 600, "rgba(46,230,197,0.09)"], [660, 220, 460, "rgba(255,77,141,0.07)"]]) {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, c); rg.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  }
  for (const s of stars) disc(s.x, s.y, s.r, "#FFFFFF", s.a);
  // Earth's limb along the bottom edge
  const ey = 1660 + 1600, er = 1600;
  const ag = ctx.createRadialGradient(540, ey, er - 20, 540, ey, er + 110); ag.addColorStop(0, "rgba(110,190,255,0.55)"); ag.addColorStop(1, "rgba(110,190,255,0)");
  ctx.fillStyle = ag; ctx.fillRect(0, 1480, W, H - 1480);
  const eg = ctx.createLinearGradient(0, 1660, 0, H); eg.addColorStop(0, "#3A7BEA"); eg.addColorStop(0.25, "#1A4596"); eg.addColorStop(1, "#0A1D4A");
  ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(540, ey, er, 0, Math.PI * 2); ctx.fill();
}
function background(t) {
  if (!BG) { BG = document.createElement("canvas"); BG.width = W; BG.height = H; const c0 = ctx; ctx = BG.getContext("2d"); staticBg(); ctx = c0; }
  ctx.drawImage(BG, 0, 0);
  for (const s of twinkle) disc(s.x, s.y, s.r, "#FFFFFF", 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph)), 8);
}
function finishFrame(t) {
  if (!VIG) { VIG = document.createElement("canvas"); VIG.width = W; VIG.height = H; const g2 = VIG.getContext("2d");
    const v = g2.createRadialGradient(540, 900, 380, 540, 900, 1250); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g2.fillStyle = v; g2.fillRect(0, 0, W, H); }
  ctx.drawImage(VIG, 0, 0);
  ctx.save(); ctx.globalAlpha = 0.045; ctx.globalCompositeOperation = "overlay";
  const ox = Math.floor((t * 977) % 60), oy = Math.floor((t * 613) % 80);
  ctx.drawImage(grain, -ox, -oy, W + 60, H + 80); ctx.restore();
}

// ================= Earth + ISS =================
function earth(cx, cy, r, p, t) {
  if (p <= 0) return;
  const s = 0.6 + 0.4 * eo(p);
  ctx.save(); ctx.globalAlpha = clamp(p * 1.5); ctx.translate(cx, cy); ctx.scale(s, s);
  const ag = ctx.createRadialGradient(0, 0, r * 0.95, 0, 0, r * 1.35); ag.addColorStop(0, "rgba(124,200,255,0.55)"); ag.addColorStop(1, "rgba(124,200,255,0)");
  ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r); g.addColorStop(0, "#4C9BFF"); g.addColorStop(1, "#163C8C");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = "rgba(46,230,197,0.85)";
  for (const c of continents) { const a = c.a + t * 0.35, x = Math.sin(a) * r, vis = Math.cos(a); if (vis <= 0) continue;
    ctx.beginPath(); ctx.ellipse(x, c.y * r * 0.6, c.rx * r * vis, c.ry * r, 0, 0, Math.PI * 2); ctx.fill(); }
  const sh = ctx.createLinearGradient(-r, 0, r, 0); sh.addColorStop(0.45, "rgba(5,9,32,0)"); sh.addColorStop(1, "rgba(5,9,32,0.55)");
  ctx.fillStyle = sh; ctx.fillRect(-r, -r, 2 * r, 2 * r); ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
function iss(x, y, rot, a, sc = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = a;
  ctx.shadowColor = SKY; ctx.shadowBlur = 16;
  ctx.fillStyle = "#DCE6FF"; ctx.fillRect(-62, -4, 124, 8);
  for (const sx of [-50, -30, 30, 50]) { ctx.fillStyle = "#2B7BD8"; ctx.fillRect(sx - 8, -34, 16, 26); ctx.fillRect(sx - 8, 8, 16, 26);
    ctx.strokeStyle = "#BFE2FF"; ctx.lineWidth = 2; ctx.strokeRect(sx - 8, -34, 16, 26); ctx.strokeRect(sx - 8, 8, 16, 26); }
  ctx.fillStyle = "#F4F7FF"; ctx.beginPath(); ctx.roundRect(-16, -10, 32, 20, 6); ctx.fill();
  ctx.restore();
}

// ================= body (front view), drawn into an offscreen mask =================
const BW = 700, BHh = 960;
const BMASK = document.createElement("canvas"); BMASK.width = BW; BMASK.height = BHh; const bm = BMASK.getContext("2d");
const BOUT = document.createElement("canvas"); BOUT.width = BW; BOUT.height = BHh; const bo = BOUT.getContext("2d");
function capsule(c, x1, y1, x2, y2, r1, r2) {
  const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
  c.beginPath(); c.moveTo(x1 + nx * r1, y1 + ny * r1); c.lineTo(x2 + nx * r2, y2 + ny * r2);
  c.arc(x2, y2, r2, a + Math.PI / 2, a - Math.PI / 2, true); c.lineTo(x1 - nx * r1, y1 - ny * r1);
  c.arc(x1, y1, r1, a - Math.PI / 2, a + Math.PI / 2, true); c.closePath(); c.fill();
}
function bodyShapes(c, u, o) {
  const cx = BW / 2, top = 40, f = o.face || 1, lg = o.leg || 1;
  c.beginPath(); c.ellipse(cx, top + 0.068 * u, 0.05 * u * f, 0.064 * u * (1 + 0.04 * (f - 1)), 0, 0, Math.PI * 2); c.fill();
  c.fillRect(cx - 0.022 * u, top + 0.12 * u, 0.044 * u, 0.07 * u);
  c.beginPath(); [[-0.118, 0.178], [0.118, 0.178], [0.095, 0.33], [0.082, 0.43], [0.1, 0.52], [-0.1, 0.52], [-0.082, 0.43], [-0.095, 0.33]]
    .forEach(([x, y], i) => i ? c.lineTo(cx + x * u, top + y * u) : c.moveTo(cx + x * u, top + y * u)); c.closePath();
  c.lineJoin = "round"; c.lineWidth = 0.05 * u; c.strokeStyle = c.fillStyle; c.stroke(); c.fill();
  for (const s of [-1, 1]) {
    capsule(c, cx + s * 0.118 * u, top + 0.2 * u, cx + s * 0.16 * u, top + 0.49 * u, 0.034 * u, 0.025 * u);
    c.beginPath(); c.arc(cx + s * 0.162 * u, top + 0.515 * u, 0.03 * u, 0, Math.PI * 2); c.fill();
    capsule(c, cx + s * 0.052 * u, top + 0.52 * u, cx + s * 0.058 * u, top + 0.945 * u, 0.052 * u * lg, 0.027 * u * Math.sqrt(lg));
    c.beginPath(); c.ellipse(cx + s * 0.072 * u, top + 0.968 * u, 0.042 * u, 0.022 * u, 0, 0, Math.PI * 2); c.fill();
  }
}
// o: p (draw-on), face, leg, fluid (0 = pooled low, 1 = pooled high), fluidA, rot, col
function bodyFront(x, top, u, o) {
  const p = o.p ?? 1; if (p <= 0) return;
  bm.clearRect(0, 0, BW, BHh); bm.globalCompositeOperation = "source-over"; bm.fillStyle = "#FFFFFF"; bodyShapes(bm, u, o);
  bm.globalCompositeOperation = "source-in";
  const g = bm.createLinearGradient(0, 40, 0, 40 + u); g.addColorStop(0, o.col || "#1E5566"); g.addColorStop(1, "#102F3E");
  bm.fillStyle = g; bm.fillRect(0, 0, BW, BHh);
  bm.globalCompositeOperation = "source-atop";
  const fa = o.fluidA ?? 0;
  if (fa > 0) { const f = o.fluid ?? 0, fg = bm.createLinearGradient(0, 40, 0, 40 + u);
    fg.addColorStop(0, `rgba(90,175,255,${fa * (0.08 + 0.62 * f)})`); fg.addColorStop(0.5, `rgba(90,175,255,${fa * 0.3})`); fg.addColorStop(1, `rgba(90,175,255,${fa * (0.08 + 0.62 * (1 - f))})`);
    bm.fillStyle = fg; bm.fillRect(0, 0, BW, BHh); }
  bm.globalCompositeOperation = "source-over";
  bo.clearRect(0, 0, BW, BHh); bo.globalCompositeOperation = "source-over"; bo.drawImage(BMASK, 0, 0); bo.globalCompositeOperation = "source-in";
  bo.fillStyle = TEAL; bo.fillRect(0, 0, BW, BHh); bo.globalCompositeOperation = "source-over";
  ctx.save(); ctx.translate(x, top + u / 2); ctx.rotate(o.rot || 0); ctx.translate(-x, -(top + u / 2));
  ctx.beginPath(); ctx.rect(x - BW / 2 - 20, top - 60, BW + 40, (u + 120) * eo(p)); ctx.clip();
  ctx.globalAlpha = clamp(p * 1.5);
  const ox = x - BW / 2, oy = top - 40;
  ctx.save(); ctx.shadowColor = "rgba(46,230,197,0.6)"; ctx.shadowBlur = 24;
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; ctx.drawImage(BOUT, ox + Math.cos(a) * 5, oy + Math.sin(a) * 5); }
  ctx.restore(); ctx.drawImage(BMASK, ox, oy);
  ctx.restore();
}
const BP = (x, top, u) => ({ head: [x, top + 0.068 * u], heart: [x + 0.03 * u, top + 0.27 * u], stomach: [x - 0.015 * u, top + 0.37 * u] });

// a love-heart that can be blended toward a circle (round 0..1) and pulsed (beat ~1)
function heartShape(cx, cy, s, round, p, beat) {
  if (p <= 0) return;
  const pts = [];
  for (let i = 0; i <= 120; i++) { const a = i / 120 * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(a), 3), hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
    const cxp = 15.5 * Math.sin(a), cyp = -15.5 * Math.cos(a) + 1.5;
    pts.push([cx + s * beat * (hx + (cxp - hx) * round), cy + s * beat * (hy + (cyp - hy) * round)]); }
  const fa = eo(clamp(p * 1.6 - 0.5));
  if (fa > 0) { ctx.save(); ctx.globalAlpha = fa; const g = ctx.createRadialGradient(cx - s * 6, cy - s * 6, s, cx, cy, s * 18); g.addColorStop(0, "#FF8FB6"); g.addColorStop(1, "#C21F5B");
    ctx.fillStyle = g; ctx.shadowColor = PINK; ctx.shadowBlur = 40; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); ctx.restore(); }
  polyPartial(pts, p, WHITE, 6);
}
function clockFace(cx, cy, r, ang, p, color = WHITE) {
  if (p <= 0) return;
  arcP(cx, cy, r, p, color, 7);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; lineP(cx + Math.cos(a) * r * 0.82, cy + Math.sin(a) * r * 0.82, cx + Math.cos(a) * r * 0.92, cy + Math.sin(a) * r * 0.92, p, color, 4); }
  lineP(cx, cy, cx + Math.cos(ang - Math.PI / 2) * r * 0.7, cy + Math.sin(ang - Math.PI / 2) * r * 0.7, p, YEL, 7); disc(cx, cy, 9, YEL, p);
}

// ---------- captions (channel style: condensed white, key words yellow) ----------
function captions(t) {
  const c = TL.captions.find(c => t >= c.s && t < c.e);
  if (!c) return;
  const pop = eo(P(t, c.s, 0.12)), s = 0.86 + 0.14 * pop;
  ctx.save(); ctx.translate(540, 1530); ctx.scale(s, s);
  ctx.font = "700 84px Oswald"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  const parts = c.words.map((w, i) => ({ text: (i ? " " : "") + w.w, hi: w.hi }));
  const widths = parts.map(p => ctx.measureText(p.text).width), total = widths.reduce((a, b) => a + b, 0);
  for (const pass of [0, 1]) {
    let x = -total / 2;
    parts.forEach((p, i) => {
      if (pass === 0) { ctx.strokeStyle = "#000"; ctx.lineWidth = 12; ctx.strokeText(p.text, x, 0); }
      else { ctx.fillStyle = p.hi ? YEL : WHITE; ctx.fillText(p.text, x, 0); }
      x += widths[i];
    });
  }
  ctx.restore();
}

window.ready = document.fonts.load("120px Righteous").then(() => document.fonts.load("700 84px Oswald"))
  .then(() => document.fonts.load("500 40px Oswald")).then(() => document.fonts.ready).then(() => true);
