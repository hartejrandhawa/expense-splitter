import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { Avatar } from "./Avatar";
import Icon from "./Icon";
import Logo from "./Logo";

export default function AppShell({ children }) {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/groups" className="brand">
            <Logo />
            <span>Expense Splitter</span>
          </Link>
          <div className="topbar-user">
            <Avatar name={username} size="sm" />
            <span className="topbar-name">{username}</span>
            <button type="button" className="icon-btn" onClick={handleLogout} aria-label="Log out" title="Log out">
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
