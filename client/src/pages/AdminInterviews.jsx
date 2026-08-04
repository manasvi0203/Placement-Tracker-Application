import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";

const ROUND_TYPES = [
  "Aptitude",
  "Technical",
  "Coding",
  "HR",
  "Group Discussion",
  "Final",
];
const EMPTY_ROUND = {
  driveId: "",
  company: "",
  role: "",
  roundNo: 1,
  type: "",
  date: "",
  time: "",
  venue: "",
  isOnline: false,
  link: "",
};

export default function AdminInterviews() {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState([]);
  const [drives, setDrives] = useState([]);
  const [tab, setTab] = useState("rounds"); //controls which section of the page is visible
  const [search, setSearch] = useState(""); 
  const [statusF, setStatusF] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_ROUND);
  const [editRound, setEditRound] = useState(null);
  const [showUpload, setShowUpload] = useState(false); //for uploading shortlisted candidates
  const [uploadRound, setUploadRound] = useState(null); //interview round for which a person is shortlisted
  const [uploadFile, setUploadFile] = useState(null);
  const [shortlisted, setShortlisted] = useState([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const loadAll = () => {
    //loads all interview rounds
    axios
      .get("/api/admin/interviews", { headers }) 
      .then((r) => setRounds(r.data));
    
    //loads all placement drives
    axios
       .get("/api/drives", { headers }).then((r) => setDrives(r.data)); 

    //loads all shortlisted students
    axios
      .get("/api/admin/shortlisted", { headers })
      .then((r) => setShortlisted(r.data));
  };

  //authentication check
  useEffect(() => {
    if (!token || localStorage.getItem("role") !== "tpo") {
      navigate("/auth");
      return;
    }
    loadAll();
  }, []);

  //if interview round is coming
  const isUpcoming = (r) => {
     if (r.completed) return false; //if manually marked done, treat as completed
     const roundDate = new Date(r.date);
     return roundDate >= new Date();
  };

  //filter interview rounds
  const filtered = rounds
    .filter((r) => {
      if (search && !r.company.toLowerCase().includes(search.toLowerCase()))
        return false;

      if (statusF === "upcoming" && !isUpcoming(r)) return false;
      if (statusF === "completed" && isUpcoming(r)) return false;

      return true;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  //populate form if drive exists
  const handleDriveSelect = (driveId) => {
    const drive = drives.find((d) => d._id === driveId);

    if (drive)
      setForm({ ...form, driveId, company: drive.company, role: drive.role });

    else setForm({ ...form, driveId, company: "", role: "" });
  };

  //save in add/edit interview round modal
  const handleSave = async () => {
    if (!form.driveId || !form.type || !form.date || !form.time) {
      alert("Please fill drive, type, date and time");
      return;
    }
    try {
      if (editRound) {
        await axios.put(`/api/admin/interviews/${editRound._id}`, form, {
          headers,
        });
      } else {
        await axios.post("/api/admin/interviews", form, { headers });
      }
      setShowModal(false);
      setForm(EMPTY_ROUND);
      setEditRound(null);
      loadAll();
    } 
    catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    }
  };

  //deletes an interview round
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this interview round?")) return;

    await axios.delete(`/api/admin/interviews/${id}`, { headers });
    loadAll();
  };

  //marks interview completed manually
  const handleMarkComplete = async (round) => {
  try {
    await axios.put(`/api/admin/interviews/${round._id}`,
      { ...round, completed: true, date: round.date, time: round.time },
      { headers }
    );
    loadAll();
  } 
  catch (err) {
    alert(err.response?.data?.message || "Failed to mark as done");
  }
};
  
  //opens interviw modal in edit mode
  const openEdit = (r) => {
    setEditRound(r);
    setForm(r);
    setShowModal(true);
  };

  //when creating a new interview round
  const openAdd = () => {
    setEditRound(null);
    setForm(EMPTY_ROUND);
    setShowModal(true);
  };

  //opens shortlist upload popup
  const openUpload = (r) => {
    setUploadRound(r);
    setUploadFile(null);
    setShowUpload(true);
  };

  //uploads a shortlisted file
  const handleUpload = async () => {
    if (!uploadFile) {
      alert("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("roundId", uploadRound._id);
    formData.append("driveId", uploadRound.driveId);

    try {
      await axios.post("/api/admin/shortlisted/upload", formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      setShowUpload(false);
      setUploadFile(null);
      loadAll();
      alert("Shortlist uploaded and students notified!");
    } 
    catch {
      alert("Upload failed");
    }
  };

  const upcoming = rounds.filter((r) => isUpcoming(r)).length;
  const completed = rounds.filter((r) => !isUpcoming(r)).length;
  const totalShortlisted = shortlisted.length;

  return (
    <div style={s.root}>
      <AdminSidebar active="interviews" />

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.title}>Interviews</h1>
            <p style={s.sub}>
              Schedule rounds and manage shortlisted candidates
            </p>
          </div>
          <button style={s.addBtn} onClick={openAdd}>
            + Schedule round
          </button>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <p style={s.statLabel}>Total rounds</p>
            <p style={{ ...s.statVal, color: "#7c6bff" }}>{rounds.length}</p>
          </div>
          <div
            style={{
              ...s.statCard,
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.2)",
            }}
          >
            <p style={{ ...s.statLabel, color: "#fcd34d" }}>Upcoming</p>
            <p style={{ ...s.statVal, color: "#fcd34d" }}>{upcoming}</p>
          </div>
          <div
            style={{
              ...s.statCard,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <p style={{ ...s.statLabel, color: "#86efac" }}>Completed</p>
            <p style={{ ...s.statVal, color: "#86efac" }}>{completed}</p>
          </div>
          <div
            style={{
              ...s.statCard,
              background: "rgba(124,107,255,0.08)",
              border: "1px solid rgba(124,107,255,0.2)",
            }}
          >
            <p style={{ ...s.statLabel, color: "#a89cff" }}>
              Total shortlisted
            </p>
            <p style={{ ...s.statVal, color: "#a89cff" }}>{totalShortlisted}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {[
            { key: "rounds", label: "Scheduled rounds" },
            { key: "shortlisted", label: "Shortlisted students" },
          ].map((t) => (
            <button
              key={t.key}
              style={{ ...s.tabBtn, ...(tab === t.key ? s.tabActive : {}) }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={s.filterRow}>
          <input
            style={s.input}
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={s.select}
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
          >
            <option value="">All status</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
          <span style={s.count}>{filtered.length} rounds</span>
        </div>

        {/* Rounds tab */}
        {tab === "rounds" && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {[
                    "Company",
                    "Drive / Role",
                    "Round",
                    "Type",
                    "Date & Time",
                    "Venue / Link",
                    "Shortlisted",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th key={h} style={s.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        ...s.td,
                        textAlign: "center",
                        color: "#6b7280",
                        padding: "2rem",
                      }}
                    >
                      No rounds scheduled yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const upcoming = isUpcoming(r);
                    const roundShortlisted = shortlisted.filter(
                      (s) => s.roundId === r._id,
                    ).length;
                    return (
                      <tr
                        key={r._id}
                        style={!upcoming ? { opacity: 0.65 } : {}}
                      >
                        <td style={{ ...s.td, fontWeight: 600 }}>
                          {r.company}
                        </td>
                        <td style={s.td}>{r.role}</td>
                        <td style={s.td}>
                          <span style={s.roundBadge}>Round {r.roundNo}</span>
                        </td>
                        <td style={s.td}>{r.type}</td>
                        <td style={s.td}>
                          <p style={{ fontSize: "0.82rem" }}>
                            {new Date(r.date).toLocaleDateString()}
                          </p>
                          <p style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                            {r.time}
                          </p>
                        </td>
                        <td style={s.td}>
                          {r.isOnline ? (
                            <a
                              href={r.link}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "#7c6bff", fontSize: "0.78rem" }}
                            >
                              {r.link || "Online"}
                            </a>
                          ) : (
                            <span
                              style={{ fontSize: "0.82rem", color: "#9ca3af" }}
                            >
                              {r.venue || "—"}
                            </span>
                          )}
                        </td>
                        <td style={s.td}>
                          {roundShortlisted || r.shortlistedCount || 0}
                        </td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.tag,
                              ...(upcoming ? s.tagUpcoming : s.tagDone),
                            }}
                          >
                            {upcoming ? "Upcoming" : "Completed"}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={s.actionRow}>
                            {upcoming && (
                              <>
                                <button
                                  style={s.btnEdit}
                                  onClick={() => openEdit(r)}
                                >
                                  Edit
                                </button>
                                <button
                                  style={s.btnUpload}
                                  onClick={() => openUpload(r)}
                                >
                                  Upload list
                                </button>
                                <button
                                  style={s.btnComplete}
                                  onClick={() => handleMarkComplete(r)}
                                >
                                  Mark done
                                </button>
                              </>
                            )}
                            {!upcoming && (
                              <button
                                style={s.btnView}
                                onClick={() => openUpload(r)}
                              >
                                View list
                              </button>
                            )}
                            <button
                              style={s.btnDelete}
                              onClick={() => handleDelete(r._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Shortlisted students tab */}
        {tab === "shortlisted" && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {[
                    "Student",
                    "Enroll no.",
                    "Company",
                    "Round",
                    "Shortlisted on",
                    "Status",
                  ].map((h) => (
                    <th key={h} style={s.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shortlisted.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        ...s.td,
                        textAlign: "center",
                        color: "#6b7280",
                        padding: "2rem",
                      }}
                    >
                      No shortlisted students yet.
                    </td>
                  </tr>
                ) : (
                  shortlisted.map((st) => (
                    <tr key={st._id}>
                      <td style={{ ...s.td, fontWeight: 600 }}>
                        {st.studentName}
                      </td>
                      <td style={s.td}>
                        <span style={s.enrollBadge}>
                          {st.enrollmentNo || "—"}
                        </span>
                      </td>
                      <td style={s.td}>{st.company}</td>
                      <td style={s.td}>
                        <span style={s.roundBadge}>Round {st.roundNo}</span>
                      </td>
                      <td style={{ ...s.td, color: "#6b7280" }}>
                        {new Date(st.createdAt).toLocaleDateString()}
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.tag,
                            ...(st.status === "selected"
                              ? s.tagSelected
                              : st.status === "rejected"
                                ? s.tagRejected
                                : s.tagUpcoming),
                          }}
                        >
                          {st.status === "selected"
                            ? "Selected"
                            : st.status === "rejected"
                              ? "Rejected"
                              : "In process"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule round modal */}
      {showModal && (
        <div
          style={m.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div style={m.modal}>
            <div style={m.header}>
              <h3 style={m.title}>
                {editRound ? "Edit round" : "Schedule interview round"}
              </h3>
              <button style={m.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <label style={m.label}>Drive</label>
            <select
              style={m.input}
              value={form.driveId}
              onChange={(e) => handleDriveSelect(e.target.value)}
            >
              <option value="">Select drive</option>
              {drives.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.company} — {d.role}
                </option>
              ))}
            </select>

            {form.company && (
              <div style={m.infoPill}>
                {form.company} · {form.role}
              </div>
            )}

            <div style={m.twoCol}>
              <div>
                <label style={m.label}>Round number</label>
                <select
                  style={m.input}
                  value={form.roundNo}
                  onChange={(e) =>
                    setForm({ ...form, roundNo: parseInt(e.target.value) })
                  }
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      Round {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={m.label}>Round type</label>
                <select
                  style={m.input}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="">Select type</option>
                  {ROUND_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={m.twoCol}>
              <div>
                <label style={m.label}>Date</label>
                <input
                  style={m.input}
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label style={m.label}>Time</label>
                <input
                  style={m.input}
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>

            <div style={m.checkRow}>
              <input
                type="checkbox"
                id="online"
                checked={form.isOnline}
                onChange={(e) =>
                  setForm({ ...form, isOnline: e.target.checked })
                }
              />
              <label
                htmlFor="online"
                style={{
                  fontSize: "0.82rem",
                  color: "#9ca3af",
                  cursor: "pointer",
                }}
              >
                Online interview
              </label>
            </div>

            {form.isOnline ? (
              <>
                <label style={m.label}>Meeting link</label>
                <input
                  style={m.input}
                  placeholder="https://meet.google.com/..."
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                />
              </>
            ) : (
              <>
                <label style={m.label}>Venue</label>
                <input
                  style={m.input}
                  placeholder="e.g. Hall A, Main Block"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                />
              </>
            )}

            <div style={m.actions}>
              <button style={m.cancelBtn} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button style={m.saveBtn} onClick={handleSave}>
                {editRound ? "Save changes" : "Schedule round"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload shortlist modal */}
      {showUpload && (
        <div
          style={m.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUpload(false);
          }}
        >
          <div style={m.modal}>
            <div style={m.header}>
              <div>
                <h3 style={m.title}>Upload shortlisted candidates</h3>
                <p style={m.sub}>
                  {uploadRound?.company} · Round {uploadRound?.roundNo} ·{" "}
                  {uploadRound?.type}
                </p>
              </div>
              <button style={m.closeBtn} onClick={() => setShowUpload(false)}>
                ✕
              </button>
            </div>

            <div style={m.infoBox}>
              <p style={m.infoText}>
                Upload a CSV with columns:{" "}
                <strong>enrollment_no, name, status</strong>. Status should be{" "}
                <code>shortlisted</code> or <code>rejected</code>. Students will
                be notified automatically.
              </p>
            </div>

            <div style={m.sampleRow}>
              <p style={m.sampleText}>Sample format:</p>
              <code style={m.sampleCode}>
                enrollment_no, name, status{"\n"}2025CS001, Rahul Sharma,
                shortlisted{"\n"}2025CS002, Priya Verma, rejected
              </code>
            </div>

            <label style={m.label}>Upload CSV / Excel</label>
            <div style={m.fileBox}>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                style={{ display: "none" }}
                id="shortlist-upload"
                onChange={(e) => setUploadFile(e.target.files[0])}
              />
              <label htmlFor="shortlist-upload" style={m.fileLabel}>
                {uploadFile ? `📄 ${uploadFile.name}` : "Choose file"}
              </label>
              {uploadFile && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    marginTop: 6,
                  }}
                >
                  Selected: {uploadFile.name}
                </p>
              )}
            </div>

            <div style={m.actions}>
              <button style={m.cancelBtn} onClick={() => setShowUpload(false)}>
                Cancel
              </button>
              <button style={m.saveBtn} onClick={handleUpload}>
                Upload &amp; Notify students
              </button>
            </div>
          </div>
        </div>
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
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "transparent",
    color: "#6b7280",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  tabActive: {
    color: "#a89cff",
    borderBottomColor: "#7c6bff",
    fontWeight: 600,
  },
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
    width: 220,
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
  count: { marginLeft: "auto", fontSize: "0.75rem", color: "#6b7280" },
  tableWrap: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" },
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
  td: {
    padding: "11px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    color: "#e8eaf0",
  },
  roundBadge: {
    display: "inline-block",
    padding: "2px 9px",
    borderRadius: 999,
    fontSize: "0.7rem",
    fontWeight: 600,
    background: "rgba(124,107,255,0.12)",
    color: "#a89cff",
  },
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
  tag: {
    display: "inline-block",
    padding: "2px 9px",
    borderRadius: 999,
    fontSize: "0.7rem",
    fontWeight: 600,
  },
  tagUpcoming: { background: "rgba(251,191,36,0.13)", color: "#fcd34d" },
  tagDone: { background: "rgba(34,197,94,0.13)", color: "#86efac" },
  tagSelected: { background: "rgba(34,197,94,0.13)", color: "#86efac" },
  tagRejected: { background: "rgba(239,68,68,0.13)", color: "#fca5a5" },
  actionRow: { display: "flex", gap: 5, flexWrap: "wrap" },
  btnEdit: {
    display: "inline-flex",
    padding: "4px 10px",
    background: "rgba(124,107,255,0.1)",
    border: "1px solid rgba(124,107,255,0.3)",
    color: "#a89cff",
    borderRadius: 6,
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnUpload: {
    display: "inline-flex",
    padding: "4px 10px",
    background: "rgba(59,130,246,0.1)",
    border: "1px solid rgba(59,130,246,0.3)",
    color: "#93c5fd",
    borderRadius: 6,
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnComplete: {
    display: "inline-flex",
    padding: "4px 10px",
    background: "rgba(34,197,94,0.08)",
    border: "1px solid rgba(34,197,94,0.25)",
    color: "#86efac",
    borderRadius: 6,
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnView: {
    display: "inline-flex",
    padding: "4px 10px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#9ca3af",
    borderRadius: 6,
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnDelete: {
    display: "inline-flex",
    padding: "4px 10px",
    background: "rgba(239,68,68,0.06)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#fca5a5",
    borderRadius: 6,
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
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
    width: 460,
    maxHeight: "88vh",
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
  title: { fontSize: "1rem", fontWeight: 700 },
  sub: { fontSize: "0.75rem", color: "#6b7280", marginTop: 3 },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "1rem",
    cursor: "pointer",
  },
  label: {
    display: "block",
    fontSize: "0.78rem",
    color: "#9ca3af",
    marginBottom: "0.3rem",
    marginTop: "0.85rem",
  },
  input: {
    width: "100%",
    padding: "0.6rem 0.85rem",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#e8eaf0",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box",
    colorScheme: "dark",
  },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  infoPill: {
    marginTop: 8,
    padding: "5px 12px",
    background: "rgba(124,107,255,0.1)",
    border: "1px solid rgba(124,107,255,0.2)",
    borderRadius: 999,
    fontSize: "0.78rem",
    color: "#a89cff",
    display: "inline-block",
  },
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: "1rem",
  },
  infoBox: {
    background: "rgba(124,107,255,0.08)",
    border: "1px solid rgba(124,107,255,0.2)",
    borderRadius: 8,
    padding: "0.75rem",
    marginBottom: "1rem",
  },
  infoText: { fontSize: "0.78rem", color: "#9ca3af", lineHeight: 1.6 },
  sampleRow: { marginBottom: "1rem" },
  sampleText: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 6 },
  sampleCode: {
    display: "block",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    padding: "0.6rem 0.75rem",
    fontSize: "0.72rem",
    color: "#9ca3af",
    whiteSpace: "pre",
    fontFamily: "monospace",
  },
  fileBox: {
    border: "1px dashed rgba(255,255,255,0.15)",
    borderRadius: 8,
    padding: "1.25rem",
    textAlign: "center",
  },
  fileLabel: {
    display: "inline-block",
    padding: "0.5rem 1.25rem",
    background: "rgba(124,107,255,0.12)",
    border: "1px solid rgba(124,107,255,0.3)",
    color: "#a89cff",
    borderRadius: 7,
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  actions: { display: "flex", gap: 10, marginTop: "1.5rem" },
  cancelBtn: {
    flex: 1,
    padding: "0.65rem",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#e8eaf0",
    borderRadius: 8,
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  saveBtn: {
    flex: 1,
    padding: "0.65rem",
    background: "#7c6bff",
    border: "none",
    color: "#fff",
    borderRadius: 8,
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
  },
};
