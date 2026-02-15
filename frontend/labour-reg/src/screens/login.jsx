import React, { useRef, useState } from "react";
import FormCard from "../components/FormCard";
import { ensureMobileFocus } from "../utils/mobileFocus";
import { t } from "../utils/i18n";

import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login({ lang }) {
  const formRef = useRef(null);

  const [form, setForm] = useState({
    phone: "",
    password: "", // ✅ CHANGED
  });

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ---------------- LOGIN ----------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.phone.trim()) {
      alert(t(lang, "phoneRequired"));
      return;
    }

    if (!form.password.trim()) {
      alert(t(lang, "passwordRequired"));
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/auth/login", {
        phone: form.phone,
        password: form.password, // ✅ FIXED
      });

      login(data);

      navigate("/jobs");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">
      <FormCard logintitle={t(lang, "login")}>
        <form ref={formRef} className="form" onSubmit={handleSubmit}>
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

          {/* ✅ REUSED OTP ROW → PASSWORD ROW */}

          <div className="otp-row">
            <label className="field otp-field">
              <span className="label-text">Password</span>

              <input
                type="password"
                placeholder="Enter Password"
                onFocus={ensureMobileFocus}
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : t(lang, "login")}
          </button>
        </form>

        <style jsx>{`
          :root {
            --g-bg: #f3f9f1;
            --g-muted: #647056;
            --g-input-bg: #f7fbf6;
            --g-border: rgba(79, 138, 82, 0.12);
            --g-accent-strong: #2f6f3f;
          }

          .page-root {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: var(--g-bg);
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
            color: var(--g-muted);
          }

          .input {
            height: 44px;
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid var(--g-border);
            background: var(--g-input-bg);
            font-size: 15px;
            outline: none;
          }

          .otp-row {
            display: flex;
            gap: 10px;
          }

          .submit-btn {
            height: 46px;
            border-radius: 10px;
            border: none;
            background: var(--g-accent-strong);
            color: white;
            font-weight: 600;
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
