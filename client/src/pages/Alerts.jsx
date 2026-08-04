import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function Alerts() {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    axios.get("/api/drives", { headers }).then((r) => setDrives(r.data));
    axios
      .get("/api/student/profile", { headers })
      .then((r) => setProfile(r.data));
  }, []);

  const isEligible = (d) =>
    profile && profile.cgpa >= d.minCGPA && d.branches.includes(profile.branch);

  const upcoming = drives.filter(
    (d) => d.status === "open" && new Date(d.date) >= new Date(),
  );

  const eligible = upcoming.filter((d) => isEligible(d));
  const ineligible = upcoming.filter((d) => !isEligible(d));

  const daysLeft = (date) => {
    const diff = new Date(date) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${days} days left`;
  };

  const urgencyColor = (date) => {
    const days = Math.ceil(
      (new Date(date) - new Date()) / (1000 * 60 * 60 * 24),
    );
    if (days <= 1) return "#fca5a5";
    if (days <= 3) return "#fcd34d";
    return "#86efac";
  };

  return (
    <div style={s.root}>
      <Sidebar active="alerts" />

      <div style={s.main}>
        <div style={s.topbar}>
          <h1 style={s.title}>Drive Alerts</h1>
          <p style={s.sub}>Upcoming drives matching your profile</p>
        </div>

        {/* Eligible drives */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>✅ You are eligible</span>
            <span style={s.count}>{eligible.length} drives</span>
          </div>

          {eligible.length === 0 ? (
            <div style={s.emptyBox}>
              <p style={s.emptyText}>No upcoming eligible drives right now.</p>
            </div>
          ) : (
            <div style={s.grid}>
              {eligible.map((d) => (
                <div key={d._id} style={s.alertCard}>
                  <div style={s.cardTop}>
                    <div>
                      <p style={s.company}>{d.company}</p>
                      <p style={s.role}>
                        {d.role} · {d.type}
                      </p>
                    </div>
                    <span style={{ ...s.urgency, color: urgencyColor(d.date) }}>
                      {daysLeft(d.date)}
                    </span>
                  </div>
                  <div style={s.cardDetails}>
                    <span style={s.detail}>
                      📅 {new Date(d.date).toLocaleDateString()}
                    </span>
                    <span style={s.detail}>💰 {d.ctc}</span>
                    <span style={s.detail}>🎓 CGPA {d.minCGPA}+</span>
                    <span style={s.detail}>🏢 {d.slots} seats</span>
                  </div>
                  <button
                    style={s.applyBtn}
                    onClick={() => navigate("/drives")}
                  >
                    View & Apply →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ineligible drives */}
        {ineligible.length > 0 && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <span style={{ ...s.sectionTitle, color: "#6b7280" }}>
                🔒 Not eligible
              </span>
              <span style={s.count}>{ineligible.length} drives</span>
            </div>
            <div style={s.grid}>
              {ineligible.map((d) => (
                <div key={d._id} style={{ ...s.alertCard, opacity: 0.5 }}>
                  <div style={s.cardTop}>
                    <div>
                      <p style={s.company}>{d.company}</p>
                      <p style={s.role}>
                        {d.role} · {d.type}
                      </p>
                    </div>
                    <span style={{ ...s.urgency, color: "#6b7280" }}>
                      {daysLeft(d.date)}
                    </span>
                  </div>
                  <div style={s.cardDetails}>
                    <span style={s.detail}>
                      📅 {new Date(d.date).toLocaleDateString()}
                    </span>
                    <span style={s.detail}>💰 {d.ctc}</span>
                    <span style={s.detail}>🎓 CGPA {d.minCGPA}+</span>
                    <span style={s.detail}>🏛️ {d.branches.join(", ")}</span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#6b7280",
                      marginTop: 4,
                    }}
                  >
                    {profile && profile.cgpa < d.minCGPA
                      ? `Your CGPA (${profile.cgpa}) is below the requirement`
                      : `Your branch (${profile?.branch}) is not eligible`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcoming.length === 0 && (
          <div style={s.emptyBox}>
            <p style={{ fontSize: "2rem" }}>🔔</p>
            <p style={s.emptyText}>
              No upcoming drives at the moment. Check back later.
            </p>
          </div>
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
  section: { marginBottom: "2rem" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  sectionTitle: { fontSize: "0.875rem", fontWeight: 600, color: "#e8eaf0" },
  count: {
    fontSize: "0.72rem",
    color: "#6b7280",
    background: "rgba(255,255,255,0.06)",
    padding: "2px 10px",
    borderRadius: 999,
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 },
  alertCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(124,107,255,0.25)",
    borderRadius: 12,
    padding: "1.1rem",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  company: { fontSize: "0.95rem", fontWeight: 700 },
  role: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 2 },
  urgency: {
    fontSize: "0.72rem",
    fontWeight: 700,
    background: "rgba(255,255,255,0.06)",
    padding: "2px 8px",
    borderRadius: 999,
    whiteSpace: "nowrap",
  },
  cardDetails: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 },
  detail: { fontSize: "0.78rem", color: "#9ca3af" },
  applyBtn: {
    padding: "0.5rem",
    background: "rgba(124,107,255,0.15)",
    color: "#a89cff",
    border: "1px solid rgba(124,107,255,0.3)",
    borderRadius: 8,
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  emptyBox: { textAlign: "center", padding: "3rem 0" },
  emptyText: { color: "#6b7280", fontSize: "0.875rem", marginTop: "0.5rem" },
};
