import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";

const LOGO_COLORS = [
  { bg: "rgba(59,130,246,0.15)", color: "#93c5fd" },
  { bg: "rgba(124,107,255,0.15)", color: "#a89cff" },
  { bg: "rgba(34,197,94,0.15)", color: "#86efac" },
  { bg: "rgba(251,191,36,0.15)", color: "#fcd34d" },
  { bg: "rgba(239,68,68,0.13)", color: "#fca5a5" },
];
const getLogoColor = (name = "") =>
  LOGO_COLORS[name.charCodeAt(0) % LOGO_COLORS.length];

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

//acts as a template whenever new company object is created
const EMPTY_COMPANY = {
  name: "",
  type: "",
  location: "",
  packageRange: "",
  hrName: "",
  hrEmail: "",
  hrPhone: "",
  website: "",
  isVerified: false,
};

export default function AdminCompanies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState("");
  const [statusF, setStatusF] = useState("");

  // Company form modal
  const [showModal, setShowModal] = useState(false);
  const [editComp, setEditComp] = useState(null);
  const [form, setForm] = useState(EMPTY_COMPANY);

  // HR contacts modal
  const [showHR, setShowHR] = useState(false);
  const [hrComp, setHRComp] = useState(null);
  const [hrContacts, setHRContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  //to fetch all companies
  const loadCompanies = () => {
    axios.get("/api/admin/companies", { headers }).then((r) => {
      setCompanies(r.data);
      setFiltered(r.data);
    });
  };

  //authentication check
  useEffect(() => {
    if (!token || localStorage.getItem("role") !== "tpo") {
      navigate("/auth");
      return;
    }
    loadCompanies();
  }, []);

  //dynamically filter companies
  useEffect(() => {
    let list = [...companies];

    if (search)
      list = list.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      );
    if (typeF) list = list.filter((c) => c.type === typeF);
    if (statusF === "verified") list = list.filter((c) => c.isVerified);
    if (statusF === "pending") list = list.filter((c) => !c.isVerified);
    setFiltered(list);
  }, [search, typeF, statusF, companies]); //dependency array

  //edit for new company
  const openAdd = () => {
    setEditComp(null);
    setForm(EMPTY_COMPANY);
    setShowModal(true);
  };

  //edit for existing company
  const openEdit = (c) => {
    setEditComp(c);
    setForm(c);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editComp) {
        await axios.put(`/api/admin/companies/${editComp._id}`, form, {
          headers,
        });
      } 
      else {
        await axios.post("/api/admin/companies", form, { headers });
      }
      setShowModal(false);
      loadCompanies();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    }
  };
  
  //to delete a company from db
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company?")) return;
    await axios.delete(`/api/admin/companies/${id}`, { headers });
    loadCompanies();
  };

  //toggles verify status
  const handleVerify = async (company) => {
    await axios.put(
      `/api/admin/companies/${company._id}`,
      { ...company, isVerified: !company.isVerified },
      { headers },
    );
    loadCompanies();
  };

  //open hr contacts modal
  const openHR = (c) => {
    setHRComp(c);
    setHRContacts(c.hrContacts || []);
    setNewContact({ name: "", email: "", phone: "" });
    setShowHR(true);
  };

  const addHRContact = async () => {
    if (!newContact.name || !newContact.email) {
      alert("Name and email required");
      return;
    }
    const updated = [...hrContacts, newContact];

    await axios.put(
      `/api/admin/companies/${hrComp._id}`,
      { ...hrComp, hrContacts: updated },
      { headers },
    );
    setHRContacts(updated);
    setNewContact({ name: "", email: "", phone: "" });
    loadCompanies();
  };

  //remove selected HR
  const removeHRContact = async (idx) => {
    const updated = hrContacts.filter((_, i) => i !== idx);
    
    await axios.put(
      `/api/admin/companies/${hrComp._id}`,
      { ...hrComp, hrContacts: updated },
      { headers },
    );
    setHRContacts(updated);
    loadCompanies();
  };

  const total = companies.length;
  const verified = companies.filter((c) => c.isVerified).length;
  const pending = total - verified;

  return (
    <div style={s.root}>
      <AdminSidebar active="companies" />

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.title}>Companies</h1>
            <p style={s.sub}>Manage recruiting companies and HR contacts</p>
          </div>
          <button style={s.addBtn} onClick={openAdd}>
            + Add company
          </button>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <p style={s.statLabel}>Total companies</p>
            <p style={{ ...s.statVal, color: "#7c6bff" }}>{total}</p>
          </div>
          <div
            style={{
              ...s.statCard,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <p style={{ ...s.statLabel, color: "#86efac" }}>Verified</p>
            <p style={{ ...s.statVal, color: "#86efac" }}>{verified}</p>
          </div>
          <div
            style={{
              ...s.statCard,
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.2)",
            }}
          >
            <p style={{ ...s.statLabel, color: "#fcd34d" }}>
              Pending verification
            </p>
            <p style={{ ...s.statVal, color: "#fcd34d" }}>{pending}</p>
          </div>
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
            value={typeF}
            onChange={(e) => setTypeF(e.target.value)}
          >
            <option value="">All types</option>
            <option value="Product">Product</option>
            <option value="Service">Service</option>
            <option value="Startup">Startup</option>
            <option value="Consulting">Consulting</option>
            <option value="Finance">Finance</option>
          </select>
          <select
            style={s.select}
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
          >
            <option value="">All status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
          <span style={s.count}>{filtered.length} companies</span>
        </div>

        {/* Company cards */}
        {filtered.length === 0 ? (
          <div style={s.emptyBox}>
            <p style={{ fontSize: "2rem", marginBottom: 8 }}>🏢</p>
            <p style={s.emptyText}>No companies found. Add your first one.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map((c) => {
              const logo = getLogoColor(c.name);
              return (
                <div
                  key={c._id}
                  style={{ ...s.card, ...(c.isVerified ? s.cardVerified : {}) }}
                >
                  <div style={s.cardTop}>
                    <div style={s.cardLeft}>
                      <div
                        style={{
                          ...s.logo,
                          background: logo.bg,
                          color: logo.color,
                        }}
                      >
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <p style={s.companyName}>{c.name}</p>
                        <p style={s.companyMeta}>
                          {c.type}
                          {c.location ? ` · ${c.location}` : ""}
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        ...s.tag,
                        ...(c.isVerified ? s.tagVerified : s.tagPending),
                      }}
                    >
                      {c.isVerified ? "Verified" : "Pending"}
                    </span>
                  </div>

                  <div style={s.details}>
                    <div>
                      <p style={s.detailKey}>HR Contact</p>
                      <p style={s.detailVal}>{c.hrName || "—"}</p>
                    </div>
                    <div>
                      <p style={s.detailKey}>HR Email</p>
                      <p style={{ ...s.detailVal, color: "#7c6bff" }}>
                        {c.hrEmail || "—"}
                      </p>
                    </div>
                    <div>
                      <p style={s.detailKey}>Package range</p>
                      <p style={s.detailVal}>{c.packageRange || "—"}</p>
                    </div>
                    <div>
                      <p style={s.detailKey}>Website</p>
                      {c.website ? (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            ...s.detailVal,
                            color: "#7c6bff",
                            textDecoration: "none",
                          }}
                        >
                          {c.website
                            .replace("https://", "")
                            .replace("http://", "")}
                        </a>
                      ) : (
                        <p style={s.detailVal}>—</p>
                      )}
                    </div>
                  </div>

                  <div style={s.cardBottom}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={s.btnEdit} onClick={() => openEdit(c)}>
                        Edit
                      </button>
                      <button style={s.btnHR} onClick={() => openHR(c)}>
                        HR Contacts{" "}
                        {c.hrContacts?.length > 0
                          ? `(${c.hrContacts.length})`
                          : ""}
                      </button>
                      {!c.isVerified && (
                        <button
                          style={s.btnVerify}
                          onClick={() => handleVerify(c)}
                        >
                          Verify
                        </button>
                      )}
                      {c.isVerified && (
                        <button
                          style={s.btnUnverify}
                          onClick={() => handleVerify(c)}
                        >
                          Unverify
                        </button>
                      )}
                    </div>
                    <button
                      style={s.btnDelete}
                      onClick={() => handleDelete(c._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit company modal */}
      {showModal && (
        <div
          style={m.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div style={m.modal}>
            <div style={m.header}>
              <h3 style={m.title}>
                {editComp ? "Edit company" : "Add new company"}
              </h3>
              <button style={m.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div style={m.twoCol}>
              <div>
                <label style={m.label}>Company name</label>
                <input
                  style={m.input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label style={m.label}>Type</label>
                <select
                  style={m.input}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="">Select type</option>
                  {[
                    "Product",
                    "Service",
                    "Startup",
                    "Consulting",
                    "Finance",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={m.twoCol}>
              <div>
                <label style={m.label}>Location</label>
                <input
                  style={m.input}
                  placeholder="e.g. Hyderabad"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </div>
              <div>
                <label style={m.label}>Package range</label>
                <input
                  style={m.input}
                  placeholder="e.g. ₹10–20 LPA"
                  value={form.packageRange}
                  onChange={(e) =>
                    setForm({ ...form, packageRange: e.target.value })
                  }
                />
              </div>
            </div>

            <label style={m.label}>Website</label>
            <input
              style={m.input}
              placeholder="https://company.com"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />

            <div style={m.divider} />
            <p style={m.sectionTitle}>Primary HR Contact</p>

            <div style={m.twoCol}>
              <div>
                <label style={m.label}>HR Name</label>
                <input
                  style={m.input}
                  placeholder="Recruiter name"
                  value={form.hrName}
                  onChange={(e) => setForm({ ...form, hrName: e.target.value })}
                />
              </div>
              <div>
                <label style={m.label}>HR Phone</label>
                <input
                  style={m.input}
                  placeholder="+91 98765 43210"
                  value={form.hrPhone}
                  onChange={(e) =>
                    setForm({ ...form, hrPhone: e.target.value })
                  }
                />
              </div>
            </div>

            <label style={m.label}>HR Email</label>
            <input
              style={m.input}
              type="email"
              placeholder="hr@company.com"
              value={form.hrEmail}
              onChange={(e) => setForm({ ...form, hrEmail: e.target.value })}
            />

            <div style={m.checkRow}>
              <input
                type="checkbox"
                id="verify"
                checked={form.isVerified}
                onChange={(e) =>
                  setForm({ ...form, isVerified: e.target.checked })
                }
              />
              <label
                htmlFor="verify"
                style={{
                  fontSize: "0.82rem",
                  color: "#9ca3af",
                  cursor: "pointer",
                }}
              >
                Mark as verified recruiter
              </label>
            </div>

            <div style={m.actions}>
              <button style={m.cancelBtn} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button style={m.saveBtn} onClick={handleSave}>
                {editComp ? "Save changes" : "Add company"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HR Contacts modal */}
      {showHR && (
        <div
          style={m.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHR(false);
          }}
        >
          <div style={m.modal}>
            <div style={m.header}>
              <div>
                <h3 style={m.title}>HR Contacts</h3>
                <p style={m.sub}>{hrComp?.name}</p>
              </div>
              <button style={m.closeBtn} onClick={() => setShowHR(false)}>
                ✕
              </button>
            </div>

            {hrContacts.length === 0 ? (
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#6b7280",
                  marginBottom: "1rem",
                }}
              >
                No additional HR contacts yet.
              </p>
            ) : (
              <div style={{ marginBottom: "1rem" }}>
                {hrContacts.map((hr, i) => (
                  <div key={i} style={m.hrRow}>
                    <div style={m.hrAvatar}>
                      {hr.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                        {hr.name}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#7c6bff" }}>
                        {hr.email}
                      </p>
                      {hr.phone && (
                        <p style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                          {hr.phone}
                        </p>
                      )}
                    </div>
                    <button
                      style={m.removeBtn}
                      onClick={() => removeHRContact(i)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={m.divider} />
            <p style={m.sectionTitle}>Add new contact</p>

            <label style={m.label}>Name</label>
            <input
              style={m.input}
              placeholder="Recruiter name"
              value={newContact.name}
              onChange={(e) =>
                setNewContact({ ...newContact, name: e.target.value })
              }
            />

            <label style={m.label}>Email</label>
            <input
              style={m.input}
              type="email"
              placeholder="hr@company.com"
              value={newContact.email}
              onChange={(e) =>
                setNewContact({ ...newContact, email: e.target.value })
              }
            />

            <label style={m.label}>Phone (optional)</label>
            <input
              style={m.input}
              placeholder="+91 98765 43210"
              value={newContact.phone}
              onChange={(e) =>
                setNewContact({ ...newContact, phone: e.target.value })
              }
            />

            <div style={m.actions}>
              <button style={m.cancelBtn} onClick={() => setShowHR(false)}>
                Done
              </button>
              <button style={m.saveBtn} onClick={addHRContact}>
                Add contact
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
  count: { marginLeft: "auto", fontSize: "0.75rem", color: "#6b7280" },
  emptyBox: { textAlign: "center", padding: "4rem 0" },
  emptyText: { color: "#6b7280", fontSize: "0.875rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "1.1rem",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardVerified: { borderColor: "rgba(124,107,255,0.35)" },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardLeft: { display: "flex", alignItems: "center", gap: 10 },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.78rem",
    flexShrink: 0,
  },
  companyName: { fontSize: "0.95rem", fontWeight: 700 },
  companyMeta: { fontSize: "0.72rem", color: "#6b7280", marginTop: 2 },
  tag: {
    display: "inline-block",
    padding: "2px 9px",
    borderRadius: 999,
    fontSize: "0.7rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  tagVerified: { background: "rgba(34,197,94,0.13)", color: "#86efac" },
  tagPending: { background: "rgba(251,191,36,0.13)", color: "#fcd34d" },
  details: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    background: "rgba(255,255,255,0.02)",
    borderRadius: 8,
    padding: "0.75rem",
  },
  detailKey: { fontSize: "0.68rem", color: "#6b7280" },
  detailVal: { fontSize: "0.82rem", fontWeight: 500, marginTop: 2 },
  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: 10,
  },
  btnEdit: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    background: "rgba(124,107,255,0.1)",
    border: "1px solid rgba(124,107,255,0.3)",
    color: "#a89cff",
    borderRadius: 6,
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnHR: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    background: "rgba(59,130,246,0.1)",
    border: "1px solid rgba(59,130,246,0.3)",
    color: "#93c5fd",
    borderRadius: 6,
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnVerify: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    background: "rgba(34,197,94,0.08)",
    border: "1px solid rgba(34,197,94,0.25)",
    color: "#86efac",
    borderRadius: 6,
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnUnverify: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#6b7280",
    borderRadius: 6,
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnDelete: {
    display: "inline-flex",
    alignItems: "center",
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
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
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
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.07)",
    margin: "1rem 0",
  },
  sectionTitle: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#9ca3af",
    marginBottom: "0.25rem",
  },
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: "1rem",
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
  hrRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0.75rem",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 8,
    marginBottom: 8,
  },
  hrAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(124,107,255,0.15)",
    color: "#a89cff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.85rem",
    flexShrink: 0,
  },
  removeBtn: {
    padding: "3px 8px",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#fca5a5",
    borderRadius: 6,
    fontSize: "0.72rem",
    cursor: "pointer",
  },
};
