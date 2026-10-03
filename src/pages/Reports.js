// import { useEffect, useState } from "react";
// import { api } from "../api/client";

// const reportTypes = [
//   ["material-consumptions", "Material Consumption"],
//   ["task-statuses", "Task Status"],
//   ["expenses", "Expenses"],
// ];

// export default function Reports() {
//   const [type, setType] = useState(reportTypes[0][0]);
//   const [items, setItems] = useState([]);
//   const [error, setError] = useState("");
//   useEffect(() => {
//     api
//       .get(`/reports/${type}?limit=100`)
//       .then(({ data }) => setItems(data.items))
//       .catch((err) =>
//         setError(err.response?.data?.message || "Unable to load reports"),
//       );
//   }, [type]);
//   return (
//     <section>
//       <div className="page-heading">
//         <div>
//           <h1>Submitted Reports</h1>
//           <p>Entries received through WhatsApp and the simulator.</p>
//         </div>
//       </div>
//       <div className="report-tabs">
//         {reportTypes.map(([id, label]) => (
//           <button
//             className={type === id ? "active" : ""}
//             onClick={() => setType(id)}
//             key={id}
//           >
//             {label}
//           </button>
//         ))}
//       </div>
//       {error && <div className="error">{error}</div>}
//       <div className="report-grid">
//         {items.map((item) => (
//           <article className="card report" key={item._id}>
//             <div>
//               <strong>{item.reference}</strong>
//               <span className="badge">{item.status}</span>
//             </div>
//             <h3>
//               {item.job?.routeName} · {item.job?.jobId}
//             </h3>
//             <p>
//               {item.user?.name} · {new Date(item.createdAt).toLocaleString()}
//             </p>
//             {item.items?.map((line) => (
//               <p key={line._id}>
//                 {line.name}:{" "}
//                 <b>
//                   {line.quantity} {line.unit}
//                 </b>
//               </p>
//             ))}
//             {item.amount && (
//               <p>
//                 Amount: <b>₹{item.amount}</b> · {item.category}
//               </p>
//             )}
//             {item.progressPercent !== undefined && (
//               <p>
//                 Progress: <b>{item.progressPercent}%</b> · Manpower:{" "}
//                 {item.manpower}
//               </p>
//             )}
//           </article>
//         ))}
//       </div>
//       {!items.length && (
//         <div className="card empty">
//           No submitted reports yet. Use the simulator to create one.
//         </div>
//       )}
//     </section>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import * as XLSX from "xlsx";

const reportTypes = [
  ["material-consumptions", "Material Consumption"],
  ["task-statuses", "Task Status"],
  ["expenses", "Expenses"],
];

