import { Avatar } from "../../components/Avatar";
import { memberBalanceText } from "../../lib/balance";
import { balanceSign } from "../../lib/money";
import { displayName } from "../../lib/people";

/**
 * Diverging bars around a zero line: right of centre = gets money back,
 * left = owes. Bar length is relative to the largest balance in the group.
 */
export default function BalanceChart({ balances, me }) {
  const max = Math.max(...balances.map((b) => Math.abs(b.balance)), 0.01);

  return (
    <ul className="balance-chart">
      {balances.map((b) => {
        const sign = balanceSign(b.balance);
        const text = memberBalanceText(b.balance);
        const width = sign === 0 ? 0 : Math.max((Math.abs(b.balance) / max) * 50, 1.5);
        return (
          <li key={b.username} className="balance-row">
            <span className="balance-who">
              <Avatar name={b.username} size="sm" />
              <span className="balance-name">{displayName(b.username, me)}</span>
            </span>
            <span className="balance-track" aria-hidden="true">
              <span
                className={`balance-bar balance-bar-${sign > 0 ? "pos" : "neg"}`}
                style={{ width: `${width}%` }}
              />
            </span>
            <span className={`balance-text tone-${text.tone}`}>{text.text}</span>
          </li>
        );
      })}
    </ul>
  );
}
