import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import DriveFormModal from "../components/DriveFormModal";

export default function AdminManageDrives() {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState(""); //stores search keyword 
  const [statusF, setStatusF] = useState(""); //stores selected drive status
  const [typeF, setTypeF] = useState(""); //stores placement drive type
  const [showModal, setShowModal] = useState(false); // add/edit drive popup
  const [editDrive, setEditDrive] = useState(null); //shortlist upload popup

  // Shortlist modal
  const [showShortlist, setShowShortlist] = useState(false);
  const [shortlistDrive, setShortlistDrive] = useState(null);
  const [shortlistFile, setShortlistFile] = useState(null);
  const [shortlistType, setShortlistType] = useState("shortlisted"); // shortlisted | selected

  // Offer letter modal
  const [showOffer, setShowOffer] = useState(false);
  const [offerDrive, setOfferDrive] = useState(null);
  const [offerFile, setOfferFile] = useState(null);

  // Announce modal
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [announceDrive, setAnnounceDrive] = useState(null);
  const [announceMsg, setAnnounceMsg] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  //loads all placement drives from backend
  const loadDrives = () => {
    axios.get("/api/drives", { headers }).then((r) => {
      const sorted = [...r.data].sort((a, b) => (a.status === "open" ? -1 : 1));
      setDrives(sorted);
      setFiltered(sorted);
    });
  };
 
  //authentication check
  useEffect(() => {
    if (!token || localStorage.getItem("role") !== "tpo") {
      navigate("/auth");
      return;
    }
    loadDrives();
  }, []);

  //filtering drives - based on status(open/closed) and type(intern/fte/ppo)
  useEffect(() => {
    let list = [...drives];
    if (search)
      list = list.filter(
        (d) =>
          d.company.toLowerCase().includes(search.toLowerCase()) ||
          d.role.toLowerCase().includes(search.toLowerCase()),
      );

    if (statusF) list = list.filter((d) => d.status === statusF);
    if (typeF) list = list.filter((d) => d.type === typeF);
    setFiltered(list);
  }, [search, statusF, typeF, drives]);


  //deletes a placement drive
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this drive? This cannot be undone.")) return;
    try {
      await axios.delete(`/api/admin/drives/${id}`, { headers });
      loadDrives();
    } 
    catch {
      alert("Failed to delete drive");
    }
  };

  //changes placement drive status
  const handleToggleStatus = async (drive) => {
    const newStatus = drive.status === "open" ? "closed" : "open";
    try {
      await axios.put(
        `/api/admin/drives/${drive._id}`,
        { ...drive, status: newStatus },
        { headers },
      );
      loadDrives();
    } catch {
      alert("Failed to update status");
    }
  };

  //uploads shortlisted candidates
  const handleShortlistUpload = async () => {
    if (!shortlistFile) {
      alert("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", shortlistFile);
    formData.append("type", shortlistType);
    formData.append("driveId", shortlistDrive._id);

    try {
      await axios.post("/api/admin/drives/shortlist", formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      setShowShortlist(false);
      setShortlistFile(null);
      alert("Candidates uploaded successfully!");
    } 
    catch {
      alert("Upload failed");
    }
  };

  //uploads offer letters
  const handleOfferUpload = async () => {
    if (!offerFile) {
      alert("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", offerFile);
    formData.append("driveId", offerDrive._id);

    try {
      await axios.post("/api/admin/drives/offer-letters", formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      setShowOffer(false);
      setOfferFile(null);
      alert("Offer letters uploaded!");
    } 
    catch {
      alert("Upload failed");
    }
  };

  //send placement announcements
  const handleAnnounce = async () => {
    if (!announceMsg.trim()) {
      alert("Enter a message");
      return;
    }
    try {
      await axios.post(
        "/api/admin/announcements",
        {
          message: announceMsg,
          driveId: announceDrive._id,
          company: announceDrive.company,
        },
        { headers },
      );
      setShowAnnounce(false);
      setAnnounceMsg("");
      alert("Announcement sent!");
    } catch {
      alert("Failed to send announcement");
    }
  };

  const openAdd = () => {
    setEditDrive(null);
    setShowModal(true);
  };
  const openEdit = (d) => {
    setEditDrive(d);
    setShowModal(true);
  };
  const openShortlist = (d, type) => {
    setShortlistDrive(d);
    setShortlistType(type);
    setShortlistFile(null);
    setShowShortlist(true);
  };
  const openOffer = (d) => {
    setOfferDrive(d);
    setOfferFile(null);
    setShowOffer(true);
  };
  const openAnnounce = (d) => {
    setAnnounceDrive(d);
    setAnnounceMsg("");
    setShowAnnounce(true);
  };

  const openCount = drives.filter((d) => d.status === "open").length;
  const closedCount = drives.filter((d) => d.status === "closed").length;

  return (
    <div style={s.root}>
      <AdminSidebar active="manage" />

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.title}>Manage Drives</h1>
            <p style={s.sub}>
              Create, publish, assign and manage placement drives
            </p>
          </div>
          <button style={s.addBtn} onClick={openAdd}>
            + Add drive
          </button>
        </div>

        {/* Quick stats */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <p style={s.statLabel}>Total drives</p>
            <p style={{ ...s.statVal, color: "#7c6bff" }}>{drives.length}</p>
          </div>
          <div
            style={{
              ...s.statCard,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <p style={{ ...s.statLabel, color: "#86efac" }}>Open</p>
            <p style={{ ...s.statVal, color: "#86efac" }}>{openCount}</p>
          </div>
          <div style={s.statCard}>
            <p style={s.statLabel}>Closed</p>
            <p style={{ ...s.statVal, color: "#6b7280" }}>{closedCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div style={s.filterRow}>
          <input
            style={s.input}
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={s.select}
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
          >
            <option value="">All status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <select
            style={s.select}
            value={typeF}
            onChange={(e) => setTypeF(e.target.value)}
          >
            <option value="">All types</option>
            <option value="FTE">Full-time</option>
            <option value="Intern">Internship</option>
            <option value="Intern+FTE">Intern + FTE</option>
          </select>
          <span style={s.resultCount}>{filtered.length} drives</span>
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {[
                  "Company",
                  "Role",
                  "Type",
                  "Date",
                  "CTC",
                  "Min CGPA",
                  "Branches",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      ...s.th,
                      ...(h === "Actions" ? { minWidth: 180 } : {}),
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
                  <td
                    colSpan={9}
                    style={{
                      ...s.td,
                      color: "#6b7280",
                      textAlign: "center",
                      padding: "2rem",
                    }}
                  >
                    No drives found.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d._id}>
                    <td style={{ ...s.td, fontWeight: 600 }}>{d.company}</td>
                    <td style={s.td}>{d.role}</td>
                    <td style={s.td}>{d.type}</td>
                    <td style={s.td}>
                      {new Date(d.date).toLocaleDateString()}
                    </td>
                    <td style={s.td}>{d.ctc}</td>
                    <td style={s.td}>{d.minCGPA}</td>
                    <td style={s.td}>{d.branches?.join(", ")}</td>
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

                    <td
                      style={{ ...s.td, whiteSpace: "nowrap", minWidth: 180 }}
                    >
                      <div style={s.actionRow}>
                        <button style={s.actionBtn} onClick={() => openEdit(d)}>
                          Edit
                        </button>
                        <button
                          style={{
                            ...s.actionBtn,
                            ...(d.status === "open" ? s.btnClose : s.btnOpen),
                          }}
                          onClick={() => handleToggleStatus(d)}
                        >
                          {d.status === "open" ? "Close" : "Reopen"}
                        </button>
                        <button
                          style={{ ...s.actionBtn, ...s.btnDelete }}
                          onClick={() => handleDelete(d._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p style={s.count}>
          {filtered.length} drive{filtered.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Add/Edit Drive Modal */}
      {showModal && (
        <DriveFormModal
          drive={editDrive}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            loadDrives();
          }}
        />
      )}

      {/* Upload shortlisted / selected candidates modal */}
      {showShortlist && (
        <div
          style={m.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowShortlist(false);
          }}
        >
          <div style={m.modal}>
            <div style={m.header}>
              <div>
                <h3 style={m.title}>
                  {shortlistType === "shortlisted"
                    ? "Upload Shortlisted"
                    : "Upload Final Selected"}{" "}
                  Candidates
                </h3>
                <p style={m.sub}>
                  {shortlistDrive?.company} · {shortlistDrive?.role}
                </p>
              </div>
              <button
                style={m.closeBtn}
                onClick={() => setShowShortlist(false)}
              >
                ✕
              </button>
            </div>

            <div style={m.infoBox}>
              <p style={m.infoText}>
                Upload a CSV or Excel file with student enrollment numbers.
                System will update their application status automatically.
              </p>
            </div>

            <div style={m.tabRow}>
              <button
                style={{
                  ...m.typeBtn,
                  ...(shortlistType === "shortlisted" ? m.typeBtnActive : {}),
                }}
                onClick={() => setShortlistType("shortlisted")}
              >
                Shortlisted (Interview)
              </button>
              <button
                style={{
                  ...m.typeBtn,
                  ...(shortlistType === "selected" ? m.typeBtnActive : {}),
                }}
                onClick={() => setShortlistType("selected")}
              >
                Final Selected (Offer)
              </button>
            </div>

            <label style={m.label}>Upload file (CSV / Excel)</label>
            <div style={m.fileBox}>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                style={{ display: "none" }}
                id="shortlist-file"
                onChange={(e) => setShortlistFile(e.target.files[0])}
              />
              <label htmlFor="shortlist-file" style={m.fileLabel}>
                {shortlistFile ? `📄 ${shortlistFile.name}` : "Choose file"}
              </label>
            </div>

            <div style={m.actions}>
              <button
                style={m.cancelBtn}
                onClick={() => setShowShortlist(false)}
              >
                Cancel
              </button>
              <button style={m.saveBtn} onClick={handleShortlistUpload}>
                Upload & Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer letters modal */}
      {showOffer && (
        <div
          style={m.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowOffer(false);
          }}
        >
          <div style={m.modal}>
            <div style={m.header}>
              <div>
                <h3 style={m.title}>Upload Offer Letters</h3>
                <p style={m.sub}>
                  {offerDrive?.company} · {offerDrive?.role}
                </p>
              </div>
              <button style={m.closeBtn} onClick={() => setShowOffer(false)}>
                ✕
              </button>
            </div>

            <div style={m.infoBox}>
              <p style={m.infoText}>
                Upload offer letters as a ZIP file or individual PDFs. Students
                will be notified automatically.
              </p>
            </div>

            <label style={m.label}>Upload offer letters (PDF / ZIP)</label>
            <div style={m.fileBox}>
              <input
                type="file"
                accept=".pdf,.zip"
                style={{ display: "none" }}
                id="offer-file"
                onChange={(e) => setOfferFile(e.target.files[0])}
              />
              <label htmlFor="offer-file" style={m.fileLabel}>
                {offerFile ? `📄 ${offerFile.name}` : "Choose file"}
              </label>
            </div>

            <div style={m.actions}>
              <button style={m.cancelBtn} onClick={() => setShowOffer(false)}>
                Cancel
              </button>
              <button style={m.saveBtn} onClick={handleOfferUpload}>
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement modal */}
      {showAnnounce && (
        <div
          style={m.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAnnounce(false);
          }}
        >
          <div style={m.modal}>
            <div style={m.header}>
              <div>
                <h3 style={m.title}>Send Drive Notification</h3>
                <p style={m.sub}>
                  {announceDrive?.company} · {announceDrive?.role}
                </p>
              </div>
              <button style={m.closeBtn} onClick={() => setShowAnnounce(false)}>
                ✕
              </button>
            </div>

            <div style={m.infoBox}>
              <p style={m.infoText}>
                This notification will be sent to all eligible students for this
                drive.
              </p>
            </div>

            <label style={m.label}>Message</label>
            <textarea
              style={m.textarea}
              rows={4}
              placeholder={`e.g. ${announceDrive?.company} placement drive is scheduled for ${new Date(announceDrive?.date).toLocaleDateString()}. All eligible students must register by tomorrow.`}
              value={announceMsg}
              onChange={(e) => setAnnounceMsg(e.target.value)}
            />

            <div style={m.actions}>
              <button
                style={m.cancelBtn}
                onClick={() => setShowAnnounce(false)}
              >
                Cancel
              </button>
              <button style={m.saveBtn} onClick={handleAnnounce}>
                Send notification
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
    gridTemplateColumns: "repeat(3,1fr)",
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
  resultCount: { marginLeft: "auto", fontSize: "0.75rem", color: "#6b7280" },
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
  tag: {
    display: "inline-block",
    padding: "2px 9px",
    borderRadius: 999,
    fontSize: "0.7rem",
    fontWeight: 600,
  },
  tagOpen: { background: "rgba(34,197,94,0.13)", color: "#86efac" },
  tagClosed: { background: "rgba(255,255,255,0.07)", color: "#6b7280" },
  actionRow: {
    display: "flex",
    gap: 5,
    flexWrap: "nowrap", // ← was "wrap", now never wraps
    alignItems: "center",
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 8px", // ← slightly tighter padding
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#9ca3af",
    borderRadius: 6,
    fontSize: "0.72rem", // ← slightly smaller font
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnClose: {
    background: "rgba(239,68,68,0.08)",
    borderColor: "rgba(239,68,68,0.25)",
    color: "#fca5a5",
  },
  btnOpen: {
    background: "rgba(34,197,94,0.08)",
    borderColor: "rgba(34,197,94,0.25)",
    color: "#86efac",
  },
  btnShortlist: {
    background: "rgba(124,107,255,0.1)",
    borderColor: "rgba(124,107,255,0.3)",
    color: "#a89cff",
  },
  btnAnnounce: {
    background: "rgba(251,191,36,0.08)",
    borderColor: "rgba(251,191,36,0.25)",
    color: "#fcd34d",
  },
  btnDelete: {
    background: "rgba(239,68,68,0.06)",
    borderColor: "rgba(239,68,68,0.2)",
    color: "#fca5a5",
  },
  dropdown: { position: "relative", display: "inline-block" },
  dropdownMenu: {
    display: "none",
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: 4,
    background: "#1e2130",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    zIndex: 100,
    minWidth: 180,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  },
  dropdownItem: {
    display: "block",
    width: "100%",
    padding: "8px 14px",
    background: "transparent",
    border: "none",
    color: "#e8eaf0",
    fontSize: "0.8rem",
    cursor: "pointer",
    textAlign: "left",
  },
  count: { fontSize: "0.72rem", color: "#6b7280", marginTop: "0.75rem" },
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
    width: 440,
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
  title: { fontSize: "1rem", fontWeight: 700 },
  sub: { fontSize: "0.75rem", color: "#6b7280", marginTop: 3 },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "1rem",
    cursor: "pointer",
  },
  infoBox: {
    background: "rgba(124,107,255,0.08)",
    border: "1px solid rgba(124,107,255,0.2)",
    borderRadius: 8,
    padding: "0.75rem",
    marginBottom: "1rem",
  },
  infoText: { fontSize: "0.78rem", color: "#9ca3af", lineHeight: 1.5 },
  tabRow: { display: "flex", gap: 8, marginBottom: "1rem" },
  typeBtn: {
    flex: 1,
    padding: "0.5rem",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#6b7280",
    borderRadius: 8,
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  typeBtnActive: {
    background: "rgba(124,107,255,0.15)",
    borderColor: "rgba(124,107,255,0.4)",
    color: "#a89cff",
    fontWeight: 600,
  },
  label: {
    display: "block",
    fontSize: "0.78rem",
    color: "#9ca3af",
    marginBottom: "0.4rem",
    marginTop: "0.85rem",
  },
  fileBox: {
    border: "1px dashed rgba(255,255,255,0.15)",
    borderRadius: 8,
    padding: "1rem",
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
  textarea: {
    width: "100%",
    padding: "0.65rem 0.85rem",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#e8eaf0",
    fontSize: "0.875rem",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif",
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
