import { useState } from "react";
import { api } from "../../api/client";
import { Avatar } from "../../components/Avatar";
import Modal from "../../components/Modal";
import { useToast } from "../../context/toast-context";
import { equalSplit, formatMoney, fromCents, sumCents, toCents } from "../../lib/money";
import { displayName } from "../../lib/people";

export default function AddExpenseModal({ group, me, onClose, onSaved }) {
  const members = group.members;
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(me);
  const [mode, setMode] = useState("equal");
  const [selected, setSelected] = useState(members);
  const [exact, setExact] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const totalCents = toCents(amount);
  const hasTotal = Number.isFinite(totalCents) && totalCents > 0;

  // Keep the selection in member order so the "extra cent" goes to the same people the server picks.
  const orderedSelection = members.filter((m) => selected.includes(m));
  const preview = hasTotal ? equalSplit(totalCents, orderedSelection) : [];

  const exactEntries = Object.entries(exact).filter(([, v]) => v.trim() !== "");
  const exactInvalid = exactEntries.some(([, v]) => !Number.isFinite(toCents(v)));
  const exactCents = sumCents(exactEntries.map(([, v]) => toCents(v)));
  const remaining = hasTotal ? totalCents - exactCents : 0;

  const canSubmit =
    description.trim() &&
    hasTotal &&
    (mode === "equal" ? orderedSelection.length > 0 : !exactInvalid && remaining === 0 && exactCents > 0);

  function toggle(name) {
    setSelected((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSaving(true);
    const body = {
      description: description.trim(),
      amount: fromCents(totalCents),
      paidByUsername: paidBy,
      ...(mode === "equal"
        ? { splitBetweenUsernames: orderedSelection }
        : { exactSplits: Object.fromEntries(exactEntries.map(([u, v]) => [u, fromCents(toCents(v))])) }),
    };
    try {
      await api.addExpense(group.id, body);
      toast(`Added ${body.description}`);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Add an expense" size="lg">
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="field field-grow">
            <label htmlFor="exp-desc">What was it for?</label>
            <input
              id="exp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Groceries"
              maxLength={120}
              data-autofocus
              required
            />
          </div>
          <div className="field field-amount">
            <label htmlFor="exp-amount">Amount</label>
            <div className="input-prefix">
              <span aria-hidden="true">$</span>
              <input
                id="exp-amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder="0.00"
                className="tnum"
                autoComplete="off"
                required
              />
            </div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="exp-payer">Paid by</label>
          <select id="exp-payer" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            {members.map((m) => (
              <option key={m} value={m}>
                {m === me ? `${m} (you)` : m}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="field">
          <legend>Split</legend>
          <div className="segmented" role="radiogroup" aria-label="How to split">
            {[
              ["equal", "Equally"],
              ["exact", "By amount"],
            ].map(([value, label]) => (
              <label key={value} className={`segment${mode === value ? " is-active" : ""}`}>
                <input
                  type="radio"
                  name="split-mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                {label}
              </label>
            ))}
          </div>

          {mode === "equal" ? (
            <ul className="split-people">
              {members.map((m) => {
                const share = preview.find((p) => p.username === m);
                const on = selected.includes(m);
                return (
                  <li key={m}>
                    <label className={`split-person${on ? " is-on" : ""}`}>
                      <input type="checkbox" checked={on} onChange={() => toggle(m)} />
                      <Avatar name={m} size="sm" />
                      <span className="split-person-name">{displayName(m, me)}</span>
                      <span className="split-person-amount tnum">
                        {on && share ? formatMoney(fromCents(share.cents)) : on ? "" : "not included"}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="split-people">
              {members.map((m) => (
                <li key={m}>
                  <div className="split-person is-on">
                    <Avatar name={m} size="sm" />
                    <label className="split-person-name" htmlFor={`exact-${m}`}>
                      {displayName(m, me)}
                    </label>
                    <div className="input-prefix input-prefix-sm">
                      <span aria-hidden="true">$</span>
                      <input
                        id={`exact-${m}`}
                        inputMode="decimal"
                        className="tnum"
                        placeholder="0.00"
                        value={exact[m] ?? ""}
                        onChange={(e) => setExact((x) => ({ ...x, [m]: e.target.value.replace(/[^\d.]/g, "") }))}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {mode === "exact" && hasTotal && (
            <p
              className={`split-remaining tone-${remaining === 0 && !exactInvalid ? "positive" : "negative"}`}
              aria-live="polite"
            >
              {exactInvalid
                ? "One of the amounts isn't a valid number."
                : remaining === 0
                  ? "Adds up to the total."
                  : remaining > 0
                    ? `${formatMoney(fromCents(remaining))} still to assign`
                    : `${formatMoney(fromCents(-remaining))} more than the total`}
            </p>
          )}
          {mode === "equal" && orderedSelection.length === 0 && (
            <p className="split-remaining tone-negative">Pick at least one person.</p>
          )}
        </fieldset>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit || saving}>
            {saving ? "Adding…" : "Add expense"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
