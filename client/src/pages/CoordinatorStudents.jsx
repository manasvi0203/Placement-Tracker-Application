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

const getInitials    = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const getAvatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export default function CoordinatorStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [profile, setProfile]   = useState(null);
  const [search, setSearch]     = useState("");
  const [statusF, setStatusF]   = useState("");
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading]   = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const loadStudents = () => {
    setLoading(true);
    axios.get("/api/coordinator/students", { headers })
      .then(r => {
        setStudents(r.data);
        setFiltered(r.data);
      })
      .catch(err => console.error("Failed to load students:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token || localStorage.getItem("role") !== "coordinator") {
      navigate("/auth"); return;
    }
    axios.get("/api/auth/me", { headers }).then(r => setProfile(r.data));
    loadStudents();
  }, []);

  useEffect(() => {
    let list = [...students];
    if (search) list = list.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.enrollmentNo || "").toLowerCase().includes(search.toLowerCase())
    );
    if (statusF === "placed") list = list.filter(s => s.isPlaced);
    if (statusF === "active") list = list.filter(s => !s.isPlaced);
    setFiltered(list);
  }, [search, statusF, students]);

  const openStudent = (st) => {
    setSelected(st);
    setEditData({ ...st });
    setActiveTab("profile");
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/coordinator/students/${selected._id}`, {
        branch:   editData.branch,
        cgpa:     editData.cgpa,
        batch:    editData.batch,
        backlogs: editData.backlogs,
        resume:   editData.resume,
        isPlaced: editData.isPlaced,
      }, { headers });
      setSelected(null);
      loadStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update student");
    }
  };

  const getResumeUrl = (resume) => {
    if (!resume) return null;
    if (resume.startsWith("http")) return resume;
    if (resume.startsWith("/uploads")) return `http://localhost:5000${resume}`;
    return null;
  };

  const total   = students.length;
  const placed  = students.filter(s => s.isPlaced).length;
  const active  = total - placed;
  const rate    = total ? Math.round((placed / total) * 100) : 0;

  return (
    <div style={s.root}>
      <CoordinatorSidebar active="students" />

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.title}>Students</h1>
            <p style={s.sub}>
              {profile?.department
                ? <><strong style={{ color: "#a89cff" }}>{profile.department}</strong> department · verify and update profiles</>
                : "Your department · verify and update profiles"}
            </p>
          </div>
          <button style={s.exportBtn} onClick={() => exportCSV(filtered)}>Export CSV</button>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {[
            { label: "Total",       value: total,      color: "#7c6bff" },
            { label: "Placed",      value: placed,     color: "#86efac" },
            { label: "Active",      value: active,     color: "#fcd34d" },
            { label: "Placement %", value: `${rate}%`, color: "#93c5fd" },
          ].map(c => (
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
            placeholder="Search name, enrollment no. or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select style={s.select} value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="">All status</option>
            <option value="placed">Placed</option>
            <option value="active">Active</option>
          </select>
          <span style={s.count}>{filtered.length} students</span>
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          {loading ? (
            <div style={s.loadingBox}>
              <p style={s.loadingText}>Loading students...</p>
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {["Student","Enroll no.","CGPA","Batch","Backlogs","Resume","Applications","Status",""].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ ...s.td, textAlign: "center", color: "#6b7280", padding: "2.5rem" }}>
                      {students.length === 0
                        ? "No students found in your department."
                        : "No students match your filters."}
                    </td>
                  </tr>
                ) : filtered.map(st => {
                  const av        = getAvatarColor(st.name);
                  const resumeUrl = getResumeUrl(st.resume);
                  return (
                    <tr key={st._id}>
                      {/* Student */}
                      <td style={s.td}>
                        <div style={s.studentCell}>
                          <div style={{ ...s.avatar, background: av.bg, color: av.color }}>
                            {getInitials(st.name)}
                          </div>
                          <div>
                            <p style={s.studentName}>{st.name}</p>
                            <p style={s.studentEmail}>{st.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Enrollment */}
                      <td style={s.td}>
                        <span style={s.enrollBadge}>{st.enrollmentNo || "—"}</span>
                      </td>
                      <td style={s.td}>{st.cgpa || "—"}</td>
                      <td style={s.td}>{st.batch || "—"}</td>
                      {/* Backlogs */}
                      <td style={s.td}>
                        <span style={st.backlogs > 0 ? s.backlogBad : s.backlogGood}>
                          {st.backlogs ?? 0}
                        </span>
                      </td>
                      {/* Resume */}
                      <td style={s.td}>
                        {resumeUrl ? (
                          <a href={resumeUrl} target="_blank" rel="noreferrer" style={s.resumeLink}>
                            View PDF
                          </a>
                        ) : (
                          <span style={s.noResume}>Not uploaded</span>
                        )}
                      </td>
                      <td style={s.td}>{st.applicationCount ?? 0}</td>
                      {/* Status */}
                      <td style={s.td}>
                        <span style={{ ...s.tag, ...(st.isPlaced ? s.tagPlaced : s.tagActive) }}>
                          {st.isPlaced ? "Placed" : "Active"}
                        </span>
                      </td>
                      {/* Action */}
                      <td style={s.td}>
                        <button style={s.editBtn} onClick={() => openStudent(st)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <p style={s.countBottom}>{filtered.length} student{filtered.length !== 1 ? "s" : ""} total</p>
      </div>

      {/* Edit / View modal */}
      {selected && (
        <div style={m.overlay} onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={m.modal}>

            {/* Modal header */}
            <div style={m.header}>
              <div style={m.headerLeft}>
                <div style={{
                  ...m.avatar,
                  background: getAvatarColor(selected.name).bg,
                  color: getAvatarColor(selected.name).color,
                }}>
                  {getInitials(selected.name)}
                </div>
                <div>
                  <h3 style={m.name}>{selected.name}</h3>
                  <p style={m.email}>{selected.email}</p>
                  {selected.enrollmentNo && (
                    <span style={m.enrollBadge}>#{selected.enrollmentNo}</span>
                  )}
                </div>
              </div>
              <button style={m.closeBtn} onClick={() => setSelected(null)}>✕</button>
            </div>

            {/* Tabs */}
            <div style={m.tabs}>
              {["profile", "edit", "resume"].map(t => (
                <button
                  key={t}
                  style={{ ...m.tab, ...(activeTab === t ? m.tabActive : {}) }}
                  onClick={() => setActiveTab(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Profile tab */}
            {activeTab === "profile" && (
              <div style={m.profileGrid}>
                {[
                  ["Branch",        selected.branch        || "—"],
                  ["CGPA",          selected.cgpa           || "—"],
                  ["Batch",         selected.batch          || "—"],
                  ["Backlogs",      selected.backlogs       ?? 0],
                  ["Applications",  selected.applicationCount ?? 0],
                  ["Status",        selected.isPlaced ? "Placed" : "Active"],
                ].map(([k, v]) => (
                  <div key={k} style={m.profileItem}>
                    <p style={m.pLabel}>{k}</p>
                    <p style={{
                      ...m.pVal,
                      color: k === "Status" && selected.isPlaced ? "#86efac" : "#e8eaf0"
                    }}>{v}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Edit tab */}
            {activeTab === "edit" && (
              <div>
                <label style={m.label}>CGPA</label>
                <input style={m.input} type="number" step="0.01" min="0" max="10"
                  value={editData.cgpa || ""}
                  onChange={e => setEditData({ ...editData, cgpa: parseFloat(e.target.value) })} />

                <label style={m.label}>Batch year</label>
                <input style={m.input} placeholder="e.g. 2025"
                  value={editData.batch || ""}
                  onChange={e => setEditData({ ...editData, batch: e.target.value })} />

                <label style={m.label}>Backlogs</label>
                <input style={m.input} type="number" min="0"
                  value={editData.backlogs ?? 0}
                  onChange={e => setEditData({ ...editData, backlogs: parseInt(e.target.value) })} />

                <label style={m.label}>Placement status</label>
                <select style={m.input}
                  value={editData.isPlaced ? "placed" : "active"}
                  onChange={e => setEditData({ ...editData, isPlaced: e.target.value === "placed" })}>
                  <option value="active">Active</option>
                  <option value="placed">Placed</option>
                </select>

                <div style={m.actions}>
                  <button style={m.cancelBtn} onClick={() => setSelected(null)}>Cancel</button>
                  <button style={m.saveBtn} onClick={handleSave}>Save changes</button>
                </div>
              </div>
            )}

            {/* Resume tab */}
            {activeTab === "resume" && (
              <div style={m.resumeTab}>
                {(() => {
                  const url = getResumeUrl(selected.resume);
                  if (url) {
                    return (
                      <div style={m.resumeBox}>
                        <div style={m.resumeIcon}>📄</div>
                        <p style={m.resumeFileName}>
                          {selected.resume.split("/").pop()}
                        </p>
                        <p style={m.resumeMeta}>Uploaded resume</p>
                        <div style={m.resumeActions}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            style={m.viewBtn}
                          >
                            Open PDF
                          </a>
                          <a
                            href={url}
                            download
                            style={m.downloadBtn}
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div style={m.noResumeBox}>
                      <div style={m.resumeIcon}>📭</div>
                      <p style={m.noResumeText}>No resume uploaded yet</p>
                      <p style={m.noResumeSub}>The student hasn't uploaded their resume.</p>
                    </div>
                  );
                })()}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

function exportCSV(students) {
  const headers = ["Name","Enroll no.","Email","CGPA","Batch","Backlogs","Status"];
  const rows    = students.map(s => [
    s.name, s.enrollmentNo || "", s.email,
    s.cgpa, s.batch, s.backlogs ?? 0,
    s.isPlaced ? "Placed" : "Active",
  ]);
  const csv  = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "department_students.csv"; a.click();
  URL.revokeObjectURL(url);
}

const s = {
  root: { display: "flex", background: "#0f1117", color: "#e8eaf0", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, padding: "1.5rem", overflowY: "auto" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" },
  title: { fontSize: "1.15rem", fontWeight: 700 },
  sub: { fontSize: "0.78rem", color: "#6b7280", marginTop: 3 },
  exportBtn: { padding: "0.5rem 1rem", background: "rgba(124,107,255,0.12)", border: "1px solid rgba(124,107,255,0.3)", color: "#a89cff", borderRadius: 8, fontSize: "0.82rem", cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: "1.25rem" },
  statCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1rem 1.25rem" },
  statLabel: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 6 },
  statVal: { fontSize: "1.5rem", fontWeight: 700 },
  filterRow: { display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" },
  input: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e8eaf0", fontSize: "0.85rem", padding: "0.5rem 0.85rem", outline: "none", width: 280 },
  select: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e8eaf0", fontSize: "0.85rem", padding: "0.5rem 0.75rem", colorScheme: "dark" },
  count: { marginLeft: "auto", fontSize: "0.75rem", color: "#6b7280" },
  tableWrap: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" },
  loadingBox: { padding: "3rem", textAlign: "center" },
  loadingText: { color: "#6b7280", fontSize: "0.875rem" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" },
  th: { textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: "0.72rem", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", textTransform: "uppercase", whiteSpace: "nowrap" },
  td: { padding: "11px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#e8eaf0", verticalAlign: "middle" },
  studentCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0 },
  studentName: { fontSize: "0.875rem", fontWeight: 600 },
  studentEmail: { fontSize: "0.72rem", color: "#6b7280", marginTop: 2 },
  enrollBadge: { display: "inline-block", padding: "2px 7px", borderRadius: 5, background: "rgba(124,107,255,0.12)", color: "#a89cff", fontSize: "0.7rem", fontWeight: 600, fontFamily: "monospace" },
  backlogGood: { display: "inline-block", padding: "2px 8px", borderRadius: 999, background: "rgba(34,197,94,0.1)", color: "#86efac", fontSize: "0.72rem", fontWeight: 600 },
  backlogBad:  { display: "inline-block", padding: "2px 8px", borderRadius: 999, background: "rgba(239,68,68,0.1)", color: "#fca5a5", fontSize: "0.72rem", fontWeight: 600 },
  resumeLink: { color: "#7c6bff", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none" },
  noResume: { color: "#4b5563", fontSize: "0.78rem" },
  tag: { display: "inline-block", padding: "2px 9px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600 },
  tagPlaced: { background: "rgba(34,197,94,0.13)", color: "#86efac" },
  tagActive: { background: "rgba(255,255,255,0.07)", color: "#6b7280" },
  editBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "rgba(124,107,255,0.12)", border: "1px solid rgba(124,107,255,0.3)", color: "#a89cff", borderRadius: 7, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" },
  countBottom: { fontSize: "0.72rem", color: "#6b7280", marginTop: "0.75rem" },
};

const m = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#171a23", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "1.5rem", width: 440, maxHeight: "88vh", overflowY: "auto", color: "#e8eaf0", fontFamily: "'Segoe UI', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, flexShrink: 0 },
  name: { fontSize: "1rem", fontWeight: 700, marginBottom: 2 },
  email: { fontSize: "0.75rem", color: "#6b7280" },
  enrollBadge: { display: "inline-block", marginTop: 4, padding: "2px 8px", borderRadius: 6, background: "rgba(124,107,255,0.12)", color: "#a89cff", fontSize: "0.7rem", fontWeight: 600, fontFamily: "monospace" },
  closeBtn: { background: "transparent", border: "none", color: "#6b7280", fontSize: "1rem", cursor: "pointer" },
  tabs: { display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "1.25rem" },
  tab: { flex: 1, padding: "0.55rem", background: "transparent", border: "none", borderBottomWidth: "2px", borderBottomStyle: "solid", borderBottomColor: "transparent", color: "#6b7280", fontSize: "0.875rem", cursor: "pointer" },
  tabActive: { color: "#7c6bff", borderBottomColor: "#7c6bff", fontWeight: 600 },
  profileGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "1rem" },
  profileItem: {},
  pLabel: { fontSize: "0.72rem", color: "#6b7280" },
  pVal: { fontSize: "0.85rem", fontWeight: 500, marginTop: 3 },
  label: { display: "block", fontSize: "0.78rem", color: "#9ca3af", marginBottom: "0.3rem", marginTop: "0.85rem" },
  input: { width: "100%", padding: "0.6rem 0.85rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#e8eaf0", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", colorScheme: "dark" },
  actions: { display: "flex", gap: 10, marginTop: "1.5rem" },
  cancelBtn: { flex: 1, padding: "0.65rem", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#e8eaf0", borderRadius: 8, fontSize: "0.875rem", cursor: "pointer" },
  saveBtn: { flex: 1, padding: "0.65rem", background: "#7c6bff", border: "none", color: "#fff", borderRadius: 8, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" },
  resumeTab: { marginTop: "0.5rem" },
  resumeBox: { textAlign: "center", padding: "2rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" },
  resumeIcon: { fontSize: "2.5rem", marginBottom: "0.75rem" },
  resumeFileName: { fontSize: "0.9rem", fontWeight: 600, color: "#e8eaf0", marginBottom: 4 },
  resumeMeta: { fontSize: "0.75rem", color: "#6b7280", marginBottom: "1.25rem" },
  resumeActions: { display: "flex", gap: 10, justifyContent: "center" },
  viewBtn: { padding: "0.55rem 1.25rem", background: "#7c6bff", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 },
  downloadBtn: { padding: "0.55rem 1.25rem", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#e8eaf0", borderRadius: 8, textDecoration: "none", fontSize: "0.85rem" },
  noResumeBox: { textAlign: "center", padding: "2rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.1)" },
  noResumeText: { fontSize: "0.9rem", fontWeight: 600, color: "#6b7280", marginBottom: 6 },
  noResumeSub: { fontSize: "0.75rem", color: "#4b5563" },
};