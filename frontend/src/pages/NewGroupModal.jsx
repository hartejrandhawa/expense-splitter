import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/auth-context";
import { useToast } from "../context/toast-context";
import Modal from "../components/Modal";
import UsernameChips from "../components/UsernameChips";

export default function NewGroupModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [members, setMembers] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const { username } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  function close() {
    setName("");
    setMembers([]);
    setError(null);
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const group = await api.createGroup({ name: name.trim(), memberUsernames: members });
      toast(`Created ${group.name}`);
      close();
      navigate(`/groups/${group.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={close} title="New group">
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="group-name">Name</label>
          <input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Lisbon trip, Flat 4B, Friday dinners…"
            maxLength={60}
            data-autofocus
            required
          />
        </div>
        <div className="field">
          <label htmlFor="group-members">Who else is in it?</label>
          <UsernameChips id="group-members" value={members} onChange={setMembers} exclude={[username]} />
          <p className="field-hint">You're added automatically. You can add more people later.</p>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Creating…" : "Create group"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
