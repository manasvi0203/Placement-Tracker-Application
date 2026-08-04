import { useNavigate } from "react-router-dom";

const links = [
  { icon: "ti-layout-dashboard", label: "Overview",       path: "/admin" },
  { icon: "ti-building",         label: "Manage drives",  path: "/admin/drives" },
  { icon: "ti-users",            label: "Students",       path: "/admin/students" },
  { icon: "ti-building-bank",    label: "Companies",      path: "/admin/companies" },
  { icon: "ti-list-check",       label: "Interviews",     path: "/admin/interviews" },
  { icon: "ti-chart-bar",        label: "Reports",        path: "/admin/reports" },
];

export default function AdminSidebar({ active }) {
  const navigate = useNavigate();
  const logout = () => { localStorage.clear(); navigate("/auth"); };

  return (
    <div style={s.sidebar}>
      <div style={s.brand}>
        <span style={s.logo}>PlaceTrack</span>
        <p style={s.role}>Admin / TPO</p>
      </div>
      {links.map(l => (
        <button
          key={l.path}
          style={{
            ...s.link,
            ...(active === l.label.toLowerCase().split(" ")[0] ? s.active : {}),
          }}
          onClick={() => navigate(l.path)}
        >
          <i className={`ti ${l.icon}`} style={{ fontSize: 17 }} aria-hidden="true" />
          {l.label}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <button style={s.link} onClick={logout}>
        <i className="ti ti-logout" style={{ fontSize: 17 }} aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
}

const s = {
  sidebar: {
    width: 210, minWidth: 210,
    borderRight: "1px solid rgba(255,255,255,0.07)",
    padding: "1.25rem 0.75rem",
    display: "flex", flexDirection: "column", gap: 4,
    background: "#0f1117", minHeight: "100vh",
  },
  brand: {
    padding: "0.5rem 0.75rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    marginBottom: "0.75rem",
  },
  logo: { fontWeight: 700, fontSize: "1.1rem", color: "#7c6bff" },
  role: { fontSize: "0.68rem", color: "#6b7280", marginTop: 2 },
  link: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 14px", borderRadius: 8,
    color: "#9ca3af", fontSize: "0.875rem", cursor: "pointer",
    background: "transparent", border: "none", width: "100%", textAlign: "left",
  },
  active: { background: "rgba(124,107,255,0.12)", color: "#a89cff", fontWeight: 600 },
};