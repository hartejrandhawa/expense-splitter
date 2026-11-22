import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import AppShell from "../components/AppShell";
import { AvatarStack } from "../components/Avatar";
import Icon from "../components/Icon";
import { memberBalanceText } from "../lib/balance";
import { balanceSign, formatMoney } from "../lib/money";
import NewGroupModal from "./NewGroupModal";

function Overview({ groups }) {
  const owed = groups.filter((g) => balanceSign(g.yourBalance) > 0).reduce((t, g) => t + g.yourBalance, 0);
  const owe = groups.filter((g) => balanceSign(g.yourBalance) < 0).reduce((t, g) => t - g.yourBalance, 0);

  if (!owed && !owe) {
    return <p className="headline">You're all settled up everywhere.</p>;
  }
  return (
    <p className="headline">
      {owed > 0 && (
        <span className="headline-line">
          You're owed <span className="tone-positive">{formatMoney(owed)}</span>
        </span>
      )}
      {owe > 0 && (
        <span className="headline-line">
          {owed > 0 ? "and you owe " : "You owe "}
          <span className="tone-negative">{formatMoney(owe)}</span>
        </span>
      )}
    </p>
  );
}

function GroupRow({ group }) {
  const balance = memberBalanceText(group.yourBalance);
  const sign = balanceSign(group.yourBalance);
  return (
    <li>
      <Link to={`/groups/${group.id}`} className="group-row">
        <span className="group-row-main">
          <span className="group-row-name">{group.name}</span>
          <span className="group-row-meta">
            <AvatarStack names={group.members} />
            <span>
              {group.members.length} {group.members.length === 1 ? "person" : "people"}
            </span>
            <span className="tnum">{formatMoney(group.totalSpent)} spent</span>
          </span>
        </span>
        <span className={`group-row-balance tone-${balance.tone}`}>
          <span className="group-row-balance-label">
            {sign > 0 ? "you get back" : sign < 0 ? "you owe" : "settled up"}
          </span>
          {sign !== 0 && <span className="tnum group-row-amount">{formatMoney(group.yourBalance)}</span>}
        </span>
      </Link>
    </li>
  );
}

export default function Groups() {
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getMyGroups()
      .then((data) => !cancelled && setGroups(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <h1 className="page-title">Your groups</h1>
          {groups?.length > 0 && <Overview groups={groups} />}
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
          <Icon name="plus" /> New group
        </button>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {!groups && !error && (
        <ul className="group-list" aria-busy="true" aria-label="Loading groups">
          {[0, 1, 2].map((i) => (
            <li key={i} className="skeleton skeleton-row" />
          ))}
        </ul>
      )}

      {groups?.length === 0 && (
        <div className="empty">
          <Icon name="receipt" size={28} />
          <h2>Start your first group</h2>
          <p>Make one for a trip, a flat or a regular dinner, then add the people you split costs with.</p>
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
            <Icon name="plus" /> New group
          </button>
        </div>
      )}

      {groups?.length > 0 && (
        <ul className="group-list">
          {groups.map((g) => (
            <GroupRow key={g.id} group={g} />
          ))}
        </ul>
      )}

      <NewGroupModal open={creating} onClose={() => setCreating(false)} />
    </AppShell>
  );
}
