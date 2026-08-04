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

export default function CoordinatorDrives() {
  const navigate = useNavigate();
  const [drives, setDrives]               = useState([]);
  const [profile, setProfile]             = useState(null);
  const [search, setSearch]               = useState("");
  const [statusF, setStatusF]             = useState("");
  const [typeF, setTypeF]                 = useState("");
  const [eligibleDrive, setEligibleDrive] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [showEligible, setShowEligible]   = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const loadDrives = () => {
    axios.get("/api/coordinator/drives", { headers }).then(r => setDrives(r.data));
  };

  useEffect(() => {
    if (!token || localStorage.getItem("role") !== "coordinator") {
      navigate("/auth"); return;
    }
    axios.get("/api/auth/me", { headers }).then(r => setProfile(r.data));
    loadDrives();
  }, []);

  // Filter then sort: open first, closed last
  const visible = drives
    .filter(d => {
      if (search &&
        !d.company.toLowerCase().includes(search.toLowerCase()) &&
        !d.role.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusF && d.status !== statusF) return false;
      if (typeF && d.type !== typeF) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === "open" ? -1 : 1;
    });

  const handleToggleStatus = async (drive) => {
    const newStatus = drive.status === "open" ? "closed" : "open";
    try {
      await axios.put(`/api/admin/drives/${drive._id}`, { ...drive, status: newStatus }, { headers });
      loadDrives();
    } catch {
      alert("Failed to update drive status");
    }
  };

  const openEligible = async (drive) => {
    setEligibleDrive(drive);
    setShowEligible(true);
    try {
      const res = await axios.get(`/api/coordinator/drives/${drive._id}/eligible`, { headers });
      setEligibleStudents(res.data);
    } catch {
      setEligibleStudents([]);
    }
  };

  const total  = drives.length;
  const open   = drives.filter(d => d.status === "open").length;
  const closed = drives.filter(d => d.status === "closed").length;

  return (
    <div style={s.root}>
      <CoordinatorSidebar active="drives" />

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.title}>Placement Drives</h1>
            <p style={s.sub}>
              Drives available for{" "}
              {profile?.department
                ? <strong style={{ color: "#a89cff" }}>{profile.department}</strong>
                : "your"}{" "}
              department
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <p style={s.statLabel}>Total drives</p>
            <p style={{ ...s.statVal, color: "#7c6bff" }}>{total}</p>
          </div>
          <div style={{ ...s.statCard, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <p style={{ ...s.statLabel, color: "#86efac" }}>Open drives</p>
            <p style={{ ...s.statVal, color: "#86efac" }}>{open}</p>
          </div>
          <div style={{ ...s.statCard, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={s.statLabel}>Closed drives</p>
            <p style={{ ...s.statVal, color: "#6b7280" }}>{closed}</p>
          </div>
        </div>

        {/* Filters */}
        <div style={s.filterRow}>
          <input
            style={s.input}
            placeholder="Search company or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select style={s.select} value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="">All status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <select style={s.select} value={typeF} onChange={e => setTypeF(e.target.value)}>
            <option value="">All types</option>
            <option value="FTE">Full-time</option>
            <option value="Intern">Internship</option>
            <option value="Intern+FTE">Intern + FTE</option>
          </select>
          <span style={s.resultCount}>{visible.length} drives</span>
        </div>

        {/* Drive cards */}
        {visible.length === 0 ? (
          <div style={s.emptyBox}>
            <p style={{ fontSize: "2rem", marginBottom: 8 }}>🏢</p>
            <p style={s.emptyText}>No drives found for your department.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {visible.map(d => {
              const isOpen = d.status === "open";
              return (
                <div key={d._id} style={{ ...s.card, ...(isOpen ? s.cardOpen : s.cardClosed) }}>

                  {/* Card header */}
                  <div style={s.cardTop}>
                    <div>
                      <p style={s.company}>{d.company}</p>
                      <p style={s.role}>{d.role}</p>
                    </div>
                    <div style={s.tags}>
                      <span style={{ ...s.tag, ...(isOpen ? s.tagOpen : s.tagClosedStyle) }}>
                        {isOpen ? "Open" : "Closed"}
                      </span>
                      <span style={s.tagType}>{d.type}</span>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div style={s.details}>
                    {[
                      ["CTC",      d.ctc],
                      ["Date",     new Date(d.date).toLocaleDateString()],
                      ["Min CGPA", `${d.minCGPA}+`],
                      ["Slots",    d.slots],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p style={s.detailKey}>{k}</p>
                        <p style={s.detailVal}>{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Card footer actions */}
                  <div style={s.cardBottom}>
                    {isOpen ? (
                      <>
                        <button style={s.eligibleBtn} onClick={() => openEligible(d)}>
                          View eligible students
                        </button>
                        <button style={s.closeBtn} onClick={() => handleToggleStatus(d)}>
                          Close drive
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={s.closedText}>Drive closed</span>
                        <button style={s.reopenBtn} onClick={() => handleToggleStatus(d)}>
                          Reopen drive
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Eligible students modal */}
      {showEligible && (
        <div style={m.overlay} onClick={e => { if (e.target === e.currentTarget) setShowEligible(false); }}>
          <div style={m.modal}>
            <div style={m.header}>
              <div>
                <h3 style={m.title}>{eligibleDrive?.company} — Eligible Students</h3>
                <p style={m.sub}>
                  Min CGPA {eligibleDrive?.minCGPA}+ · {eligibleStudents.length} students eligible
                </p>
              </div>
              <button style={m.closeBtn} onClick={() => setShowEligible(false)}>✕</button>
            </div>

            {eligibleStudents.length === 0 ? (
              <div style={m.emptyBox}>
                <p style={{ fontSize: "1.5rem", marginBottom: 8 }}>👥</p>
                <p style={m.empty}>No eligible students found.</p>
              </div>
            ) : (
              <table style={m.table}>
                <thead>
                  <tr>
                    {["Student","Enroll no.","CGPA","Backlogs","Status"].map(h => (
                      <th key={h} style={m.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eligibleStudents.map(st => {
                    const av = getAvatarColor(st.user?.name || "");
                    return (
                      <tr key={st._id}>
                        <td style={m.td}>
                          <div style={m.studentCell}>
                            <div style={{ ...m.avatar, background: av.bg, color: av.color }}>
                              {getInitials(st.user?.name || "")}
                            </div>
                            <div>
                              <p style={m.studentName}>{st.user?.name}</p>
                              <p style={m.studentEmail}>{st.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={m.td}>
                          <span style={m.enrollBadge}>
                            {st.enrollmentNo ? `#${st.enrollmentNo}` : "—"}
                          </span>
                        </td>
                        <td style={m.td}>{st.cgpa}</td>
                        <td style={m.td}>
                          <span style={st.backlogs > 0 ? m.backlogBad : m.backlogGood}>
                            {st.backlogs ?? 0}
                          </span>
                        </td>
                        <td style={m.td}>
                          <span style={{ ...m.tag, ...(st.isPlaced ? m.tagPlaced : m.tagActive) }}>
                            {st.isPlaced ? "Placed" : "Active"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  root: { display: "flex", background: "#0f1117", color: "#e8eaf0", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, padding: "1.5rem", overflowY: "auto" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" },
  title: { fontSize: "1.15rem", fontWeight: 700 },
  sub: { fontSize: "0.78rem", color: "#6b7280", marginTop: 3 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.25rem" },
  statCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1rem 1.25rem" },
  statLabel: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 6 },
  statVal: { fontSize: "1.5rem", fontWeight: 700 },
  filterRow: { display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" },
  input: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e8eaf0", fontSize: "0.85rem", padding: "0.5rem 0.85rem", outline: "none", width: 230 },
  select: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e8eaf0", fontSize: "0.85rem", padding: "0.5rem 0.75rem", colorScheme: "dark" },
  resultCount: { marginLeft: "auto", fontSize: "0.75rem", color: "#6b7280" },
  emptyBox: { textAlign: "center", padding: "4rem 0" },
  emptyText: { color: "#6b7280", fontSize: "0.875rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1.1rem", display: "flex", flexDirection: "column", gap: 10 },
  cardOpen: { borderColor: "rgba(124,107,255,0.35)" },
  cardClosed: { opacity: 0.55 },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  company: { fontSize: "0.95rem", fontWeight: 700 },
  role: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 2 },
  tags: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" },
  tag: { display: "inline-block", padding: "2px 9px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600 },
  tagOpen: { background: "rgba(34,197,94,0.13)", color: "#86efac" },
  tagClosedStyle: { background: "rgba(255,255,255,0.07)", color: "#6b7280" },
  tagType: { display: "inline-block", padding: "2px 9px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600, background: "rgba(124,107,255,0.12)", color: "#a89cff" },
  details: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "0.75rem" },
  detailKey: { fontSize: "0.68rem", color: "#6b7280" },
  detailVal: { fontSize: "0.82rem", fontWeight: 600, marginTop: 2 },
  cardBottom: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, gap: 8 },
  eligibleBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "rgba(124,107,255,0.12)", border: "1px solid rgba(124,107,255,0.3)", color: "#a89cff", borderRadius: 7, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" },
  closeBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5", borderRadius: 7, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" },
  reopenBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#86efac", borderRadius: 7, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" },
  closedText: { fontSize: "0.75rem", color: "#6b7280" },
};

const m = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#171a23", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "1.5rem", width: 500, maxHeight: "82vh", overflowY: "auto", color: "#e8eaf0", fontFamily: "'Segoe UI', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" },
  title: { fontSize: "1rem", fontWeight: 700 },
  sub: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 },
  closeBtn: { background: "transparent", border: "none", color: "#6b7280", fontSize: "1rem", cursor: "pointer" },
  emptyBox: { textAlign: "center", padding: "1.5rem 0" },
  empty: { fontSize: "0.82rem", color: "#6b7280" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" },
  th: { textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: "0.72rem", padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)", textTransform: "uppercase", whiteSpace: "nowrap" },
  td: { padding: "10px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#e8eaf0", verticalAlign: "middle" },
  studentCell: { display: "flex", alignItems: "center", gap: 8 },
  avatar: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, flexShrink: 0 },
  studentName: { fontSize: "0.85rem", fontWeight: 600 },
  studentEmail: { fontSize: "0.7rem", color: "#6b7280", marginTop: 1 },
  enrollBadge: { display: "inline-block", padding: "2px 7px", borderRadius: 5, background: "rgba(124,107,255,0.12)", color: "#a89cff", fontSize: "0.7rem", fontWeight: 600, fontFamily: "monospace" },
  backlogGood: { display: "inline-block", padding: "2px 8px", borderRadius: 999, background: "rgba(34,197,94,0.1)", color: "#86efac", fontSize: "0.72rem", fontWeight: 600 },
  backlogBad:  { display: "inline-block", padding: "2px 8px", borderRadius: 999, background: "rgba(239,68,68,0.1)", color: "#fca5a5", fontSize: "0.72rem", fontWeight: 600 },
  tag: { display: "inline-block", padding: "2px 9px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600 },
  tagPlaced: { background: "rgba(34,197,94,0.13)", color: "#86efac" },
  tagActive: { background: "rgba(255,255,255,0.07)", color: "#6b7280" },
};