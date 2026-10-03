export default function More({ onOpen }) {
  return (
    <section className="mobile-page">
      <div className="page-heading compact-heading">
        <div>
          <h1>More</h1>
          <p>Master data and application tools.</p>
        </div>
      </div>

      <div className="settings-list">
        <button className="settings-row" onClick={() => onOpen("jobs")}>
          <span className="settings-icon">🛠️</span>
          <span className="settings-copy">
            <strong>Jobs & Sites</strong>
            <small>View and manage assigned jobs, routes and sites</small>
          </span>
          <span className="chevron">›</span>
        </button>

        <button className="settings-row" onClick={() => onOpen("materials")}>
          <span className="settings-icon">📦</span>
          <span className="settings-copy">
            <strong>Materials</strong>
            <small>View and manage material master data</small>
          </span>
          <span className="chevron">›</span>
        </button>

        <div className="settings-row static-row">
          <span className="settings-icon">📱</span>
          <span className="settings-copy">
            <strong>Mobile App</strong>
            <small>React + Capacitor Android application</small>
          </span>
        </div>
      </div>

      <div className="about-card">
        <strong>MVDT Field Assistant</strong>
        <p>Plan. Build. Connect. Deliver.</p>
        <small>Existing API and workflow logic retained.</small>
      </div>
    </section>
  );
}
