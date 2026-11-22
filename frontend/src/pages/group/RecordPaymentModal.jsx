import { useState } from "react";
import { api } from "../../api/client";
import Modal from "../../components/Modal";
import { useToast } from "../../context/toast-context";
import { fromCents, toCents } from "../../lib/money";

export default function RecordPaymentModal({ group, me, suggestion, onClose, onSaved }) {
  const members = group.members;
  const [from, setFrom] = useState(suggestion?.from ?? me);
  const [to, setTo] = useState(suggestion?.to ?? members.find((m) => m !== me) ?? "");
  const [amount, setAmount] = useState(suggestion ? Number(suggestion.amount).toFixed(2) : "");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const cents = toCents(amount);
  const canSubmit = from && to && from !== to && Number.isFinite(cents) && cents > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSaving(true);
    try {
      await api.recordPayment(group.id, { fromUsername: from, toUsername: to, amount: fromCents(cents) });
      toast("Payment recorded");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const label = (m) => (m === me ? `${m} (you)` : m);

  return (
    <Modal open onClose={onClose} title="Record a payment">
      <form className="form" onSubmit={handleSubmit}>
        <p className="muted">Log money that changed hands outside the app, like a bank transfer or cash.</p>
        <div className="form-row">
          <div className="field field-grow">
            <label htmlFor="pay-from">Who paid</label>
            <select id="pay-from" value={from} onChange={(e) => setFrom(e.target.value)}>
              {members.map((m) => (
                <option key={m} value={m}>
                  {label(m)}
                </option>
              ))}
            </select>
          </div>
          <div className="field field-grow">
            <label htmlFor="pay-to">Who received it</label>
            <select id="pay-to" value={to} onChange={(e) => setTo(e.target.value)}>
              {members.map((m) => (
                <option key={m} value={m}>
                  {label(m)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="pay-amount">Amount</label>
          <div className="input-prefix">
            <span aria-hidden="true">$</span>
            <input
              id="pay-amount"
              inputMode="decimal"
              className="tnum"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder="0.00"
              autoComplete="off"
              required
            />
          </div>
        </div>
        {from === to && <p className="form-error">Pick two different people.</p>}
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
            {saving ? "Recording…" : "Record payment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
