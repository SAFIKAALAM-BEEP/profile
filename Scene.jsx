// Fixed full-screen background: D&D battle-map grid + map marks, stars, aurora, bio/space details,
// a dragon art slot, an architecture art slot (sketched cathedral by default), and ocean waves.
import { art } from "./art.js";

// Image URLs respect the GitHub Pages base path (/profile/)
const url = (f) => import.meta.env.BASE_URL + "art/" + f;

// Deterministic "random" stars (same every render)
const stars = Array.from({ length: 120 }, (_, i) => {
  const r = (n) => { const x = Math.sin(i * 999 + n) * 10000; return x - Math.floor(x); };
  return { x: r(1) * 1200, y: r(2) * 520, r: r(3) * 1.4 + 0.3, d: r(4) * 4 };
});
const constellation = [[420, 60], [480, 100], [550, 80], [610, 130], [690, 105]];

// DNA double helix: two sine strands plus rungs
const helix = Array.from({ length: 48 }, (_, i) => ({ y: i * 15, x: 38 * Math.sin(i * 0.28), rung: i % 3 === 0 }));
const strand = (k) => helix.map((h, i) => `${i ? "L" : "M"}${k * h.x} ${h.y}`).join("");

// Placeholder frame shown while an art slot is empty
function Slot({ x, y, w, h, label }) {
  return (
    <g className="slot-frame">
      <rect x={x} y={y} width={w} height={h} rx="14" />
      <text x={x + w / 2} y={y + 24} textAnchor="middle">{label}</text>
    </g>
  );
}

// Line-drawn Gothic cathedral (default). Hatch fill gives an engraved look.
function Sketch() {
  return (
    <g fill="url(#hatch)" stroke="#8fe3ee" strokeOpacity=".65" strokeWidth="1.3" strokeLinejoin="round">
      {/* Nave, gable and central spire (with crockets) */}
      <path d="M500 770V520H700V770ZM490 520L600 400 710 520ZM580 420L600 250 620 420Z" />
      <path d="M586 380l-8 4M614 380l8 4M590 340l-8 4M610 340l8 4M594 300l-7 4M606 300l7 4" fill="none" />
      {/* Twin towers and spires */}
      <path d="M410 770V470H490V770ZM405 470L450 330 495 470ZM710 770V470H790V770ZM705 470L750 330 795 470Z" />
      {/* Flying buttresses, piers and pinnacles */}
      <path d="M500 590Q430 560 360 650V770M700 590Q770 560 840 650V770M340 770V650H380V770ZM820 770V650H860V770Z" />
      <path d="M338 650L360 600 382 650ZM818 650L840 600 862 650Z" />
      {/* Glowing pointed-arch windows, portals and rose window */}
      <g fill="#5eead4" fillOpacity=".28">
        <path d="M440 560v-50q10-26 20 0v50ZM740 560v-50q10-26 20 0v50ZM520 640v-40q8-20 16 0v40ZM548 640v-40q8-20 16 0v40ZM636 640v-40q8-20 16 0v40ZM664 640v-40q8-20 16 0v40Z" />
        <path d="M560 770v-70q10-30 20 0v70ZM585 770v-90q15-40 30 0v90ZM620 770v-70q10-30 20 0v70Z" />
      </g>
      <circle cx="600" cy="500" r="30" fill="#5eead4" fillOpacity=".15" />
      <path d="M600 470V530M570 500H630M579 479L621 521M621 479L579 521M600 488a12 12 0 1 0 .1 0" fill="none" />
      <path d="M300 770H900" fill="none" />
    </g>
  );
}

