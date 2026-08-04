import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

     const role = localStorage.getItem("role");
      if (role === "tpo") {
      navigate("/admin");
      return;
     } 

    axios.get("/api/student/profile", { headers }).then((r) => {
      setProfile(r.data);
      setEditData(r.data);
    });
    axios
      .get("/api/student/applications", { headers })
      .then((r) => setApplications(r.data));
    axios
      .get("/api/drives/upcoming", { headers })
      .then((r) => setDrives(r.data));
  }, []);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put("/api/student/profile", editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setShowEdit(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save profile");
    }
  };

  const stats = [
    { label: "Applied", value: applications.length, color: "#7c6bff" },
    {
      label: "Interviews",
      value: applications.filter((a) => a.status === "interview").length,
      color: "#fcd34d",
    },
    {
      label: "Offers",
      value: applications.filter((a) => a.status === "selected").length,
      color: "#86efac",
    },
    { label: "Upcoming", value: drives.length, color: "#93c5fd" },
  ];

  const badgeStyle = {
    applied: { background: "rgba(59,130,246,0.15)", color: "#93c5fd" },
    interview: { background: "rgba(251,191,36,0.15)", color: "#fcd34d" },
    selected: { background: "rgba(34,197,94,0.15)", color: "#86efac" },
    rejected: { background: "rgba(239,68,68,0.13)", color: "#fca5a5" },
  };

  const handleResumeUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.type !== "application/pdf") {
    alert("Only PDF files are allowed");
    return;
  }


  // Rename file to enrollmentNo_name.pdf
  const enroll = profile?.enrollmentNo || "student";
  const name   = (profile?.name || "resume").toLowerCase().replace(/\s+/g, "_");
  const newFileName = `${enroll}_${name}.pdf`;
  const renamedFile = new File([file], newFileName, { type: "application/pdf" });

  const formData = new FormData();
  formData.append("resume", renamedFile);

  const token = localStorage.getItem("token");
  setUploading(true);
  try {
    const res = await axios.post("/api/student/upload-resume", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    setEditData({ ...editData, resume: res.data.resumeUrl });
    alert("Resume uploaded successfully!");
  } catch (err) {
    alert(err.response?.data?.message || "Upload failed");
  } finally {
    setUploading(false);
  }
};


  return (
    <div style={s.root}>
      <Sidebar active="dashboard" />

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <p style={s.welcome}>Welcome back,</p>
            <h1 style={s.name}>{profile?.name || "Student"}</h1>
          </div>
          <div style={s.avatar}>
            {profile?.name
              ?.split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        </div>

        {/* Stat cards */}
        <div style={s.statsGrid}>
          {stats.map((st) => (
            <div key={st.label} style={s.statCard}>
              <p style={s.statLabel}>{st.label}</p>
              <p style={{ ...s.statVal, color: st.color }}>{st.value}</p>
            </div>
          ))}
        </div>

        <div style={s.twoCol}>
          {/* Recent applications */}
          <div style={s.card}>
            <p style={s.cardTitle}>Recent applications</p>
            {applications.length === 0 ? (
              <p style={s.emptyText}>No applications yet.</p>
            ) : (
              applications.slice(0, 4).map((app) => (
                <div key={app._id} style={s.appRow}>
                  <div>
                    <p style={s.appCompany}>{app.company}</p>
                    <p style={s.appRole}>{app.role}</p>
                  </div>
                  <span style={{ ...s.badge, ...badgeStyle[app.status] }}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Upcoming drives */}
          <div style={s.card}>
            <p style={s.cardTitle}>Upcoming drives</p>
            {drives.slice(0, 3).map((d) => {
              const eligible = (profile?.cgpa || 0) >= d.minCGPA;
              return (
                <div
                  key={d._id}
                  style={{
                    ...s.driveRow,
                    borderLeftColor: eligible
                      ? "#7c6bff"
                      : "rgba(124,107,255,0.2)",
                  }}
                >
                  <p
                    style={{
                      ...s.appCompany,
                      color: eligible ? "#e8eaf0" : "#6b7280",
                    }}
                  >
                    {d.company}
                  </p>
                  <p style={s.appRole}>
                    {new Date(d.date).toLocaleDateString()} · {d.role} · CGPA{" "}
                    {d.minCGPA}+
                  </p>
                </div>
              );
            })}
            <button style={s.viewAllBtn} onClick={() => navigate("/drives")}>
              View all drives →
            </button>
          </div>
        </div>

        {/* Profile summary */}
        {profile && (
          <div style={s.card}>
            <div style={s.profileHeader}>
              <p style={s.cardTitle}>Student profile</p>
              <button style={s.editBtn} onClick={() => setShowEdit(true)}>
                ✏️ Edit profile
              </button>
            </div>
            <div style={s.profileGrid}>
              {[
                ["Branch", profile.branch],
                ["CGPA", `${profile.cgpa} / 10`],
                ["Backlogs", profile.backlogs ?? 0],
                ["Batch", profile.batch],
                ["Resume", profile.resume || "Not uploaded"],
                ["Status", profile.isPlaced ? "Placed" : "Active"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p style={s.pLabel}>{k}</p>
                  <p
                    style={{
                      ...s.pVal,
                      color:
                        k === "Status" && profile.isPlaced
                          ? "#86efac"
                          : "#e8eaf0",
                    }}
                  >
                    {v}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div style={m.overlay}>
          <div style={m.modal}>
            <div style={m.modalHeader}>
              <h3 style={m.title}>Edit Profile</h3>
              <button style={m.closeBtn} onClick={() => setShowEdit(false)}>
                ✕
              </button>
            </div>

            <label style={m.label}>Full name</label>
            <input
              style={m.input}
              value={editData.name || ""}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
            />

            <label style={m.label}>Branch</label>
            <select
              style={m.input}
              value={editData.branch || ""}
              onChange={(e) =>
                setEditData({ ...editData, branch: e.target.value })
              }
            >
              <option value="">Select branch</option>
              {["CS", "IT", "EC", "ME", "Civil"].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <label style={m.label}>CGPA</label>
            <input
              style={m.input}
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={editData.cgpa || ""}
              onChange={(e) =>
                setEditData({ ...editData, cgpa: parseFloat(e.target.value) })
              }
            />

            <label style={m.label}>Batch year</label>
            <input
              style={m.input}
              placeholder="e.g. 2025"
              value={editData.batch || ""}
              onChange={(e) =>
                setEditData({ ...editData, batch: e.target.value })
              }
            />

            <label style={m.label}>Backlogs</label>
            <input
              style={m.input}
              type="number"
              min="0"
              value={editData.backlogs ?? 0}
              onChange={(e) =>
                setEditData({ ...editData, backlogs: parseInt(e.target.value) })
              }
            />

            <label style={m.label}>Resume</label>
              <div style={m.resumeRow}>
                <span style={m.resumeName}>
                  {editData.resume ? `📄 ${editData.resume.split("/").pop()}` : "No file chosen"}
                </span>
                <label style={m.uploadBtn}>
                  {uploading ? "Uploading..." : "Upload PDF"}
                  <input
                    type="file"
                    accept=".pdf"
                    style={{ display: "none" }}
                    onChange={handleResumeUpload}
                  />
                </label>
              </div>

              {/* Show download link if resume exists */}
              {editData.resume && (
                <a
                  href={`http://localhost:5000${editData.resume}`}
                  target="_blank"
                  rel="noreferrer"
                  style={m.viewLink}
                >
                  View uploaded resume →
                </a>
              )}

            <div style={m.actions}>
              <button style={m.cancelBtn} onClick={() => setShowEdit(false)}>
                Cancel
              </button>
              <button style={m.saveBtn} onClick={handleSaveProfile}>
                Save changes
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
    marginBottom: "1.5rem",
  },
  welcome: { fontSize: "0.8rem", color: "#6b7280" },
  name: { fontSize: "1.2rem", fontWeight: 700, marginTop: "2px" },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "rgba(124,107,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.85rem",
    color: "#a89cff",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "12px",
    marginBottom: "1.25rem",
  },
  statCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "1rem 1.25rem",
  },
  statLabel: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 6 },
  statVal: { fontSize: "1.6rem", fontWeight: 700 },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "1.25rem",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "1.1rem",
  },
  cardTitle: { fontSize: "0.8rem", fontWeight: 600, marginBottom: "1rem" },
  emptyText: { fontSize: "0.82rem", color: "#6b7280", padding: "0.5rem 0" },
  appRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  appCompany: { fontSize: "0.85rem", fontWeight: 500 },
  appRole: { fontSize: "0.72rem", color: "#6b7280" },
  badge: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 999,
    fontSize: "0.72rem",
    fontWeight: 600,
  },
  driveRow: { borderLeft: "3px solid", paddingLeft: 10, marginBottom: 10 },
  viewAllBtn: {
    marginTop: "0.75rem",
    width: "100%",
    padding: "0.5rem",
    background: "transparent",
    border: "1px solid rgba(124,107,255,0.3)",
    color: "#a89cff",
    borderRadius: 8,
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  profileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  editBtn: {
    padding: "0.35rem 0.85rem",
    background: "rgba(124,107,255,0.12)",
    border: "1px solid rgba(124,107,255,0.3)",
    color: "#a89cff",
    borderRadius: 7,
    fontSize: "0.78rem",
    cursor: "pointer",
  },
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 10,
  },
  pLabel: { fontSize: "0.72rem", color: "#6b7280" },
  pVal: { fontSize: "0.85rem", marginTop: 3 },
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
    width: 400,
    maxHeight: "85vh",
    overflowY: "auto",
    color: "#e8eaf0",
    fontFamily: "'Segoe UI', sans-serif",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  title: { fontSize: "1.05rem", fontWeight: 700 },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "1rem",
    cursor: "pointer",
    padding: "2px 6px",
    borderRadius: 6,
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

  resumeRow: {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  padding: "0.6rem 0.85rem",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
},
resumeName: {
  fontSize: "0.82rem",
  color: "#9ca3af",
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
},
uploadBtn: {
  padding: "0.35rem 0.85rem",
  background: "rgba(124,107,255,0.15)",
  border: "1px solid rgba(124,107,255,0.3)",
  color: "#a89cff",
  borderRadius: 7,
  fontSize: "0.78rem",
  cursor: "pointer",
  whiteSpace: "nowrap",
},
viewLink: {
  display: "block",
  fontSize: "0.75rem",
  color: "#7c6bff",
  marginTop: "0.4rem",
  textDecoration: "none",
},
};