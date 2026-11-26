// Why stubbing your toe hurts twice: two nerves race from the toe to the brain
const ACHE = "#FF4D8D";
const S2 = C.l2 - 0.3, S3 = C.l3 - 0.3, S4 = C.l4 - 0.3, S5 = C.l5 - 0.3, S6 = C.l6 - 0.3, S7 = C.l7 - 0.3, S8 = C.l8 - 0.3;
const SPEED = 1.45, HIT = 1.65 * SPEED;           // the toe meets the table leg 1.65 s into the clip (played at 1/1.45 speed)
const IMP1 = HIT, IMP2 = S8 + HIT, TOE = [785, 1005], BURST = [690, 850];   // where the toe meets the table leg on screen (clip shifted up 320 px)
const aiOn = t => t < S3 || t >= S7;

// ---------- clip scenes: transparent canvas, dark bands top and bottom for titles and captions ----------
function bands() {
  const g = ctx.createLinearGradient(0, 0, 0, 600); g.addColorStop(0, "rgba(5,9,32,0.94)"); g.addColorStop(0.55, "rgba(5,9,32,0.55)"); g.addColorStop(1, "rgba(5,9,32,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 600);
  const b = ctx.createLinearGradient(0, 1250, 0, 1580); b.addColorStop(0, "rgba(5,9,32,0)"); b.addColorStop(0.6, "rgba(5,9,32,0.85)"); b.addColorStop(1, "rgba(5,9,32,1)");
  ctx.fillStyle = b; ctx.fillRect(0, 1250, W, H - 1250);
}
// spiky comic burst with a word in it
function jag(cx, cy, R, p, color, text, rot = 0) {
  if (p <= 0) return;
  const s = p < 1 ? eo(p) * (1 + 0.25 * Math.sin(Math.PI * p)) : 1;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = i % 2 ? R * 0.64 : R * (1 + 0.08 * Math.sin(i * 1.7)); i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  ctx.closePath(); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 40; ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 9; ctx.strokeStyle = DARK; ctx.lineJoin = "round"; ctx.stroke();
  ctx.fillStyle = DARK; ctx.font = `${Math.round(R * 0.4)}px Righteous`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 0, 4);
  ctx.restore();
}
// slow pulsing rings for the ache
function throb(cx, cy, t, a, R = 120) {
  if (a <= 0) return;
  for (let k = 0; k < 3; k++) { const q = ((t * 0.9 + k / 3) % 1); arcP(cx, cy, R * (0.4 + q), 1, `rgba(255,77,141,${a * (1 - q) * 0.9})`, 14 * (1 - q) + 3); }
  disc(cx, cy, R * 0.32 * (1 + 0.12 * Math.sin(t * 5.6)), ACHE, a * 0.85, 40);
}

// ---------- nerve paths on the drawn body (toe -> leg -> spine -> brain) ----------
function nerve(bx, top, u, dx) {
  return [[bx + 0.084 * u + dx, top + 0.972 * u], [bx + 0.06 * u + dx, top + 0.93 * u], [bx + 0.056 * u + dx, top + 0.74 * u], [bx + 0.052 * u + dx, top + 0.55 * u],
          [bx + 0.012 * u + dx, top + 0.47 * u], [bx + dx * 0.6, top + 0.3 * u], [bx + dx * 0.6, top + 0.15 * u], [bx + dx * 0.6, top + 0.05 * u]];
}
function pointAt(pts, f) {
  let d = clamp(f) * polyLen(pts);
  for (let i = 1; i < pts.length; i++) { const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d <= seg) { const q = d / seg; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * q, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * q]; } d -= seg; }
  return pts[pts.length - 1];
}
function comet(pts, f, color, a, r = 16) {
  if (a <= 0 || f <= 0) return;
  for (let k = 6; k >= 0; k--) { const q = pointAt(pts, f - k * 0.018); disc(q[0], q[1], r * (1 - k * 0.11), color, a * (1 - k * 0.13), k ? 0 : 30); }
}
function nerves(bx, top, u, pf, ps, a) {
  const fp = nerve(bx, top, u, -9), sp = nerve(bx, top, u, 9);
  if (pf > 0) { polyPartial(fp, pf, "rgba(255,214,64,0.28)", 16); polyPartial(fp, pf, YEL, 6); }
  if (ps > 0) { polyPartial(sp, ps, "rgba(255,77,141,0.28)", 16); polyPartial(sp, ps, ACHE, 6); }
  return [fp, sp];
}

