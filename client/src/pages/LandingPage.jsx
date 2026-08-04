import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const stats = [
  { value: "2,400+", label: "Students Tracked" },
  { value: "380+", label: "Companies Visited" },
  { value: "91%", label: "Placement Rate" },
  { value: "₹18L", label: "Avg. Package" },
];

const features = [
  {
    icon: "📋",
    title: "Application Tracker",
    desc: "Log every drive, application status, interview rounds, and outcomes in one place.",
  },
  {
    icon: "🏢",
    title: "Company Database",
    desc: "Browse visiting companies with roles, CTC ranges, and eligibility criteria.",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    desc: "Visual breakdowns by branch, package, and placement trends over semesters.",
  },
  {
    icon: "🔔",
    title: "Drive Alerts",
    desc: "Get notified for upcoming placement drives matching your profile.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={styles.root}>
      {/* Navbar */}
      <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
        <span style={styles.logo}>PlaceTrack</span>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#stats" style={styles.navLink}>Stats</a>
          <button style={styles.navBtn} onClick={() => navigate("/auth")}>
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroBadge}>🎓 For Engineering Colleges</div>
        <h1 style={styles.heroTitle}>
          Track Every <span style={styles.accent}>Placement Drive</span>
          <br />From Application to Offer
        </h1>
        <p style={styles.heroSub}>
          A central platform for students, TPOs, and placement coordinators to
          manage campus recruitment - organized, transparent, and stress-free.
        </p>
        <div style={styles.heroActions}>
          <button
            style={styles.btnPrimary}
            onClick={() => navigate("/auth")}
          >
            Get Started 
          </button>
          
        </div>
      </section>

      {/* Stats */}
      <section id="stats" style={styles.statsSection}>
        {stats.map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>Everything you need</h2>
        <p style={styles.sectionSub}>
          Built specifically for college placement cells - not a generic job board.
        </p>
        <div style={styles.featureGrid}>
          {features.map((f) => (
            <div key={f.title} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to streamline placements?</h2>
        <p style={styles.ctaSub}>
          Join hundreds of colleges already using PlaceTrack.
        </p>
        <button
          style={styles.btnPrimary}
          onClick={() => navigate("/auth")}
        >
          Create Account
        </button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={styles.logo}>PlaceTrack</span>
        <span style={styles.footerNote}>© 2025 · Built with MERN Stack</span>
      </footer>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'Segoe UI', sans-serif",
    background: "#0f1117",
    color: "#e8eaf0",
    minHeight: "100vh",
  },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    zIndex: 100,
    transition: "background 0.3s",
  },
  navScrolled: {
    background: "rgba(15,17,23,0.92)",
    backdropFilter: "blur(8px)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  logo: {
    fontWeight: 700,
    fontSize: "1.25rem",
    color: "#7c6bff",
    letterSpacing: "-0.5px",
  },
  navLinks: { display: "flex", alignItems: "center", gap: "1.5rem" },
  navLink: {
    color: "#9ca3af",
    textDecoration: "none",
    fontSize: "0.9rem",
    transition: "color 0.2s",
  },
  navBtn: {
    background: "transparent",
    border: "1px solid rgba(124,107,255,0.5)",
    color: "#7c6bff",
    padding: "0.4rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  hero: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "6rem 1.5rem 3rem",
    background:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,107,255,0.12) 0%, transparent 70%)",
  },
  heroBadge: {
    display: "inline-block",
    background: "rgba(124,107,255,0.12)",
    border: "1px solid rgba(124,107,255,0.25)",
    color: "#a89cff",
    fontSize: "0.8rem",
    padding: "0.35rem 1rem",
    borderRadius: "999px",
    marginBottom: "1.5rem",
    letterSpacing: "0.02em",
  },
  heroTitle: {
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: "1.25rem",
    letterSpacing: "-1px",
  },
  accent: { color: "#7c6bff" },
  heroSub: {
    color: "#9ca3af",
    fontSize: "1.05rem",
    maxWidth: "540px",
    lineHeight: 1.7,
    marginBottom: "2rem",
  },
  heroActions: { display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" },
  btnPrimary: {
    background: "#7c6bff",
    color: "#fff",
    border: "none",
    padding: "0.75rem 1.75rem",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnOutline: {
    background: "transparent",
    color: "#e8eaf0",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "0.75rem 1.75rem",
    borderRadius: "8px",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  statsSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "1px",
    background: "rgba(255,255,255,0.06)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  statCard: {
    background: "#0f1117",
    padding: "2.5rem 1.5rem",
    textAlign: "center",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#7c6bff",
    marginBottom: "0.4rem",
  },
  statLabel: { fontSize: "0.85rem", color: "#6b7280" },
  featuresSection: {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "5rem 1.5rem",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: 700,
    marginBottom: "0.75rem",
    letterSpacing: "-0.5px",
  },
  sectionSub: {
    color: "#9ca3af",
    fontSize: "1rem",
    marginBottom: "3rem",
  },
  featureGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",  // ← always 2 columns = 2x2 grid
  gap: "1.25rem",
  textAlign: "left",
  },
  featureCard: {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "12px",
  padding: "1.5rem",
  display: "flex",          // ← add this
  flexDirection: "column",  // ← add this
  gap: "0.5rem",            // ← add this
},
featureIcon: {
  fontSize: "1.5rem",
  marginBottom: "0.25rem",
  width: 40,                                        // ← add this
  height: 40,                                       // ← add this
  background: "rgba(124,107,255,0.1)",              // ← add this
  borderRadius: "10px",                             // ← add this
  display: "flex",                                  // ← add this
  alignItems: "center",                             // ← add this
  justifyContent: "center",                         // ← add this
},
  featureDesc: { fontSize: "0.875rem", color: "#9ca3af", lineHeight: 1.6 },
  ctaSection: {
    textAlign: "center",
    padding: "5rem 1.5rem",
    background:
      "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(124,107,255,0.1) 0%, transparent 70%)",
  },
  ctaTitle: {
    fontSize: "1.75rem",
    fontWeight: 700,
    marginBottom: "0.75rem",
    letterSpacing: "-0.5px",
  },
  ctaSub: { color: "#9ca3af", marginBottom: "1.75rem" },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem 2rem",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  footerNote: { fontSize: "0.8rem", color: "#4b5563" },
};
