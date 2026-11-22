import Logo from "./Logo";

/** Two-panel auth screen: a worked example of what the app does, then the form. */
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="brand brand-light">
          <Logo />
          <span>Expense Splitter</span>
        </div>
        <div className="auth-pitch">
          <p className="auth-pitch-title">Three people, one weekend, two payments.</p>
          <ol className="auth-example" aria-label="Example settle-up">
            <li>
              <span>Bob pays Alice</span>
              <span className="tnum">$42.50</span>
            </li>
            <li>
              <span>Cara pays Alice</span>
              <span className="tnum">$18.20</span>
            </li>
          </ol>
          <p className="auth-pitch-body">
            Log what everyone paid for. The app nets it all out and tells you the fewest transfers it can find to get
            everyone even.
          </p>
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-form-wrap">
          <h1>{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}
