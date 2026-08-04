import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [branchF, setBranchF] = useState("");
  const [statusF, setStatusF] = useState("");
  const [selected, setSelected] = useState(null); // for view modal
  const [applications, setApplications] = useState([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token || localStorage.getItem("role") !== "tpo") {
      navigate("/auth");
      return;
    }
    axios.get("/api/admin/students", { headers }).then((r) => {
      setStudents(r.data);
      setFiltered(r.data);
    });
  }, []);

  // Filter logic
  useEffect(() => {
    let list = [...students];
    if (search)
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase()),
      );
    if (branchF) list = list.filter((s) => s.branch === branchF);
    if (statusF === "placed") list = list.filter((s) => s.isPlaced);
    if (statusF === "active") list = list.filter((s) => !s.isPlaced);
    setFiltered(list);
  }, [search, branchF, statusF, students]);


  const openStudent = async (student) => {
    setSelected(student);
    try {
      const res = await axios.get(
        `/api/admin/students/${student._id}/applications`,
        { headers },
      );
      setApplications(res.data);
    } catch {
      setApplications([]);
    }
  };

  const total = students.length;
  const placed = students.filter((s) => s.isPlaced).length;
  const active = students.filter((s) => !s.isPlaced).length;
  const rate = total ? Math.round((placed / total) * 100) : 0;

  const badgeStyle = {
    applied: { background: "rgba(59,130,246,0.15)", color: "#93c5fd" },
    interview: { background: "rgba(251,191,36,0.15)", color: "#fcd34d" },
    selected: { background: "rgba(34,197,94,0.15)", color: "#86efac" },
    rejected: { background: "rgba(239,68,68,0.13)", color: "#fca5a5" },
  };

  return (
    <div style={s.root}>
      <AdminSidebar active="students" />

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.title}>Students</h1>
            <p style={s.sub}>View and manage all registered students</p>
          </div>
          <button style={s.exportBtn} onClick={() => exportCSV(filtered)}>
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {[
            { label: "Total", value: total, color: "#7c6bff" },
            { label: "Placed", value: placed, color: "#86efac" },
            { label: "Active", value: active, color: "#fcd34d" },
            { label: "Placement %", value: `${rate}%`, color: "#93c5fd" },
          ].map((c) => (
            <div key={c.label} style={s.statCard}>
              <p style={s.statLabel}>{c.label}</p>
              <p style={{ ...s.statVal, color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={s.filterRow}>
          <input
            style={s.input}
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={s.select}
            value={branchF}
            onChange={(e) => setBranchF(e.target.value)}
          >
            <option value="">All branches</option>
            {["CS", "IT", "EC", "ME", "Civil"].map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            style={s.select}
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
          >
            <option value="">All status</option>
            <option value="placed">Placed</option>
            <option value="active">Active</option>
          </select>
          <span style={s.resultCount}>{filtered.length} students</span>
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          <div style={s.tableScroll}>
            <table style={s.table}>
              <colgroup>
                <col style={{ width: "14%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "90px" }} />
              </colgroup>
              <thead>
                <tr>
                  {[
                    "Name",
                    "Enroll no.",
                    "Email",
                    "Branch",
                    "CGPA",
                    "Batch",
                    "Backlogs",
                    "Applications",
                    "Status",
                    "",
                  ].map((h, i) => (
                    <th
                      key={h || `col-${i}`}
                      style={{
                        ...s.th,
                        ...(["CGPA", "Backlogs", "Applications"].includes(h) ? s.thRight : {}),
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={s.emptyCell}>
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((st) => (
                    <tr key={st._id}>
                      <td style={{ ...s.td, fontWeight: 600 }}>{st.name}</td>
                      <td style={s.td}>
                        <span style={s.enrollBadge}>{st.enrollmentNo || "—"}</span>
                      </td>
                      <td style={{ ...s.td, color: "#9ca3af" }} title={st.email}>{st.email}</td>
                      <td style={s.td}>{st.branch || "—"}</td>
                      <td style={{ ...s.td, ...s.tdRight }}>{st.cgpa || "—"}</td>
                      <td style={s.td}>{st.batch || "—"}</td>
                      <td style={{ ...s.td, ...s.tdRight }}>{st.backlogs ?? 0}</td>
                      <td style={{ ...s.td, ...s.tdRight }}>{st.applicationCount ?? 0}</td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.tag,
                            ...(st.isPlaced ? s.tagPlaced : s.tagActive),
                          }}
                        >
                          {st.isPlaced ? "Placed" : "Active"}
                        </span>
                      </td>
                      <td style={{ ...s.td, ...s.actionsCell }}>
                        <button style={s.iconBtn} onClick={() => openStudent(st)}>
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p style={s.count}>
          {filtered.length} student{filtered.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Student detail modal */}
      {selected && (
        <div style={m.overlay}>
          <div style={m.modal}>
            <div style={m.header}>
              <div>
                <h3 style={m.name}>{selected.name}</h3>
                <p style={m.email}>{selected.email}</p>
              </div>
              <button style={m.closeBtn} onClick={() => setSelected(null)}>
                ✕
              </button>
            </div>

            {/* Profile grid */}
            <div style={m.profileGrid}>
              {[
                ["Enroll no.", selected.enrollmentNo || "—"],
                ["Branch", selected.branch || "—"],
                ["CGPA", selected.cgpa || "—"],
                ["Batch", selected.batch || "—"],
                ["Backlogs", selected.backlogs ?? 0],
                ["Resume", selected.resume || null],
                ["Status", selected.isPlaced ? "Placed" : "Active"],
              ].map(([k, v]) => (
                <div key={k} style={m.profileItem}>
                  <p style={m.pLabel}>{k}</p>
                  {k === "Resume" ? (
                    v ? (
                      <a
                        href={v}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={m.resumeLink}
                      >
                        View resume
                      </a>
                    ) : (
                      <p style={{ ...m.pVal, color: "#6b7280" }}>Not uploaded</p>
                    )
                  ) : (
                    <p
                      style={{
                        ...m.pVal,
                        color:
                          k === "Status" && selected.isPlaced
                            ? "#86efac"
                            : "#e8eaf0",
                      }}
                    >
                      {v}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Applications */}
            <p style={m.sectionTitle}>Applications ({applications.length})</p>
            {applications.length === 0 ? (
              <p style={m.empty}>No applications yet.</p>
            ) : (
              <div style={m.appList}>
                {applications.map((app) => (
                  <div key={app._id} style={m.appRow}>
                    <div>
                      <p style={m.appCompany}>{app.company}</p>
                      <p style={m.appRole}>{app.role}</p>
                    </div>
                    <span style={{ ...m.badge, ...badgeStyle[app.status] }}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Export to CSV helper
function exportCSV(students) {
  const headers = ["Name", "Enroll no.", "Email", "Branch", "CGPA", "Batch", "Backlogs", "Status"];
  const rows = students.map((s) => [
    s.name, s.enrollmentNo || "", s.email, s.branch, s.cgpa, s.batch,
    s.backlogs ?? 0, s.isPlaced ? "Placed" : "Active",
  ]);

  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const s = {
  root: {
    display: "flex",
    background: "#0f1117",
    color: "#e8eaf0",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
  },
  main: { flex: 1, padding: "1.5rem", overflowY: "auto", minWidth: 0 },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.25rem",
    flexWrap: "wrap",
    gap: 12,
  },
  title: { fontSize: "1.15rem", fontWeight: 700 },
  sub: { fontSize: "0.78rem", color: "#6b7280", marginTop: 3 },
  exportBtn: {
    padding: "0.5rem 1rem",
    background: "rgba(124,107,255,0.12)",
    border: "1px solid rgba(124,107,255,0.3)",
    color: "#a89cff",
    borderRadius: 8,
    fontSize: "0.82rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
    marginBottom: "1.25rem",
  },
  statCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "1rem 1.25rem",
  },
  statLabel: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 6 },
  statVal: { fontSize: "1.5rem", fontWeight: 700 },
  filterRow: {
    display: "flex",
    gap: 8,
    marginBottom: "1.25rem",
    flexWrap: "wrap",
    alignItems: "center",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#e8eaf0",
    fontSize: "0.85rem",
    padding: "0.5rem 0.85rem",
    outline: "none",
    width: 230,
    flex: "0 1 230px",
  },
  select: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#e8eaf0",
    fontSize: "0.85rem",
    padding: "0.5rem 0.75rem",
    colorScheme: "dark",
  },
  resultCount: { marginLeft: "auto", fontSize: "0.75rem", color: "#6b7280", whiteSpace: "nowrap" },
  tableWrap: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableScroll: { overflowX: "auto" },
  table: { width: "100%", minWidth: 980, borderCollapse: "collapse", fontSize: "0.82rem", tableLayout: "fixed" },
  th: {
    textAlign: "left",
    color: "#6b7280",
    fontWeight: 600,
    fontSize: "0.72rem",
    padding: "10px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  thRight: { textAlign: "right" },
  td: {
    padding: "11px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    color: "#e8eaf0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  tdRight: { textAlign: "right", fontVariantNumeric: "tabular-nums" },
  emptyCell: {
    padding: "2rem",
    color: "#6b7280",
    textAlign: "center",
  },
  actionsCell: { whiteSpace: "nowrap" },
  tag: {
    display: "inline-block",
    padding: "2px 9px",
    borderRadius: 999,
    fontSize: "0.7rem",
    fontWeight: 600,
  },
  tagPlaced: { background: "rgba(34,197,94,0.13)", color: "#86efac" },
  tagActive: { background: "rgba(255,255,255,0.07)", color: "#6b7280" },
  iconBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#9ca3af",
    cursor: "pointer",
    padding: "3px 8px",
    borderRadius: 6,
    fontSize: "0.75rem",
    whiteSpace: "nowrap",
  },
  count: { fontSize: "0.72rem", color: "#6b7280", marginTop: "0.75rem" },

  enrollBadge: {
    display: "inline-block",
    padding: "2px 7px",
    borderRadius: 5,
    background: "rgba(124,107,255,0.12)",
    color: "#a89cff",
    fontSize: "0.7rem",
    fontWeight: 600,
    fontFamily: "monospace",
  },
};

const m = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#171a23",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: "1.5rem",
    width: 480,
    maxHeight: "85vh",
    overflowY: "auto",
    color: "#e8eaf0",
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.25rem",
  },
  name: { fontSize: "1.05rem", fontWeight: 700 },
  email: { fontSize: "0.78rem", color: "#6b7280", marginTop: 3 },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "1rem",
    cursor: "pointer",
    padding: "2px 6px",
  },
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 12,
    background: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    padding: "1rem",
    marginBottom: "1.25rem",
  },
  profileItem: {},
  pLabel: { fontSize: "0.72rem", color: "#6b7280" },
  pVal: { fontSize: "0.85rem", fontWeight: 500, marginTop: 3 },
  resumeLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#a89cff",
    marginTop: 3,
    textDecoration: "none",
    cursor: "pointer",
  },
  sectionTitle: {
    fontSize: "0.8rem",
    fontWeight: 600,
    marginBottom: "0.75rem",
  },
  empty: { fontSize: "0.82rem", color: "#6b7280" },
  appList: { display: "flex", flexDirection: "column", gap: 8 },
  appRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.6rem 0.75rem",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 8,
  },
  appCompany: { fontSize: "0.85rem", fontWeight: 600 },
  appRole: { fontSize: "0.72rem", color: "#6b7280" },
  badge: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 999,
    fontSize: "0.72rem",
    fontWeight: 600,
  },
};