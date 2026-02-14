import React, { useRef } from "react";
import FormCard from "../../components/FormCard";
import { ensureMobileFocus } from "../../utils/mobileFocus";
import { useNavigate } from "react-router-dom";
import { t } from "../../utils/i18n";

export default function LabourRegi({ lang }) {
  const formRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const name = document.getElementById("name").value.trim();
    const dob = document.getElementById("dob").value.trim();

    if (!phone) {
      alert(t(lang, "phoneRequired"));
      return;
    }

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

    if (!name) {
      alert(t(lang, "nameRequired"));
      return;
    }

    console.log({ phone, email, name, dob });

    alert(t(lang, "registrationSuccess"));
  };

  return (
    <div className="page-root">
      <FormCard title={t(lang, "providerRegistration")}>
        <form ref={formRef} className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label-text">{t(lang, "name")}</span>
            <input
              id="name"
              type="text"
              placeholder={t(lang, "enterName")}
              onFocus={ensureMobileFocus}
              required
              className="input"
            />
          </label>

          <label className="field">
            <span className="label-text">{t(lang, "phone")}</span>
            <input
              id="phone"
              type="tel"
              placeholder={t(lang, "enterPhone")}
              onFocus={ensureMobileFocus}
              required
              className="input"
            />
          </label>

          <label className="field">
            <span className="label-text">{t(lang, "emailOptional")}</span>
            <input
              id="email"
              type="email"
              placeholder={t(lang, "enterEmail")}
              onFocus={ensureMobileFocus}
              className="input"
            />
          </label>

          <label className="field">
            <span className="label-text">{t(lang, "dob")}</span>
            <input
              id="dob"
              type="date"
              onFocus={ensureMobileFocus}
              required
              className="input"
            />
          </label>

          <button className="submit-btn" type="submit">
            {t(lang, "register")}
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
        `}</style>
      </FormCard>
    </div>
  );
}
