import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";
import AppShell from "../../components/AppShell";
import { Avatar } from "../../components/Avatar";
import Icon from "../../components/Icon";
import { useAuth } from "../../context/auth-context";
import { yourBalanceText } from "../../lib/balance";
import { formatMoney } from "../../lib/money";
import Activity from "./Activity";
import AddExpenseModal from "./AddExpenseModal";
import AddMemberModal from "./AddMemberModal";
import BalanceChart from "./BalanceChart";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import RecordPaymentModal from "./RecordPaymentModal";
import SettleUp from "./SettleUp";

export default function GroupDetail() {
  const { groupId } = useParams();
  const { username: me } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  // Which modal is open: { type: "expense" | "member" | "payment" | "delete", ...payload }
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    try {
      const [group, expenses, balances, transfers] = await Promise.all([
        api.getGroup(groupId),
        api.getExpenses(groupId),
        api.getBalances(groupId),
        api.getSettlement(groupId),
      ]);
      setData({ group, expenses, balances, transfers });
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, [groupId]);

  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  const close = () => setModal(null);

  if (error && !data) {
    return (
      <AppShell>
        <div className="empty">
          <h1>{error.status === 404 ? "Group not found" : "Couldn't load this group"}</h1>
          <p>
            {error.status === 404
              ? "It may have been removed, or you're not a member. Ask someone in the group to add you."
              : error.message}
          </p>
          <Link to="/groups" className="btn btn-secondary">
            Back to your groups
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell>
        <div aria-busy="true" aria-label="Loading group">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
          <div className="detail-grid">
            <div className="skeleton skeleton-panel" />
            <div className="skeleton skeleton-panel" />
          </div>
        </div>
      </AppShell>
    );
  }

  const { group, expenses, balances, transfers } = data;
  const you = yourBalanceText(group.yourBalance);

  return (
    <AppShell>
      <Link to="/groups" className="back-link">
        <Icon name="back" size={16} /> All groups
      </Link>

      <div className="page-head">
        <div className="group-heading">
          <h1 className="page-title">{group.name}</h1>
          <div className="member-line">
            <ul className="member-chips" aria-label="Members">
              {group.members.map((m) => (
                <li key={m} className="member-chip">
                  <Avatar name={m} size="xs" />
                  {m === me ? "you" : m}
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal({ type: "member" })}>
              <Icon name="userPlus" size={16} /> Add person
            </button>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ type: "expense" })}>
          <Icon name="plus" /> Add expense
        </button>
      </div>

      <div className="group-summary">
        <p className={`headline tone-${you.tone}`}>{you.text}</p>
        <p className="muted tnum">{formatMoney(group.totalSpent)} spent by the group so far</p>
      </div>

      <div className="detail-grid">
        <section className="panel" aria-labelledby="balances-title">
          <h2 id="balances-title" className="panel-title">
            Balances
          </h2>
          <BalanceChart balances={balances} me={me} />
        </section>
        <section className="panel" aria-labelledby="settle-title">
          <div className="panel-head">
            <h2 id="settle-title" className="panel-title">
              Settle up
            </h2>
            {transfers.length > 0 && (
              <span className="muted small">
                {transfers.length} {transfers.length === 1 ? "payment" : "payments"} gets everyone even
              </span>
            )}
          </div>
          <SettleUp transfers={transfers} me={me} onRecord={(t) => setModal({ type: "payment", suggestion: t })} />
          <button
            type="button"
            className="btn btn-ghost btn-sm panel-foot-btn"
            onClick={() => setModal({ type: "payment", suggestion: null })}
          >
            <Icon name="repay" size={16} /> Record a different payment
          </button>
        </section>
      </div>

      <section className="panel" aria-labelledby="activity-title">
        <h2 id="activity-title" className="panel-title">
          Activity
        </h2>
        <Activity
          expenses={expenses}
          me={me}
          groupCreator={group.createdBy}
          onDelete={(expense) => setModal({ type: "delete", expense })}
        />
      </section>

      {modal?.type === "expense" && <AddExpenseModal group={group} me={me} onClose={close} onSaved={load} />}
      {modal?.type === "member" && <AddMemberModal group={group} onClose={close} onSaved={load} />}
      {modal?.type === "payment" && (
        <RecordPaymentModal group={group} me={me} suggestion={modal.suggestion} onClose={close} onSaved={load} />
      )}
      {modal?.type === "delete" && (
        <ConfirmDeleteModal groupId={group.id} expense={modal.expense} onClose={close} onSaved={load} />
      )}
    </AppShell>
  );
}
