import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const definitions = {
  users: {
    title: "Users", fields: [
      ["name", "Name"], ["phone", "Phone with country code"], ["employeeCode", "Employee code"],
      ["role", "Role", ["SUPERVISOR", "TECHNICIAN", "ADMIN"]]
    ], columns: ["name", "phone", "employeeCode", "role"]
  },
  jobs: {
    title: "Jobs", fields: [["jobId", "JOB ID"], ["routeName", "Route name"], ["client", "Client"], ["zone", "Zone"]],
    columns: ["jobId", "routeName", "client", "zone"]
  },
  materials: {
    title: "Materials", fields: [["itemCode", "Item code"], ["name", "Material name"], ["unit", "Unit"], ["category", "Category"]],
    columns: ["itemCode", "name", "unit", "category"]
  }
};

export default function MasterData({ type }) {
  const definition = useMemo(() => definitions[type], [type]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try { const { data } = await api.get(`/${type}?limit=100`); setItems(data.items); }
    catch (err) { setError(err.response?.data?.message || "Unable to load records"); }
  }
  useEffect(() => { setForm({}); setEditing(null); load(); }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(event) {
    event.preventDefault(); setError("");
    try {
      if (editing) await api.put(`/${type}/${editing}`, form); else await api.post(`/${type}`, form);
      setForm({}); setEditing(null); load();
    } catch (err) { setError(err.response?.data?.message || "Unable to save record"); }
  }
  function edit(item) { setEditing(item._id); setForm(item); }
  async function remove(item) {
    if (!window.confirm(`Delete this ${type.slice(0, -1)}?`)) return;
    await api.delete(`/${type}/${item._id}`); load();
  }

  return <section><div className="page-heading"><div><h1>{definition.title}</h1><p>Manage WhatsApp assistant master data.</p></div></div>
    <div className="split">
      <form className="card form-card" onSubmit={save}><h2>{editing ? "Edit" : "Add"} {definition.title.slice(0, -1)}</h2>
        {definition.fields.map(([key, label, options]) => <label key={key}>{label}
          {options ? <select required value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
            <option value="">Select</option>{options.map((value) => <option key={value}>{value}</option>)}</select>
            : <input required value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />}
        </label>)}
        {error && <div className="error">{error}</div>}
        <div className="form-actions"><button className="primary">{editing ? "Update" : "Create"}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm({}); }}>Cancel</button>}</div>
      </form>
      <div className="card table-wrap"><table><thead><tr>{definition.columns.map((column) => <th key={column}>{column}</th>)}<th>Actions</th></tr></thead>
        <tbody>{items.map((item) => <tr key={item._id}>{definition.columns.map((column) => <td key={column}>{String(item[column] ?? "—")}</td>)}<td><button onClick={() => edit(item)}>Edit</button> <button className="danger" onClick={() => remove(item)}>Delete</button></td></tr>)}</tbody></table>
        {!items.length && <p className="empty">No records found. Run the backend seed first.</p>}
      </div>
    </div>
  </section>;
}

