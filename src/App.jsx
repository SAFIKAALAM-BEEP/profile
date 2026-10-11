// Main React component: night-sky background, floating draggable die, character sheet, journal, shelves, certificates.
import { useState, useEffect, useRef } from "react";
import { character, about, abilities, inventory, books, certificates } from "./data.js";

// Deterministic "random" stars (same every render so they don't jump around).
const stars = Array.from({ length: 110 }, (_, i) => {
  const r = (n) => { const x = Math.sin(i * 999 + n) * 10000; return x - Math.floor(x); };
  return { x: r(1) * 1200, y: r(2) * 520, r: r(3) * 1.4 + 0.3, d: r(4) * 4 };
});

// Fixed full-screen SVG scene: stars, moon, aurora, dragons, gothic cathedral, ocean waves.
function Scene() {
  const wave = "M-200 770 q50 -20 100 0" + " t100 0".repeat(16) + " V800 H-200Z"; // repeating wave line
  return (
    <svg className="scene" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#050818" /><stop offset=".7" stopColor="#0a1a38" /><stop offset="1" stopColor="#0d3a4f" /></linearGradient>
        <linearGradient id="au1" x1="0" x2="1"><stop offset="0" stopColor="#34d399" stopOpacity=".7" /><stop offset=".5" stopColor="#22d3ee" stopOpacity=".5" /><stop offset="1" stopColor="#a78bfa" stopOpacity=".6" /></linearGradient>
        <linearGradient id="au2" x1="0" x2="1"><stop offset="0" stopColor="#a78bfa" stopOpacity=".4" /><stop offset="1" stopColor="#5eead4" stopOpacity=".6" /></linearGradient>
        <radialGradient id="glow"><stop offset="0" stopColor="#bfe9ff" stopOpacity=".5" /><stop offset="1" stopColor="#bfe9ff" stopOpacity="0" /></radialGradient>
        {/* Dragon silhouette (faces right): raised wing, body, long neck/head, tail */}
        <g id="dragon" fill="#03050d" stroke="#5eead4" strokeOpacity=".5" strokeWidth="1.5">
          <path d="M95 50C80 20 60 5 30 0c15 15 10 22-2 28 17 2 17 10 10 18 22-1 42 4 57 4Z" />
          <path d="M70 52C100 40 130 40 150 32L172 20l16 4-10 8 10 4-18 3C150 52 120 62 90 62 60 66 30 75 5 90c20-18 40-30 65-38Z" />
        </g>
      </defs>
      <rect width="1200" height="800" fill="url(#sky)" />
      {stars.map((s, i) => <circle key={i} className="star" cx={s.x} cy={s.y} r={s.r} fill="#e6f1ff" style={{ animationDelay: `${s.d}s` }} />)}
      <circle cx="210" cy="120" r="100" fill="url(#glow)" /><circle cx="210" cy="120" r="32" fill="#e3f4ff" />
      {/* Aurora borealis: blurred ribbons that sway slowly */}
      <g className="aurora" style={{ filter: "blur(22px)" }}>
        <path d="M-50 200C200 60 380 280 600 160S1000 50 1250 190V320C1000 190 800 370 600 280S200 170-50 330Z" fill="url(#au1)" />
        <path d="M-50 330C250 220 450 400 700 290S1050 230 1250 320V420C1000 330 800 460 600 380S200 320-50 430Z" fill="url(#au2)" />
      </g>
      <g className="drift"><use href="#dragon" transform="translate(780 90) scale(1.5)" /></g>
      <g className="drift slow"><use href="#dragon" transform="translate(330 250) scale(.6)" opacity=".5" /></g>
      {/* Gothic cathedral silhouette: twin spires, central gable, pinnacles, pointed-arch windows, rose window */}
      <g fill="#04060f">
        <path d="M500 800V540L600 420 700 540V800Z" /><path d="M585 430L600 290 615 430Z" />
        <path d="M430 800V500h60V800Z" /><path d="M424 500L460 380 496 500Z" />
        <path d="M710 800V500h60V800Z" /><path d="M704 500L740 380 776 500Z" />
        <path d="M330 800V620h100V800ZM770 800V620h100V800Z" />
        <path d="M120 800V640l12-60 12 60V800ZM1010 800V660l12-60 12 60V800ZM260 800V680l10-50 10 50V800Z" />
      </g>
      <g fill="#5eead4" fillOpacity=".35" stroke="#5eead4" strokeOpacity=".5">
        <path d="M588 740v-60q12-30 24 0v60zM530 740v-50q10-24 20 0v50zM650 740v-50q10-24 20 0v50z" />
        <path d="M452 560v-30q8-20 16 0v30zM732 560v-30q8-20 16 0v30z" />
        <circle cx="600" cy="505" r="22" fill="none" strokeWidth="2" />
      </g>
      {/* Ocean: two wave layers drifting in opposite directions */}
      <path className="wave" d={wave} fill="#0b4a63" fillOpacity=".7" />
      <path className="wave rev" d={wave} transform="translate(0 20)" fill="#061a33" fillOpacity=".9" />
    </svg>
  );
}

