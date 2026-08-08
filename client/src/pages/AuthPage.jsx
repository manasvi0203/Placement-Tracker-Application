import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [regData, setRegData]     = useState({ name: "", email: "", password: "" });

  const handleLogin = async () => {
    setError("");
    try {
      const res = await axios.post("/api/auth/login", loginData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role",  res.data.role);

      if (res.data.role === "tpo")          navigate("/admin");
      else if (res.data.role === "coordinator") navigate("/coordinator");
      else                                      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!regData.name || !regData.email || !regData.password) {
      setError("Please fill all fields.");
      return;
    }
    try {
      const res = await axios.post("/api/auth/register", {
        ...regData,
        role: "student",
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role",  res.data.role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={s.root}>

      {/* Brand */}
      <div style={s.brand}>
        <span
          style={{ ...s.logo, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          PlaceTrack
        </span>
        
        <button style={s.backBtn} onClick={() => navigate("/")}>
          ← Back to home
        </button>
      </div>

      {/* Card */}
      <div style={s.card}>
        {/* Tabs */}
        <div style={s.tabs}>
          <button
            style={{ ...s.tab, ...(tab === "login" ? s.tabActive : {}) }}
            onClick={() => { setTab("login"); setError(""); }}
          >
            Sign In
          </button>
          <button
            style={{ ...s.tab, ...(tab === "register" ? s.tabActive : {}) }}
            onClick={() => { setTab("register"); setError(""); }}
          >
            Register
          </button>
        </div>

        {/* Login form */}
        {tab === "login" && (
          <div>
            <label style={s.label}>Email address</label>
            <input
              style={s.input}
              type="email"
              placeholder="you@college.edu"
              value={loginData.email}
              onChange={e => setLoginData({ ...loginData, email: e.target.value })}
            />

            <label style={s.label}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...s.input, paddingRight: "3rem" }}
                type={showPass ? "text" : "password"}
                placeholder="Enter password"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
              />
              <span style={s.toggle} onClick={() => setShowPass(!showPass)}>
                {showPass ? "hide" : "show"}
              </span>
            </div>

            {error && <p style={s.err}>{error}</p>}

            <button style={s.btn} onClick={handleLogin}>Sign In</button>

          </div>
        )}

        {/* Register form */}
        {tab === "register" && (
          <div>
            <div style={s.registerNote}>
              <span style={s.noteIcon}>🎓</span>
              <p style={s.noteText}>
                Student registration only. 
              </p>
            </div>

            <label style={s.label}>Full name</label>
            <input
              style={s.input}
              placeholder="Rahul Sharma"
              value={regData.name}
              onChange={e => setRegData({ ...regData, name: e.target.value })}
            />

            <label style={s.label}>College email</label>
            <input
              style={s.input}
              type="email"
              placeholder="2021cs045@college.edu"
              value={regData.email}
              onChange={e => setRegData({ ...regData, email: e.target.value })}
            />

            <label style={s.label}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...s.input, paddingRight: "3rem" }}
                type={showPass ? "text" : "password"}
                placeholder="Create a password"
                value={regData.password}
                onChange={e => setRegData({ ...regData, password: e.target.value })}
                onKeyDown={e => { if (e.key === "Enter") handleRegister(); }}
              />
              <span style={s.toggle} onClick={() => setShowPass(!showPass)}>
                {showPass ? "hide" : "show"}
              </span>
            </div>

            {error && <p style={s.err}>{error}</p>}

            <button style={s.btn} onClick={handleRegister}>Create Account</button>
          </div>
        )}
      </div>

      <p style={s.notice}>Access is restricted to authorized college users only.</p>
    </div>
  );
}

const s = {
  root: {
    background: "#0f1117",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#e8eaf0",
  },
  brand: {
    textAlign: "center",
    marginBottom: "1.75rem",
  },
  logo: {
    fontWeight: 700,
    fontSize: "1.3rem",
    color: "#7c6bff",
    letterSpacing: "-0.5px",
    display: "block",
    marginBottom: "0.25rem",
  },
  sub: {
    color: "#6b7280",
    fontSize: "0.82rem",
    marginTop: "0.25rem",
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "0.78rem",
    cursor: "pointer",
    marginTop: "0.5rem",
    padding: 0,
    transition: "color 0.2s",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "1.75rem",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "1.5rem",
  },
  tab: {
    flex: 1,
    padding: "0.6rem",
    background: "transparent",
    border: "none",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "transparent",
    color: "#6b7280",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  tabActive: {
    color: "#7c6bff",
    borderBottomColor: "#7c6bff",
    fontWeight: 600,
  },
  label: {
    display: "block",
    fontSize: "0.78rem",
    color: "#9ca3af",
    marginBottom: "0.35rem",
    marginTop: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.65rem 0.9rem",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#e8eaf0",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    colorScheme: "dark",
  },
  toggle: {
    position: "absolute",
    right: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#6b7280",
    fontSize: "0.8rem",
  },
  btn: {
    width: "100%",
    padding: "0.72rem",
    background: "#7c6bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.925rem",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "1rem",
  },
  err: {
    fontSize: "0.78rem",
    color: "#f87171",
    marginTop: "0.4rem",
  },
  roleNote: {
    fontSize: "0.75rem",
    color: "#6b7280",
    textAlign: "center",
    marginTop: "1rem",
    lineHeight: 1.5,
  },
  registerNote: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    background: "rgba(124,107,255,0.08)",
    border: "1px solid rgba(124,107,255,0.2)",
    borderRadius: 8,
    padding: "0.75rem",
    marginBottom: "0.5rem",
  },
  noteIcon: { fontSize: "1rem", marginTop: 1 },
  noteText: { fontSize: "0.78rem", color: "#9ca3af", lineHeight: 1.5 },
  notice: {
    marginTop: "1.25rem",
    fontSize: "0.75rem",
    color: "#374151",
  },
};