// ---------- the two lanes ----------
function lane(y, h, t, rate, color, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = "#151B3A"; ctx.beginPath(); ctx.roundRect(60, y, 960, h, 30); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); ctx.roundRect(60, y, 960, h, 30); ctx.clip();
  ctx.fillStyle = "rgba(255,255,255,0.55)"; const off = (t * rate) % 160;
  for (let x = 60 - 160 + off; x < 1040; x += 160) ctx.fillRect(x, y + h - 52, 80, 10);
  ctx.restore();
}
function car(x, y, a, t) {   // y = road line
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y);
  ctx.strokeStyle = "rgba(255,214,64,0.6)"; ctx.lineCap = "round";
  for (let k = 0; k < 4; k++) { ctx.lineWidth = 8 - k; ctx.beginPath(); ctx.moveTo(-170 - k * 30, -40 - k * 22); ctx.lineTo(-330 - k * 60, -40 - k * 22); ctx.stroke(); }
  ctx.fillStyle = YEL; ctx.beginPath(); ctx.moveTo(-72, -86); ctx.lineTo(-40, -132); ctx.lineTo(48, -132); ctx.lineTo(90, -86); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.roundRect(-140, -90, 280, 62, 22); ctx.fill();
  ctx.fillStyle = "#1A2140"; ctx.beginPath(); ctx.moveTo(-54, -90); ctx.lineTo(-32, -122); ctx.lineTo(0, -122); ctx.lineTo(0, -90); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(12, -90); ctx.lineTo(12, -122); ctx.lineTo(42, -122); ctx.lineTo(72, -90); ctx.closePath(); ctx.fill();
  disc(132, -66, 9, "#FFFFFF", 1, 24);
  for (const wx of [-82, 82]) { disc(wx, -26, 30, "#0B0F24"); disc(wx, -26, 12, "#9AA6C8"); }
  ctx.restore();
}
function walker(x, y, t, a) {   // y = ground line
  if (a <= 0) return;
  const ph = Math.sin(t * 4.2), hip = [x, y - 92], sh = [x, y - 170];
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = ACHE; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 16;
  ctx.shadowColor = ACHE; ctx.shadowBlur = 20;
  const limb = (o, len, ang) => { ctx.beginPath(); ctx.moveTo(...o); ctx.lineTo(o[0] + Math.sin(ang) * len, o[1] + Math.cos(ang) * len); ctx.stroke(); };
  limb(hip, 92, 0.42 * ph); limb(hip, 92, -0.42 * ph); limb(sh, 72, -0.45 * ph); limb(sh, 72, 0.45 * ph);
  ctx.beginPath(); ctx.moveTo(...hip); ctx.lineTo(...sh); ctx.stroke();
  ctx.restore(); disc(x, y - 205, 26, ACHE, a, 20);
}
function laneScene(t, out) {
  const pf = io(t, C.l4 - 0.2, 0.5, out), ps = io(t, C.l5 - 0.25, 0.5, out);
  label("FAST NERVE", 90, 520, 40, YEL, pf, "left", 700); label("5–30 m/s", 990, 520, 36, DIM, pf, "right", 700);
  lane(550, 250, t, 1400, YEL, pf);
  if (pf > 0) { ctx.save(); ctx.beginPath(); ctx.roundRect(60, 550, 960, 250, 30); ctx.clip();
    car(-260 + ((t - C.l4) * 1500) % 1700, 760, pf, t); ctx.restore(); }
  title("AS FAST AS A CAR", 540, 860, 64, YEL, io(t, C.car - 0.5, 0.5, out));
  label("SLOW NERVE", 90, 980, 40, ACHE, ps, "left", 700); label("0.5–2 m/s", 990, 980, 36, DIM, ps, "right", 700);
  lane(1010, 250, t, 70, ACHE, ps);
  if (ps > 0) { ctx.save(); ctx.beginPath(); ctx.roundRect(60, 1010, 960, 250, 30); ctx.clip();
    walker(200 + (t - C.l5) * 75, 1225, t, ps); ctx.restore(); }
  title("AS SLOW AS WALKING", 540, 1320, 64, ACHE, io(t, C.walking - 0.4, 0.5, out));
}