export default function Scene() {
  const wave = "M-200 770 q50 -20 100 0" + " t100 0".repeat(16) + " V800 H-200Z";
  return (
    <svg className="scene" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#050818" /><stop offset=".7" stopColor="#0a1a38" /><stop offset="1" stopColor="#0d3a4f" /></linearGradient>
        <linearGradient id="au1" x1="0" x2="1"><stop offset="0" stopColor="#34d399" stopOpacity=".7" /><stop offset=".5" stopColor="#22d3ee" stopOpacity=".5" /><stop offset="1" stopColor="#a78bfa" stopOpacity=".6" /></linearGradient>
        <linearGradient id="au2" x1="0" x2="1"><stop offset="0" stopColor="#a78bfa" stopOpacity=".4" /><stop offset="1" stopColor="#5eead4" stopOpacity=".6" /></linearGradient>
        <radialGradient id="glow"><stop offset="0" stopColor="#bfe9ff" stopOpacity=".5" /><stop offset="1" stopColor="#bfe9ff" stopOpacity="0" /></radialGradient>
        <radialGradient id="planet" cx=".35" cy=".35"><stop offset="0" stopColor="#c4b5fd" /><stop offset="1" stopColor="#1e3a8a" /></radialGradient>
        {/* Battle-map grid: small squares plus bolder large squares */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#5eead4" strokeOpacity=".1" /></pattern>
        <pattern id="grid2" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M200 0H0V200" fill="none" stroke="#5eead4" strokeOpacity=".2" strokeWidth="1.5" /></pattern>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#050a1a" fillOpacity=".85" /><path d="M0 0V6" stroke="#5eead4" strokeOpacity=".25" /></pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#sky)" />
      <rect width="1200" height="800" fill="url(#grid)" /><rect width="1200" height="800" fill="url(#grid2)" />

      {/* Stars, constellation, moon */}
      {stars.map((s, i) => <circle key={i} className="star" cx={s.x} cy={s.y} r={s.r} fill="#e6f1ff" style={{ animationDelay: `${s.d}s` }} />)}
      <path d={"M" + constellation.map((c) => c.join(" ")).join("L")} fill="none" stroke="#b9cbe6" strokeOpacity=".4" />
      {constellation.map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r="3" fill="#e6f1ff" />)}
      <circle cx="210" cy="120" r="100" fill="url(#glow)" /><circle cx="210" cy="120" r="32" fill="#e3f4ff" />

      {/* Map marks: compass rose, dashed coastline, X marks the spot */}
      <g transform="translate(90 100)" stroke="#5eead4" strokeOpacity=".45" fill="none" strokeWidth="1.5"><circle r="34" /><path d="M0-48L8-8 48 0 8 8 0 48-8 8-48 0-8-8Z" /></g>
      <path d="M0 600C80 580 120 650 200 640S300 700 340 760" fill="none" stroke="#5eead4" strokeOpacity=".35" strokeDasharray="8 8" strokeWidth="2" />
      <path d="M292 682l16 16m0-16l-16 16" stroke="#a78bfa" strokeWidth="4" />

      {/* Aurora borealis */}
      <g className="aurora" style={{ filter: "blur(22px)" }}>
        <path d="M-50 200C200 60 380 280 600 160S1000 50 1250 190V320C1000 190 800 370 600 280S200 170-50 330Z" fill="url(#au1)" />
        <path d="M-50 330C250 220 450 400 700 290S1050 230 1250 320V420C1000 330 800 460 600 380S200 320-50 430Z" fill="url(#au2)" />
      </g>

      {/* Space + bio details: ringed planet with orbit, DNA helix, cells, molecule */}
      <g transform="translate(1050 560)" opacity=".7">
        <ellipse rx="170" ry="46" transform="rotate(-18)" fill="none" stroke="#b9cbe6" strokeOpacity=".3" strokeDasharray="6 6" />
        <circle r="52" fill="url(#planet)" /><ellipse rx="92" ry="20" transform="rotate(-20)" fill="none" stroke="#e6f1ff" strokeOpacity=".6" strokeWidth="3" />
      </g>
      <g className="helix" transform="translate(95 300) rotate(6)" fill="none" strokeWidth="2.5" opacity=".5">
        <path d={strand(1)} stroke="#5eead4" /><path d={strand(-1)} stroke="#a78bfa" />
        {helix.filter((h) => h.rung).map((h, i) => <path key={i} d={`M${h.x} ${h.y}H${-h.x}`} stroke="#b9cbe6" strokeWidth="1.5" />)}
      </g>
      <g fill="none" stroke="#5eead4" strokeOpacity=".35" strokeWidth="1.5">
        <circle cx="210" cy="480" r="34" /><circle cx="210" cy="480" r="11" fill="#a78bfa" fillOpacity=".3" /><circle cx="262" cy="528" r="20" /><circle cx="262" cy="528" r="6" fill="#a78bfa" fillOpacity=".3" />
        <polygon transform="translate(1100 380)" points="26,0 13,22.5 -13,22.5 -26,0 -13,-22.5 13,-22.5" /><circle cx="1126" cy="380" r="4" fill="#5eead4" /><circle cx="1074" cy="380" r="4" fill="#5eead4" />
      </g>

      {/* DRAGON ART SLOT: set art.dragon in art.js (otherwise a dashed placeholder shows) */}
      <g className="drift">
        {art.dragon ? <image href={url(art.dragon)} x="720" y="30" width="420" height="260" preserveAspectRatio="xMidYMid meet" /> : <Slot x={720} y={30} w={420} h={260} label="DRAGON ART SLOT · public/art + art.js" />}
      </g>

      {/* ARCHITECTURE ART SLOT: set art.architecture in art.js to replace the sketched cathedral */}
      {art.architecture
        ? <image href={url(art.architecture)} x="250" y="370" width="700" height="410" preserveAspectRatio="xMidYMax meet" />
        : <><Sketch /><Slot x={250} y={360} w={700} h={410} label="ARCHITECTURE ART SLOT · public/art + art.js" /></>}

      {/* Ocean */}
      <path className="wave" d={wave} fill="#0b4a63" fillOpacity=".7" />
      <path className="wave rev" d={wave} transform="translate(0 20)" fill="#061a33" fillOpacity=".9" />
    </svg>
  );
}