const DIE = 80; // die size in px

// Floating d20 you can pick up, drag, and throw. It tumbles, bounces off the window edges, then settles on a result.
function Dice({ request, onResult }) {
  const el = useRef(null);
  const p = useRef({ x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, drag: false, ox: 0, oy: 0, t: 0, label: "Free throw", mod: 0, raf: 0, frame: 0 });
  const [face, setFace] = useState(20);

  const paint = () => { const s = p.current; el.current.style.transform = `translate(${s.x}px,${s.y}px) rotate(${s.rot}deg)`; };

  // One physics frame: move, apply friction, bounce off edges; settle when slow.
  const step = () => {
    const s = p.current;
    s.x += s.vx; s.y += s.vy; s.rot += s.vr;
    s.vx *= 0.985; s.vy *= 0.985; s.vr *= 0.985;
    const maxX = window.innerWidth - DIE, maxY = window.innerHeight - DIE;
    if (s.x < 0 || s.x > maxX) { s.x = Math.min(Math.max(s.x, 0), maxX); s.vx *= -0.8; }
    if (s.y < 0 || s.y > maxY) { s.y = Math.min(Math.max(s.y, 0), maxY); s.vy *= -0.8; }
    paint();
    if (++s.frame % 4 === 0) setFace(1 + Math.floor(Math.random() * 20)); // flicker while tumbling
    if (Math.hypot(s.vx, s.vy) < 0.8) { // stopped: pick the final number
      const die = 1 + Math.floor(Math.random() * 20);
      setFace(die); onResult({ label: s.label, mod: s.mod, die, id: Date.now() });
      return;
    }
    s.raf = requestAnimationFrame(step);
  };

  const launch = (vx, vy, label, mod) => {
    const s = p.current; cancelAnimationFrame(s.raf);
    Object.assign(s, { vx, vy, vr: 12 + Math.abs(vx), label, mod });
    s.raf = requestAnimationFrame(step);
  };

  // Start in the bottom-right corner
  useEffect(() => {
    const s = p.current; s.x = window.innerWidth - 130; s.y = window.innerHeight - 130; paint();
    return () => cancelAnimationFrame(s.raf);
  }, []);

  // An ability click asks the die to be thrown in a random direction
  useEffect(() => {
    if (!request) return;
    const a = Math.random() * Math.PI * 2, v = 20 + Math.random() * 10;
    launch(Math.cos(a) * v, Math.sin(a) * v, request.label, request.mod);
  }, [request]);

  // Pick up: remember grab offset and stop physics
  const down = (e) => {
    const s = p.current; cancelAnimationFrame(s.raf);
    e.currentTarget.setPointerCapture(e.pointerId);
    Object.assign(s, { drag: true, ox: e.clientX - s.x, oy: e.clientY - s.y, vx: 0, vy: 0, t: Date.now() });
  };
  // Drag: follow the pointer, tracking velocity for the throw
  const move = (e) => {
    const s = p.current; if (!s.drag) return;
    const nx = e.clientX - s.ox, ny = e.clientY - s.oy;
    s.vx = nx - s.x; s.vy = ny - s.y; s.x = nx; s.y = ny; s.t = Date.now(); paint();
  };
  // Drop: throw with the last velocity (a plain click gives a random flick)
  const up = () => {
    const s = p.current; s.drag = false;
    let { vx, vy } = s;
    if (Date.now() - s.t > 80 || Math.hypot(vx, vy) < 3) { vx = (Math.random() - 0.5) * 30; vy = (Math.random() - 0.5) * 30; }
    const k = Math.min(1.5, 40 / Math.hypot(vx, vy)); // cap throw speed
    launch(vx * k, vy * k, "Free throw", 0);
  };

  return <div ref={el} className="floating-die" onPointerDown={down} onPointerMove={move} onPointerUp={up} title="Pick me up and throw me!">{face}</div>;
}

// Latest roll result text (the die itself floats over the page).
function RollResult({ roll }) {
  if (!roll) return <p className="roll-text"><small>Click an ability, or grab the die and throw it!</small></p>;
  const total = roll.die + roll.mod;
  return (
    <p className="roll-text" aria-live="polite">
      <strong>{roll.label}: {total}</strong>{" "}
      <small>{roll.die === 20 ? "Natural 20! Critical success." : roll.die === 1 ? "Natural 1. The dice gods frown." : `d20 (${roll.die}) ${roll.mod >= 0 ? "+" : "−"} ${Math.abs(roll.mod)}`}</small>
    </p>
  );
}

