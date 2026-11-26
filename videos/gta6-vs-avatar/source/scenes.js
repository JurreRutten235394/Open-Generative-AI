// GTA 6 made more in one day than Avatar ever made (drawn infographic; no game footage or logos)
const MONEY = "#3FBF6F", MONEY2 = "#1F7A44", GOLD = "#FFD640";
// ---------- neon sunset background (synthwave sun, palms, scrolling grid) ----------
let VBG = null;
const HZ = 1290;
function palm(c, x, base, h, lean) {
  c.strokeStyle = "#1A0730"; c.lineWidth = 26; c.lineCap = "round";
  c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x + lean * 0.4, base - h * 0.5, x + lean, base - h); c.stroke();
  const tx = x + lean, ty = base - h; c.fillStyle = "#1A0730";
  for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.48; c.beginPath(); c.moveTo(tx, ty);
    c.quadraticCurveTo(tx + Math.cos(a) * 140, ty + Math.sin(a) * 140 - 40, tx + Math.cos(a) * 230, ty + Math.sin(a) * 230 + 70);
    c.quadraticCurveTo(tx + Math.cos(a) * 120, ty + Math.sin(a) * 120 + 10, tx, ty + 12); c.fill(); }
}
function background(t) {
  if (!VBG) { VBG = document.createElement("canvas"); VBG.width = W; VBG.height = H; const c = VBG.getContext("2d");
    const g = c.createLinearGradient(0, 0, 0, HZ); g.addColorStop(0, "#12062E"); g.addColorStop(0.45, "#3B0F5C"); g.addColorStop(0.8, "#B8306E"); g.addColorStop(1, "#FF7A59");
    c.fillStyle = g; c.fillRect(0, 0, W, HZ);
    for (let i = 0; i < 160; i++) { c.globalAlpha = 0.2 + Math.random() * 0.5; c.fillStyle = "#FFFFFF"; c.beginPath(); c.arc(Math.random() * W, Math.random() * 700, Math.random() * 1.6 + 0.4, 0, 6.3); c.fill(); }
    c.globalAlpha = 1;
    // striped synthwave sun sitting on the horizon
    const sg = c.createLinearGradient(0, HZ - 330, 0, HZ); sg.addColorStop(0, "#FFE76A"); sg.addColorStop(1, "#FF4D8D");
    const sun = document.createElement("canvas"); sun.width = W; sun.height = H; const sc = sun.getContext("2d");   // stripes cut on a separate layer keep VBG opaque
    sc.beginPath(); sc.arc(540, HZ, 330, Math.PI, 0); sc.closePath(); sc.clip(); sc.fillStyle = sg; sc.fillRect(200, HZ - 340, 680, 340);
    sc.globalCompositeOperation = "destination-out"; for (let k = 0; k < 7; k++) { const y = HZ - 150 + k * 22; sc.fillRect(200, y, 680, 4 + k * 1.6); }
    c.drawImage(sun, 0, 0);
    const fg = c.createLinearGradient(0, HZ, 0, H); fg.addColorStop(0, "#2A0B4A"); fg.addColorStop(1, "#0C0420"); c.fillStyle = fg; c.fillRect(0, HZ, W, H - HZ);
    palm(c, 70, HZ + 40, 520, 90); palm(c, 1010, HZ + 40, 600, -110); palm(c, 180, HZ + 60, 360, 40);
  }
  ctx.drawImage(VBG, 0, 0);
  // scrolling neon grid on the ground
  ctx.save(); ctx.strokeStyle = "rgba(255,77,141,0.55)"; ctx.lineWidth = 2;
  for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(540 + i * 30, HZ); ctx.lineTo(540 + i * 260, H); ctx.stroke(); }
  for (let k = 0; k < 9; k++) { const q = ((k + (t * 0.8) % 1) / 9), y = HZ + (H - HZ) * q * q; ctx.globalAlpha = 0.2 + 0.6 * q; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();
}
// ---------- props ----------
function cashStack(x, base, w, h, p, glow) {
  if (p <= 0) return;
  const hh = h * eo(p), n = Math.max(1, Math.floor(hh / 16));
  ctx.save(); if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 50; ctx.fillStyle = glow; ctx.fillRect(x, base - hh, w, hh); ctx.shadowBlur = 0; }
  for (let i = 0; i < n; i++) { const y = base - (i + 1) * 16, jit = ((i * 37) % 7) - 3;
    ctx.fillStyle = i % 2 ? MONEY : "#4DD07F"; ctx.fillRect(x + jit, y, w, 14); ctx.fillStyle = MONEY2; ctx.fillRect(x + jit, y + 12, w, 2);
    ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(x + jit + w * 0.42, y, w * 0.16, 14); }
  const ty = base - n * 16; ctx.fillStyle = "#6BE39A"; ctx.fillRect(x, ty - 16, w, 16);
  ctx.fillStyle = MONEY2; ctx.font = "26px Righteous"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("$", x + w / 2, ty - 7);
  ctx.restore();
}
function controller(x, y, s, a) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a; ctx.fillStyle = "#F4F7FF";
  ctx.beginPath(); ctx.moveTo(-60, -22); ctx.lineTo(60, -22); ctx.quadraticCurveTo(92, -22, 96, 18); ctx.quadraticCurveTo(100, 50, 74, 48); ctx.quadraticCurveTo(52, 46, 40, 20);
  ctx.lineTo(-40, 20); ctx.quadraticCurveTo(-52, 46, -74, 48); ctx.quadraticCurveTo(-100, 50, -96, 18); ctx.quadraticCurveTo(-92, -22, -60, -22); ctx.fill();
  ctx.fillStyle = DARK; ctx.fillRect(-58, -4, 26, 8); ctx.fillRect(-49, -13, 8, 26);
  for (const [dx, dy, c] of [[48, -8, PINK], [62, 4, TEAL], [34, 4, YEL], [48, 16, SKY]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(dx, dy, 6, 0, 6.3); ctx.fill(); }
  ctx.restore();
}
function clapper(x, y, s, a) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a;
  ctx.fillStyle = "#F4F7FF"; ctx.fillRect(-60, -10, 120, 70);
  ctx.save(); ctx.translate(-60, -10); ctx.rotate(-0.25); ctx.fillStyle = "#F4F7FF"; ctx.fillRect(0, -26, 124, 26);
  ctx.fillStyle = DARK; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(10 + k * 30, -26); ctx.lineTo(26 + k * 30, -26); ctx.lineTo(16 + k * 30, 0); ctx.lineTo(0 + k * 30, 0); ctx.closePath(); ctx.fill(); } ctx.restore();
  ctx.fillStyle = DARK; for (let k = 0; k < 4; k++) ctx.fillRect(-56 + k * 30, -6, 16, 10);
  ctx.restore();
}
function money(n) { return n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${Math.round(n / 1e6)}M` : `$${fmt(n)}`; }
// the opening (and closing) composition
function hero(t, p) {
  const base = 1215;
  cashStack(250, base, 230, 700, p, "rgba(255,214,64,0.35)");
  cashStack(600, base, 230, 700 * 2.92 / 3.79, p, null);
  bigNumber("$3.79B", 365, base - 700 - 60, 84, GOLD, p);
  bigNumber("$2.92B", 715, base - 540 - 60, 72, WHITE, p);
  controller(365, base + 60, 0.9, p); clapper(715, base + 60, 0.75, p);
  label("GTA 6 · 1 DAY", 365, base + 150, 40, GOLD, p, "center", 700);
  label("AVATAR · ALL TIME", 715, base + 150, 40, WHITE, p, "center", 700);
}

const S2 = C.l2 - 0.3, S3 = C.l3 - 0.3, S4 = C.l4 - 0.3, S5 = C.l5 - 0.3, S6 = C.l6 - 0.3, S7 = C.l7 - 0.3;
function render(t) {
  background(t);

  // ===== 1. Hook: complete from frame one =====
  camera(t, -0.3, S2, () => {
    title("GTA 6 MADE MORE IN 1 DAY", 540, T1, 96, WHITE, ON(t, S2));
    title("THAN AVATAR EVER MADE", 540, T2, 66, PINK, ON(t, S2));
    hero(t, ON(t, S2));
  });

  // ===== 2. Avatar: 13 years and several re-releases =====
  camera(t, S2, S3, () => {
    const out = S3;
    title("AVATAR", 540, T1, 140, WHITE, io(t, C.l2 - 0.05, 0.5, out));
    title("13 YEARS TO EARN $2.9B", 540, T2, 66, PINK, io(t, C.decade - 0.3, 0.5, out));
    const p = io(t, C.l2 - 0.2, 0.6, out), prog = eio(P(t, C.l2, C.n29 + 0.4 - C.l2));
    panel(90, 500, 900, 760, 36, p, "#2A1450", "#160A30");
    clapper(540, 640, 1.2, p);
    const x0 = 160, x1 = 920, y = 900, yr = v => x0 + (x1 - x0) * (v - 2009) / 13;
    lineP(x0, y, x1, y, p, "rgba(255,255,255,0.5)", 5); lineP(x0, y, x0 + (x1 - x0) * prog, y, p, PINK, 7);
    [[2009, "2009 RELEASE", -1, "left"], [2010, "2010 RE-RELEASE", 1, "left"], [2021, "2021 CHINA", -1, "right"], [2022, "2022 RE-RELEASE", 1, "right"]].forEach(([v, n, side, al]) => {
      const x = yr(v), on = prog * 13 + 2009 >= v;
      disc(x, y, on ? 14 : 9, on ? PINK : "#6A5A8A", p, on ? 20 : 0);
      lineP(x, y + side * 16, x, y + side * 40, p, on ? YEL : DIM, 3);
      label(n, x + (al === "left" ? -8 : 8), y + side * 62, 28, on ? YEL : DIM, p * (on ? 1 : 0.6), al, 700); });
    bigNumber(money(2.92e9 * prog), 540, 1100, 110, WHITE, p);
    label("TOTAL BOX OFFICE, ALL TIME", 540, 1190, 32, DIM, p, "center", 700);
  });

  // ===== 3. GTA 6: $3.79 billion on day one =====
  camera(t, S3, S4, () => {
    const out = S4;
    title("GTA 6", 540, T1, 150, GOLD, io(t, C.l3 - 0.05, 0.5, out));
    title("$3.79 BILLION ON DAY ONE", 540, T2, 62, PINK, io(t, C.n379 - 0.3, 0.5, out));
    const p = io(t, C.l3 - 0.2, 0.6, out), prog = eio(P(t, C.g6, C.dayone + 0.3 - C.g6));
    panel(140, 500, 800, 820, 40, p, "#2A1450", "#160A30");
    controller(540, 620, 1.1, p);
    arcP(540, 900, 210, p, "rgba(255,255,255,0.18)", 26); arcP(540, 900, 210, prog * p, GOLD, 26);
    clockFace(540, 900, 170, prog * Math.PI * 4, p, WHITE);
    label("24 HOURS", 540, 1050, 32, DIM, p, "center", 700);
    bigNumber(money(3.79e9 * prog), 540, 1170, 110, GOLD, p);
    label("TAKE-TWO'S ESTIMATE", 540, 1260, 28, DIM, p, "center", 500);
  });

  // ===== 4. $44,000 every second =====
  camera(t, S4, S5, () => {
    const out = S5;
    title("$44,000", 540, T1, 150, GOLD, io(t, C.l4 - 0.05, 0.5, out));
    title("EVERY SINGLE SECOND", 540, T2, 66, PINK, io(t, C.second - 0.5, 0.5, out));
    const p = io(t, C.l4 - 0.2, 0.6, out);
    clockFace(540, 860, 230, (t - C.l4) * Math.PI * 2 / 60 * 15, p, WHITE);
    for (let k = 0; k < 4; k++) { const tk = C.n44 - 0.3 + k * 1.0, q = P(t, tk, 1.0); if (q <= 0 || q >= 1) continue;
      bigNumber("+$44,000", 540 + (k % 2 ? 180 : -180), 760 - 260 * eo(q), 64, GOLD, (1 - q) * p);
      burst(540, 860, tk, t, GOLD, 16, 260); }
    label("ON LAUNCH DAY", 540, 1160, 40, WHITE, p, "center", 700);
  });

  // ===== 5. vs GTA 5: almost five times bigger =====
  camera(t, S5, S6, () => {
    const out = S6;
    title("VS GTA 5", 540, T1, 140, WHITE, io(t, C.l5 - 0.05, 0.5, out));
    title("ALMOST 5X BIGGER", 540, T2, 72, PINK, io(t, C.almost - 0.4, 0.5, out));
    const p = io(t, C.l5 - 0.2, 0.6, out), base = 1250;
    cashStack(220, base, 260, 700 * 0.8 / 3.79, io(t, C.n800 - 0.3, 0.6, out), null);
    cashStack(600, base, 260, 700, io(t, C.almost - 0.4, 0.9, out), "rgba(255,214,64,0.35)");
    bigNumber("$800M", 350, base - 152 - 60, 72, WHITE, io(t, C.n800 - 0.2, 0.4, out));
    bigNumber("$3.79B", 730, base - 760, 84, GOLD, io(t, C.almost - 0.1, 0.4, out));
    label("GTA 5 · DAY ONE · 2013", 350, base + 50, 34, WHITE, p, "center", 700);
    label("GTA 6 · DAY ONE · 2026", 730, base + 50, 34, GOLD, io(t, C.almost - 0.4, 0.4, out), "center", 700);
    stamp("≈ 5X", 360, 820, io(t, C.almost + 0.3, 0.35, out), PINK, 300, 90, -0.08);
  });

  // ===== 6. 32.5 million copies sold before launch =====
  camera(t, S6, S7, () => {
    const out = S7;
    title("BEFORE LAUNCH", 540, T1, 124, WHITE, io(t, C.l6 - 0.05, 0.5, out));
    title("32.5 MILLION COPIES SOLD", 540, T2, 60, PINK, io(t, C.n325 - 0.4, 0.5, out));
    const p = io(t, C.l6 - 0.2, 0.6, out), n = Math.floor(130 * eo(P(t, C.n325 - 0.6, 1.6)));
    panel(90, 480, 900, 820, 36, p, "#2A1450", "#160A30");
    for (let i = 0; i < 130; i++) { const c = i % 10, r = Math.floor(i / 10); icon(180 + c * 80, 560 + r * 52, 0.7, i < n ? [GOLD, PINK, TEAL][i % 3] : "#4A3A6A", p * (i < n ? 1 : 0.5)); }
    bigNumber(fmt(32.5e6 * n / 130), 540, 1250, 76, GOLD, p);
    label("EACH ICON = 250,000 COPIES", 540, 1330, 30, DIM, p, "center", 700);
  });

  // ===== 7. Loop back to the opening =====
  camera(t, S7, TL.total, () => {
    title("GTA 6 MADE MORE IN 1 DAY", 540, T1, 96, WHITE, io(t, C.l7 - 0.1, 0.4, null));
    title("THAN AVATAR EVER MADE", 540, T2, 66, PINK, io(t, C.l7, 0.4, null));
    hero(t, io(t, C.l7 - 0.2, 0.5, null));
    subscribePill(t, C.avatar7, 1405);
  });

  for (const ts of [S2, S3, S4, S5, S6, S7]) sweep(t, ts);
  finishFrame(t);
  captions(Math.max(t, TL.captions[0].s));
}
