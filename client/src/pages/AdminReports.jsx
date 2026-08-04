import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminReports() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token || localStorage.getItem("role") !== "tpo") {
      navigate("/auth");
      return;
    }
    axios
      .get("/api/admin/students", { headers })
      .then((r) => setStudents(r.data));
    axios
      .get("/api/admin/applications", { headers })
      .then((r) => setApplications(r.data));
    axios.get("/api/drives", { headers }).then((r) => setDrives(r.data));
  }, []);

  // Summary stats
  const total = students.length;
  const placed = students.filter((s) => s.isPlaced).length;
  const rate = total ? Math.round((placed / total) * 100) : 0;

  // Application status counts
  const appStats = {
    applied: applications.filter((a) => a.status === "applied").length,
    interview: applications.filter((a) => a.status === "interview").length,
    selected: applications.filter((a) => a.status === "selected").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  // Branch wise placement
  const branches = ["CS", "IT", "EC", "ME", "Civil"];
  const branchData = branches
    .map((b) => {
      const branchStudents = students.filter((s) => s.branch === b);
      const placedCount = branchStudents.filter((s) => s.isPlaced).length;
      const pct = branchStudents.length
        ? Math.round((placedCount / branchStudents.length) * 100)
        : 0;
      return {
        branch: b,
        total: branchStudents.length,
        placed: placedCount,
        pct,
      };
    })
    .filter((b) => b.total > 0);

  const branchColor = (pct) =>
    pct >= 75 ? "#86efac" : pct >= 50 ? "#fcd34d" : "#fca5a5";

  // Top companies by offers (selected applications)
  const companyMap = {};
  applications
    .filter((a) => a.status === "selected")
    .forEach((a) => {
      companyMap[a.company] = (companyMap[a.company] || 0) + 1;
    });
  const topCompanies = Object.entries(companyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Highest CTC from drives
  const exportReport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Students", total],
      ["Placed", placed],
      ["Placement Rate", `${rate}%`],
      ["Applied", appStats.applied],
      ["Interview", appStats.interview],
      ["Selected", appStats.selected],
      ["Rejected", appStats.rejected],
      [],
      ["Branch", "Total", "Placed", "Rate"],
      ...branchData.map((b) => [b.branch, b.total, b.placed, `${b.pct}%`]),
      [],
      ["Company", "Offers"],
      ...topCompanies.map(([c, n]) => [c, n]),
    ];

    
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "placement_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={s.root}>
      <AdminSidebar active="reports" />

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.title}>Placement Reports</h1>
            <p style={s.sub}>Batch 2025 · Overall statistics</p>
          </div>
          <button style={s.exportBtn} onClick={exportReport}>
            Export Report
          </button>
        </div>

        {/* Summary cards */}
        <div style={s.statsGrid}>
          {[
            {
              label: "Total students",
              value: total,
              sub: "",
              color: "#7c6bff",
            },
            {
              label: "Placed",
              value: placed,
              sub: `${rate}% placement rate`,
              color: "#86efac",
            },
            {
              label: "Highest CTC",
              value: "₹18 LPA",
              sub: "Flipkart",
              color: "#fcd34d",
            },
            {
              label: "Total drives",
              value: drives.length,
              sub: `${drives.filter((d) => d.status === "open").length} open`,
              color: "#93c5fd",
            },
          ].map((c) => (
            <div key={c.label} style={s.statCard}>
              <p style={s.statLabel}>{c.label}</p>
              <p style={{ ...s.statVal, color: c.color }}>{c.value}</p>
              {c.sub && <p style={s.statSub}>{c.sub}</p>}
            </div>
          ))}
        </div>

        <div style={s.twoCol}>
          {/* Branch wise */}
          <div style={s.card}>
            <p style={s.cardTitle}>Branch-wise placement</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {branchData.map((b) => (
                <div key={b.branch}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.8rem",
                      marginBottom: 5,
                    }}
                  >
                    <span>{b.branch}</span>
                    <span
                      style={{ color: branchColor(b.pct), fontWeight: 600 }}
                    >
                      {b.placed}/{b.total} · {b.pct}%
                    </span>
                  </div>
                  <div style={s.barBg}>
                    <div
                      style={{
                        ...s.barFill,
                        width: `${b.pct}%`,
                        background: branchColor(b.pct),
                      }}
                    />
                  </div>
                </div>
              ))}
              {branchData.length === 0 && <p style={s.empty}>No data yet.</p>}
            </div>
          </div>

          {/* Top companies */}
          <div style={s.card}>
            <p style={s.cardTitle}>Top recruiting companies</p>
            {topCompanies.length === 0 ? (
              <p style={s.empty}>No offers recorded yet.</p>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {topCompanies.map(([company, count], i) => {
                  const drive = drives.find((d) => d.company === company);
                  return (
                    <div key={company} style={s.companyRow}>
                      <div style={s.companyRank}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <p style={s.companyName}>{company}</p>
                        <p style={s.companySub}>
                          {drive?.role || "—"} · {drive?.ctc || "—"}
                        </p>
                      </div>
                      <span style={s.offerCount}>
                        {count} offer{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Application status breakdown */}
        <div style={s.card}>
          <p style={s.cardTitle}>Application status breakdown</p>
          <div style={s.statusGrid}>
            {[
              {
                label: "Applied",
                value: appStats.applied,
                color: "#93c5fd",
                bg: "rgba(59,130,246,0.08)",
              },
              {
                label: "Interview",
                value: appStats.interview,
                color: "#fcd34d",
                bg: "rgba(251,191,36,0.08)",
              },
              {
                label: "Selected",
                value: appStats.selected,
                color: "#86efac",
                bg: "rgba(34,197,94,0.08)",
              },
              {
                label: "Rejected",
                value: appStats.rejected,
                color: "#fca5a5",
                bg: "rgba(239,68,68,0.08)",
              },
            ].map((c) => (
              <div key={c.label} style={{ ...s.statusCard, background: c.bg }}>
                <p style={{ ...s.statusVal, color: c.color }}>{c.value}</p>
                <p style={s.statusLabel}>{c.label}</p>
                <p style={s.statusPct}>
                  {applications.length
                    ? Math.round((c.value / applications.length) * 100)
                    : 0}
                  %
                </p>
              </div>
            ))}
          </div>
        </div>
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
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.25rem",
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
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
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
  statSub: { fontSize: "0.7rem", color: "#6b7280", marginTop: 3 },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: "1.25rem",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "1.1rem",
    marginBottom: "1.25rem",
  },
  cardTitle: { fontSize: "0.8rem", fontWeight: 600, marginBottom: "1rem" },
  empty: { fontSize: "0.82rem", color: "#6b7280" },
  barBg: {
    width: "100%",
    height: 8,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 999,
  },
  barFill: { height: "100%", borderRadius: 999, transition: "width 0.4s ease" },
  companyRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0.5rem 0.75rem",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 8,
  },
  companyRank: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "rgba(124,107,255,0.15)",
    color: "#a89cff",
    fontSize: "0.72rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  companyName: { fontSize: "0.85rem", fontWeight: 600 },
  companySub: { fontSize: "0.7rem", color: "#6b7280" },
  offerCount: { fontSize: "0.82rem", color: "#86efac", fontWeight: 600 },
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 12,
  },
  statusCard: { textAlign: "center", padding: "1rem", borderRadius: 10 },
  statusVal: { fontSize: "1.4rem", fontWeight: 700 },
  statusLabel: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 },
  statusPct: { fontSize: "0.7rem", color: "#6b7280", marginTop: 2 },
};