export default function Reports() {
  const [type, setType] = useState(reportTypes[0][0]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadReports();
  }, [type]);

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(`/reports/${type}?limit=100`);

      setItems(data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load reports");

      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // Department helpers
  // ---------------------------------------------------------

  const getDepartmentCode = (item) => {
    return (
      item.department?.code ||
      item.departmentCode ||
      item.job?.departmentId?.code ||
      item.job?.department?.code ||
      item.job?.departmentCode ||
      ""
    );
  };

  const getDepartmentName = (item) => {
    return (
      item.department?.name ||
      item.departmentName ||
      item.job?.departmentId?.name ||
      item.job?.department?.name ||
      item.job?.departmentName ||
      getDepartmentCode(item) ||
      "Unknown"
    );
  };

  // Unique departments from loaded reports
  const departments = useMemo(() => {
    const map = new Map();

    items.forEach((item) => {
      const code = getDepartmentCode(item);
      const name = getDepartmentName(item);

      if (code || name) {
        const key = code || name;

        if (!map.has(key)) {
          map.set(key, {
            code: key,
            name,
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [items]);

  // ---------------------------------------------------------
  // Filter reports
  // ---------------------------------------------------------

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const departmentCode = getDepartmentCode(item);

      const matchesDepartment =
        selectedDepartment === "all" ||
        departmentCode === selectedDepartment ||
        getDepartmentName(item) === selectedDepartment;

      const searchText = search.trim().toLowerCase();

      if (!searchText) {
        return matchesDepartment;
      }

      const materialNames =
        item.items
          ?.map((line) => line.name)
          .join(" ")
          .toLowerCase() || "";

      const searchableText = [
        item.reference,
        item.status,
        item.user?.name,
        item.job?.jobId,
        item.job?.routeName,
        item.job?.nodeId,
        item.job?.networkElementNo,
        item.job?.referenceType,
        getDepartmentCode(item),
        getDepartmentName(item),
        item.category,
        item.description,
        materialNames,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesDepartment && searchableText.includes(searchText);
    });
  }, [items, selectedDepartment, search]);

  // ---------------------------------------------------------
  // Excel export
  // ---------------------------------------------------------

  const downloadExcel = () => {
    if (!filteredItems.length) {
      alert("No report data available to download.");
      return;
    }

    let excelData = [];

    // -------------------------------------------------------
    // Material Consumption
    // -------------------------------------------------------

    if (type === "material-consumptions") {
      filteredItems.forEach((item) => {
        if (item.items?.length) {
          item.items.forEach((material) => {
            excelData.push({
              Reference: item.reference || "",
              Department: getDepartmentName(item),

              "Reference Type": item.job?.referenceType || "",

              "Job ID": item.job?.jobId || "",

              Route: item.job?.routeName || "",

              "Node ID": item.job?.nodeId || "",

              "Network Element No": item.job?.networkElementNo || "",

              User: item.user?.name || "",

              Material: material.name || "",

              Quantity: material.quantity || "",

              Unit: material.unit || "",

              Status: item.status || "",

              Description: item.description || "",

              Date: item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "",

              Time: item.createdAt
                ? new Date(item.createdAt).toLocaleTimeString()
                : "",
            });
          });
        } else {
          excelData.push({
            Department: getDepartmentName(item),
            "Reference Type": item.job?.referenceType || "",
            "Job ID": item.job?.jobId || "",
            Route: item.job?.routeName || "",
            "Node ID": item.job?.nodeId || "",
            "Network Element No": item.job?.networkElementNo || "",
            User: item.user?.name || "",
            Material: "",
            Quantity: "",
            Unit: "",
            Status: item.status || "",
            Description: item.description || "",
            Date: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : "",
            Time: item.createdAt
              ? new Date(item.createdAt).toLocaleTimeString()
              : "",
          });
        }
      });
    }

    // -------------------------------------------------------
    // Task Status
    // -------------------------------------------------------

    if (type === "task-statuses") {
      excelData = filteredItems.map((item) => ({
        Reference: item.reference || "",

        Department: getDepartmentName(item),

        "Reference Type": item.job?.referenceType || "",

        "Job ID": item.job?.jobId || "",

        Route: item.job?.routeName || "",

        "Node ID": item.job?.nodeId || "",

        "Network Element No": item.job?.networkElementNo || "",

        User: item.user?.name || "",

        Status: item.status || "",

        "Progress %": item.progressPercent ?? "",

        Manpower: item.manpower ?? "",

        Description: item.description || "",

        Date: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString()
          : "",

        Time: item.createdAt
          ? new Date(item.createdAt).toLocaleTimeString()
          : "",
      }));
    }

    // -------------------------------------------------------
    // Expenses
    // -------------------------------------------------------

    if (type === "expenses") {
      excelData = filteredItems.map((item) => ({
        Reference: item.reference || "",

        Department: getDepartmentName(item),

        "Reference Type": item.job?.referenceType || "",

        "Job ID": item.job?.jobId || "",

        Route: item.job?.routeName || "",

        "Network Element No": item.job?.networkElementNo || "",

        User: item.user?.name || "",

        Category: item.category || "",

        "Sub Category": item.subCategory || "",

        Amount: item.amount || "",

        "Payment Mode": item.paymentMode || "",

        Status: item.status || "",

        Description: item.description || "",

        Date: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString()
          : "",

        Time: item.createdAt
          ? new Date(item.createdAt).toLocaleTimeString()
          : "",
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Column width
    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 30 },
      { wch: 20 },
      { wch: 22 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

    const reportName =
      reportTypes.find(([id]) => id === type)?.[1] || "Reports";

    const departmentName =
      selectedDepartment === "all" ? "All-Departments" : selectedDepartment;

    const date = new Date().toISOString().split("T")[0];

    XLSX.writeFile(workbook, `${reportName}-${departmentName}-${date}.xlsx`);
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Submitted Reports</h1>
          <p>Entries received through WhatsApp and the simulator.</p>
        </div>
      </div>

      {/* Report type tabs */}

      <div className="report-tabs">
        {reportTypes.map(([id, label]) => (
          <button
            className={type === id ? "active" : ""}
            onClick={() => {
              setType(id);
              setSelectedDepartment("all");
              setSearch("");
            }}
            key={id}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}

      <div className="report-filters">
        <div className="filter-group">
          <label>Department</label>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>

            {departments.map((department) => (
              <option key={department.code} value={department.code}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group search-filter">
          <label>Search</label>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, Job ID, Route, material..."
          />
        </div>

        <div className="filter-actions">
          <button
            className="download-btn"
            onClick={downloadExcel}
            disabled={!filteredItems.length}
          >
            ⬇ Download Excel
          </button>
        </div>
      </div>

      {/* Count */}

      <div className="report-count">
        Showing <b>{filteredItems.length}</b> of <b>{items.length}</b> reports
      </div>

      {error && <div className="error">{error}</div>}

      {loading && <div className="card empty">Loading reports...</div>}

      {/* Reports */}

      {!loading && (
        <div className="report-grid">
          {filteredItems.map((item) => (
            <article className="card report" key={item._id}>
              <div className="report-card-header">
                <strong>{item.reference}</strong>

                <span className="badge">{item.status}</span>
              </div>

              <div className="department-badge">{getDepartmentName(item)}</div>

              <h3>
                {item.job?.routeName || item.job?.networkElementNo || "-"}

                {item.job?.jobId && ` · ${item.job.jobId}`}
              </h3>

              {item.job?.referenceType && (
                <p>
                  <b>{item.job.referenceType}:</b> {item.job.jobId}
                </p>
              )}

              <p>
                {item.user?.name || "-"} ·{" "}
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleString()
                  : "-"}
              </p>

              {/* Material items */}

              {item.items?.map((line) => (
                <p key={line._id}>
                  {line.name}:{" "}
                  <b>
                    {line.quantity} {line.unit}
                  </b>
                </p>
              ))}

              {/* Expense */}

              {item.amount && (
                <p>
                  Amount: <b>₹{item.amount}</b> · {item.category}
                </p>
              )}

              {/* Task */}

              {item.progressPercent !== undefined && (
                <p>
                  Progress: <b>{item.progressPercent}%</b> · Manpower:{" "}
                  {item.manpower}
                </p>
              )}

              {item.description && (
                <p>
                  <b>Description:</b> {item.description}
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      {!loading && !filteredItems.length && (
        <div className="card empty">
          No reports found for the selected filters.
        </div>
      )}
    </section>
  );
}
