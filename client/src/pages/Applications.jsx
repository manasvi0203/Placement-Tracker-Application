import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function Applications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    axios
      .get("/api/student/applications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setApplications(r.data));
  }, []);

  const badgeStyle = {
    applied: { background: "rgba(59,130,246,0.15)", color: "#93c5fd" },
    interview: { background: "rgba(251,191,36,0.15)", color: "#fcd34d" },
    selected: { background: "rgba(34,197,94,0.15)", color: "#86efac" },
    rejected: { background: "rgba(239,68,68,0.13)", color: "#fca5a5" },
  };

  return (
    <div style={s.root}>
      <Sidebar active="applications" />

      <div style={s.main}>
        <div style={s.topbar}>
          <h1 style={s.title}>My Applications</h1>
          <p style={s.sub}>{applications.length} total applications</p>
        </div>

        {applications.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: "2rem" }}>📋</p>
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
              No applications yet. Browse drives to apply.
            </p>
            <button style={s.browseBtn} onClick={() => navigate("/drives")}>
              Browse Drives
            </button>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {[
                  "Company",
                  "Role",
                  "Type",
                  "Drive Date",
                  "Applied On",
                  "Status",
                ].map((h) => (
                  <th key={h} style={s.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td style={{ ...s.td, fontWeight: 600 }}>{app.company}</td>
                  <td style={s.td}>{app.role}</td>
                  <td style={s.td}>{app.type || "—"}</td>
                  <td style={s.td}>
                    {app.driveDate
                      ? new Date(app.driveDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td style={s.td}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...badgeStyle[app.status] }}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
  topbar: { marginBottom: "1.5rem" },
  title: { fontSize: "1.15rem", fontWeight: 700 },
  sub: { fontSize: "0.78rem", color: "#6b7280", marginTop: 3 },
  empty: { textAlign: "center", padding: "4rem 0" },
  browseBtn: {
    marginTop: "1rem",
    padding: "0.65rem 1.5rem",
    background: "#7c6bff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
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
  badge: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 999,
    fontSize: "0.72rem",
    fontWeight: 600,
  },
};
