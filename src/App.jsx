// Main React component: night-sky background, floating draggable die, character sheet, journal, shelves, certificates.
import { useState, useEffect, useRef } from "react";
import Scene from "./Scene.jsx";
import { character, about, abilities, inventory, books, certificates } from "./data.js";

const DIE = 80; // die size in px

// Floating d20 you can pick up, drag, and throw. It tumbles, bounces off the window edges, then settles on a result.
function Dice({ request, onResult, locked }) {
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

  // Start in the center of the screen (the "gate" roll)
  useEffect(() => {
    const s = p.current; s.x = window.innerWidth / 2 - DIE / 2; s.y = window.innerHeight / 2 - DIE / 2; paint();
    return () => cancelAnimationFrame(s.raf);
  }, []);

  // When the gate opens, glide the die to the bottom-right corner
  useEffect(() => {
    if (locked) return;
    const s = p.current, d = el.current;
    d.style.transition = "transform .9s ease";
    s.x = window.innerWidth - 130; s.y = window.innerHeight - 130; s.rot = 0; paint();
    const t = setTimeout(() => (d.style.transition = ""), 950);
    return () => clearTimeout(t);
  }, [locked]);

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

// Grimoire-style backstory: aged parchment, leather border, drop cap, ribbon and wax seal (see CSS).
function Journal() {
  return (
    <section className="journal">
      <span className="ribbon" aria-hidden="true" />
      <h2>Grimoire of the Adventurer</h2>
      <div className="rule" aria-hidden="true">✦ ❖ ✦</div>
      {about.map((p, i) => <p key={i}>{p}</p>)}
      <p className="sign">~ {character.name}</p>
      <span className="wax" aria-hidden="true">✠</span>
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
  const [locked, setLocked] = useState(true);         // the "gate": page is locked until the first roll
  const entered = useRef(false);
  const selected = books.find((b) => b.id === selectedId);

  // Store each result; the FIRST result opens the gate after a short pause
  const handleResult = (r) => {
    setRoll(r);
    if (!entered.current) { entered.current = true; setTimeout(() => setLocked(false), 1500); }
  };

  useEffect(() => { // Escape closes the open book
    const onKey = (e) => e.key === "Escape" && setSelectedId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Scene />
      {/* inert stops clicking AND keyboard focus on the page while locked */}
      <main className="page" inert={locked ? "" : undefined}>
        <CharacterSheet roll={roll} onRoll={(label, mod) => setRequest({ id: Date.now(), label, mod })} />
        <div className="library">
          <Journal />
          <Shelf title="🏆 Completed Quests" list={books.filter((b) => b.status === "done")} selectedId={selectedId} onSelect={setSelectedId} />
          <Shelf title="🔮 Active Spells" list={books.filter((b) => b.status === "active")} selectedId={selectedId} onSelect={setSelectedId} />
          {selected ? <OpenBook book={selected} onClose={() => setSelectedId(null)} /> : <p className="hint">Pull a book from the shelf to read about the project.</p>}
          <Certificates />
        </div>
      </main>
      {/* Gate overlay: lightly darkens everything behind the centered die */}
      {locked && (
        <div className="gate">
          <p className="gate-text">{roll ? `You rolled a ${roll.die}. The realm opens...` : "Roll the die to enter the realm. Grab it and throw!"}</p>
        </div>
      )}
      <Dice request={request} onResult={handleResult} locked={locked} />
    </>
  );
}