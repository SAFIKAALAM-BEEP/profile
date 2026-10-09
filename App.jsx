// Main React component: character sheet (left) + bookshelf (right).
import { useState, useEffect } from "react";
import { character, abilities, inventory, books } from "./data.js";

// Left column: name, ability scores and inventory (skills).
function CharacterSheet() {
  return (
    <aside className="sheet" aria-label="Character sheet">
      <h1>{character.name}</h1>
      <p className="class">{character.className}, {character.level}</p>
      <p>{character.blurb}</p>

      {/* Ability scores: modifier follows the D&D rule (score - 10) / 2, rounded down */}
      <h2>Abilities</h2>
      <ul className="abilities">
        {abilities.map((a) => (
          <li key={a.name}>
            <span className="score">{a.score}</span>
            <span>{a.name}</span>
            <small>+{Math.floor((a.score - 10) / 2)}</small>
          </li>
        ))}
      </ul>

      {/* Inventory: each skill is an "item" grouped into a slot */}
      <h2>Inventory</h2>
      {inventory.map((group) => (
        <div key={group.slot} className="slot">
          <h3>{group.slot}</h3>
          <ul>{group.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
      ))}

      <p className="links">
        <a href={character.links.github}>GitHub</a> <a href={character.links.email}>Send a raven</a>
      </p>
    </aside>
  );
}

// One shelf row. Clicking a spine selects the book (it slides out).
function Shelf({ title, list, selectedId, onSelect }) {
  return (
    <section className="shelf-block">
      <h2>{title}</h2>
      <div className="shelf">
        {list.map((b) => (
          <button
            key={b.id}
            className={"book" + (b.id === selectedId ? " pulled" : "")}
            style={{ height: b.height, background: b.color }}
            onClick={() => onSelect(b.id === selectedId ? null : b.id)}
            aria-expanded={b.id === selectedId}
          >
            <span className="spine">{b.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// Open-book panel with the description and GitHub link.
function OpenBook({ book, onClose }) {
  return (
    <article className="open-book" aria-live="polite">
      <button className="close" onClick={onClose} aria-label="Close book">×</button>
      <h3>{book.title}</h3>
      <p className="status">{book.status === "done" ? "Completed quest" : "Spell being cast"}</p>
      <p>{book.summary}</p>
      <p>{book.details}</p>
      <p className="tags">{book.tags.join(", ")}</p>
      <a href={book.repo} target="_blank" rel="noreferrer">Read the book on GitHub</a>
    </article>
  );
}

export default function App() {
  // Which book is currently pulled from the shelf (null = none)
  const [selectedId, setSelectedId] = useState(null);
  const selected = books.find((b) => b.id === selectedId);

  // Close the open book with the Escape key
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelectedId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="page">
      <CharacterSheet />
      <div className="library">
        <Shelf title="Completed Quests" list={books.filter((b) => b.status === "done")} selectedId={selectedId} onSelect={setSelectedId} />
        <Shelf title="Active Spells" list={books.filter((b) => b.status === "active")} selectedId={selectedId} onSelect={setSelectedId} />
        {selected
          ? <OpenBook book={selected} onClose={() => setSelectedId(null)} />
          : <p className="hint">Pull a book from the shelf to read about the project.</p>}
      </div>
    </main>
  );
}
