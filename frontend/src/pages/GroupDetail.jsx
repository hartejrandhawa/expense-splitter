import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";

export default function GroupDetail() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlement, setSettlement] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [splitBetween, setSplitBetween] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [groupId]);

  async function loadAll() {
    setLoading(true);
    try {
      const [groupData, expensesData, settlementData] = await Promise.all([
        api.getGroup(groupId),
        api.getExpenses(groupId),
        api.getSettlement(groupId),
      ]);
      setGroup(groupData);
      setExpenses(expensesData);
      setSettlement(settlementData);
      setSplitBetween(groupData.members);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleMember(username) {
    setSplitBetween((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]
    );
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.addExpense(groupId, {
        description,
        amount: parseFloat(amount),
        splitBetweenUsernames: splitBetween,
      });
      setDescription("");
      setAmount("");
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (!group) return <div className="page"><p>Group not found.</p></div>;

  return (
    <div className="page">
      <Link to="/groups" className="back-link">&larr; All groups</Link>
      <header className="page-header">
        <h1>{group.name}</h1>
        <p className="members-line">{group.members.join(", ")}</p>
      </header>

      <div className="two-col">
        <div className="card">
          <h2>Add an expense</h2>
          <form onSubmit={handleAddExpense}>
            <input
              placeholder="Description (e.g. Dinner)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <div className="split-checkboxes">
              <span className="split-label">Split between:</span>
              {group.members.map((m) => (
                <label key={m} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={splitBetween.includes(m)}
                    onChange={() => toggleMember(m)}
                  />
                  {m}
                </label>
              ))}
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit">Add expense</button>
          </form>
        </div>

        <div className="card">
          <h2>Settle up</h2>
          {settlement.length === 0 ? (
            <p className="empty-state">Everyone's even — nothing to settle.</p>
          ) : (
            <ul className="settlement-list">
              {settlement.map((t, i) => (
                <li key={i}>
                  <strong>{t.from}</strong> owes <strong>{t.to}</strong>{" "}
                  <span className="amount">${t.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Expense history</h2>
        {expenses.length === 0 ? (
          <p className="empty-state">No expenses yet.</p>
        ) : (
          <ul className="expense-history">
            {expenses.map((e) => (
              <li key={e.id}>
                <span>{e.description}</span>
                <span className="amount">${e.amount.toFixed(2)}</span>
                <span className="paid-by">paid by {e.paidBy}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