// Left column: name, abilities (click to roll) and inventory.
function CharacterSheet({ roll, onRoll }) {
  return (
    <aside className="sheet" aria-label="Character sheet">
      <h1>{character.name}</h1>
      <p className="class">{character.className}, {character.level}</p>
      <p>{character.blurb}</p>
      <h2>🎲 Abilities</h2>
      {/* Modifier follows the D&D rule: (score - 10) / 2, rounded down */}
      <ul className="abilities">
        {abilities.map((a) => {
          const mod = Math.floor((a.score - 10) / 2);
          return (
            <li key={a.name}><button onClick={() => onRoll(a.name, mod)} title={`Roll ${a.name}`}>
              <span aria-hidden="true">{a.icon}</span><span className="score">{a.score}</span><span>{a.name}</span><small>+{mod}</small>
            </button></li>
          );
        })}
      </ul>
      <RollResult roll={roll} />
      <h2>🎒 Inventory</h2>
      {inventory.map((g) => (
        <div key={g.slot} className="slot">
          <h3><span aria-hidden="true">{g.icon}</span> {g.slot}</h3>
          <ul>{g.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
      ))}
      <p className="links"><a href={character.links.github}>GitHub</a> <a href={character.links.email}>Send a raven</a></p>
    </aside>
  );
}

// Journal-style backstory: ruled paper, margin line, binder holes, ribbon bookmark, handwriting font (see CSS).
function Journal() {
  return (
    <section className="journal">
      <span className="ribbon" aria-hidden="true" />
      <h2>📖 Adventurer's Journal</h2>
      {about.map((p, i) => <p key={i}>{p}</p>)}
      <p className="sign">~ {character.name}</p>
    </section>
  );
}

// One shelf row. Spine height scales with title length.
function Shelf({ title, list, selectedId, onSelect }) {
  return (
    <section className="shelf-block">
      <h2>{title}</h2>
      <div className="shelf">
        {list.map((b) => (
          <button key={b.id} className={"book" + (b.id === selectedId ? " pulled" : "")}
            style={{ height: Math.min(270, 120 + b.title.length * 8), width: 46 + (b.title.length % 3) * 6, background: b.color }}
            onClick={() => onSelect(b.id === selectedId ? null : b.id)} aria-expanded={b.id === selectedId}>
            <span className="spine">{b.title}</span>
            <span className="decal" aria-hidden="true">{b.icon}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// Open-book panel with the project description and GitHub link.
function OpenBook({ book, onClose }) {
  return (
    <article className="open-book" aria-live="polite">
      <button className="close" onClick={onClose} aria-label="Close book">×</button>
      <h3>{book.icon} {book.title}</h3>
      <p className="status">{book.status === "done" ? "Completed quest" : "Spell being cast"}</p>
      <p>{book.summary}</p><p>{book.details}</p>
      <p className="tags">{book.tags.join(", ")}</p>
      <a href={book.repo} target="_blank" rel="noreferrer">Read the book on GitHub</a>
    </article>
  );
}

// Certificates: gothic-arch plaques with an icon "seal".
function Certificates() {
  return (
    <section className="certs">
      <h2>🏅 Relics &amp; Certificates</h2>
      <div className="cert-grid">
        {certificates.map((c) => (
          <article key={c.title} className="cert">
            <span className="seal" aria-hidden="true">{c.icon}</span>
            <h3>{c.title}</h3>
            <p>{c.issuer} · {c.year}</p>
            {c.link && <a href={c.link} target="_blank" rel="noreferrer">View credential</a>}
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [selectedId, setSelectedId] = useState(null); // book pulled from the shelf
  const [roll, setRoll] = useState(null);             // latest dice result
  const [request, setRequest] = useState(null);       // asks the die to be thrown
  const selected = books.find((b) => b.id === selectedId);

  useEffect(() => { // Escape closes the open book
    const onKey = (e) => e.key === "Escape" && setSelectedId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Scene />
      <Dice request={request} onResult={setRoll} />
      <main className="page">
        <CharacterSheet roll={roll} onRoll={(label, mod) => setRequest({ id: Date.now(), label, mod })} />
        <div className="library">
          <Journal />
          <Shelf title="🏆 Completed Quests" list={books.filter((b) => b.status === "done")} selectedId={selectedId} onSelect={setSelectedId} />
          <Shelf title="🔮 Active Spells" list={books.filter((b) => b.status === "active")} selectedId={selectedId} onSelect={setSelectedId} />
          {selected ? <OpenBook book={selected} onClose={() => setSelectedId(null)} /> : <p className="hint">Pull a book from the shelf to read about the project.</p>}
          <Certificates />
        </div>
      </main>
    </>
  );
}