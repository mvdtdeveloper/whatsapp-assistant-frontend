import MvdtLogo from "../assets/mvdt_logo.png";

const tabs = [
  ["simulator", "WhatsApp Simulator"],
  ["users", "Users"],
  ["jobs", "Jobs"],
  ["materials", "Materials"],
  ["reports", "Reports"],
];

export default function Nav({ active, onChange }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <img src={MvdtLogo} alt="" className="brand-logo" />
        </span>

        <div>
          <strong>MVDT</strong>
          <small>Field Assistant</small>
        </div>
      </div>
      <nav>
        {tabs.map(([id, label]) => (
          <button
            className={active === id ? "active" : ""}
            key={id}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <p className="sidebar-note">Plan. Build. Connect. Deliver.</p>
    </aside>
  );
}
