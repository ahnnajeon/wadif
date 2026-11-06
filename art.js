// StegoAhnna's faces, props and hidden-condition icons for the stage.
//
// The body is one painted image (img/stego-body.webp, 560 × 425 in face units)
// with the eyes, nose and mouth taken out. A face is drawn on top of it as SVG,
// so one picture can show every mood. Episodes pick a mood and a prop by name:
//
//   episode.art = { setup: { mood, prop }, conditions: [icon0, icon1] }
//   ending.art  = { mood, prop }
//
// Anything left out falls back to the neutral face, no prop and a plain icon.

(() => {
  "use strict";

  const ink = "#3b2417";

  // Face units: the body image's own pixels. The head is turned a little to the
  // viewer's left, so the eye line is tilted and the nose sits left of centre.
  // Features are drawn level in a local frame and rotated into place.
  const FRAME = 'transform="translate(136 182) rotate(8.6)"';
  const EYES = [
    { x: -59, y: 0, rx: 12, ry: 16 },    // far eye
    { x: 59, y: 0, rx: 14, ry: 18.5 }    // near eye
  ];
  const NOSE = { x: -10.8, y: 13.7 };
  const S = { x: -10.8, y: 20 };          // where the mouth hangs from the nose

  const f = (n) => Math.round(n * 10) / 10;
  const stroke = (w) => `fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

  const openEye = ({ x, y, rx, ry }, k = 1) => {
    const h = ry * k;
    return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f(h)}" fill="${ink}"/>` +
      `<ellipse cx="${x}" cy="${f(y + h * 0.36)}" rx="${f(rx * 0.68)}" ry="${f(h * 0.42)}" fill="#6a4630" opacity=".45"/>` +
      `<circle cx="${f(x + rx * 0.32)}" cy="${f(y - h * 0.38)}" r="${f(rx * 0.3)}" fill="#fff"/>` +
      `<circle cx="${f(x - rx * 0.3)}" cy="${f(y + h * 0.42)}" r="${f(rx * 0.13)}" fill="#fff" opacity=".6"/>`;
  };

  const eyes = {
    open: () => `<g class="eyes-open">${EYES.map((e) => openEye(e)).join("")}</g>`,
    // ^ ^  smiling shut
    happy: () => EYES.map(({ x, y, rx, ry }) =>
      `<path d="M${x - rx},${y + 4} Q${x},${f(y - ry * 0.95)} ${x + rx},${y + 4}" ${stroke(3.8)}/>`).join(""),
    // ︶ ︶  calm, content
    content: () => EYES.map(({ x, y, rx, ry }) =>
      `<path d="M${x - rx},${y - 1} Q${x},${f(y + ry * 0.7)} ${x + rx},${y - 1}" ${stroke(3.4)}/>`).join(""),
    // half shut, flat lid
    flat: () => EYES.map(({ x, y, rx, ry }) =>
      `<path d="M${x - rx},${y + 1} A${rx},${f(ry * 0.72)} 0 0 0 ${x + rx},${y + 1} Z" fill="${ink}"/>` +
      `<circle cx="${f(x + rx * 0.35)}" cy="${f(y + ry * 0.3)}" r="${f(rx * 0.18)}" fill="#fff" opacity=".85"/>` +
      `<path d="M${f(x - rx - 2)},${y + 1} L${f(x + rx + 2)},${y + 1}" ${stroke(2.8)}/>`).join(""),
    // open, a little smaller and wetter, under worried brows
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
    open: () => `<path d="M${p(0, 0)} L${p(0, 5)}" ${stroke(3)}/>` +
      `<path d="M${p(-13, 5)} Q${p(0, 8.5)} ${p(13, 5)} C${p(12, 18)} ${p(-12, 18)} ${p(-13, 5)} Z" fill="#5a2a1e"/>` +
      `<ellipse cx="${f(S.x)}" cy="${f(S.y + 13)}" rx="6" ry="3" fill="#e98b80"/>`,
    flat: () => `<path d="M${p(-8, 10)} Q${p(0, 8.5)} ${p(8, 10)}" ${stroke(3)}/>`,
    frown: () => `<path d="M${p(-9, 12.5)} Q${p(0, 5)} ${p(9, 12.5)}" ${stroke(3.2)}/>`
  };

  const blush = () => `<ellipse cx="-66" cy="21" rx="10" ry="5.5" fill="#f39a92" opacity=".5"/>` +
    `<ellipse cx="68" cy="25" rx="11" ry="6" fill="#f39a92" opacity=".5"/>`;
  // Sweat drop on the side of the head, outside the tilted frame.
  const sweat = () => `<g class="sweat" transform="translate(-60 2)"><path d="M296,96 C288,110 284,118 284,124 a12,12 0 0 0 24,0 C308,118 304,110 296,96 Z" fill="#bfe4f7" stroke="#7fb6d3" stroke-width="2"/>` +
    `<ellipse cx="291" cy="122" rx="3" ry="5" fill="#fff" opacity=".8"/></g>`;

  const MOODS = {
    neutral: { eyes: "open", mouth: "cat" },
    glad: { eyes: "happy", mouth: "open", blush: true, sweat: true },
    blank: { eyes: "flat", mouth: "flat", sweat: true },
    sad: { eyes: "worried", mouth: "frown" },
    calm: { eyes: "content", mouth: "cat" }
  };

  function face(name) {
    const m = MOODS[name] || MOODS.neutral;
    return `<g ${FRAME}>${m.blush ? blush() : ""}${eyes[m.eyes]()}${nose()}${mouths[m.mouth]()}</g>${m.sweat ? sweat() : ""}`;
  }

  // ---- props: small things beside StegoAhnna ----

  const recorder = (extra = "") => `<g ${extra}>` +
    `<path d="M4 11 L19 8.5 L19 21.5 L4 19 Z" fill="#d6c095"/>` +
    `<rect x="17" y="8.5" width="98" height="13" rx="6.5" fill="#f2e5c6"/>` +
    `<rect x="19" y="9.5" width="94" height="4" rx="2" fill="#fff" opacity=".45"/>` +
    `<rect x="45" y="8" width="3" height="14" rx="1" fill="#d7c39b"/><rect x="88" y="8" width="3" height="14" rx="1" fill="#d7c39b"/>` +
    [55, 63, 71, 79, 99].map((x) => `<circle cx="${x}" cy="15" r="2" fill="#7a5a3c"/>`).join("") +
    `<ellipse cx="117" cy="15" rx="7" ry="9" fill="#e4d0a3"/><ellipse cx="120" cy="15" rx="3.4" ry="6" fill="#b49866"/></g>`;

  const PROPS = {
    recorder: { box: "0 0 130 30", w: 0.7, body: recorder('transform="rotate(-7 65 15)"') },
    papers: {
      box: "0 0 70 62", w: 0.38,
      body: `<rect x="17" y="4" width="44" height="54" rx="3" fill="#b8c7d1" transform="rotate(6 39 31)"/>` +
        `<rect x="9" y="7" width="44" height="54" rx="3" fill="#eef2f4"/>` +
        [18, 25, 32, 39, 46].map((y, i) => `<rect x="15" y="${y}" width="${i === 0 ? 20 : 32}" height="2.6" rx="1.3" fill="${i === 0 ? "#5d7b8a" : "#b3c1ca"}"/>`).join("") +
        `<path d="M44 3 v14 a4 4 0 0 1 -8 0 v-11" fill="none" stroke="#8aa1ae" stroke-width="2.4" stroke-linecap="round"/>`
    }
  };

  function prop(name) {
    const item = PROPS[name];
    return item ? `<svg viewBox="${item.box}" style="--prop-w:${item.w}" aria-hidden="true">${item.body}</svg>` : "";
  }

  // ---- hidden-condition icons for the token between the two worlds ----

  const ICONS = {
    // a graded music sheet: there was a test today
    test: `<rect x="15" y="11" width="34" height="44" rx="5" fill="#eef2f4"/>` +
      `<rect x="24" y="7" width="16" height="9" rx="3" fill="#8aa1ae"/>` +
      `<circle cx="27" cy="41" r="4.6" fill="#2f4a55"/><rect x="30.2" y="22" width="2.6" height="19" fill="#2f4a55"/>` +
      `<path d="M32.8 22 q6 2 6 8 q-2-4-6-4z" fill="#2f4a55"/>` +
      `<text x="44" y="51" text-anchor="middle" font-size="13" font-weight="700" fill="#d0785e" font-family="DM Sans, sans-serif">A</text>`,
    // two recorders: a spare one was there
    spare: `<g transform="translate(32 32) scale(.42)">${recorder('transform="translate(-65 -15) rotate(-32 65 15)"')}${recorder('transform="translate(-65 -15) rotate(32 65 15)"')}</g>`,
    unknown: `<text x="32" y="43" text-anchor="middle" font-size="30" font-weight="600" fill="#cfe6dc" font-family="DM Sans, sans-serif">?</text>`,
    plain: `<path d="M32 12 L48 32 L32 52 L16 32 Z" fill="none" stroke="#cfe6dc" stroke-width="3"/><circle cx="32" cy="32" r="5" fill="#cfe6dc"/>`
  };

  function icon(name) {
    return `<svg viewBox="0 0 64 64" aria-hidden="true">${ICONS[name] || ICONS.plain}</svg>`;
  }

  window.WADIF_ART = { face, prop, icon, moods: Object.keys(MOODS), props: Object.keys(PROPS), icons: Object.keys(ICONS) };
})();
