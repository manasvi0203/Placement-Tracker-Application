import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CoordinatorSidebar from "../components/CoordinatorSidebar";

const AVATAR_COLORS = [
  { bg: "rgba(59,130,246,0.15)", color: "#93c5fd" },
  { bg: "rgba(124,107,255,0.15)", color: "#a89cff" },
  { bg: "rgba(34,197,94,0.15)", color: "#86efac" },
  { bg: "rgba(251,191,36,0.15)", color: "#fcd34d" },
  { bg: "rgba(239,68,68,0.13)", color: "#fca5a5" },
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getAvatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export default function CoordinatorResults() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("");
  const [companyF, setCompanyF] = useState("");
  const [updating, setUpdating] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const loadAll = () => {
    axios
      .get("/api/coordinator/applications", { headers })
      .then((r) => setApplications(r.data));
    axios
      .get("/api/coordinator/students", { headers })
      .then((r) => setStudents(r.data));
  };

  useEffect(() => {
    if (!token || localStorage.getItem("role") !== "coordinator") {
      navigate("/auth");
      return;
    }
    axios.get("/api/auth/me", { headers }).then((r) => setProfile(r.data));
    loadAll();
  }, []);

  const getStudentName = (id) =>
    students.find((s) => s._id === id)?.name || "—";
  const getEnrollment = (id) =>
    students.find((s) => s._id === id)?.enrollmentNo || "";

  const companies = [...new Set(applications.map((a) => a.company))];

  const visible = applications.filter((a) => {
    const name = getStudentName(a.student).toLowerCase();
    const enroll = getEnrollment(a.student).toLowerCase();
    if (
      search &&
      !name.includes(search.toLowerCase()) &&
      !enroll.includes(search.toLowerCase()) &&
      !a.company.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (statusF && a.status !== statusF) return false;
    if (companyF && a.company !== companyF) return false;
    return true;
  });

  // Group by company
  const grouped = visible.reduce((acc, app) => {
    if (!acc[app.company]) acc[app.company] = [];
    acc[app.company].push(app);
    return acc;
  }, {});

  const handleUpdate = async (appId, status) => {
    setUpdating(appId + status);
    try {
      await axios.put(
        `/api/coordinator/applications/${appId}`,
        { status },
        { headers },
      );
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const total = applications.length;
  const interview = applications.filter((a) => a.status === "interview").length;
  const selected = applications.filter((a) => a.status === "selected").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;

  const statusButtons = {
    applied: [
      { label: "Interview", next: "interview", style: s.btnInterview },
      { label: "Select", next: "selected", style: s.btnSelect },
      { label: "Reject", next: "rejected", style: s.btnReject },
    ],
    interview: [
      { label: "Select", next: "selected", style: s.btnSelect },
      { label: "Reject", next: "rejected", style: s.btnReject },
    ],
    selected: [
      { label: "Reject", next: "rejected", style: s.btnReject },
      { label: "Interview", next: "interview", style: s.btnInterview },
    ],
    rejected: [
      { label: "Interview", next: "interview", style: s.btnInterview },
      { label: "Select", next: "selected", style: s.btnSelect },
    ],
  };

  const currentBadge = {
    applied: { label: "Applied", style: s.badgeApplied },
    interview: { label: "Interview", style: s.badgeInterview },
    selected: { label: "Selected", style: s.badgeSelected },
    rejected: { label: "Rejected", style: s.badgeRejected },
  };

  return (
    <div style={s.root}>
      <CoordinatorSidebar active="results" />

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.title}>Results</h1>
            <p style={s.sub}>
              {profile?.department || "Your"} department · update placement
              outcomes
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <p style={s.statLabel}>Total</p>
            <p style={{ ...s.statVal, color: "#7c6bff" }}>{total}</p>
          </div>
          <div
            style={{
              ...s.statCard,
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.2)",
            }}
          >
            <p style={{ ...s.statLabel, color: "#fcd34d" }}>Interview</p>
            <p style={{ ...s.statVal, color: "#fcd34d" }}>{interview}</p>
          </div>
          <div
            style={{
              ...s.statCard,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <p style={{ ...s.statLabel, color: "#86efac" }}>Selected</p>
            <p style={{ ...s.statVal, color: "#86efac" }}>{selected}</p>
          </div>
          <div
            style={{
              ...s.statCard,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <p style={{ ...s.statLabel, color: "#fca5a5" }}>Rejected</p>
            <p style={{ ...s.statVal, color: "#fca5a5" }}>{rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div style={s.filterRow}>
          <input
            style={s.input}
            placeholder="Search name, enrollment no. or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={s.select}
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
          >
            <option value="">All status</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            style={s.select}
            value={companyF}
            onChange={(e) => setCompanyF(e.target.value)}
          >
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Grouped table */}
        <div style={s.tableWrap}>
          {/* Table header */}
          <div style={s.tableHeader}>
            {[
              "Student / Enroll no.",
              "Role",
              "Applied on",
              "Status",
              "Update result",
            ].map((h) => (
              <p key={h} style={s.th}>
                {h}
              </p>
            ))}
          </div>

          {Object.keys(grouped).length === 0 ? (
            <div style={s.emptyBox}>
              <p style={s.emptyText}>No applications found.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([company, apps]) => (
              <div key={company}>
                {/* Company group header */}
                <div style={s.companyHeader}>
                  <div style={s.companyLeft}>
                    <div style={s.companyDot} />
                    <p style={s.companyName}>{company}</p>
                  </div>
                  <span style={s.companyCount}>
                    {apps.length} application{apps.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Student rows */}
                {apps.map((app) => {
                  const name = getStudentName(app.student);
                  const enroll = getEnrollment(app.student);
                  const avatar = getAvatarColor(name);
                  const badge = currentBadge[app.status];
                  const btns = statusButtons[app.status] || [];

                  return (
                    <div key={app._id} style={s.tableRow}>
                      {/* Student cell */}
                      <div style={s.studentCell}>
                        <div
                          style={{
                            ...s.avatar,
                            background: avatar.bg,
                            color: avatar.color,
                          }}
                        >
                          {getInitials(name)}
                        </div>
                        <div>
                          <p style={s.studentName}>{name}</p>
                          <p style={s.enrollNo}>
                            {enroll ? `#${enroll}` : "No enroll no."}
                          </p>
                        </div>
                      </div>

                      {/* Role */}
                      <p style={{ ...s.cell, color: "#9ca3af" }}>{app.role}</p>

                      {/* Date */}
                      <p style={{ ...s.cell, color: "#6b7280" }}>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>

                      {/* Status badge */}
                      <div>
                        <span style={{ ...s.statusBadge, ...badge?.style }}>
                          {badge?.label}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div style={s.actionCell}>
                        {btns.map((btn) => (
                          <button
                            key={btn.next}
                            style={{ ...s.actionBtn, ...btn.style }}
                            disabled={updating === app._id + btn.next}
                            onClick={() => handleUpdate(app._id, btn.next)}
                          >
                            {updating === app._id + btn.next
                              ? "..."
                              : btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <p style={s.count}>
          {visible.length} application{visible.length !== 1 ? "s" : ""} shown
        </p>
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

  filterRow: {
    display: "flex",
    gap: 8,
    marginBottom: "1.25rem",
    flexWrap: "wrap",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#e8eaf0",
    fontSize: "0.85rem",
    padding: "0.5rem 0.85rem",
    outline: "none",
    width: 280,
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

  tableWrap: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1.6fr 1fr 0.8fr 0.9fr 1.6fr",
    gap: 0,
    padding: "10px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
  },
  th: {
    fontSize: "0.7rem",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  companyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 16px",
    background: "rgba(124,107,255,0.07)",
    borderBottom: "1px solid rgba(124,107,255,0.15)",
    borderTop: "1px solid rgba(255,255,255,0.04)",
  },
  companyLeft: { display: "flex", alignItems: "center", gap: 8 },
  companyDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#7c6bff",
    flexShrink: 0,
  },
  companyName: { fontSize: "0.85rem", fontWeight: 700, color: "#a89cff" },
  companyCount: {
    fontSize: "0.72rem",
    color: "#6b7280",
    background: "rgba(255,255,255,0.06)",
    padding: "2px 10px",
    borderRadius: 999,
  },

  tableRow: {
    display: "grid",
    gridTemplateColumns: "1.6fr 1fr 0.8fr 0.9fr 1.6fr",
    gap: 0,
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  studentCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 700,
    flexShrink: 0,
  },
  studentName: { fontSize: "0.875rem", fontWeight: 600, color: "#e8eaf0" },
  enrollNo: { fontSize: "0.7rem", color: "#6b7280", marginTop: 2 },
  cell: { fontSize: "0.82rem", color: "#e8eaf0" },

  statusBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: "0.72rem",
    fontWeight: 600,
  },
  badgeApplied: { background: "rgba(255,255,255,0.08)", color: "#9ca3af" },
  badgeInterview: { background: "rgba(251,191,36,0.15)", color: "#fcd34d" },
  badgeSelected: { background: "rgba(34,197,94,0.15)", color: "#86efac" },
  badgeRejected: { background: "rgba(239,68,68,0.13)", color: "#fca5a5" },

  actionCell: { display: "flex", gap: 5, flexWrap: "wrap" },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid",
    transition: "opacity 0.15s",
  },
  btnSelect: {
    background: "rgba(34,197,94,0.1)",
    borderColor: "rgba(34,197,94,0.3)",
    color: "#86efac",
  },
  btnReject: {
    background: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.3)",
    color: "#fca5a5",
  },
  btnInterview: {
    background: "rgba(251,191,36,0.1)",
    borderColor: "rgba(251,191,36,0.3)",
    color: "#fcd34d",
  },

  emptyBox: { padding: "3rem", textAlign: "center" },
  emptyText: { color: "#6b7280", fontSize: "0.875rem" },
  count: { fontSize: "0.72rem", color: "#6b7280", marginTop: "0.75rem" },
};