function hook(t, p) {
  title("STUBBING YOUR TOE", 540, T1, 104, WHITE, p);
  title("HURTS TWICE", 540, T2 + 30, 150, ACHE, p);
}

function render(t) {
  ctx.clearRect(0, 0, W, H);
  if (aiOn(t)) bands(); else background(t);

  // ===== 1. Hook over the stub clip: complete from frame one =====
  if (t < S2 + 0.4) hook(t, ON(t, S2));

  // ===== 2. Sharp ouch, then the slow ache (same clip) =====
  if (t >= S2 - 0.4 && t < S3 + 0.4) {
    const out = S3;
    title("FIRST: A SHARP OUCH", 540, T1, 92, YEL, io(t, C.l2 - 0.05, 0.5, out));
    title("THEN: A THROBBING ACHE", 540, T2, 70, ACHE, io(t, C.then2 - 0.2, 0.5, out));
    const pr = io(t, C.then2 - 0.1, 0.3, out), fr = clamp((t - C.then2) / (C.second2 + 0.5 - C.then2));
    if (pr > 0) { arcP(TOE[0], TOE[1], 200, 1, `rgba(255,255,255,${0.18 * pr})`, 12); arcP(TOE[0], TOE[1], 200, fr, ACHE, 12);
      label("UP TO 1 SECOND", TOE[0], 1262, 46, WHITE, pr, "center", 700); }
    throb(TOE[0], TOE[1], t, io(t, C.throb - 0.35, 0.4, out), 140);
  }
  // the OUCH burst lands on the toe (also at the very end, so the loop restarts after the hit)
  for (const it of [IMP1, IMP2]) {
    const pb = io(t, it - 0.02, 0.22, it === IMP1 ? C.then2 + 0.4 : null, 0.4);
    jag(BURST[0], BURST[1], 165, pb, YEL, "OUCH!", -0.08);
  }

  // ===== 3. Two nerves, one race to the brain =====
  camera(t, S3, S4, () => {
    const out = S4, bx = 540, top = 480, u = 900;
    title("TWO NERVES", 540, T1, 124, WHITE, io(t, C.l3 - 0.05, 0.5, out));
    title("ONE RACE TO YOUR BRAIN", 540, T2, 68, TEAL, io(t, C.races - 0.3, 0.5, out));
    const p = io(t, C.l3 - 0.2, 0.6, out);
    bodyFront(bx, top, u, { p });
    const pf = io(t, C.races - 0.2, 0.9, out), ps = io(t, C.two3 - 0.3, 0.9, out);
    const [fp, sp] = nerves(bx, top, u, eo(pf), eo(ps), p);
    if (pf >= 1) for (let k = 0; k < 3; k++) comet(fp, ((t * 1.6 + k / 3) % 1), YEL, p, 12);
    if (ps >= 1) for (let k = 0; k < 2; k++) comet(sp, ((t * 0.3 + k / 2) % 1), ACHE, p, 12);
    jag(bx + 0.084 * u, top + 0.975 * u, 62, io(t, C.l3, 0.3, out), YEL, "", 0.2);
    label("BRAIN", bx + 120, top + 0.05 * u, 38, DIM, io(t, C.brain3 - 0.3, 0.4, out), "left", 700);
    label("FAST", 150, 1420, 44, YEL, pf, "left", 700); label("SLOW", 930, 1420, 44, ACHE, ps, "right", 700);
  });

  // ===== 4-5. The fast lane (car speed) and the slow lane (walking speed) =====
  camera(t, S4, S6, () => {
    const out = S6;
    title("THE FAST LANE", 540, T1, 120, YEL, io(t, C.l4 - 0.05, 0.5, S5));
    title("FOR THE SHARP PAIN", 540, T2, 70, WHITE, io(t, C.fast4 - 0.3, 0.5, S5));
    title("THE SLOW LANE", 540, T1, 120, ACHE, io(t, C.l5 - 0.05, 0.5, out));
    title("FOR THE ACHE", 540, T2, 76, WHITE, io(t, C.slow5 - 0.2, 0.5, out));
    laneScene(t, out);
  });

  // ===== 6. The race up the body: the ache arrives last =====
  camera(t, S6, S7, () => {
    const out = S7, bx = 300, top = 480, u = 900;
    title("THE LONG WAY UP", 540, T1, 120, WHITE, io(t, C.l6 - 0.05, 0.5, out));
    title("SO THE ACHE ARRIVES LAST", 540, T2, 66, ACHE, io(t, C.so6 - 0.35, 0.5, out));
    const p = io(t, C.l6 - 0.2, 0.6, out);
    bodyFront(bx, top, u, { p });
    const [fp, sp] = nerves(bx, top, u, p, p, p);
    const RS = C.l6 + 0.6, fA = RS + 0.45, sA = C.arrives + 0.25;
    const ff = clamp((t - RS) / (fA - RS)), sf = clamp((t - RS) / (sA - RS));
    if (t >= RS - 0.3) jag(bx + 0.084 * u, top + 0.975 * u, 70, io(t, RS - 0.25, 0.25, out), YEL, "", 0.2);
    if (ff < 1) comet(fp, ff, YEL, p, 18);
    comet(sp, sf, ACHE, p * (sf < 1 ? 1 : 0), 18);
    const head = [bx, top + 0.06 * u];
    if (t >= fA) burst(head[0], head[1], fA, t, YEL, 14, 150);
    if (t >= sA) burst(head[0], head[1], sA, t, ACHE, 14, 150);
    // results board
    const pb = io(t, C.l6, 0.5, out);
    panel(560, 560, 460, 430, 34, pb);
    label("ARRIVAL AT THE BRAIN", 790, 615, 30, DIM, pb, "center", 700);
    const r1 = io(t, fA - 0.05, 0.3, out), r2 = io(t, sA - 0.05, 0.3, out);
    disc(640, 720, 44, YEL, r1, 20); label("1", 640, 722, 52, DARK, r1, "center", 700); label("SHARP PAIN", 705, 722, 46, YEL, r1, "left", 700);
    disc(640, 880, 44, ACHE, r2, 20); label("2", 640, 882, 52, DARK, r2, "center", 700); label("THE ACHE", 705, 882, 46, ACHE, r2, "left", 700);
    if (r2 <= 0 && t > fA) { hbar(610, 860, 370, 40, sf, ACHE, pb, 16); }
    const pl = io(t, C.farthest - 0.3, 0.4, out);
    lineP(bx + 0.14 * u, top + 0.975 * u, 560, top + 0.975 * u, pl, TEAL, 5);
    label("FARTHEST", 575, top + 0.975 * u - 26, 40, TEAL, pl, "left", 700);
    label("FROM YOUR BRAIN", 575, top + 0.975 * u + 24, 40, TEAL, pl, "left", 700);
  });

  // ===== 7. What each one is for (hop clip) =====
  if (t >= S7 - 0.4 && t < S8 + 0.4) {
    const out = S8;
    title("FAST: WHERE IT HURTS", 540, T1, 90, YEL, io(t, C.l7 - 0.05, 0.5, out));
    title("SLOW: SO YOU DON'T FORGET", 540, T2, 66, ACHE, io(t, C.slow7 - 0.3, 0.5, out));
  }

  // ===== 8. Loop back to the opening =====
  if (t >= S8 - 0.4) { hook(t, io(t, C.l8 - 0.2, 0.4, null)); subscribePill(t, C.every8, 1405); }

  for (const ts of [S3, S4, S6, S7, S8]) sweep(t, ts);
  finishFrame(t);
  captions(Math.max(t, TL.captions[0].s));
}
