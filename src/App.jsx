// Main React component: map background, character sheet (left), about + bookshelf (right).
import { useState, useEffect } from "react";
import { character, about, abilities, inventory, books } from "./data.js";

// Fixed full-screen SVG that looks like a hand-drawn D&D map (grid, coastlines, route, compass).
function MapBackground() {
  return (
    <svg className="map-bg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        {/* Faint battle-map grid */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#c9a24b" strokeOpacity=".09" />
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#grid)" />
      {/* Two landmasses */}
      <path d="M60 300 C150 180 320 170 390 260 S530 410 430 490 S190 570 110 490 Z" fill="#c9a24b" fillOpacity=".06" stroke="#c9a24b" strokeOpacity=".28" strokeWidth="2" />
      <path d="M700 520 C760 430 920 440 990 520 S1100 690 960 730 S720 720 700 520 Z" fill="#c9a24b" fillOpacity=".06" stroke="#c9a24b" strokeOpacity=".28" strokeWidth="2" />
      {/* Mountains */}
      <path d="M200 380l20-30 20 30m10 0l20-36 20 36m-80 40l16-24 16 24" fill="none" stroke="#c9a24b" strokeOpacity=".3" strokeWidth="2" />
      {/* Dashed adventuring route ending in an X */}
      <path d="M250 420 C450 520 600 300 800 560" fill="none" stroke="#c9a24b" strokeOpacity=".35" strokeWidth="2" strokeDasharray="8 8" />
      <path d="M792 552l16 16m0-16l-16 16" stroke="#7b2c2c" strokeWidth="4" />
      {/* Compass rose */}
      <g transform="translate(1060 150)" stroke="#c9a24b" strokeOpacity=".4" fill="none" strokeWidth="2">
        <circle r="46" />
        <path d="M0-60L10-10 60 0 10 10 0 60-10 10-60 0-10-10Z" />
        <text y="-68" textAnchor="middle" fill="#c9a24b" fillOpacity=".5" stroke="none" fontSize="18">N</text>
      </g>
    </svg>
  );
}

// Shows the latest dice result. `key` on the die restarts the spin animation each roll.
function DiceTray({ roll, onRoll }) {
  const total = roll ? roll.die + roll.mod : null;
  return (
    <div className="dice-tray">
      <div key={roll?.id} className={"d20" + (roll ? " spin" : "")}>{roll ? roll.die : "20"}</div>
      <div className="dice-text" aria-live="polite">
        {roll ? (
          <>
            <strong>{roll.label}: {total}</strong>
            <small>
              {roll.die === 20 ? "Natural 20! Critical success." :
               roll.die === 1 ? "Natural 1. The dice gods frown." :
               `d20 (${roll.die}) ${roll.mod >= 0 ? "+" : "−"} ${Math.abs(roll.mod)}`}
            </small>
          </>
        ) : <small>Click an ability to roll, or</small>}
        <button onClick={() => onRoll("Free roll", 0)}>Roll a d20</button>
      </div>
    </div>
  );
}

// Left column: name, dice, abilities and inventory (skills).
function CharacterSheet({ roll, onRoll }) {
  return (
    <aside className="sheet" aria-label="Character sheet">
      <h1>{character.name}</h1>
      <p className="class">{character.className}, {character.level}</p>
      <p>{character.blurb}</p>

      <h2>🎲 Abilities</h2>
      {/* Each ability is a button: click to roll d20 + modifier ((score - 10) / 2, rounded down) */}
      <ul className="abilities">
        {abilities.map((a) => {
          const mod = Math.floor((a.score - 10) / 2);
          return (
            <li key={a.name}>
              <button onClick={() => onRoll(a.name, mod)} title={`Roll ${a.name}`}>
                <span aria-hidden="true">{a.icon}</span>
                <span className="score">{a.score}</span>
                <span>{a.name}</span>
                <small>+{mod}</small>
              </button>
            </li>
          );
        })}
      </ul>
      <DiceTray roll={roll} onRoll={onRoll} />

      <h2>🎒 Inventory</h2>
      {inventory.map((group) => (
        <div key={group.slot} className="slot">
          <h3><span aria-hidden="true">{group.icon}</span> {group.slot}</h3>
          <ul>{group.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
      ))}

      <p className="links">
        <a href={character.links.github}>GitHub</a> <a href={character.links.email}>Send a raven</a>
      </p>
    </aside>
  );
}

// Backstory card; paragraphs come from data.js.
function AboutMe() {
  return (
    <section className="about">
      <h2>📖 Backstory</h2>
      {about.map((p, i) => <p key={i}>{p}</p>)}
    </section>
  );
}

// One shelf row. Spine height scales with the title length, so long names get taller books.
function Shelf({ title, list, selectedId, onSelect }) {
  return (
    <section className="shelf-block">
      <h2>{title}</h2>
      <div className="shelf">
        {list.map((b) => {
          const height = Math.min(270, 120 + b.title.length * 8);
          const width = 46 + (b.title.length % 3) * 6; // slight width variety
          return (
            <button
              key={b.id}
              className={"book" + (b.id === selectedId ? " pulled" : "")}
              style={{ height, width, background: b.color }}
              onClick={() => onSelect(b.id === selectedId ? null : b.id)}
              aria-expanded={b.id === selectedId}
            >
              <span className="spine">{b.title}</span>
              {/* Emblem decal; gold bands are drawn in CSS (::before / ::after) */}
              <span className="decal" aria-hidden="true">{b.icon}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// Open-book panel with the description and GitHub link.
function OpenBook({ book, onClose }) {
  return (
    <article className="open-book" aria-live="polite">
      <button className="close" onClick={onClose} aria-label="Close book">×</button>
      <h3>{book.icon} {book.title}</h3>
      <p className="status">{book.status === "done" ? "Completed quest" : "Spell being cast"}</p>
      <p>{book.summary}</p>
      <p>{book.details}</p>
      <p className="tags">{book.tags.join(", ")}</p>
      <a href={book.repo} target="_blank" rel="noreferrer">Read the book on GitHub</a>
    </article>
  );
}

export default function App() {
  const [selectedId, setSelectedId] = useState(null); // which book is pulled out
  const [roll, setRoll] = useState(null);             // latest dice result
  const selected = books.find((b) => b.id === selectedId);

  // Roll a d20: random 1-20, stored with a unique id so the animation replays.
  const rollDie = (label, mod) =>
    setRoll({ label, mod, die: 1 + Math.floor(Math.random() * 20), id: Date.now() });

  // Close the open book with the Escape key
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelectedId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <MapBackground />
      <main className="page">
        <CharacterSheet roll={roll} onRoll={rollDie} />
        <div className="library">
          <AboutMe />
          <Shelf title="🏆 Completed Quests" list={books.filter((b) => b.status === "done")} selectedId={selectedId} onSelect={setSelectedId} />
          <Shelf title="🔮 Active Spells" list={books.filter((b) => b.status === "active")} selectedId={selectedId} onSelect={setSelectedId} />
          {selected
            ? <OpenBook book={selected} onClose={() => setSelectedId(null)} />
            : <p className="hint">Pull a book from the shelf to read about the project.</p>}
        </div>
      </main>
    </>
  );
}