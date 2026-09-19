import { useEffect, useState } from "react";
import { api } from "../api/client";

const reportTypes = [
  ["material-consumptions", "Material Consumption"], ["task-statuses", "Task Status"], ["expenses", "Expenses"]
];

export default function Reports() {
  const [type, setType] = useState(reportTypes[0][0]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { api.get(`/reports/${type}?limit=100`).then(({ data }) => setItems(data.items)).catch((err) => setError(err.response?.data?.message || "Unable to load reports")); }, [type]);
  return <section><div className="page-heading"><div><h1>Submitted Reports</h1><p>Entries received through WhatsApp and the simulator.</p></div></div>
    <div className="report-tabs">{reportTypes.map(([id, label]) => <button className={type === id ? "active" : ""} onClick={() => setType(id)} key={id}>{label}</button>)}</div>
    {error && <div className="error">{error}</div>}
    <div className="report-grid">{items.map((item) => <article className="card report" key={item._id}>
      <div><strong>{item.reference}</strong><span className="badge">{item.status}</span></div>
      <h3>{item.job?.routeName} · {item.job?.jobId}</h3><p>{item.user?.name} · {new Date(item.createdAt).toLocaleString()}</p>
      {item.items?.map((line) => <p key={line._id}>{line.name}: <b>{line.quantity} {line.unit}</b></p>)}
      {item.amount && <p>Amount: <b>₹{item.amount}</b> · {item.category}</p>}
      {item.progressPercent !== undefined && <p>Progress: <b>{item.progressPercent}%</b> · Manpower: {item.manpower}</p>}
    </article>)}</div>
    {!items.length && <div className="card empty">No submitted reports yet. Use the simulator to create one.</div>}
  </section>;
}

