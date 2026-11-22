import { useState } from "react";
import { api } from "../../api/client";
import Modal from "../../components/Modal";
import { useToast } from "../../context/toast-context";
import { formatMoney } from "../../lib/money";

export default function ConfirmDeleteModal({ groupId, expense, onClose, onSaved }) {
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const what = expense.payment ? "payment" : "expense";

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    try {
      await api.deleteExpense(groupId, expense.id);
      toast(`Deleted ${expense.payment ? "payment" : expense.description}`);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Delete this ${what}?`} size="sm">
      <div className="form">
        <p>
          {expense.payment ? "The payment" : <strong>{expense.description}</strong>} of{" "}
          <span className="tnum">{formatMoney(expense.amount)}</span> will be removed and everyone's balances will
          change to match.
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} data-autofocus>
            Keep it
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : `Delete ${what}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
