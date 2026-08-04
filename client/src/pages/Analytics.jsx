import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function Analytics() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get("/api/student/applications", { headers })
      .then((r) => setApplications(r.data));
    axios
      .get("/api/student/profile", { headers })
      .then((r) => setProfile(r.data));
  }, []);

  const total = applications.length;
  const applied = applications.filter((a) => a.status === "applied").length;
  const interview = applications.filter((a) => a.status === "interview").length;
  const selected = applications.filter((a) => a.status === "selected").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;
  const successRate = total ? Math.round((selected / total) * 100) : 0;

  const bars = [
    { label: "Applied", value: applied, color: "#93c5fd", max: total },
    { label: "Interview", value: interview, color: "#fcd34d", max: total },
    { label: "Selected", value: selected, color: "#86efac", max: total },
    { label: "Rejected", value: rejected, color: "#fca5a5", max: total },
  ];

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const byMonth = months
    .map((m, i) => ({
      month: m,
      count: applications.filter((a) => new Date(a.createdAt).getMonth() === i)
        .length,
    }))
    .filter((m) => m.count > 0);
  const maxMonth = Math.max(...byMonth.map((m) => m.count), 1);

  return (
    <div style={s.root}>
      <Sidebar active="analytics" />

      <div style={s.main}>
        <div style={s.topbar}>
          <h1 style={s.title}>Analytics</h1>
          <p style={s.sub}>Your placement journey at a glance</p>
        </div>

        {/* Summary cards */}
        <div style={s.statsGrid}>
          {[
            { label: "Total Applied", value: total, color: "#7c6bff" },
            { label: "Interviews", value: interview, color: "#fcd34d" },
            { label: "Offers", value: selected, color: "#86efac" },
            {
              label: "Success Rate",
              value: `${successRate}%`,
              color: "#93c5fd",
            },
          ].map((c) => (
            <div key={c.label} style={s.statCard}>
              <p style={s.statLabel}>{c.label}</p>
              <p style={{ ...s.statVal, color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>

        <div style={s.twoCol}>
          {/* Status breakdown bar chart */}
          <div style={s.card}>
            <p style={s.cardTitle}>Status breakdown</p>
            {total === 0 ? (
              <p style={s.empty}>No applications yet.</p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  marginTop: 8,
                }}
              >
                {bars.map((b) => (
                  <div key={b.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 5,
                      }}
                    >
                      <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                        {b.label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: b.color,
                          fontWeight: 600,
                        }}
                      >
                        {b.value}
                      </span>
                    </div>
                    <div style={s.barBg}>
                      <div
                        style={{
                          ...s.barFill,
                          width: b.max ? `${(b.value / b.max) * 100}%` : "0%",
                          background: b.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monthly activity */}
          <div style={s.card}>
            <p style={s.cardTitle}>Monthly activity</p>
            {byMonth.length === 0 ? (
              <p style={s.empty}>No data yet.</p>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                  height: 140,
                  marginTop: 16,
                  paddingBottom: 24,
                  position: "relative",
                }}
              >
                {byMonth.map((m) => (
                  <div
                    key={m.month}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                      {m.count}
                    </span>
                    <div
                      style={{
                        width: "100%",
                        height: `${(m.count / maxMonth) * 100}px`,
                        background: "rgba(124,107,255,0.6)",
                        borderRadius: "4px 4px 0 0",
                        minHeight: 4,
                      }}
                    />
                    <span style={{ fontSize: "0.65rem", color: "#6b7280" }}>
                      {m.month}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile stats */}
        {profile && (
          <div style={s.card}>
            <p style={s.cardTitle}>Profile eligibility snapshot</p>
            <div style={s.profileGrid}>
              {[
                {
                  label: "CGPA",
                  value: `${profile.cgpa} / 10`,
                  color:
                    profile.cgpa >= 8
                      ? "#86efac"
                      : profile.cgpa >= 7
                        ? "#fcd34d"
                        : "#fca5a5",
                },
                {
                  label: "Backlogs",
                  value: profile.backlogs ?? 0,
                  color: profile.backlogs > 0 ? "#fca5a5" : "#86efac",
                },
                { label: "Branch", value: profile.branch, color: "#e8eaf0" },
                { label: "Batch", value: profile.batch, color: "#e8eaf0" },
                {
                  label: "Placement status",
                  value: profile.isPlaced ? "Placed" : "Active",
                  color: profile.isPlaced ? "#86efac" : "#93c5fd",
                },
                { label: "Applications", value: total, color: "#e8eaf0" },
              ].map((p) => (
                <div key={p.label} style={s.profileItem}>
                  <p style={s.pLabel}>{p.label}</p>
                  <p style={{ ...s.pVal, color: p.color }}>{p.value}</p>
                </div>
              ))}
            </div>
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
  },
  cardTitle: { fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem" },
  empty: { color: "#6b7280", fontSize: "0.82rem", padding: "1rem 0" },
  barBg: {
    width: "100%",
    height: 8,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 999,
  },
  barFill: { height: "100%", borderRadius: 999, transition: "width 0.4s ease" },
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 12,
    marginTop: 8,
  },
  profileItem: {},
  pLabel: { fontSize: "0.72rem", color: "#6b7280" },
  pVal: { fontSize: "0.9rem", fontWeight: 600, marginTop: 3 },
};
