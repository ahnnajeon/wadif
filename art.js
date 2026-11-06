// StegoAhnna's faces, props, age-group accessories and hidden-condition icons.
//
// The body is one painted image (img/stego-body.webp, 560 × 425 in body units)
// with the eyes, nose and mouth taken out. A face is drawn on top of it as SVG,
// so one picture can show every mood. Episodes pick everything by name:
//
//   episode.art = { setup: { mood, prop }, conditions: [icon0, icon1] }
//   ending.art  = { mood, prop, sweat }
//
// Anything left out falls back to the neutral face, no prop and a plain icon.
// The age group's accessory (10대 책가방 … 50대 돋보기) is added by the page.

(() => {
  "use strict";

  const f = (n) => Math.round(n * 10) / 10;

  // ======================================================================
  // Faces
  // ======================================================================

  const ink = "#3b2417";

  // The head is turned a little to the viewer's left, so the eye line is tilted
  // and the nose sits left of centre. Features are drawn level in a local frame
  // centred between the eyes and rotated into place.
  const FRAME = 'transform="translate(136 182) rotate(8.6)"';
  const EYES = [
    { x: -59, y: 0, rx: 12, ry: 16 },    // far eye
    { x: 59, y: 0, rx: 14, ry: 18.5 }    // near eye
  ];
  const NOSE = { x: -10.8, y: 13.7 };
  const S = { x: -10.8, y: 20 };          // where the mouth hangs from the nose

  const stroke = (w, col = ink) => `fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

  const openEye = ({ x, y, rx, ry }, k = 1, kx = 1) => {
    const h = ry * k;
    const w = rx * kx;
    return `<ellipse cx="${x}" cy="${y}" rx="${f(w)}" ry="${f(h)}" fill="${ink}"/>` +
      `<ellipse cx="${x}" cy="${f(y + h * 0.36)}" rx="${f(w * 0.68)}" ry="${f(h * 0.42)}" fill="#6a4630" opacity=".45"/>` +
      `<circle cx="${f(x + w * 0.32)}" cy="${f(y - h * 0.38)}" r="${f(w * 0.3)}" fill="#fff"/>` +
      `<circle cx="${f(x - w * 0.3)}" cy="${f(y + h * 0.42)}" r="${f(w * 0.13)}" fill="#fff" opacity=".6"/>`;
  };

  const eyes = {
    open: () => `<g class="eyes-open">${EYES.map((e) => openEye(e)).join("")}</g>`,
    // ^ ^  smiling shut
    happy: () => EYES.map(({ x, y, rx, ry }) =>
      `<path d="M${x - rx},${y + 4} Q${x},${f(y - ry * 0.95)} ${x + rx},${y + 4}" ${stroke(3.8)}/>`).join(""),
    // ^ ^  flatter, pleased with oneself
    smug: () => EYES.map(({ x, y, rx, ry }) =>
      `<path d="M${x - rx},${y + 3} Q${x},${f(y - ry * 0.55)} ${x + rx},${y + 3}" ${stroke(3.6)}/>`).join(""),
    // ︶ ︶  calm, content
    content: () => EYES.map(({ x, y, rx, ry }) =>
      `<path d="M${x - rx},${y - 1} Q${x},${f(y + ry * 0.7)} ${x + rx},${y - 1}" ${stroke(3.4)}/>`).join(""),
    // half shut, flat lid: blank
    flat: () => EYES.map(({ x, y, rx, ry }) =>
      `<path d="M${x - rx},${y + 1} A${rx},${f(ry * 0.72)} 0 0 0 ${x + rx},${y + 1} Z" fill="${ink}"/>` +
      `<circle cx="${f(x + rx * 0.35)}" cy="${f(y + ry * 0.3)}" r="${f(rx * 0.18)}" fill="#fff" opacity=".85"/>` +
      `<path d="M${f(x - rx - 2)},${y + 1} L${f(x + rx + 2)},${y + 1}" ${stroke(2.8)}/>`).join(""),
    // heavy lids sliding down at the outer corner, shadows underneath: tired
    heavy: () => EYES.map(({ x, y, rx, ry }, i) => {
      const out = i === 0 ? -1 : 1;
      return `<path d="M${x - rx},${y + 3} A${rx},${f(ry * 0.62)} 0 0 0 ${x + rx},${y + 3} Z" fill="${ink}"/>` +
        `<circle cx="${f(x + rx * 0.3)}" cy="${f(y + ry * 0.32)}" r="${f(rx * 0.16)}" fill="#fff" opacity=".7"/>` +
        `<path d="M${f(x - rx * out - 3 * out)},${f(y + 6)} Q${x},${f(y - 3)} ${f(x + rx * out + 2 * out)},${f(y + 1)}" ${stroke(3)}/>` +
        `<path d="M${f(x - rx * 0.75)},${f(y + ry * 0.95)} Q${x},${f(y + ry * 1.25)} ${f(x + rx * 0.75)},${f(y + ry * 0.95)}" ${stroke(2.2, "#5b6b3a")} opacity=".55"/>`;
    }).join(""),
    // wide and round, brows up: surprised
    wide: () => `<g class="eyes-open">${EYES.map((e) => openEye(e, 1.08, 1.15)).join("")}</g>` +
      `<path d="M-72,-29 Q-59,-38 -46,-30" ${stroke(3)}/><path d="M46,-33 Q59,-43 73,-33" ${stroke(3)}/>`,
    // open, small, looking aside: flustered
    aside: () => `<g class="eyes-open">${EYES.map(({ x, y, rx, ry }) =>
      `<ellipse cx="${x}" cy="${y}" rx="${f(rx * 0.85)}" ry="${f(ry * 0.85)}" fill="${ink}"/>` +
      `<circle cx="${f(x - rx * 0.35)}" cy="${f(y - ry * 0.3)}" r="${f(rx * 0.26)}" fill="#fff"/>`).join("")}</g>`,
    // open, a little smaller and wetter, under worried brows: sad
    worried: () => `<g class="eyes-open">${EYES.map((e) => openEye(e, 0.88) +
      `<circle cx="${f(e.x + e.rx * 0.05)}" cy="${f(e.y + e.ry * 0.12)}" r="${f(e.rx * 0.16)}" fill="#fff" opacity=".5"/>`).join("")}</g>` +
      `<path d="M-73,-21 L-48,-30" ${stroke(3.2)}/><path d="M48,-32 L75,-22" ${stroke(3.2)}/>`
  };

  const nose = () => {
    const { x, y } = NOSE;
    return `<path d="M${f(x - 12)},${f(y - 4.5)} C${f(x - 11)},${f(y - 7.5)} ${f(x + 11)},${f(y - 7.5)} ${f(x + 12)},${f(y - 4.5)} ` +
      `C${f(x + 12.5)},${f(y - 1)} ${f(x + 4)},${f(y + 6)} ${x},${f(y + 6.5)} ` +
      `C${f(x - 4)},${f(y + 6)} ${f(x - 12.5)},${f(y - 1)} ${f(x - 12)},${f(y - 4.5)} Z" fill="#4a2b1c"/>` +
      `<ellipse cx="${f(x - 2.5)}" cy="${f(y - 3.2)}" rx="4" ry="1.7" fill="#a0705a" opacity=".85"/>`;
  };

  const p = (dx, dy) => `${f(S.x + dx)},${f(S.y + dy)}`;
  const mouths = {
    // ω
    cat: () => `<path d="M${p(0, 0)} L${p(0, 4.5)} M${p(-22, 7)} C${p(-19, 14)} ${p(-5, 14)} ${p(0, 4.5)} C${p(5, 14)} ${p(19, 14)} ${p(22, 7)}" ${stroke(3.2)}/>`,
    // ω with the corners turned up
    smirk: () => `<path d="M${p(0, 0)} L${p(0, 4.5)} M${p(-24, 2)} C${p(-20, 15)} ${p(-5, 14)} ${p(0, 4.5)} C${p(5, 14)} ${p(20, 15)} ${p(24, 2)}" ${stroke(3.2)}/>`,
    open: () => `<path d="M${p(0, 0)} L${p(0, 5)}" ${stroke(3)}/>` +
      `<path d="M${p(-13, 5)} Q${p(0, 8.5)} ${p(13, 5)} C${p(12, 18)} ${p(-12, 18)} ${p(-13, 5)} Z" fill="#5a2a1e"/>` +
      `<ellipse cx="${f(S.x)}" cy="${f(S.y + 13)}" rx="6" ry="3" fill="#e98b80"/>`,
    o: () => `<ellipse cx="${f(S.x)}" cy="${f(S.y + 11)}" rx="5.5" ry="7" fill="#5a2a1e"/>`,
    sigh: () => `<ellipse cx="${f(S.x)}" cy="${f(S.y + 10)}" rx="4.5" ry="3.2" fill="#5a2a1e"/>`,
    wavy: () => `<path d="M${p(-13, 10)} q4,-5 8.5,0 t8.5,0 t8.5,0" ${stroke(3)}/>`,
    flat: () => `<path d="M${p(-8, 10)} Q${p(0, 8.5)} ${p(8, 10)}" ${stroke(3)}/>`,
    frown: () => `<path d="M${p(-9, 12.5)} Q${p(0, 5)} ${p(9, 12.5)}" ${stroke(3.2)}/>`
  };

  const blush = () => `<ellipse cx="-66" cy="21" rx="10" ry="5.5" fill="#f39a92" opacity=".5"/>` +
    `<ellipse cx="68" cy="25" rx="11" ry="6" fill="#f39a92" opacity=".5"/>`;
  // Sweat drop on the side of the head, outside the tilted frame.
  const sweat = () => `<g class="sweat"><path d="M236,98 C228,112 224,120 224,126 a12,12 0 0 0 24,0 C248,120 244,112 236,98 Z" fill="#bfe4f7" stroke="#7fb6d3" stroke-width="2"/>` +
    `<ellipse cx="231" cy="124" rx="3" ry="5" fill="#fff" opacity=".8"/></g>`;
  // A small four-point sparkle beside the head.
  const sparkle = () => `<path d="M22,52 Q24,66 36,68 Q24,70 22,84 Q20,70 8,68 Q20,66 22,52 Z" fill="#f6e3a1"/>` +
    `<path d="M44,30 Q45,37 51,38 Q45,39 44,46 Q43,39 37,38 Q43,37 44,30 Z" fill="#f6e3a1" opacity=".8"/>`;

  const MOODS = {
    neutral: { eyes: "open", mouth: "cat" },
    glad: { eyes: "happy", mouth: "open", blush: true },
    proud: { eyes: "smug", mouth: "smirk", sparkle: true },
    calm: { eyes: "content", mouth: "cat" },
    surprised: { eyes: "wide", mouth: "o" },
    flustered: { eyes: "aside", mouth: "wavy", blush: true, sweat: true },
    blank: { eyes: "flat", mouth: "flat", sweat: true },
    tired: { eyes: "heavy", mouth: "sigh" },
    sad: { eyes: "worried", mouth: "frown" }
  };

  // ======================================================================
  // Age-group accessories, drawn on the body (body units, 560 × 425)
  // ======================================================================

  const ACCESSORIES = {
    // 10대: a school backpack on her back
    "10s": {
      under: `<path d="M318 168 C300 200 296 250 304 292" ${stroke(7, "#6b4a2b")}/>` +
        `<rect x="322" y="150" width="96" height="112" rx="22" fill="#f2b84b"/>` +
        `<rect x="322" y="150" width="96" height="44" rx="22" fill="#e19a2f"/>` +
        `<rect x="340" y="214" width="60" height="34" rx="10" fill="#e19a2f"/>` +
        `<rect x="364" y="186" width="12" height="16" rx="3" fill="#fff4d6"/>` +
        `<path d="M338 150 Q370 126 402 150" ${stroke(6, "#6b4a2b")}/>`
    },
    // 20대: an ID badge on a lanyard
    "20s": {
      under: `<path d="M112 266 Q150 292 176 296" ${stroke(6, "#3e7bc2")}/><path d="M276 268 Q222 296 196 297" ${stroke(6, "#3e7bc2")}/>` +
        `<rect x="181" y="291" width="10" height="10" rx="2" fill="#c8d3db"/>` +
        `<rect x="158" y="298" width="56" height="44" rx="6" fill="#fafcfd" stroke="#c8d3db" stroke-width="2"/>` +
        `<rect x="158" y="298" width="56" height="12" rx="6" fill="#3e7bc2"/><rect x="158" y="304" width="56" height="6" fill="#3e7bc2"/>` +
        `<circle cx="174" cy="324" r="7" fill="#9fb3c0"/><rect x="186" y="318" width="22" height="4" rx="2" fill="#9fb3c0"/><rect x="186" y="327" width="16" height="4" rx="2" fill="#c8d3db"/>`
    },
    // 30대: a canvas tote over the shoulder
    "30s": {
      under: `<path d="M342 236 C340 170 360 140 384 136 C408 140 420 176 414 236" ${stroke(6, "#b9a37a")}/>` +
        `<path d="M326 236 H430 L420 330 H336 Z" fill="#efe4c9"/>` +
        `<path d="M326 236 H430 L428 252 H328 Z" fill="#e2d4b2"/>` +
        `<circle cx="378" cy="288" r="15" fill="#86c35a"/><path d="M378 276 v24 M368 290 l10 -8 l10 8" ${stroke(2.6, "#4f7f35")}/>`
    },
    // 40대: a knitted scarf
    "40s": {
      under: `<path d="M96 262 C150 300 250 300 300 252 L306 274 C252 324 146 324 92 284 Z" fill="#b65a4c"/>` +
        `<path d="M100 270 C152 306 248 306 302 262" ${stroke(3, "#d98a74")} stroke-dasharray="6 7"/>` +
        `<path d="M206 300 L244 300 L252 366 L214 370 Z" fill="#a54d40"/>` +
        `<path d="M216 370 v10 M226 369 v11 M236 368 v11 M246 367 v10" ${stroke(3.4, "#a54d40")}/>` +
        `<path d="M212 318 h34 M213 336 h35 M214 352 h36" ${stroke(3, "#d98a74")}/>`
    },
    // 50대 이상: half-moon reading glasses on a chain (drawn over the face)
    "50s": {
      over: `<g ${FRAME}>` +
        `<path d="M-90,-1 H-28 A31,23 0 0 1 -90,-1 Z M28,0 H92 A32,24 0 0 1 28,0 Z" fill="#e6f2f7" opacity=".3"/>` +
        `<path d="M-90,-1 H-28 A31,23 0 0 1 -90,-1 Z M28,0 H92 A32,24 0 0 1 28,0 Z" ${stroke(6.5, "#9a6f12")}/>` +
        `<path d="M-84,4 Q-59,16 -36,4" ${stroke(2.2, "#ffffff")} opacity=".55"/><path d="M34,5 Q60,18 86,5" ${stroke(2.2, "#ffffff")} opacity=".55"/>` +
        `<path d="M-28,-1 Q0,-10 28,0" ${stroke(5.5, "#9a6f12")}/>` +
        `<path d="M-90,-1 Q-118,30 -106,88" ${stroke(3.2, "#c9a227")} stroke-dasharray="2.5 5.5"/>` +
        `<path d="M92,0 Q124,34 116,96" ${stroke(3.2, "#c9a227")} stroke-dasharray="2.5 5.5"/></g>`
    }
  };

  function face(name, { sweat: wet = false, age = "" } = {}) {
    const m = MOODS[name] || MOODS.neutral;
    const acc = ACCESSORIES[age] || {};
    return (acc.under || "") +
      `<g ${FRAME}>${m.blush ? blush() : ""}${eyes[m.eyes]()}${nose()}${mouths[m.mouth]()}</g>` +
      (m.sweat || wet ? sweat() : "") + (m.sparkle ? sparkle() : "") + (acc.over || "");
  }

  // ======================================================================
  // Props: small things beside StegoAhnna
  // ======================================================================

  const recorder = (extra = "") => `<g ${extra}>` +
    `<path d="M4 11 L19 8.5 L19 21.5 L4 19 Z" fill="#d6c095"/>` +
    `<rect x="17" y="8.5" width="98" height="13" rx="6.5" fill="#f2e5c6"/>` +
    `<rect x="19" y="9.5" width="94" height="4" rx="2" fill="#fff" opacity=".45"/>` +
    `<rect x="45" y="8" width="3" height="14" rx="1" fill="#d7c39b"/><rect x="88" y="8" width="3" height="14" rx="1" fill="#d7c39b"/>` +
    [55, 63, 71, 79, 99].map((x) => `<circle cx="${x}" cy="15" r="2" fill="#7a5a3c"/>`).join("") +
    `<ellipse cx="117" cy="15" rx="7" ry="9" fill="#e4d0a3"/><ellipse cx="120" cy="15" rx="3.4" ry="6" fill="#b49866"/></g>`;

  const lettuce = (x = 0, y = 0, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">` +
    `<path d="M6 26 H64 L58 48 H12 Z" fill="#b98a5a"/><path d="M8 32 H62 M10 40 H60" ${stroke(2, "#8e6740")}/>` +
    `<path d="M10 28 C6 14 18 6 24 16 C26 4 40 2 40 14 C46 4 60 8 56 20 C66 18 66 28 60 28 Z" fill="#7cc04d"/>` +
    `<path d="M18 26 C20 18 24 14 26 12 M36 26 C36 18 38 12 40 10 M50 26 C50 20 52 16 56 14" ${stroke(2, "#4f8f2f")}/></g>`;

  const PROPS = {
    recorder: { box: "0 0 130 30", w: 0.7, body: recorder('transform="rotate(-7 65 15)"') },
    papers: {
      box: "0 0 70 62", w: 0.38,
      body: `<rect x="17" y="4" width="44" height="54" rx="3" fill="#b8c7d1" transform="rotate(6 39 31)"/>` +
        `<rect x="9" y="7" width="44" height="54" rx="3" fill="#eef2f4"/>` +
        [18, 25, 32, 39, 46].map((y, i) => `<rect x="15" y="${y}" width="${i === 0 ? 20 : 32}" height="2.6" rx="1.3" fill="${i === 0 ? "#5d7b8a" : "#b3c1ca"}"/>`).join("") +
        `<path d="M44 3 v14 a4 4 0 0 1 -8 0 v-11" fill="none" stroke="#8aa1ae" stroke-width="2.4" stroke-linecap="round"/>`
    },
    phone: {
      box: "0 0 40 64", w: 0.22,
      body: `<rect x="4" y="2" width="32" height="60" rx="7" fill="#26313b"/><rect x="7" y="8" width="26" height="46" rx="3" fill="#9fd3e6"/>` +
        `<rect x="10" y="13" width="20" height="10" rx="3" fill="#fff"/><rect x="13" y="16.5" width="12" height="3" rx="1.5" fill="#9fb3c0"/>` +
        `<circle cx="29" cy="12" r="4.5" fill="#e0614f"/><rect x="16" y="57" width="8" height="2" rx="1" fill="#55636e"/>`
    },
    icecream: {
      box: "0 0 50 56", w: 0.26,
      body: `<path d="M8 18 H42 L37 52 H13 Z" fill="#f4e7d0"/><path d="M8 18 H42 L41 26 H9 Z" fill="#c9a06b"/>` +
        `<ellipse cx="25" cy="16" rx="18" ry="6" fill="#8a5a3c"/><ellipse cx="25" cy="14" rx="15" ry="4" fill="#a8714b"/>` +
        `<rect x="15" y="34" width="20" height="8" rx="2" fill="#c9a06b"/>`
    },
    coffee: {
      box: "0 0 44 64", w: 0.22,
      body: `<path d="M26 2 L22 22" ${stroke(3, "#3e6f8a")}/><path d="M7 18 H37 L33 60 H11 Z" fill="#dfeef5" opacity=".9"/>` +
        `<path d="M8.5 30 H35.5 L33 60 H11 Z" fill="#7a4a2c"/><rect x="5" y="15" width="34" height="5" rx="2.5" fill="#f4f8fa"/>` +
        `<rect x="13" y="34" width="7" height="6" rx="1.5" fill="#e9f4f8" opacity=".7"/><rect x="22" y="40" width="7" height="6" rx="1.5" fill="#e9f4f8" opacity=".6"/>`
    },
    lettuce: { box: "0 0 70 50", w: 0.42, body: lettuce() },
    money: {
      box: "0 0 70 44", w: 0.36,
      body: `<rect x="6" y="12" width="56" height="26" rx="3" fill="#e9b45a" transform="rotate(-8 34 25)"/>` +
        `<rect x="8" y="10" width="56" height="26" rx="3" fill="#f3c46c"/><circle cx="36" cy="23" r="8" fill="#e9a94a"/>` +
        `<rect x="12" y="14" width="10" height="4" rx="2" fill="#e9a94a"/><rect x="50" y="28" width="10" height="4" rx="2" fill="#e9a94a"/>`
    },
    cupnoodle: {
      box: "0 0 50 60", w: 0.26,
      body: `<path d="M18 8 q-4 -6 0 -8 M26 8 q-4 -6 0 -8 M34 8 q-4 -6 0 -8" ${stroke(2.2, "#dfeef5")} opacity=".8"/>` +
        `<path d="M6 16 H44 L39 58 H11 Z" fill="#f4f1ea"/><path d="M8 28 H42 L41 38 H9 Z" fill="#e0614f"/>` +
        `<rect x="4" y="12" width="42" height="7" rx="2" fill="#d8d2c4"/>`
    }
  };

  function prop(name) {
    const item = PROPS[name];
    return item ? `<svg viewBox="${item.box}" style="--prop-w:${item.w}" aria-hidden="true">${item.body}</svg>` : "";
  }

  // ======================================================================
  // Hidden-condition icons (64 × 64), shown in the token between the worlds
  // ======================================================================

  const P = "#eef2f4", I = "#2f4a55", C = "#d0785e", M = "#7fc8b0", G = "#e8c15a", Sk = "#8ec5e8",
    R = "#e0614f", L = "#b8c7d1", Br = "#a8784f", Gr = "#86c35a", Mute = "#cfe6dc";

  const txt = (x, y, s, size = 14, fill = I, weight = 700) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="${weight}" fill="${fill}" font-family="DM Sans, 'Noto Sans KR', sans-serif">${s}</text>`;
  const check = (x, y, s = 1, col = M) =>
    `<path d="M${f(x - 6 * s)},${y} l${f(4 * s)},${f(4 * s)} l${f(8 * s)},${f(-9 * s)}" ${stroke(f(3.6 * s), col)}/>`;
  const cross = (x, y, s = 1, col = R) =>
    `<path d="M${f(x - 6 * s)},${f(y - 6 * s)} l${f(12 * s)},${f(12 * s)} M${f(x + 6 * s)},${f(y - 6 * s)} l${f(-12 * s)},${f(12 * s)}" ${stroke(f(3.8 * s), col)}/>`;
  const sheet = (x = 16, y = 10, w = 32, h = 44, col = P) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${col}"/>`;
  const rows = (x, y, w, n, gap = 7, col = L) =>
    Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * gap}" width="${i === n - 1 ? f(w * 0.6) : w}" height="2.8" rx="1.4" fill="${col}"/>`).join("");
  const cal = (inner, top = C) => `<rect x="12" y="14" width="40" height="38" rx="5" fill="${P}"/>` +
    `<path d="M12 19 a5 5 0 0 1 5 -5 h30 a5 5 0 0 1 5 5 v6 h-40 z" fill="${top}"/>` +
    `<rect x="20" y="9" width="4" height="10" rx="2" fill="${I}"/><rect x="40" y="9" width="4" height="10" rx="2" fill="${I}"/>${inner}`;
  const hand = (cx, cy, deg, len, w = 3) => {
    const a = (deg - 90) * Math.PI / 180;
    return `<path d="M${cx},${cy} L${f(cx + len * Math.cos(a))},${f(cy + len * Math.sin(a))}" ${stroke(w, I)}/>`;
  };
  const dial = (inner = "", cx = 32, cy = 35, r = 19) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${P}" stroke="${I}" stroke-width="3"/>${inner}`;
  const env = (x, y, w, h, col = P, flap = L) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${col}"/>` +
    `<path d="M${x + 2},${y + 3} L${f(x + w / 2)},${f(y + h * 0.55)} L${x + w - 2},${y + 3}" ${stroke(2.6, flap)}/>`;
  const house = (extra) => `<path d="M15 32 L32 17 L49 32 V52 H15 Z" fill="${P}"/>` +
    `<path d="M11 33 L32 14 L53 33" ${stroke(3.6, I)}/><rect x="27" y="39" width="10" height="13" rx="1.5" fill="${L}"/>${extra}`;
  const person = (x, y, r, col = L) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>` +
    `<path d="M${f(x - r * 1.6)},${f(y + r * 3)} a${f(r * 1.6)},${f(r * 1.6)} 0 0 1 ${f(r * 3.2)},0 Z" fill="${col}"/>`;
  const coin = (cx, cy, r, inner = "") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${G}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${f(r * 0.74)}" fill="none" stroke="#c89d2e" stroke-width="2"/>${inner}`;
  const bubble = (inner, col = P) => `<path d="M14 12 h36 a6 6 0 0 1 6 6 v20 a6 6 0 0 1 -6 6 h-20 l-10 9 v-9 h-6 a6 6 0 0 1 -6 -6 v-20 a6 6 0 0 1 6 -6 z" fill="${col}"/>${inner}`;
  const up = (x, y, col) => `<path d="M${x} ${y - 10} l9 10 h-5.5 v9 h-7 v-9 h-5.5 z" fill="${col}"/>`;
  const down = (x, y, col) => `<path d="M${x} ${y + 10} l9 -10 h-5.5 v-9 h-7 v9 h-5.5 z" fill="${col}"/>`;
  const heart = (x, y, s = 1, col = C) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 6 C-10 -2 -8 -10 -2 -10 C0 -10 0 -8 0 -7 C0 -8 0 -10 2 -10 C8 -10 10 -2 0 6 Z" fill="${col}"/>`;
  const stopwatch = (label) => `<rect x="28" y="8" width="8" height="6" rx="2" fill="${I}"/><path d="M47 16 l4 -4" ${stroke(3, I)}/>` +
    dial(txt(32, 41, label, 15, I), 32, 36, 20);

  const ICONS = {
    // fallbacks
    unknown: txt(32, 43, "?", 30, Mute, 600),
    plain: `<path d="M32 12 L48 32 L32 52 L16 32 Z" ${stroke(3, Mute)}/><circle cx="32" cy="32" r="5" fill="${Mute}"/>`,

    // ---- school & study ----
    test: `<rect x="15" y="11" width="34" height="44" rx="5" fill="${P}"/><rect x="24" y="7" width="16" height="9" rx="3" fill="#8aa1ae"/>` +
      `<circle cx="27" cy="41" r="4.6" fill="${I}"/><rect x="30.2" y="22" width="2.6" height="19" fill="${I}"/>` +
      `<path d="M32.8 22 q6 2 6 8 q-2-4-6-4z" fill="${I}"/>` + txt(44, 51, "A", 13, C),
    spare: `<g transform="translate(32 32) scale(.42)">${recorder('transform="translate(-65 -15) rotate(-32 65 15)"')}${recorder('transform="translate(-65 -15) rotate(32 65 15)"')}</g>`,
    solo: `<path d="M32 4 L52 54 H12 Z" fill="#f6e3a1" opacity=".35"/><ellipse cx="32" cy="54" rx="20" ry="5" fill="#f6e3a1" opacity=".5"/>` +
      `<g transform="translate(32 34) rotate(90) scale(.36) translate(-65 -15)">${recorder()}</g>`,
    choir: [0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => person(14 + c * 12 + (r % 2) * 6 - (r === 1 ? 6 : 0), 14 + r * 15, 4, r === 2 ? Mute : L)).join("")).join(""),
    usb: `<rect x="22" y="22" width="20" height="32" rx="4" fill="${Sk}"/><rect x="25" y="10" width="14" height="14" rx="2" fill="${L}"/>` +
      `<rect x="28" y="14" width="3" height="4" fill="${I}"/><rect x="33" y="14" width="3" height="4" fill="${I}"/>` + check(32, 38, 0.9, P),
    "blank-page": sheet(16, 10, 32, 44, "none") + `<rect x="16" y="10" width="32" height="44" rx="4" fill="${P}" opacity=".18" stroke="${P}" stroke-width="2.4" stroke-dasharray="5 4"/>`,
    "file-check": sheet() + rows(21, 18, 22, 3) + `<circle cx="42" cy="44" r="10" fill="${M}"/>` + check(42, 44, 0.8, P),
    plus5: `<circle cx="32" cy="32" r="21" fill="${G}"/><circle cx="32" cy="32" r="16" fill="none" stroke="#c89d2e" stroke-width="2"/>` + txt(32, 39, "+5", 18, "#6b4e10", 800),
    "blush-face": `<circle cx="32" cy="32" r="20" fill="#f4e3c4"/><ellipse cx="20" cy="38" rx="6" ry="3.5" fill="${R}" opacity=".75"/>` +
      `<ellipse cx="44" cy="38" rx="6" ry="3.5" fill="${R}" opacity=".75"/><circle cx="25" cy="29" r="2.6" fill="${I}"/><circle cx="39" cy="29" r="2.6" fill="${I}"/>` +
      `<path d="M28 43 q4 -3 8 0" ${stroke(2.4, I)}/><path d="M50 12 q4 4 0 8 M55 10 q5 6 0 12" ${stroke(2, R)}/>`,
    paid: sheet(14, 8, 36, 48) + rows(19, 16, 26, 3) +
      `<g transform="rotate(-14 34 42)"><rect x="18" y="34" width="32" height="15" rx="3" fill="none" stroke="${R}" stroke-width="2.6"/>${txt(34, 46, "완납", 10, R, 800)}</g>`,
    "thumbs-down": `<g transform="rotate(180 32 32)"><path d="M14 30 h8 v20 h-8 z" fill="${L}"/><path d="M24 30 l8 -16 c3 -4 8 -1 7 3 l-2 9 h11 c3 0 5 3 4 6 l-4 14 c-1 3 -3 4 -6 4 h-18 z" fill="${P}"/></g>`,
    palette: `<path d="M32 10 C14 10 8 26 12 36 C16 46 26 42 28 48 C30 54 36 56 42 52 C56 44 56 10 32 10 Z" fill="#e8d4b4"/>` +
      `<circle cx="22" cy="24" r="4.5" fill="${R}"/><circle cx="34" cy="19" r="4.5" fill="${G}"/><circle cx="45" cy="26" r="4.5" fill="${Sk}"/><circle cx="44" cy="39" r="4.5" fill="${Gr}"/>` +
      `<circle cx="22" cy="37" r="3.5" fill="#6b4a2b"/>`,
    ear: `<path d="M26 54 C18 54 20 44 24 40 C28 36 22 30 22 24 C22 14 30 8 38 10 C48 12 50 24 46 32 C42 40 38 40 36 46 C34 52 30 54 26 54 Z" fill="#f4e3c4"/>` +
      `<path d="M30 24 C30 18 38 16 40 22 C42 28 36 30 36 34" ${stroke(3, "#c9a77f")}/>` +
      `<path d="M8 22 q-4 8 0 16 M14 26 q-2 4 0 8" ${stroke(2.6, Mute)}/>`,
    magnifier: sheet(10, 12, 30, 40) + rows(14, 20, 22, 4) +
      `<circle cx="38" cy="34" r="11" fill="#dfeef5" fill-opacity=".35" stroke="${I}" stroke-width="3.6"/><path d="M46 42 l9 9" ${stroke(5, I)}/>`,
    "five-five": [0, 1, 2].map((i) => `<g transform="rotate(${(i - 1) * 14} 32 44)"><rect x="22" y="14" width="20" height="30" rx="3" fill="${P}" stroke="${L}" stroke-width="1.5"/>${txt(32, 35, "5", 16, C, 800)}</g>`).join(""),
    books: `<rect x="12" y="40" width="40" height="10" rx="2" fill="${Sk}"/><rect x="15" y="30" width="36" height="10" rx="2" fill="${C}"/>` +
      `<rect x="11" y="20" width="38" height="10" rx="2" fill="${M}"/><rect x="16" y="12" width="30" height="8" rx="2" fill="${G}"/>` +
      `<path d="M14 45 h34 M18 35 h30 M14 25 h32" ${stroke(1.6, P)} opacity=".7"/>`,
    math: `<rect x="10" y="10" width="44" height="44" rx="8" fill="${P}"/>` + txt(22, 30, "+", 16, C) + txt(42, 30, "×", 16, I) + txt(22, 50, "÷", 16, I) + heart(42, 44, 0.9, C),

    // ---- work & money ----
    ledger: `<rect x="12" y="10" width="40" height="44" rx="4" fill="${P}"/><rect x="12" y="10" width="40" height="9" rx="4" fill="${I}"/>` +
      `<path d="M30 19 V54" ${stroke(1.6, L)}/>` + rows(16, 24, 10, 4, 7) + rows(34, 24, 14, 4, 7) + check(44, 46, 0.8, M),
    asleep: `<path d="M38 12 A18 18 0 1 0 50 44 A14 14 0 1 1 38 12 Z" fill="#f3e6c7"/>` + txt(50, 22, "z", 12, Mute) + txt(56, 12, "z", 9, Mute),
    raise: coin(28, 36, 16, txt(28, 42, "₩", 15, "#8a6a14")) + up(48, 24, M),
    crowd: person(18, 22, 6) + person(32, 18, 7, Mute) + person(46, 22, 6) + `<rect x="18" y="42" width="28" height="15" rx="7" fill="${C}"/>` + txt(32, 54, "12", 12, P),
    promotion: `<path d="M24 34 L18 56 L26 52 L30 58 L32 40 Z M40 34 L46 56 L38 52 L34 58 L32 40 Z" fill="${C}"/>` +
      `<circle cx="32" cy="26" r="16" fill="${G}"/><path d="M32 16 l3 7 7 .6 -5.4 4.6 1.7 7 -6.3 -3.8 -6.3 3.8 1.7 -7 -5.4 -4.6 7 -.6 z" fill="#fff6d8"/>`,
    alarm: `<circle cx="16" cy="16" r="6" fill="${R}"/><circle cx="48" cy="16" r="6" fill="${R}"/>` + dial(hand(32, 35, 210, 9) + hand(32, 35, 0, 13, 2.4), 32, 35, 19) + `<path d="M20 54 l-4 5 M44 54 l4 5" ${stroke(3, I)}/>` + txt(48, 60, "7AM", 8, R, 800),
    moving: `<rect x="6" y="22" width="24" height="30" rx="2" fill="${L}"/>` + [0, 1, 2].map((r) => `<rect x="10" y="${27 + r * 8}" width="5" height="4" fill="${P}"/><rect x="20" y="${27 + r * 8}" width="5" height="4" fill="${P}"/>`).join("") +
      `<path d="M34 36 h16" ${stroke(4, M)}/><path d="M46 29 l8 7 -8 7" ${stroke(4, M)}/><rect x="38" y="46" width="20" height="8" rx="2" fill="${P}" opacity=".5"/>`,
    buddy: person(20, 20, 7) + person(44, 20, 7, Mute) +
      `<rect x="14" y="46" width="36" height="5" rx="2.5" fill="${I}"/><rect x="10" y="41" width="6" height="15" rx="2" fill="${C}"/><rect x="48" y="41" width="6" height="15" rx="2" fill="${C}"/>`,
    "org-chart": `<rect x="24" y="8" width="16" height="12" rx="3" fill="${G}"/><path d="M32 20 v8 M14 28 h36 M14 28 v6 M32 28 v6 M50 28 v6" ${stroke(2.4, Mute)}/>` +
      `<rect x="6" y="34" width="16" height="12" rx="3" fill="${P}"/><rect x="24" y="34" width="16" height="12" rx="3" fill="${R}"/><rect x="42" y="34" width="16" height="12" rx="3" fill="${P}"/>` +
      `<path d="M28 54 q4 -4 8 0" ${stroke(2.4, R)}/><path d="M36 54 l1 -4 -4 1" ${stroke(2, R)}/>`,
    "empty-chair": `<rect x="20" y="8" width="24" height="24" rx="6" fill="${L}"/><rect x="16" y="32" width="32" height="8" rx="4" fill="${P}"/>` +
      `<path d="M32 40 v8 M20 52 l12 -4 12 4" ${stroke(3, I)}/><circle cx="20" cy="54" r="2.5" fill="${I}"/><circle cx="44" cy="54" r="2.5" fill="${I}"/>`,
    stamp: sheet(10, 10, 32, 42) + rows(14, 18, 24, 3) +
      `<circle cx="42" cy="40" r="12" fill="none" stroke="${R}" stroke-width="3"/>` + txt(42, 45, "결재", 9, R, 800),
    "unread-mail": env(10, 18, 44, 30) + `<circle cx="50" cy="18" r="7" fill="${Sk}"/>`,
    "mail-two": `<g transform="rotate(-10 26 30)">${env(6, 16, 34, 24)}</g><g transform="rotate(8 40 38)">${env(24, 26, 34, 24, "#dfe7ec")}</g>`,
    copy: `<rect x="10" y="8" width="28" height="36" rx="4" fill="${L}"/>` + sheet(24, 20, 28, 36) + rows(28, 28, 20, 3) +
      `<path d="M10 52 q4 -4 8 0 t8 0" ${stroke(2.2, Mute)}/>`,
    "reply-pen": bubble(heart(30, 30, 1, C)) + `<path d="M44 46 l12 -12 4 4 -12 12 -6 2 z" fill="${G}"/><path d="M42 52 l2 -6 4 4 z" fill="${I}"/>`,
    toner: `<rect x="8" y="22" width="40" height="16" rx="4" fill="${I}"/><rect x="12" y="26" width="26" height="8" rx="2" fill="#4b6a78"/>` +
      `<rect x="44" y="24" width="8" height="12" rx="2" fill="${L}"/>` + `<circle cx="44" cy="48" r="10" fill="${M}"/>` + check(44, 48, 0.8, P),
    wrench: `<path d="M44 10 a12 12 0 0 0 -12 16 l-20 20 a5 5 0 0 0 7 7 l20 -20 a12 12 0 0 0 16 -12 l-7 7 -7 -2 -2 -7 z" fill="${L}"/>` +
      `<circle cx="16" cy="49" r="2.5" fill="${I}"/>`,
    "long-meeting": dial(`<path d="M32 35 L32 16 A19 19 0 0 1 51 35 Z" fill="${C}" opacity=".85"/>` + hand(32, 35, 90, 12) + hand(32, 35, 0, 15, 2.4), 32, 35, 19) + txt(32, 62, "3h", 9, P, 800),
    "coffee-treat": `<rect x="6" y="30" width="30" height="20" rx="3" fill="${Sk}"/><rect x="6" y="35" width="30" height="4" fill="${I}"/>` +
      `<path d="M34 16 H54 L51 54 H37 Z" fill="${P}"/><path d="M35 26 H53 L51 54 H37 Z" fill="#7a4a2c"/><path d="M46 6 l-3 14" ${stroke(2.4, M)}/>`,
    "sold-out": `<rect x="8" y="18" width="48" height="28" rx="5" fill="${P}"/><rect x="11" y="21" width="42" height="22" rx="3" fill="none" stroke="${R}" stroke-width="2.4"/>` + txt(32, 37, "마감", 13, R, 800),
    rank1: `<path d="M8 20 h48 v8 a4 4 0 0 0 0 8 v8 h-48 v-8 a4 4 0 0 0 0 -8 z" fill="${G}"/><path d="M40 20 v24" ${stroke(2, "#c89d2e")} stroke-dasharray="3 3"/>` + txt(24, 39, "1", 16, "#6b4e10", 800),
    "no-refund": coin(32, 32, 19, txt(32, 39, "₩", 18, "#8a6a14")) + `<path d="M14 50 L50 14" ${stroke(5, R)}/>`,
    wallet: `<rect x="8" y="18" width="44" height="32" rx="6" fill="${Br}"/><rect x="36" y="28" width="20" height="12" rx="4" fill="#8e6340"/><circle cx="43" cy="34" r="2.6" fill="${G}"/>` +
      `<rect x="12" y="12" width="30" height="10" rx="2" fill="#f3c46c" transform="rotate(-6 27 17)"/>` + `<circle cx="16" cy="48" r="8" fill="${M}"/>` + check(16, 48, 0.65, P),
    half: `<circle cx="32" cy="32" r="20" fill="${P}"/><path d="M32 12 A20 20 0 0 1 32 52 Z" fill="${C}"/><path d="M32 8 V56" ${stroke(2.4, I)} stroke-dasharray="3 3"/>`,
    cards: `<rect x="6" y="14" width="32" height="20" rx="3" fill="${P}" transform="rotate(-8 22 24)"/><rect x="24" y="30" width="32" height="20" rx="3" fill="${P}"/>` +
      `<circle cx="32" cy="40" r="4" fill="${Sk}"/><rect x="39" y="36" width="13" height="3" rx="1.5" fill="${L}"/><rect x="39" y="42" width="9" height="3" rx="1.5" fill="${L}"/>` +
      `<path d="M14 24 h14" ${stroke(3, L)}/><path d="M32 12 l8 -4 M44 8 l6 6" ${stroke(2.2, Mute)}/><circle cx="52" cy="16" r="3" fill="${Mute}"/>`,
    pyramid: `<path d="M32 8 L56 52 H8 Z" fill="${G}"/><path d="M20 30 H44 M14 41 H50" ${stroke(2.4, "#b88f2a")}/>` +
      person(32, 20, 3, "#6b4e10") + person(26, 33, 3, "#8a6a14") + person(38, 33, 3, "#8a6a14"),
    "bubble-q": bubble(`<rect x="22" y="22" width="20" height="14" rx="3" fill="${Br}"/><path d="M28 22 v-3 h8 v3" ${stroke(2, Br)}/>`) + txt(52, 22, "?", 14, C, 800),

    // ---- home & family ----
    cake: `<rect x="12" y="34" width="40" height="18" rx="4" fill="#f4d6c8"/><rect x="12" y="34" width="40" height="6" rx="3" fill="#fff4ee"/>` +
      `<path d="M12 40 q5 5 10 0 t10 0 t10 0 t10 0" fill="#f4d6c8" stroke="#e7a99a" stroke-width="2"/><rect x="30" y="20" width="4" height="14" rx="2" fill="${Sk}"/>` +
      `<path d="M32 10 q4 5 0 9 q-4 -4 0 -9 z" fill="${G}"/>`,
    "extra-tray": `<rect x="6" y="30" width="40" height="22" rx="4" fill="${L}"/><ellipse cx="18" cy="40" rx="8" ry="5" fill="#c98a45"/><ellipse cx="34" cy="40" rx="8" ry="5" fill="#c98a45"/>` +
      `<circle cx="50" cy="20" r="10" fill="${M}"/><path d="M50 14 v12 M44 20 h12" ${stroke(3.4, P)}/>`,
    awake: `<path d="M6 32 C16 16 48 16 58 32 C48 48 16 48 6 32 Z" fill="${P}"/><circle cx="32" cy="32" r="10" fill="${I}"/><circle cx="35" cy="29" r="3" fill="${P}"/>`,
    expired: cal(cross(32, 39, 1.2)),
    "calendar-mon": cal(txt(32, 45, "월", 15, I, 800)),
    extended: cal(txt(32, 46, "+7", 15, M, 800)),
    "next-week": cal(`<path d="M20 38 h20" ${stroke(4, M)}/><path d="M36 31 l8 7 -8 7" ${stroke(4, M)}/>`),
    friends: person(22, 22, 7) + person(42, 22, 7, Mute) + heart(32, 48, 1, C),
    heart: heart(32, 36, 2.2, C),
    parcel: `<path d="M10 22 L32 12 L54 22 V46 L32 56 L10 46 Z" fill="#c99a63"/><path d="M10 22 L32 32 L54 22 M32 32 V56" ${stroke(2, "#a07444")}/>` +
      `<circle cx="48" cy="48" r="10" fill="${M}"/>` + check(48, 48, 0.8, P),
    hook: `<path d="M32 8 V36 a10 10 0 1 1 -14 -9" ${stroke(4, L)}/><path d="M18 27 l-3 7 7 -2" ${stroke(3.4, L)}/>` +
      `<path d="M44 40 L56 58 H32 Z" fill="${R}"/>` + txt(44, 55, "!", 12, P, 800),
    "busy-staff": `<path d="M18 22 H38 L35 54 H21 Z" fill="${P}"/><path d="M38 28 h4 a6 6 0 0 1 0 12 h-4" ${stroke(3, P)}/>` +
      `<path d="M22 16 q-3 -4 0 -8 M30 16 q-3 -4 0 -8" ${stroke(2.2, Mute)}/><path d="M48 14 l8 -4 M50 24 l9 0 M48 34 l8 4" ${stroke(2.8, C)}/>`,
    "big-text": `<rect x="8" y="10" width="48" height="44" rx="8" fill="${P}"/>` + txt(32, 45, "가", 30, I, 800) + `<rect x="8" y="10" width="48" height="44" rx="8" fill="none" stroke="${M}" stroke-width="3"/>`,
    grill: `<path d="M8 30 H56" ${stroke(3, L)}/><path d="M12 30 l6 22 M52 30 l-6 22" ${stroke(3, I)}/>` +
      `<rect x="14" y="20" width="16" height="8" rx="3" fill="#d98a74"/><rect x="34" y="18" width="16" height="9" rx="3" fill="#c96f58"/><path d="M18 24 h8 M38 22 h8" ${stroke(1.8, "#f4d6c8")}/>` +
      `<path d="M20 14 q-3 -4 0 -8 M32 12 q-3 -4 0 -8 M44 14 q-3 -4 0 -8" ${stroke(2.2, Mute)}/>`,
    lettuce: lettuce(-3, 10, 1),
    crown: `<path d="M10 46 L14 18 L24 32 L32 14 L40 32 L50 18 L54 46 Z" fill="${G}"/><rect x="10" y="44" width="44" height="8" rx="2" fill="#d9a93a"/>` +
      `<circle cx="32" cy="30" r="3.4" fill="${R}"/><circle cx="20" cy="38" r="2.6" fill="${Sk}"/><circle cx="44" cy="38" r="2.6" fill="${Sk}"/>`,
    timer10: stopwatch("10"),
    "clock-1h": stopwatch("1h"),
    sun: `<circle cx="32" cy="32" r="12" fill="${G}"/>` + Array.from({ length: 8 }, (_, i) => {
      const a = i * Math.PI / 4;
      return `<path d="M${f(32 + 17 * Math.cos(a))},${f(32 + 17 * Math.sin(a))} L${f(32 + 24 * Math.cos(a))},${f(32 + 24 * Math.sin(a))}" ${stroke(3.4, G)}/>`;
    }).join(""),
    "house-down": house(down(46, 40, Sk)),
    "house-up": house(up(46, 26, C)),
    inspection: `<rect x="12" y="12" width="34" height="44" rx="4" fill="${P}"/><rect x="20" y="8" width="18" height="8" rx="3" fill="#8aa1ae"/>` + rows(17, 22, 22, 2) +
      `<path d="M22 42 C30 32 46 32 54 42 C46 52 30 52 22 42 Z" fill="${I}"/><circle cx="38" cy="42" r="5" fill="${P}"/>`,
    flood: `<path d="M4 40 q7 -6 14 0 t14 0 t14 0 t14 0 V58 H4 Z" fill="${Sk}"/><path d="M4 48 q7 -6 14 0 t14 0 t14 0 t14 0" ${stroke(2.4, P)} opacity=".7"/>` +
      `<path d="M22 10 C17 18 16 22 16 25 a6 6 0 0 0 12 0 C28 22 27 18 22 10 Z M42 16 C38 22 37 25 37 27 a5 5 0 0 0 10 0 C47 25 46 22 42 16 Z" fill="${Sk}"/>`,
    valve: `<path d="M4 44 H60" ${stroke(8, L)}/><path d="M32 44 V30" ${stroke(4, I)}/>` +
      `<circle cx="32" cy="22" r="13" fill="none" stroke="${R}" stroke-width="4"/><path d="M32 9 V35 M19 22 H45" ${stroke(3, R)}/>` + `<circle cx="50" cy="54" r="7" fill="${M}"/>` + check(50, 54, 0.55, P),
    podium: person(32, 12, 6, Mute) + `<path d="M16 32 H48 L44 58 H20 Z" fill="${Br}"/><rect x="12" y="28" width="40" height="7" rx="2" fill="#c49466"/>` +
      `<circle cx="32" cy="46" r="5" fill="${G}"/>`,
    curtain: `<rect x="6" y="8" width="52" height="5" fill="#8e3b3b"/><path d="M6 13 H24 C20 30 22 44 10 56 H6 Z M58 13 H40 C44 30 42 44 54 56 H58 Z" fill="#b65a4c"/>` +
      person(27, 36, 4.5, Mute) + person(38, 36, 4.5, G) + `<rect x="6" y="54" width="52" height="4" fill="${Br}"/>`,
    rings: `<circle cx="25" cy="36" r="13" fill="none" stroke="${G}" stroke-width="5"/><circle cx="39" cy="36" r="13" fill="none" stroke="#dfe7ec" stroke-width="5"/>` +
      `<path d="M25 18 l4 -6 4 6 z" fill="${Sk}"/>`,
    cobweb: `<rect x="20" y="14" width="24" height="40" rx="5" fill="${I}"/><rect x="23" y="19" width="18" height="28" rx="2" fill="#4b6a78"/>` +
      `<path d="M4 4 L22 22 M4 4 L4 26 M4 4 L26 4 M4 14 Q12 14 14 4 M4 22 Q18 22 22 4" ${stroke(1.4, Mute)}/>` + txt(46, 62, "20년", 8, Mute, 700),
    tag: `<path d="M12 22 L30 8 H52 V30 L34 52 Z" fill="${P}"/><circle cx="44" cy="16" r="3.5" fill="${I}"/><path d="M44 16 C40 4 30 4 26 10" ${stroke(2, L)}/>` +
      `<rect x="20" y="28" width="16" height="3" rx="1.5" fill="${C}" transform="rotate(-38 28 30)"/><rect x="24" y="34" width="12" height="3" rx="1.5" fill="${L}" transform="rotate(-38 30 36)"/>`,
    cushion: `<rect x="10" y="36" width="44" height="12" rx="6" fill="#b65a4c"/><path d="M16 36 q16 -8 32 0" fill="#c96f58"/>` +
      `<rect x="16" y="20" width="32" height="6" rx="2" fill="${Br}"/><path d="M20 26 v8 M44 26 v8" ${stroke(3, Br)}/>`,
    journal: `<path d="M8 14 C16 10 24 10 31 14 V54 C24 50 16 50 8 54 Z" fill="${Sk}"/><path d="M56 14 C48 10 40 10 33 14 V54 C40 50 48 50 56 54 Z" fill="${P}"/>` +
      rows(12, 22, 14, 3, 7, P) + `<path d="M44 20 l2.6 5.4 5.9 .8 -4.3 4.1 1 5.9 -5.2 -2.8 -5.2 2.8 1 -5.9 -4.3 -4.1 5.9 -.8 z" fill="${G}"/>`,
    progress: `<rect x="6" y="22" width="52" height="16" rx="8" fill="#0d1828" stroke="${P}" stroke-width="2.4"/><rect x="10" y="26" width="42" height="8" rx="4" fill="${M}"/>` +
      txt(32, 54, "99%", 12, P, 800) + `<path d="M20 12 h24 M24 12 l8 6 8 -6" ${stroke(2.4, Mute)}/>`,
    deadline: dial(hand(32, 33, 0, 11) + hand(32, 33, 0, 15, 2.4), 30, 33, 19) +
      `<rect x="40" y="42" width="18" height="14" rx="3" fill="${R}"/><path d="M44 42 v-4 a5 5 0 0 1 10 0 v4" ${stroke(3, R)}/><circle cx="49" cy="49" r="2" fill="${P}"/>`,
    restart: `<rect x="22" y="34" width="5" height="10" rx="1" fill="${L}"/><rect x="30" y="28" width="5" height="16" rx="1" fill="${L}"/><rect x="38" y="24" width="5" height="20" rx="1" fill="${L}"/>` +
      `<path d="M47 20 A18 18 0 1 0 50 40" ${stroke(4, C)}/><path d="M52 10 L50 24 L38 19 Z" fill="${C}"/>`,
    sunset: `<path d="M14 40 A18 18 0 0 1 50 40 Z" fill="${C}"/><path d="M6 40 H58" ${stroke(3, G)}/>` +
      `<path d="M10 48 H54 M18 55 H46" ${stroke(2.4, Mute)}/><path d="M32 12 v6 M14 20 l4 4 M50 20 l-4 4" ${stroke(2.6, C)}/>`
  };

  function icon(name) {
    return `<svg viewBox="0 0 64 64" aria-hidden="true">${ICONS[name] || ICONS.plain}</svg>`;
  }

  window.WADIF_ART = {
    face, prop, icon,
    moods: Object.keys(MOODS), props: Object.keys(PROPS), icons: Object.keys(ICONS), ages: Object.keys(ACCESSORIES)
  };
})();
