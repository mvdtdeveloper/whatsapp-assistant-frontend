import MvdtLogo from "../assets/mvdt_logo.png";

const tabs = [
  ["simulator", "💬", "Chat"],
  ["users", "👥", "Users"],
  ["reports", "📋", "Records"],
  ["more", "☰", "More"],
];

export default function Nav({ active, onChange }) {
  const mainActive = ["jobs", "materials"].includes(active) ? "more" : active;

  return (
    <>
      <header className="app-topbar">
        <div className="app-brand">
          <img src={MvdtLogo} alt="MVDT" className="topbar-logo" />
          <div>
            <strong>MVDT Field Assistant</strong>
            <small>Mobile Console</small>
          </div>
        </div>
        <span className="online-dot" title="Connected" />
      </header>

      <nav className="bottom-nav" aria-label="Main navigation">
        {tabs.map(([id, icon, label]) => (
          <button
            type="button"
            className={mainActive === id ? "active" : ""}
            key={id}
            onClick={() => onChange(id)}
          >
            <span className="bottom-nav-icon" aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
