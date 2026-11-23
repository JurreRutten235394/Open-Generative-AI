const GOLD = "#FFD640";
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
function vibeBackground(t) {
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

// ---------- AI-clip scenes: the canvas stays transparent so the stylized clip shows through, with a tint for legibility ----------
function tint(a = 1) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(12,4,30,${0.78 * a})`); g.addColorStop(0.35, `rgba(12,4,30,${0.35 * a})`);
  g.addColorStop(0.65, `rgba(12,4,30,${0.35 * a})`); g.addColorStop(1, `rgba(12,4,30,${0.82 * a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function counterPanel(y, value, sub, p, color = YEL) {
  if (p <= 0) return;
  panel(110, y, 860, 250, 40, p, "rgba(30,12,60,0.85)", "rgba(16,6,36,0.9)");
  led(value, 540, y + 105, 112, color, p);
  label(sub, 540, y + 195, 38, WHITE, p, "center", 700);
}
function medal(cx, cy, p, t) {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  for (const s of [-1, 1]) { ctx.fillStyle = s < 0 ? PINK : TEAL; ctx.beginPath(); ctx.moveTo(cx + s * 20, cy - 10); ctx.lineTo(cx + s * 70, cy - 150); ctx.lineTo(cx + s * 120, cy - 150); ctx.lineTo(cx + s * 60, cy); ctx.closePath(); ctx.fill(); }
  const g = ctx.createRadialGradient(cx - 30, cy + 40, 10, cx, cy + 70, 110); g.addColorStop(0, "#FFF4B0"); g.addColorStop(1, "#E0A100");
  ctx.fillStyle = g; ctx.shadowColor = YEL; ctx.shadowBlur = 40 + 10 * Math.sin(t * 4); ctx.beginPath(); ctx.arc(cx, cy + 70, 100, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = "#FFF4B0"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy + 70, 80, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#7A5200"; ctx.font = "80px Righteous"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("#1", cx, cy + 74);
  ctx.restore();
}
function viewBar(y, name, sub, val, frac, color, p, hi) {
  if (p <= 0) return;
  label(name, 120, y, 40, hi ? YEL : WHITE, p, "left", 700); label(sub, 120, y + 40, 26, DIM, p, "left", 500);
  hbar(120, y + 70, 840, 70, frac, color, p, hi ? 26 : 0);
  bigNumber(val, 940, y + 106, 54, WHITE, p * clamp(frac * 4), "right");
}
function hero(t, p) {
  counterPanel(760, fmt(89000000 + 1421491 * eo(clamp(t / 2.4))), "VIEWS IN 24 HOURS", p);
  label("FIRST GTA 6 TRAILER · DEC 2023", 540, 1060, 36, TEAL, p, "center", 700);
}
const S2 = C.l2 - 0.3, S3 = C.l3 - 0.3, S4 = C.l4 - 0.3, S5 = C.l5 - 0.3, S6 = C.l6 - 0.3;
const aiOn = t => t < S3 || (t >= S5 && t < S6) || t >= S6;
function render(t) {
  ctx.clearRect(0, 0, W, H);
  if (aiOn(t)) tint(); else vibeBackground(t);

  // ===== 1. Hook over the neon-city clip: complete from frame one =====
  camera(t, -0.3, S2, () => {
    title("THE GTA 6 TRAILER", 540, T1, 110, WHITE, ON(t, S2));
    title("BEAT MRBEAST'S RECORD", 540, T2, 68, PINK, ON(t, S2));
    hero(t, ON(t, S2));
  });

  // ===== 2. 90 million in 24 hours: a world record (crowd clip) =====
  camera(t, S2, S3, () => {
    const out = S3;
    title("90 MILLION VIEWS", 540, T1, 108, WHITE, io(t, C.l2 - 0.05, 0.5, out));
    title("IN 24 HOURS", 540, T2, 76, PINK, io(t, C.n90 + 0.3, 0.5, out));
    const p = io(t, C.l2 - 0.2, 0.5, out);
    medal(540, 640, io(t, C.guinness - 0.3, 0.5, out), t);
    counterPanel(980, fmt(90421491 * eo(P(t, C.l2, 1.6))), "YOUTUBE VIEWS, FIRST 24 HOURS", p);
    label("GUINNESS WORLD RECORD: MOST VIEWED GAME REVEAL", 540, 1290, 32, YEL, io(t, C.guinness, 0.4, out), "center", 700);
  });

  // ===== 3. MrBeast's best: about 59 million =====
  camera(t, S3, S4, () => {
    const out = S4;
    title("MRBEAST'S RECORD", 540, T1, 110, WHITE, io(t, C.l3 - 0.05, 0.5, out));
    title("ABOUT 59 MILLION", 540, T2, 76, PINK, io(t, C.n59 - 0.3, 0.5, out));
    const p = io(t, C.l3 - 0.2, 0.6, out);
    panel(70, 500, 940, 820, 36, p, "#2A1450", "#160A30");
    label("MOST VIEWS IN 24 HOURS (NON-MUSIC)", 540, 570, 32, DIM, p, "center", 700);
    viewBar(650, "GTA 6 TRAILER", "DEC 2023", "90.4M", 90.4 / 108.2 * eo(P(t, C.l3, 0.8)), GOLD, p, true);
    viewBar(880, "MRBEAST'S BEST", "PREVIOUS RECORD", "59.4M", 59.4 / 108.2 * eo(P(t, C.n59 - 0.3, 0.8)), "#7FA8FF", p, false);
    label("HE EVEN POSTED THAT THE TRAILER BEAT HIM", 540, 1180, 34, TEAL, io(t, C.posted - 0.2, 0.4, out), "center", 700);
  });

  // ===== 4. Still behind BTS =====
  camera(t, S4, S5, () => {
    const out = S5;
    title("STILL NOT #1", 540, T1, 120, WHITE, io(t, C.l4 - 0.05, 0.5, out));
    title("BTS HOLDS THE RECORD", 540, T2, 70, PINK, io(t, C.bts - 0.3, 0.5, out));
    const p = io(t, C.l4 - 0.2, 0.6, out);
    panel(70, 500, 940, 820, 36, p, "#2A1450", "#160A30");
    label("MOST YOUTUBE VIEWS IN 24 HOURS (ANY VIDEO)", 540, 570, 32, DIM, p, "center", 700);
    viewBar(650, "BTS · \"BUTTER\"", "MUSIC VIDEO · MAY 2021", "108.2M", eo(P(t, C.butter - 0.3, 1.0)), PINK, io(t, C.bts - 0.3, 0.4, out), true);
    viewBar(880, "GTA 6 TRAILER", "DEC 2023", "90.4M", 90.4 / 108.2, GOLD, p, false);
    viewBar(1080, "MRBEAST'S BEST", "PREVIOUS NON-MUSIC RECORD", "59.4M", 59.4 / 108.2, "#7FA8FF", p, false);
  });

  // ===== 5. Trailer 2: 475 million across every platform (phones clip) =====
  camera(t, S5, S6, () => {
    const out = S6;
    title("THEN TRAILER 2", 540, T1, 116, WHITE, io(t, C.l5 - 0.05, 0.5, out));
    title("475 MILLION IN 24 HOURS", 540, T2, 62, PINK, io(t, C.n475 - 0.3, 0.5, out));
    counterPanel(800, fmt(475000000 * eo(P(t, C.n475 - 0.4, 1.8))), "VIEWS · ALL PLATFORMS · 24 H", io(t, C.t2 - 0.2, 0.5, out), GOLD);
    label("ROCKSTAR'S OWN COUNT · MAY 2025", 540, 1110, 34, TEAL, io(t, C.every - 0.3, 0.4, out), "center", 700);
  });

  // ===== 6. Loop back to the opening =====
  camera(t, S6, TL.total, () => {
    title("THE GTA 6 TRAILER", 540, T1, 110, WHITE, io(t, C.l6 - 0.1, 0.4, null));
    title("BEAT MRBEAST'S RECORD", 540, T2, 68, PINK, io(t, C.l6, 0.4, null));
    hero(TL.total, io(t, C.l6 - 0.2, 0.5, null));
    subscribePill(t, C.oneday + 0.2, 1405);
  });

  for (const ts of [S2, S3, S4, S5, S6]) sweep(t, ts);
  finishFrame(t);
  captions(Math.max(t, TL.captions[0].s));
}
