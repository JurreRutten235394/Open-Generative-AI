// Heart pumps an Olympic pool a year
const BLOOD0 = "#D11C3C", BLOOD1 = "#6E0A1C";
const beatK = t => 1 + 0.06 * Math.pow(Math.max(0, Math.sin(t * 7.5)), 10);   // ~72 bpm pulse
// a swimming pool seen from above at an angle: deck, tiled basin, lane ropes; blood spreads from the far end (fill 0..1)
function pool(x0, y0, w, h, fill, t, a, small = false) {
  if (a <= 0) return;
  const inset = w * 0.14, lerp = (p, q, f) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
  const BL = [x0 + inset, y0], BR = [x0 + w - inset, y0], FL = [x0, y0 + h], FR = [x0 + w, y0 + h];
  const poly = pts => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };
  const d = small ? 6 : 26;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = "#E3E9F6"; poly([[BL[0] - d * 0.8, BL[1] - d * 0.7], [BR[0] + d * 0.8, BR[1] - d * 0.7], [FR[0] + d, FR[1] + d], [FL[0] - d, FL[1] + d]]); ctx.fill();
  ctx.fillStyle = "#8FC3EE"; poly([BL, BR, FR, FL]); ctx.fill();
  if (!small) { ctx.save(); poly([BL, BR, FR, FL]); ctx.clip(); ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 2;
    for (let i = 1; i < 12; i++) { const f = i / 12, p = lerp(BL, FL, f), q = lerp(BR, FR, f); ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke(); }
    for (let i = 1; i < 24; i++) { const f = i / 24; ctx.beginPath(); ctx.moveTo(...lerp(BL, BR, f)); ctx.lineTo(...lerp(FL, FR, f)); ctx.stroke(); } ctx.restore(); }
  const f = clamp(fill);
  if (f > 0.005) { const L = lerp(BL, FL, f), R = lerp(BR, FR, f), wob = small ? 0 : 5 * Math.sin(t * 3);
    const g = ctx.createLinearGradient(0, y0, 0, L[1]); g.addColorStop(0, "#6E0A1C"); g.addColorStop(1, "#D11C3C");
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(...BL); ctx.lineTo(...BR); ctx.lineTo(R[0], R[1] + wob); ctx.quadraticCurveTo((L[0] + R[0]) / 2, L[1] - wob, L[0], L[1] + wob); ctx.closePath(); ctx.fill();
    if (!small) lineP(L[0] + 8, L[1] + wob, R[0] - 8, R[1] + wob, 1, "rgba(255,180,190,0.6)", 4); }
  if (!small) { for (let l = 1; l < 8; l++) { const fr = l / 8, p = lerp(BL, BR, fr), q = lerp(FL, FR, fr);
      for (let k = 0; k <= 16; k++) { const pt = lerp(p, q, k / 16); disc(pt[0], pt[1], 3 + 3 * (k / 16), k % 2 ? "#FFD640" : "#FFFFFF", 0.95); } }
    for (let l = 0; l < 8; l++) { const p = lerp(BL, BR, (l + 0.5) / 8); ctx.fillStyle = "#F4F7FF"; ctx.fillRect(p[0] - 9, p[1] - 22, 18, 14); } }
  ctx.strokeStyle = "rgba(255,255,255,0.95)"; ctx.lineWidth = small ? 2 : 4; poly([BL, BR, FR, FL]); ctx.stroke();
  ctx.restore();
}
function bottle(cx, cy, fill, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const path = new Path2D(`M ${cx - 16} ${cy - 100} L ${cx + 16} ${cy - 100} L ${cx + 16} ${cy - 70} Q ${cx + 50} ${cy - 56} ${cx + 50} ${cy - 20} L ${cx + 50} ${cy + 80} Q ${cx + 50} ${cy + 100} ${cx + 30} ${cy + 100} L ${cx - 30} ${cy + 100} Q ${cx - 50} ${cy + 100} ${cx - 50} ${cy + 80} L ${cx - 50} ${cy - 20} Q ${cx - 50} ${cy - 56} ${cx - 16} ${cy - 70} Z`);
  ctx.save(); ctx.clip(path); const lv = cy + 100 - 175 * clamp(fill); const g = ctx.createLinearGradient(0, lv, 0, cy + 100); g.addColorStop(0, BLOOD0); g.addColorStop(1, BLOOD1);
  ctx.fillStyle = g; ctx.fillRect(cx - 60, lv, 120, 220); ctx.restore();
  ctx.strokeStyle = WHITE; ctx.lineWidth = 5; ctx.stroke(path); ctx.restore();
  label("1 L", cx, cy + 135, 30, WHITE, a, "center", 700);
}
// blood pumping from the heart into the pool through a pipe
function hero(t, p) {
  const hx = 290, hy = 700;
  const pipe = []; for (let i = 0; i <= 40; i++) { const s = i / 40; pipe.push([hx + (600 - hx) * s, hy + 180 + (980 - hy - 180) * s - 140 * Math.sin(Math.PI * s)]); }
  polyPartial(pipe, p, "#7A1020", 34); polyPartial(pipe, p, BLOOD0, 22);
  if (p > 0) for (let k = 0; k < 9; k++) { const q = (t * 0.9 + k / 9) % 1, idx = Math.floor(q * 40); disc(pipe[idx][0], pipe[idx][1], 8, "#FF8FA0", p * 0.9, 10); }
  heartShape(hx, hy, 11, 0, p, beatK(t));
  pool(330, 966, 690, 290, 0.55 + 0.06 * Math.sin(t * 0.7), t, p);
  label("1 YEAR OF HEARTBEATS", 670, 1322, 40, YEL, p, "center", 700);
  label("= 1 OLYMPIC POOL", 670, 1368, 40, WHITE, p, "center", 700);
}

