import { useState } from "react";
import axios from "axios";

export default function DriveFormModal({ drive, onClose, onSaved }) {
  const [form, setForm] = useState(
    drive || {
      company: "",
      role: "",
      type: "FTE",
      ctc: "",
      date: "",
      minCGPA: "",
      branches: "",
      slots: "",
      status: "open",
    },
  );

  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = async () => {
    const token = localStorage.getItem("token");
    const payload = {
      ...form,
      branches: form.branches
        .toString()
        .split(",")
        .map((b) => b.trim()),
    };
    try {
      if (drive) {
        await axios.put(`/api/admin/drives/${drive._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/api/admin/drives", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onSaved();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save drive");
    }
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <h3 style={s.title}>{drive ? "Edit drive" : "Add new drive"}</h3>

        <label style={s.label}>Company</label>
        <input
          style={s.input}
          value={form.company}
          onChange={(e) => set("company", e.target.value)}
        />

        <label style={s.label}>Role</label>
        <input
          style={s.input}
          value={form.role}
          onChange={(e) => set("role", e.target.value)}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Type</label>
            <select
              style={s.input}
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
            >
              <option value="FTE">Full-time</option>
              <option value="Intern">Internship</option>
              <option value="Intern+FTE">Intern + FTE</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={s.label}>CTC / Stipend</label>
            <input
              style={s.input}
              value={form.ctc}
              onChange={(e) => set("ctc", e.target.value)}
              placeholder="₹12 LPA"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Drive date</label>
            <input
              style={s.input}
              type="date"
              value={form.date?.slice(0, 10)}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Min CGPA</label>
            <input
              style={s.input}
              type="number"
              step="0.1"
              value={form.minCGPA}
              onChange={(e) => set("minCGPA", e.target.value)}
            />
          </div>
        </div>

        <label style={s.label}>Branches (comma separated)</label>
        <input
          style={s.input}
          value={form.branches}
          onChange={(e) => set("branches", e.target.value)}
          placeholder="CS, IT, EC"
        />

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Slots</label>
            <input
              style={s.input}
              type="number"
              value={form.slots}
              onChange={(e) => set("slots", e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Status</label>
            <select
              style={s.input}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div style={s.actions}>
          <button style={s.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button style={s.saveBtn} onClick={submit}>
            {drive ? "Save changes" : "Create drive"}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
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
    width: 420,
    maxHeight: "85vh",
    overflowY: "auto",
    color: "#e8eaf0",
    fontFamily: "'Segoe UI', sans-serif",
  },
  title: { fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" },
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
