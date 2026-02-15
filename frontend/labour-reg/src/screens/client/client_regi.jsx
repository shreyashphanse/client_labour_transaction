import React, { useRef, useState } from "react";
import FormCard from "../../components/FormCard";
import { ensureMobileFocus } from "../../utils/mobileFocus";
import { useNavigate } from "react-router-dom";
import { t } from "../../utils/i18n";

import api from "../../utils/api"; // ✅ ADDED

export default function ClientRegi({ lang }) {
  const formRef = useRef(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // ✅ ADDED
    name: "",
    phone: "",
    email: "",
    password: "",
    dob: "",
  });

  const [loading, setLoading] = useState(false); // ✅ ADDED

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, phone, email, password, dob } = form;

    if (!dob) {
      alert(t(lang, "dobRequired"));
      return;
    }

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (isNaN(age)) {
      alert(t(lang, "invalidDob"));
      return;
    }

    if (age < 18) {
      alert(t(lang, "ageRestriction"));
      return;
    }

    if (!phone.trim()) {
      alert(t(lang, "phoneRequired"));
      return;
    }

    if (!email.trim()) {
      alert(t(lang, "emailRequired"));
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      alert(t(lang, "invalidEmail"));
      return;
    }

    if (!name.trim()) {
      alert(t(lang, "nameRequired"));
      return;
    }

    if (!password.trim()) {
      // ✅ ADDED
      alert("Password required");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/auth/register/client", {
        name,
        phone,
        email,
        password,
      });

      console.log("Registered:", data);

      alert(t(lang, "registrationSuccess"));

      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">
      <FormCard title={t(lang, "clientRegistration")}>
        <form ref={formRef} className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label-text">{t(lang, "name")}</span>
            <input
              type="text"
              placeholder={t(lang, "enterName")}
              onFocus={ensureMobileFocus}
              required
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label className="field">
            <span className="label-text">{t(lang, "phone")}</span>
            <input
              type="tel"
              placeholder={t(lang, "enterPhone")}
              onFocus={ensureMobileFocus}
              required
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>

          <label className="field">
            <span className="label-text">{t(lang, "email")}</span>
            <input
              type="email"
              placeholder={t(lang, "enterEmail")}
              onFocus={ensureMobileFocus}
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

          {/* ✅ PASSWORD FIELD ADDED */}

          <label className="field">
            <span className="label-text">Password</span>
            <input
              type="password"
              placeholder="Enter Password"
              onFocus={ensureMobileFocus}
              required
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>

          <label className="field">
            <span className="label-text">{t(lang, "dob")}</span>
            <input
              type="date"
              onFocus={ensureMobileFocus}
              required
              className="input"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
          </label>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Registering..." : t(lang, "register")}
          </button>

          <div className="login-redirect">
            <span>{t(lang, "alreadyRegistered")}</span>
            <button
              type="button"
              className="login-link"
              onClick={() => navigate("/login")}
            >
              {t(lang, "login")}
            </button>
          </div>
        </form>

        <style jsx>{`
          .page-root {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: #f3f6ff;
          }

          .form {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .field {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .label-text {
            font-size: 13px;
            color: #6b7280;
          }

          .input {
            height: 44px;
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid rgba(15, 23, 42, 0.06);
            background: #f8fafc;
            font-size: 15px;
            outline: none;
          }

          .submit-btn {
            height: 46px;
            border-radius: 10px;
            border: none;
            background: #2b6ef6;
            color: white;
            font-weight: 600;
            cursor: pointer;
          }

          .login-redirect {
            margin-top: 12px;
            display: flex;
            justify-content: center;
            gap: 6px;
          }

          .login-link {
            background: none;
            border: none;
            color: #2b6ef6;
            cursor: pointer;
          }

          button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
      </FormCard>
    </div>
  );
}