const S2 = C.l2 - 0.3, S3 = C.l3 - 0.3, S4 = C.l4 - 0.3, S5 = C.l5 - 0.3, S6 = C.l6 - 0.3;
function render(t) {
  background(t);

  // ===== 1. Hook: complete from frame one =====
  camera(t, -0.3, S2, () => {
    title("YOUR HEART PUMPS", 540, T1, 110, WHITE, ON(t, S2));
    title("AN OLYMPIC POOL A YEAR", 540, T2, 66, PINK, ON(t, S2));
    hero(t, ON(t, S2));
  });

  // ===== 2. Fist-sized, 5 liters a minute =====
  camera(t, S2, S3, () => {
    const out = S3;
    title("THE SIZE OF YOUR FIST", 540, T1, 100, WHITE, io(t, C.l2 - 0.05, 0.5, out));
    title("5 LITERS EVERY MINUTE", 540, T2, 64, PINK, io(t, C.n5 - 0.4, 0.5, out));
    const p = io(t, C.l2 - 0.2, 0.6, out);
    heartShape(540, 700, 14, 0, p, beatK(t));
    label("≈ FIST-SIZED, ABOUT 300 G", 540, 990, 38, DIM, io(t, C.fist - 0.3, 0.4, out), "center", 700);
    for (let i = 0; i < 5; i++) { const fill = clamp((t - (C.n5 - 0.3) - i * 0.35) / 0.35);
      bottle(220 + i * 160, 1200, fill, io(t, C.minute2 - 0.2 + i * 0.05, 0.3, out)); }
  });

  // ===== 3. Your whole blood supply, around once a minute =====
  camera(t, S3, S4, () => {
    const out = S4;
    title("ALL OF YOUR BLOOD", 540, T1, 110, WHITE, io(t, C.l3 - 0.05, 0.5, out));
    title("AROUND YOU EVERY MINUTE", 540, T2, 62, PINK, io(t, C.once - 0.4, 0.5, out));
    const p = io(t, C.l3 - 0.2, 0.7, out), bx = 420, top = 520, u = 800;
    bodyFront(bx, top, u, { p });
    const hp = [bx + 0.03 * u, top + 0.27 * u];
    heartShape(hp[0], hp[1], 2.2, 0, p, beatK(t));
    const loop = [hp, [bx, top + 0.15 * u], [bx - 0.02 * u, top + 0.06 * u], [bx + 0.02 * u, top + 0.06 * u], [bx + 0.01 * u, top + 0.15 * u], hp,
                  [bx + 0.13 * u, top + 0.3 * u], [bx + 0.15 * u, top + 0.48 * u], [bx + 0.12 * u, top + 0.3 * u], hp,
                  [bx + 0.05 * u, top + 0.6 * u], [bx + 0.055 * u, top + 0.9 * u], [bx - 0.055 * u, top + 0.9 * u], [bx - 0.05 * u, top + 0.6 * u], hp];
    if (p > 0) { polyPartial(loop, p, "rgba(209,28,60,0.55)", 8);
      const tot = polyLen(loop); for (let k = 0; k < 22; k++) { let d = ((t * 0.28 + k / 22) % 1) * tot, i = 1;
        while (i < loop.length) { const seg = Math.hypot(loop[i][0] - loop[i - 1][0], loop[i][1] - loop[i - 1][1]); if (d <= seg) break; d -= seg; i++; }
        if (i >= loop.length) continue; const seg = Math.hypot(loop[i][0] - loop[i - 1][0], loop[i][1] - loop[i - 1][1]), f = d / seg;
        disc(loop[i - 1][0] + (loop[i][0] - loop[i - 1][0]) * f, loop[i - 1][1] + (loop[i][1] - loop[i - 1][1]) * f, 9, "#FF5A75", p, 14); } }
    const pc = io(t, C.entire - 0.3, 0.4, out);
    clockFace(830, 700, 120, ((t - C.entire) / 2.2) * Math.PI * 2, pc, PINK);
    label("1 MINUTE", 830, 870, 40, PINK, pc, "center", 700);
    label("ALL ~5 LITERS", 830, 960, 40, WHITE, io(t, C.once - 0.3, 0.4, out), "center", 700);
    label("ONE FULL LOOP", 830, 1010, 40, WHITE, io(t, C.once, 0.4, out), "center", 700);
  });

  // ===== 4. 100,000 beats a day -> 2.5 million liters a year =====
  camera(t, S4, S5, () => {
    const out = S5;
    title("100,000 BEATS A DAY", 540, T1, 104, WHITE, io(t, C.l4 - 0.05, 0.5, out));
    title("2.5 MILLION LITERS A YEAR", 540, T2, 58, PINK, io(t, C.n25 - 0.4, 0.5, out));
    const p = io(t, C.l4 - 0.2, 0.6, out);
    panel(90, 470, 900, 330, 36, p);
    heartShape(220, 630, 5, 0, p, beatK(t));
    label("BEATS PER DAY", 610, 560, 34, DIM, p, "center", 700);
    led(fmt(100000 * eo(P(t, C.n100k - 0.3, 1.2))), 610, 660, 100, WHITE, p);
    const pl = io(t, C.year4 - 0.3, 0.4, out), fill = eo(P(t, C.year4 - 0.2, 1.8));
    label("LITERS PER YEAR", 540, 850, 34, DIM, pl, "center", 700);
    bigNumber(fmt(2500000 * fill) + (fill > 0.99 ? "+" : ""), 540, 930, 92, YEL, pl);
    pool(200, 1030, 680, 300, fill, t, pl);
    label("= 1 OLYMPIC POOL", 540, 1390, 44, WHITE, io(t, C.n25 + 0.2, 0.4, out), "center", 700);
  });

  // ===== 5. A lifetime: about 80 pools, no breaks =====
  camera(t, S5, S6, () => {
    const out = S6;
    title("A LIFETIME", 540, T1, 128, WHITE, io(t, C.l5 - 0.05, 0.5, out));
    title("ABOUT 80 OLYMPIC POOLS", 540, T2, 62, PINK, io(t, C.n80 - 0.4, 0.5, out));
    const p = io(t, C.l5 - 0.2, 0.5, out), n = Math.floor(80 * eo(P(t, C.lifetime - 0.1, (C.n80 + 0.4) - C.lifetime)));
    for (let i = 0; i < 80; i++) { const c = i % 8, r = Math.floor(i / 8);
      pool(132 + c * 104, 500 + r * 78, 88, 48, i < n ? 1 : 0, t, p * (i < n ? 1 : 0.35), true); }
    label(`${n} POOLS`, 540, 1300, 48, YEL, p, "center", 700);
    stamp("NO BREAKS", 540, 1400, io(t, C.brk - 0.25, 0.35, out), TEAL, 520, 64, -0.06);
  });

  // ===== 6. Loop back to the opening =====
  camera(t, S6, TL.total, () => {
    title("YOUR HEART PUMPS", 540, T1, 110, WHITE, io(t, C.l6 - 0.1, 0.4, null));
    title("AN OLYMPIC POOL A YEAR", 540, T2, 66, PINK, io(t, C.l6, 0.4, null));
    hero(t, io(t, C.l6 - 0.2, 0.5, null));
    subscribePill(t, C.fist6 - 0.3, 1412);
  });

  for (const ts of [S2, S3, S4, S5, S6]) sweep(t, ts);
  finishFrame(t);
  captions(Math.max(t, TL.captions[0].s));
}
