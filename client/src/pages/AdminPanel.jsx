import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import DriveFormModal from "../components/DriveFormModal";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("drives");
  const [drives, setDrives] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editDrive, setEditDrive] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const loadAll = () => {
    axios.get("/api/admin/stats", { headers }).then((r) => setStats(r.data));
    axios.get("/api/drives", { headers }).then((r) => setDrives(r.data));
    axios
      .get("/api/admin/students", { headers })
      .then((r) => setStudents(r.data));
  };

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }
    if (localStorage.getItem("role") !== "tpo") {
      navigate("/dashboard");
      return;
    }
    loadAll();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this drive?")) return;
    await axios.delete(`/api/admin/drives/${id}`, { headers });
    loadAll();
  };

  const openEdit = (drive) => {
    setEditDrive(drive);
    setShowModal(true);
  };
  const openAdd = () => {
    setEditDrive(null);
    setShowModal(true);
  };

  const statCards = stats
    ? [
        {
          label: "Total students",
          value: stats.totalStudents,
          color: "#7c6bff",
        },
        { label: "Active drives", value: stats.activeDrives, color: "#86efac" },
        {
          label: "Placed students",
          value: stats.placedStudents,
          color: "#fcd34d",
        },
        {
          label: "Placement rate",
          value: `${stats.placementRate}%`,
          color: "#93c5fd",
        },
      ]
    : [];

  return (
    <div style={s.root}>
      <AdminSidebar active="overview" />

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.title}>Admin overview</h1>
            <p style={s.sub}>Manage placement drives and student records</p>
          </div>
          <button style={s.addBtn} onClick={openAdd}>
            <i
              className="ti ti-plus"
              style={{ fontSize: 16 }}
              aria-hidden="true"
            />{" "}
            Add drive
          </button>
        </div>

        <div style={s.statsGrid}>
          {statCards.map((c) => (
            <div key={c.label} style={s.statCard}>
              <p style={s.statLabel}>{c.label}</p>
              <p style={{ ...s.statVal, color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>

        <div style={s.tabs}>
          <button
            style={{ ...s.tabBtn, ...(tab === "drives" ? s.tabActive : {}) }}
            onClick={() => setTab("drives")}
          >
            Drives
          </button>
          <button
            style={{ ...s.tabBtn, ...(tab === "students" ? s.tabActive : {}) }}
            onClick={() => setTab("students")}
          >
            Students
          </button>
        </div>

        {tab === "drives" ? (
          <table style={s.table}>
            <thead>
              <tr>
                {[
                  "Company",
                  "Role",
                  "Type",
                  "Date",
                  "Min CGPA",
                  "Applicants",
                  "Status",
                  "",
                ].map((h) => (
                  <th key={h} style={s.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drives.map((d) => (
                <tr key={d._id}>
                  <td style={{ ...s.td, fontWeight: 600 }}>{d.company}</td>
                  <td style={s.td}>{d.role}</td>
                  <td style={s.td}>{d.type}</td>
                  <td style={s.td}>{new Date(d.date).toLocaleDateString()}</td>
                  <td style={s.td}>{d.minCGPA}</td>
                  <td style={s.td}>{d.applicantCount ?? 0}</td>
                  <td style={s.td}>
                    <span
                      style={{
                        ...s.tag,
                        ...(d.status === "open" ? s.tagOpen : s.tagClosed),
                      }}
                    >
                      {d.status === "open" ? "Open" : "Closed"}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button style={s.iconBtn} onClick={() => openEdit(d)}>
                      <i className="ti ti-edit" aria-hidden="true" />
                    </button>
                    <button
                      style={s.iconBtn}
                      onClick={() => handleDelete(d._id)}
                    >
                      <i className="ti ti-trash" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {[
                  "Name",
                  "Branch",
                  "CGPA",
                  "Batch",
                  "Applications",
                  "Status",
                  "",
                ].map((h) => (
                  <th key={h} style={s.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st._id}>
                  <td style={{ ...s.td, fontWeight: 600 }}>{st.name}</td>
                  <td style={s.td}>{st.branch}</td>
                  <td style={s.td}>{st.cgpa}</td>
                  <td style={s.td}>{st.batch}</td>
                  <td style={s.td}>{st.applicationCount ?? 0}</td>
                  <td style={s.td}>
                    <span
                      style={{
                        ...s.tag,
                        ...(st.isPlaced ? s.tagOpen : s.tagClosed),
                      }}
                    >
                      {st.isPlaced ? "Placed" : "Active"}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button
                      style={s.iconBtn}
                      onClick={() => navigate(`/admin/students/${st._id}`)}
                    >
                      <i className="ti ti-eye" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <DriveFormModal
          drive={editDrive}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            loadAll();
          }}
        />
      )}
    </div>
  );
}

const s = {
  root: {
    display: "flex",
    background: "#0f1117",
    color: "#e8eaf0",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
  },
  main: { flex: 1, padding: "1.5rem", overflowY: "auto" },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.25rem",
  },
  title: { fontSize: "1.15rem", fontWeight: 700 },
  sub: { fontSize: "0.78rem", color: "#6b7280", marginTop: 3 },
  addBtn: {
    padding: "0.55rem 1.1rem",
    background: "#7c6bff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 12,
    marginBottom: "1.5rem",
  },
  statCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "1rem 1.25rem",
  },
  statLabel: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 6 },
  statVal: { fontSize: "1.5rem", fontWeight: 700 },
  tabs: {
    display: "flex",
    gap: 4,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "1rem",
  },
  tabBtn: {
    padding: "0.5rem 1rem",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#6b7280",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  tabActive: {
    color: "#a89cff",
    borderBottomColor: "#7c6bff",
    fontWeight: 600,
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" },
  th: {
    textAlign: "left",
    color: "#6b7280",
    fontWeight: 600,
    fontSize: "0.72rem",
    padding: "8px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    textTransform: "uppercase",
  },
  td: {
    padding: "10px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  tag: {
    display: "inline-block",
    padding: "2px 9px",
    borderRadius: 999,
    fontSize: "0.7rem",
    fontWeight: 600,
  },
  tagOpen: { background: "rgba(34,197,94,0.13)", color: "#86efac" },
  tagClosed: { background: "rgba(255,255,255,0.07)", color: "#6b7280" },
  iconBtn: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    padding: 4,
    borderRadius: 6,
    fontSize: 15,
    marginRight: 4,
  },
};
