import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/auth-context";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [memberUsernames, setMemberUsernames] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      const data = await api.getMyGroups();
      setGroups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      const members = memberUsernames
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await api.createGroup({ name, memberUsernames: members });
      setName("");
      setMemberUsernames("");
      loadGroups();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Your groups</h1>
        <div>
          <span className="username-tag">{username}</span>
          <button className="link-btn" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <form className="card create-group-form" onSubmit={handleCreate}>
        <h2>New group</h2>
        <input
          placeholder="Group name (e.g. Cabin Trip)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Other usernames, comma-separated (optional)"
          value={memberUsernames}
          onChange={(e) => setMemberUsernames(e.target.value)}
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit">Create group</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : groups.length === 0 ? (
        <p className="empty-state">No groups yet — create one above.</p>
      ) : (
        <div className="group-list">
          {groups.map((g) => (
            <Link key={g.id} to={`/groups/${g.id}`} className="group-card">
              <h3>{g.name}</h3>
              <p>{g.members.length} member{g.members.length !== 1 ? "s" : ""}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
