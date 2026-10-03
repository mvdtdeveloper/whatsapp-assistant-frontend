import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const definitions = {
  users: {
    title: "Registered Users",
    singular: "User",
    icon: "👤",
    fields: [
      ["name", "Name"],
      ["phone", "Phone with country code"],
      ["employeeCode", "Employee code"],
      ["role", "Role", ["SUPERVISOR", "TECHNICIAN", "ADMIN"]],
    ],
    primary: "name",
    secondary: (item) => `${item.phone || "—"} · ${item.employeeCode || "No employee code"}`,
    badge: (item) => item.role || "USER",
  },
  jobs: {
    title: "Jobs & Sites",
    singular: "Job",
    icon: "🛠️",
    fields: [
      ["jobId", "JOB ID"],
      ["routeName", "Route name"],
      ["client", "Client"],
      ["zone", "Zone"],
    ],
    primary: "jobId",
    secondary: (item) => `${item.routeName || "No route"} · ${item.zone || "—"}`,
    badge: (item) => item.client || "JOB",
  },
  materials: {
    title: "Materials",
    singular: "Material",
    icon: "📦",
    fields: [
      ["itemCode", "Item code"],
      ["name", "Material name"],
      ["unit", "Unit"],
      ["category", "Category"],
    ],
    primary: "name",
    secondary: (item) => `${item.itemCode || "—"} · Unit: ${item.unit || "—"}`,
    badge: (item) => item.category || "MATERIAL",
  },
};

export default function MasterData({ type, onBack }) {
  const definition = useMemo(() => definitions[type], [type]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(`/${type}?limit=100`);
      setItems(data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setForm({});
    setEditing(null);
    setShowForm(false);
    setSearch("");
    load();
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(event) {
    event.preventDefault();
    setError("");
    try {
      if (editing) await api.put(`/${type}/${editing}`, form);
      else await api.post(`/${type}`, form);
      setForm({});
      setEditing(null);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save record");
    }
  }

  function edit(item) {
    setEditing(item._id);
    setForm(item);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(item) {
    if (!window.confirm(`Delete this ${definition.singular.toLowerCase()}?`)) return;
    try {
      await api.delete(`/${type}/${item._id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete record");
    }
  }

  const filteredItems = items.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return JSON.stringify(item).toLowerCase().includes(q);
  });

  return (
    <section className="mobile-page">
      <div className="page-heading mobile-heading-row">
        <div className="heading-with-back">
          {onBack && (
            <button className="icon-button" type="button" onClick={onBack} aria-label="Back">‹</button>
          )}
          <div>
            <h1>{definition.title}</h1>
            <p>{items.length} total records</p>
          </div>
        </div>
        <button
          className="floating-add inline-add"
          type="button"
          onClick={() => {
            setEditing(null);
            setForm({});
            setShowForm((value) => !value);
          }}
        >
          {showForm && !editing ? "×" : "+"}
        </button>
      </div>

      {showForm && (
        <form className="card form-card mobile-form" onSubmit={save}>
          <div className="form-title-row">
            <h2>{editing ? `Edit ${definition.singular}` : `Add ${definition.singular}`}</h2>
            <button
              type="button"
              className="plain-close"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
                setForm({});
              }}
            >×</button>
          </div>
          {definition.fields.map(([key, label, options]) => (
            <label key={key}>
              {label}
              {options ? (
                <select
                  required
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                >
                  <option value="">Select</option>
                  {options.map((value) => <option key={value}>{value}</option>)}
                </select>
              ) : (
                <input
                  required
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              )}
            </label>
          ))}
          <div className="form-actions">
            <button className="primary full-button">{editing ? "Update" : "Create"}</button>
          </div>
        </form>
      )}

      <div className="mobile-search-wrap">
        <span>⌕</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${definition.title.toLowerCase()}...`}
        />
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="card empty">Loading...</div>}

      {!loading && (
        <div className="mobile-list">
          {filteredItems.map((item) => (
            <article className="mobile-list-item" key={item._id}>
              <div className="list-avatar">{definition.icon}</div>
              <div className="list-main">
                <div className="list-title-row">
                  <strong>{String(item[definition.primary] ?? "—")}</strong>
                  <span className="mini-badge">{definition.badge(item)}</span>
                </div>
                <p>{definition.secondary(item)}</p>
                {type === "materials" && item.category && <small>{item.category}</small>}
              </div>
              <div className="row-actions">
                <button type="button" onClick={() => edit(item)} title="Edit">✎</button>
                <button type="button" className="danger" onClick={() => remove(item)} title="Delete">⌫</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !filteredItems.length && (
        <div className="card empty">No matching records found.</div>
      )}
    </section>
  );
}
