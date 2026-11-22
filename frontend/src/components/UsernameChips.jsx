import { useState } from "react";
import Icon from "./Icon";

/** Type a username, press Enter / comma / space to turn it into a chip. Backspace removes the last one. */
export default function UsernameChips({ id, value, onChange, exclude = [] }) {
  const [draft, setDraft] = useState("");

  function commit(text) {
    const names = text
      .split(/[,\s]+/)
      .map((s) => s.trim().replace(/^@/, ""))
      .filter((s) => s && !value.includes(s) && !exclude.includes(s));
    if (names.length) onChange([...value, ...new Set(names)]);
    setDraft("");
  }

  function handleKeyDown(e) {
    if (["Enter", ",", " "].includes(e.key)) {
      if (draft.trim()) {
        e.preventDefault();
        commit(draft);
      } else if (e.key !== "Enter") {
        e.preventDefault();
      }
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="chips-input" onClick={() => document.getElementById(id)?.focus()}>
      {value.map((name) => (
        <span key={name} className="chip">
          {name}
          <button
            type="button"
            className="chip-remove"
            aria-label={`Remove ${name}`}
            onClick={() => onChange(value.filter((n) => n !== name))}
          >
            <Icon name="close" size={12} strokeWidth={2.4} />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => draft.trim() && commit(draft)}
        placeholder={value.length ? "" : "Type a username and press Enter"}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </div>
  );
}
