import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function DriveListings() {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setType] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/auth"); return; }
    const headers = { Authorization: `Bearer ${token}` };
    axios.get("/api/drives", { headers }).then((r) => setDrives(r.data));
    axios.get("/api/student/profile", { headers }).then((r) => setProfile(r.data));
  }, []);

  const isEligible = (d) =>
    profile && profile.cgpa >= d.minCGPA && d.branches.includes(profile.branch);

  const visible = drives
  .filter((d) => {
    if (search &&
      !d.company.toLowerCase().includes(search.toLowerCase()) &&
      !d.role.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && d.type !== typeFilter) return false;
    if (filter === "eligible") return d.status === "open" && isEligible(d);
    if (filter === "closed") return d.status === "closed";
    return true;
  })
  .sort((a, b) => {
  const aScore = a.status === "open" && isEligible(a) ? 0
               : a.status === "open" ? 1
               : 2;
  const bScore = b.status === "open" && isEligible(b) ? 0
               : b.status === "open" ? 1
               : 2;
  return aScore - bScore;
});

  const handleApply = async (driveId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("/api/applications", { driveId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Applied successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Already applied or error occurred");
    }
  };

  const chips = ["all", "eligible", "closed"];

  return (
    <div style={s.root}>
      <Sidebar active="drives" />

      <div style={s.main}>

        {/* Sticky topbar */}
        <div style={s.topbar}>
          <div>
            <h1 style={s.title}>Placement Drives</h1>
            <p style={s.sub}>
              {profile
                ? `Showing drives for CGPA ${profile.cgpa} · ${profile.branch}`
                : "Loading your profile..."}
            </p>
          </div>
          <div style={s.controls}>
            <input
              style={s.input}
              placeholder="Search company or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              style={s.select}
              value={typeFilter}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All types</option>
              <option value="FTE">Full-time</option>
              <option value="Intern">Internship</option>
              <option value="Intern+FTE">Intern + FTE</option>
            </select>
          </div>
        </div>

        {/* Filter chips */}
        <div style={s.chips}>
          <span style={s.chipLabel}>Filter:</span>
          {chips.map((c) => (
            <button
              key={c}
              style={{ ...s.chip, ...(filter === c ? s.chipActive : {}) }}
              onClick={() => setFilter(c)}
            >
              {c === "all" ? "All drives" : c === "eligible" ? "Eligible only" : "Closed"}
            </button>
          ))}
          <span style={s.resultCount}>{visible.length} results</span>
        </div>

        {/* Drive cards */}
        {visible.length === 0 ? (
          <div style={s.emptyBox}>
            <p style={{ fontSize: "2rem" }}>🏢</p>
            <p style={s.emptyText}>No drives found matching your filters.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {visible.map((d) => {
              const elig = isEligible(d);
              const closed = d.status === "closed";
              return (
                <div
                  key={d._id}
                  style={{
                    ...s.card,
                    ...(elig && !closed ? s.cardElig : {}),
                    ...(!elig ? s.cardInelig : {}),
                  }}
                >
                  {/* Card header */}
                  <div style={s.cardTop}>
                    <div style={{ flex: 1 }}>
                      <p style={s.company}>{d.company}</p>
                      <p style={s.role}>{d.role}</p>
                    </div>
                    <div style={s.tags}>
                      <span style={{
                        ...s.tag,
                        ...(d.status === "open"
                          ? { background: "rgba(34,197,94,0.13)", color: "#86efac" }
                          : { background: "rgba(255,255,255,0.07)", color: "#6b7280" })
                      }}>
                        {d.status === "open" ? "Open" : "Closed"}
                      </span>
                      <span style={{ ...s.tag, background: "rgba(124,107,255,0.12)", color: "#a89cff" }}>
                        {d.type}
                      </span>
                    </div>
                  </div>

                  {/* Card details */}
                  <div style={s.details}>
                    {[
                      ["💰 CTC / Stipend", d.ctc],
                      ["📅 Drive date",    new Date(d.date).toLocaleDateString()],
                      ["🎓 Min CGPA",      `${d.minCGPA}+`],
                      ["🏛️ Branches",      d.branches.slice(0, 3).join(", ") + (d.branches.length > 3 ? " +more" : "")],
                    ].map(([k, v]) => (
                      <div key={k} style={s.detailItem}>
                        <p style={s.detailKey}>{k}</p>
                        <p style={s.detailVal}>{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Card footer */}
                  <div style={s.cardBottom}>
                    <span style={s.slots}>🪑 {d.slots} seats</span>
                    {!elig ? (
                      <span style={s.notEligBadge}>
                        {profile && profile.cgpa < d.minCGPA ? "Low CGPA" : "Branch mismatch"}
                      </span>
                    ) : closed ? (
                      <span style={s.closedBadge}>Drive closed</span>
                    ) : (
                      <button style={s.applyBtn} onClick={() => handleApply(d._id)}>
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom padding so last card isn't flush against viewport */}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

const s = {
  root: {
    display: "flex",
    background: "#0f1117",
    color: "#e8eaf0",
    height: "100vh",         // full viewport height
    overflow: "hidden",      // prevent double scrollbar
    fontFamily: "'Segoe UI', sans-serif",
  },
  main: {
    flex: 1,
    overflowY: "auto",       // only this panel scrolls
    padding: "1.5rem",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.1rem",
    flexWrap: "wrap",
    gap: 10,
    position: "sticky",      // sticks while scrolling
    top: 0,
    background: "#0f1117",
    paddingTop: "0.25rem",
    paddingBottom: "0.75rem",
    zIndex: 10,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  title: { fontSize: "1.15rem", fontWeight: 700, color: "#e8eaf0" },
  sub: { fontSize: "0.78rem", color: "#9ca3af", marginTop: 3 },
  controls: { display: "flex", gap: 8 },
  input: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    color: "#e8eaf0",
    fontSize: "0.85rem",
    padding: "0.5rem 0.85rem",
    outline: "none",
    width: 210,
  },
  select: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    color: "#e8eaf0",
    fontSize: "0.85rem",
    padding: "0.5rem 0.75rem",
  },
  chips: {
    display: "flex",
    gap: 8,
    marginBottom: "1.25rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  chipLabel: { fontSize: "0.78rem", color: "#6b7280" },
  chip: {
    padding: "4px 14px",
    borderRadius: 999,
    fontSize: "0.72rem",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: "rgba(255,255,255,0.06)",
    color: "#9ca3af",
  },
  chipActive: {
    background: "rgba(124,107,255,0.2)",
    color: "#c4b8ff",
    outline: "1.5px solid #7c6bff",
  },
  resultCount: {
    marginLeft: "auto",
    fontSize: "0.72rem",
    color: "#6b7280",
  },
  emptyBox: { textAlign: "center", padding: "4rem 0" },
  emptyText: { color: "#6b7280", fontSize: "0.875rem", marginTop: "0.5rem" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 14,
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "1.1rem 1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cardElig: {
    borderColor: "rgba(124,107,255,0.4)",
    background: "rgba(124,107,255,0.04)",
  },
  cardInelig: { opacity: 0.5 },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  company: { fontSize: "1rem", fontWeight: 700, color: "#f0f0f0" },
  role: { fontSize: "0.78rem", color: "#9ca3af", marginTop: 3 },
  tags: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" },
  tag: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: "0.7rem",
    fontWeight: 600,
  },
  details: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px 12px",
    background: "rgba(255,255,255,0.02)",
    borderRadius: 8,
    padding: "0.75rem",
  },
  detailItem: {},
  detailKey: { fontSize: "0.68rem", color: "#6b7280", marginBottom: 2 },
  detailVal: { fontSize: "0.82rem", fontWeight: 600, color: "#e8eaf0" },
  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: 10,
  },
  slots: { fontSize: "0.72rem", color: "#9ca3af" },
  notEligBadge: {
    fontSize: "0.72rem",
    color: "#fca5a5",
    background: "rgba(239,68,68,0.1)",
    padding: "2px 10px",
    borderRadius: 999,
  },
  closedBadge: {
    fontSize: "0.72rem",
    color: "#6b7280",
    background: "rgba(255,255,255,0.06)",
    padding: "2px 10px",
    borderRadius: 999,
  },
  applyBtn: {
    padding: "0.45rem 1.2rem",
    background: "#7c6bff",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
  },
};