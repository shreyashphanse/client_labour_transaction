import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "../../utils/i18n";

const FIXED = {
  phone: "8097142445",
  email: "pokemongosathiemail22@gmail.com",
  password: "Shreyash@2214",
};

export default function AdminLogin({ lang }) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePhone = (v) => /^\d{10}$/.test(v.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!validatePhone(phone)) {
      setError(t(lang, "enterValidPhone"));
      return;
    }

    if (!validateEmail(email)) {
      setError(t(lang, "enterValidEmail"));
      return;
    }

    if (!password) {
      setError(t(lang, "passwordRequired"));
      return;
    }

    if (
      phone.trim() === FIXED.phone &&
      email.trim() === FIXED.email &&
      password === FIXED.password
    ) {
      sessionStorage.setItem("isAdmin", "true");
      navigate("/admin/panel", { replace: true });
      return;
    }

    setError(t(lang, "invalidCredentials"));
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.h}>{t(lang, "adminLogin")}</h2>
        <p style={styles.sub}>{t(lang, "enterAdminCredentials")}</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            {t(lang, "phone")}
            <input
              style={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit phone"
            />
          </label>

          <label style={styles.label}>
            {t(lang, "email")}
            <input
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin email"
            />
          </label>

          <label style={styles.label}>
            {t(lang, "password")}
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </label>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.btnPrimary}>
            {t(lang, "signIn")}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, #0b0d0f, #0f1316)",
    padding: 24,
  },

  card: {
    width: 520,
    maxWidth: "95%",
    background: "#ffffff",
    borderRadius: 12,
    padding: 28,
    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
  },

  h: {
    margin: 0,
    marginBottom: 6,
  },

  sub: {
    color: "#6b7280",
    marginBottom: 22, // ✅ KEY FIX → breathing space
    fontSize: 14,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18, // ✅ BIG FIX → proper vertical spacing
  },

  label: {
    fontSize: 13,
    color: "#374151",
    display: "flex",
    flexDirection: "column",
    gap: 6, // ✅ Space between label text & input
  },

  input: {
    height: 44,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    outline: "none",
  },

  btnPrimary: {
    background: "#0b1220",
    color: "#ffffff",
    border: "none",
    padding: "11px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },

  btnGhost: {
    background: "transparent",
    border: "1px solid #e5e7eb",
    padding: "11px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 500,
  },

  error: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: -6, // ✅ visually aligned
  },
};
