import { formatMoney } from "../../lib/money";
import { displayName } from "../../lib/people";

export default function SettleUp({ transfers, me, onRecord }) {
  if (transfers.length === 0) {
    return <p className="muted">Nobody owes anything. Add an expense and the transfers to settle it will show here.</p>;
  }
  return (
    <ul className="transfer-list">
      {transfers.map((t) => (
        <li key={`${t.from}-${t.to}`} className="transfer">
          <span className="transfer-text">
            <strong>{displayName(t.from, me)}</strong> {t.from === me ? "pay" : "pays"}{" "}
            <strong>{t.to === me ? "you" : t.to}</strong>
            <span className="transfer-amount tnum">{formatMoney(t.amount)}</span>
          </span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onRecord(t)}>
            Record payment
          </button>
        </li>
      ))}
    </ul>
  );
}
