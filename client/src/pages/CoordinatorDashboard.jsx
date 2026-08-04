import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CoordinatorSidebar from "../components/CoordinatorSidebar";

const AVATAR_COLORS = [
  { bg: "rgba(59,130,246,0.15)",  color: "#93c5fd" },
  { bg: "rgba(124,107,255,0.15)", color: "#a89cff" },
  { bg: "rgba(34,197,94,0.15)",   color: "#86efac" },
  { bg: "rgba(251,191,36,0.15)",  color: "#fcd34d" },
  { bg: "rgba(239,68,68,0.13)",   color: "#fca5a5" },
];
const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const getAvatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [drives, setDrives]           = useState([]);
  const [students, setStudents]       = useState([]);
  const [applications, setApplications] = useState([]);
  const [tab, setTab]                 = useState("drives");
  const [eligibleDrive, setEligibleDrive] = useState(null);
  const [profile, setProfile]         = useState(null);
  const [updating, setUpdating]       = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const loadAll = () => {
    axios.get("/api/auth/me",                  { headers }).then(r => setProfile(r.data));
    axios.get("/api/coordinator/drives",       { headers }).then(r => setDrives(r.data));
    axios.get("/api/coordinator/students",     { headers }).then(r => setStudents(r.data));
    axios.get("/api/coordinator/applications", { headers }).then(r => setApplications(r.data));
  };

  useEffect(() => {
    if (!token || localStorage.getItem("role") !== "coordinator") {
      navigate("/auth"); return;
    }
    loadAll();
  }, []);

  const handleToggleStatus = async (drive) => {
    const newStatus = drive.status === "open" ? "closed" : "open";
    await axios.put(`/api/admin/drives/${drive._id}`, { ...drive, status: newStatus }, { headers });
    loadAll();
  };

  const handleUpdateResult = async (appId, status) => {
    setUpdating(appId + status);
    try {
      await axios.put(`/api/coordinator/applications/${appId}`, { status }, { headers });
      loadAll();
    } catch (err) {
      alert("Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const getEligible = (drive) =>
    students.filter(s => s.cgpa >= drive.minCGPA && drive.branches.includes(s.branch));

  const getPending = () => applications.filter(a => a.status === "interview");

  const getStudentName = (id) => students.find(s => s._id === id)?.name || "—";
  const getEnrollment  = (id) => students.find(s => s._id === id)?.enrollmentNo || "";

  const stats = [
    { label: "Active drives",   value: drives.filter(d => d.status === "open").length, color: "#7c6bff" },
    { label: "Total students",  value: students.length,                                color: "#93c5fd" },
    { label: "Placed",          value: students.filter(s => s.isPlaced).length,        color: "#86efac" },
    { label: "Pending results", value: getPending().length,                            color: "#fcd34d" },
  ];

  const statusButtons = {
    interview: [
      { label: "Select",    next: "selected",  style: s.btnSelect    },
      { label: "Reject",    next: "rejected",  style: s.btnReject    },
    ],
    applied: [
      { label: "Interview", next: "interview", style: s.btnInterview },
      { label: "Select",    next: "selected",  style: s.btnSelect    },
      { label: "Reject",    next: "rejected",  style: s.btnReject    },
    ],
    selected: [
      { label: "Reject",    next: "rejected",  style: s.btnReject    },
      { label: "Interview", next: "interview", style: s.btnInterview },
    ],
    rejected: [
      { label: "Interview", next: "interview", style: s.btnInterview },
      { label: "Select",    next: "selected",  style: s.btnSelect    },
    ],
  };

  const badgeStyle = {
    applied:   { background: "rgba(255,255,255,0.08)",  color: "#9ca3af"  },
    interview: { background: "rgba(251,191,36,0.15)",   color: "#fcd34d"  },
    selected:  { background: "rgba(34,197,94,0.15)",    color: "#86efac"  },
    rejected:  { background: "rgba(239,68,68,0.13)",    color: "#fca5a5"  },
  };

  const avatarColor = profile?.name ? getAvatarColor(profile.name) : { bg: "rgba(124,107,255,0.2)", color: "#a89cff" };
  
  return (
    <div style={s.root}>
      <CoordinatorSidebar active="dashboard" />

      <div style={s.main}>
        {/* Topbar */}
        <div style={s.topbar}>
          <div>
            <p style={s.welcome}>Welcome back,</p>
            <h1 style={s.name}>{profile?.name || "Coordinator"}</h1>
            {profile?.department && (
              <span style={s.deptBadge}>{profile.department} Department</span>
            )}
          </div>
          <div style={{ ...s.avatar, background: avatarColor.bg, color: avatarColor.color }}>
                  {getInitials(profile?.name || "CO")}
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {stats.map(st => (
            <div key={st.label} style={s.statCard}>
              <p style={s.statLabel}>{st.label}</p>
              <p style={{ ...s.statVal, color: st.color }}>{st.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {[
            { key: "drives",   label: "Upcoming drives"   },
            { key: "eligible", label: "Eligible students" },
            { key: "results",  label: "Pending results",  badge: getPending().length },
          ].map(t => (
            <button
              key={t.key}
              style={{ ...s.tabBtn, ...(tab === t.key ? s.tabActive : {}) }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.badge > 0 && (
                <span style={s.tabBadge}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Drives tab ── */}
        {tab === "drives" && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Company","Role","Date","Min CGPA","Branches","Status","Actions"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drives.length === 0 ? (
                  <tr><td colSpan={7} style={{ ...s.td, textAlign: "center", color: "#6b7280", padding: "2rem" }}>No drives for your department.</td></tr>
                ) : drives.map(d => (
                  <tr key={d._id}>
                    <td style={{ ...s.td, fontWeight: 600 }}>{d.company}</td>
                    <td style={s.td}>{d.role}</td>
                    <td style={s.td}>{new Date(d.date).toLocaleDateString()}</td>
                    <td style={s.td}>{d.minCGPA}</td>
                    <td style={s.td}>{d.branches?.join(", ")}</td>
                    <td style={s.td}>
                      <span style={{ ...s.tag, ...(d.status === "open" ? s.tagOpen : s.tagClosed) }}>
                        {d.status === "open" ? "Open" : "Closed"}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={s.actionRow}>
                        <button
                          style={s.actionIconBtn}
                          title="View eligible students"
                          onClick={() => { setEligibleDrive(d); setTab("eligible"); }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          Eligible
                        </button>
                        <button
                          style={{ ...s.actionIconBtn, ...(d.status === "open" ? s.btnClose : s.btnOpen) }}
                          title={d.status === "open" ? "Close drive" : "Open drive"}
                          onClick={() => handleToggleStatus(d)}
                        >
                          {d.status === "open" ? (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                              Close
                            </>
                          ) : (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                              Open
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Eligible students tab ── */}
        {tab === "eligible" && (
          <div>
            <div style={s.chipRow}>
              {drives.filter(d => d.status === "open").map(d => (
                <button
                  key={d._id}
                  style={{ ...s.driveChip, ...(eligibleDrive?._id === d._id ? s.driveChipActive : {}) }}
                  onClick={() => setEligibleDrive(d)}
                >
                  {d.company}
                </button>
              ))}
            </div>
            {eligibleDrive ? (
              <div style={s.tableWrap}>
                <div style={s.tableSubHeader}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    {eligibleDrive.company} — {getEligible(eligibleDrive).length} eligible students
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    Min CGPA {eligibleDrive.minCGPA} · {eligibleDrive.branches?.join(", ")}
                  </p>
                </div>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["Student","Enroll no.","CGPA","Batch","Backlogs","Status"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getEligible(eligibleDrive).length === 0 ? (
                      <tr><td colSpan={6} style={{ ...s.td, textAlign: "center", color: "#6b7280", padding: "1.5rem" }}>No eligible students.</td></tr>
                    ) : getEligible(eligibleDrive).map(st => {
                      const av = getAvatarColor(st.name);
                      return (
                        <tr key={st._id}>
                          <td style={s.td}>
                            <div style={s.studentCell}>
                              <div style={{ ...s.miniAvatar, background: av.bg, color: av.color }}>{getInitials(st.name)}</div>
                              <div>
                                <p style={{ fontSize: "0.85rem", fontWeight: 600 }}>{st.name}</p>
                                <p style={{ fontSize: "0.72rem", color: "#6b7280" }}>{st.email}</p>
                              </div>
                            </div>
                          </td>
                          <td style={s.td}>
                            <span style={s.enrollBadge}>{st.enrollmentNo || "—"}</span>
                          </td>
                          <td style={s.td}>{st.cgpa}</td>
                          <td style={s.td}>{st.batch}</td>
                          <td style={s.td}>
                            <span style={st.backlogs > 0 ? s.backlogBad : s.backlogGood}>{st.backlogs ?? 0}</span>
                          </td>
                          <td style={s.td}>
                            <span style={{ ...s.tag, ...(st.isPlaced ? s.tagOpen : s.tagClosed) }}>
                              {st.isPlaced ? "Placed" : "Active"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={s.emptyBox}>
                <p style={{ fontSize: "1.5rem", marginBottom: 8 }}>👥</p>
                <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Select a drive above to view eligible students.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Pending results tab ── */}
        {tab === "results" && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Student / Enroll no.","Company","Role","Applied on","Status","Update result"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getPending().length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ ...s.td, textAlign: "center", color: "#6b7280", padding: "2rem" }}>
                      No pending results.
                    </td>
                  </tr>
                ) : getPending().map(app => {
                  const name   = getStudentName(app.student);
                  const enroll = getEnrollment(app.student);
                  const av     = getAvatarColor(name);
                  const btns   = statusButtons[app.status] || [];
                  return (
                    <tr key={app._id}>
                      <td style={s.td}>
                        <div style={s.studentCell}>
                          <div style={{ ...s.miniAvatar, background: av.bg, color: av.color }}>{getInitials(name)}</div>
                          <div>
                            <p style={{ fontSize: "0.85rem", fontWeight: 600 }}>{name}</p>
                            {enroll && <p style={{ fontSize: "0.7rem", color: "#a89cff", fontFamily: "monospace" }}>#{enroll}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{app.company}</td>
                      <td style={{ ...s.td, color: "#9ca3af" }}>{app.role}</td>
                      <td style={{ ...s.td, color: "#6b7280" }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td style={s.td}>
                        <span style={{ ...s.tag, ...badgeStyle[app.status] }}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={s.actionRow}>
                          {btns.map(btn => (
                            <button
                              key={btn.next}
                              style={{ ...s.resultBtn, ...btn.style }}
                              disabled={updating === app._id + btn.next}
                              onClick={() => handleUpdateResult(app._id, btn.next)}
                            >
                              {updating === app._id + btn.next ? "..." : btn.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", background: "#0f1117", color: "#e8eaf0", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, padding: "1.5rem", overflowY: "auto" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  welcome: { fontSize: "0.8rem", color: "#6b7280" },
  name: { fontSize: "1.2rem", fontWeight: 700, marginTop: 2, marginBottom: 4 },
  deptBadge: { display: "inline-block", padding: "2px 10px", borderRadius: 999, background: "rgba(124,107,255,0.12)", color: "#a89cff", fontSize: "0.72rem", fontWeight: 600 },
  avatar: { width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: "1.5rem" },
  statCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1rem 1.25rem" },
  statLabel: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 6 },
  statVal: { fontSize: "1.5rem", fontWeight: 700 },
  tabs: { display: "flex", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "1rem" },
  tabBtn: { display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", background: "transparent", border: "none", borderBottomWidth: "2px", borderBottomStyle: "solid", borderBottomColor: "transparent", color: "#6b7280", fontSize: "0.85rem", cursor: "pointer" },
  tabActive: { color: "#a89cff", borderBottomColor: "#7c6bff", fontWeight: 600 },
  tabBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18, borderRadius: 999, background: "#fcd34d", color: "#0f1117", fontSize: "0.65rem", fontWeight: 700, padding: "0 4px" },
  tableWrap: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" },
  tableSubHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(124,107,255,0.05)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" },
  th: { textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: "0.72rem", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", textTransform: "uppercase", whiteSpace: "nowrap" },
  td: { padding: "11px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#e8eaf0" },
  tag: { display: "inline-block", padding: "2px 9px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600 },
  tagOpen: { background: "rgba(34,197,94,0.13)", color: "#86efac" },
  tagClosed: { background: "rgba(255,255,255,0.07)", color: "#6b7280" },
  chipRow: { display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" },
  driveChip: { padding: "5px 14px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#9ca3af" },
  driveChipActive: { background: "rgba(124,107,255,0.15)", borderColor: "rgba(124,107,255,0.4)", color: "#a89cff" },
  studentCell: { display: "flex", alignItems: "center", gap: 8 },
  miniAvatar: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, flexShrink: 0 },
  enrollBadge: { display: "inline-block", padding: "2px 7px", borderRadius: 5, background: "rgba(124,107,255,0.12)", color: "#a89cff", fontSize: "0.7rem", fontWeight: 600, fontFamily: "monospace" },
  backlogGood: { display: "inline-block", padding: "2px 8px", borderRadius: 999, background: "rgba(34,197,94,0.1)", color: "#86efac", fontSize: "0.72rem", fontWeight: 600 },
  backlogBad:  { display: "inline-block", padding: "2px 8px", borderRadius: 999, background: "rgba(239,68,68,0.1)", color: "#fca5a5", fontSize: "0.72rem", fontWeight: 600 },
  emptyBox: { textAlign: "center", padding: "3rem 0" },
  actionRow: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" },
  actionIconBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", borderRadius: 7, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" },
  btnClose: { background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)", color: "#fca5a5" },
  btnOpen:  { background: "rgba(34,197,94,0.08)",  borderColor: "rgba(34,197,94,0.25)",  color: "#86efac" },
  resultBtn: { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", border: "1px solid" },
  btnSelect:    { background: "rgba(34,197,94,0.1)",  borderColor: "rgba(34,197,94,0.3)",  color: "#86efac" },
  btnReject:    { background: "rgba(239,68,68,0.1)",  borderColor: "rgba(239,68,68,0.3)",  color: "#fca5a5" },
  btnInterview: { background: "rgba(251,191,36,0.1)", borderColor: "rgba(251,191,36,0.3)", color: "#fcd34d" },
};