import { useState } from "react";
import { api } from "../../api/client";
import Modal from "../../components/Modal";
import { useToast } from "../../context/toast-context";

export default function AddMemberModal({ group, onClose, onSaved }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const name = username.trim().replace(/^@/, "");
    try {
      await api.addMember(group.id, name);
      toast(`Added ${name} to ${group.name}`);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Add a person">
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="member-username">Their username</label>
          <input
            id="member-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            data-autofocus
            required
          />
          <p className="field-hint">They need an account first. Ask them to sign up, then add them here.</p>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving || !username.trim()}>
            {saving ? "Adding…" : "Add person"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
