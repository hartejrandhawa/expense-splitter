import { Avatar } from "../../components/Avatar";
import Icon from "../../components/Icon";
import { formatMoney } from "../../lib/money";
import { displayName } from "../../lib/people";

function dayLabel(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

function groupByDay(expenses) {
  const days = [];
  for (const e of expenses) {
    const date = new Date(e.createdAt);
    const key = date.toDateString();
    const last = days[days.length - 1];
    if (last?.key === key) last.items.push(e);
    else days.push({ key, label: dayLabel(date), items: [e] });
  }
  return days;
}

function splitSummary(expense) {
  const n = expense.splits.length;
  const amounts = expense.splits.map((s) => Math.round(s.amount * 100));
  const even = Math.max(...amounts) - Math.min(...amounts) <= 1;
  if (n === 1) return `for ${expense.splits[0].username}`;
  return even ? `split ${n} ways` : `split by amount`;
}

/** What this expense means for the signed-in user. */
function yourPart(expense, me) {
  const yourShare = expense.splits.find((s) => s.username === me)?.amount ?? 0;
  if (expense.paidBy === me) {
    const lent = expense.amount - yourShare;
    return lent > 0.004
      ? { tone: "positive", text: `you lent ${formatMoney(lent)}` }
      : { tone: "neutral", text: "just you" };
  }
  return yourShare > 0
    ? { tone: "negative", text: `you owe ${formatMoney(yourShare)}` }
    : { tone: "neutral", text: "not involved" };
}

function canDelete(expense, me, groupCreator) {
  if (expense.paidBy === me || groupCreator === me) return true;
  return expense.payment && expense.splits.some((s) => s.username === me);
}

export default function Activity({ expenses, me, groupCreator, onDelete }) {
  if (expenses.length === 0) {
    return <p className="muted">No expenses yet. Add the first one, like the groceries or the Airbnb.</p>;
  }

  return (
    <div className="activity">
      {groupByDay(expenses).map((day) => (
        <section key={day.key} className="activity-day" aria-label={day.label}>
          <h3 className="activity-day-label">{day.label}</h3>
          <ul className="activity-list">
            {day.items.map((e) => {
              const receiver = e.splits[0]?.username;
              const part = e.payment ? null : yourPart(e, me);
              return (
                <li key={e.id} className={`activity-item${e.payment ? " is-payment" : ""}`}>
                  {e.payment ? (
                    <span className="activity-icon" aria-hidden="true">
                      <Icon name="repay" />
                    </span>
                  ) : (
                    <Avatar name={e.paidBy} />
                  )}
                  <span className="activity-body">
                    <span className="activity-title">
                      {e.payment
                        ? `${displayName(e.paidBy, me)} paid ${receiver === me ? "you" : receiver}`
                        : e.description}
                    </span>
                    <span className="activity-sub">
                      {e.payment
                        ? "Payment"
                        : `${displayName(e.paidBy, me)} paid, ${splitSummary(e)}`}
                    </span>
                  </span>
                  <span className="activity-figures">
                    <span className="activity-amount tnum">{formatMoney(e.amount)}</span>
                    {part && <span className={`activity-part tone-${part.tone}`}>{part.text}</span>}
                  </span>
                  {canDelete(e, me, groupCreator) ? (
                    <button
                      type="button"
                      className="icon-btn activity-delete"
                      onClick={() => onDelete(e)}
                      aria-label={`Delete ${e.payment ? "payment" : e.description}`}
                      title="Delete"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  ) : (
                    <span className="activity-delete-spacer" />
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
