import React, { useRef, useState } from "react";
import FormCard from "../components/FormCard";
import { ensureMobileFocus } from "../utils/mobileFocus";
import { t } from "../utils/i18n";

export default function Login({ lang }) {
  const formRef = useRef(null);
  const [otpSent, setOtpSent] = useState(false);

  const sendOtp = () => {
    const phone = document.getElementById("phone").value.trim();

    if (!phone) {
      alert(t(lang, "enterPhoneForOtp"));
      document.getElementById("phone").focus();
      return;
    }

    console.log("Send OTP to:", phone);
    setOtpSent(true);

    alert(t(lang, "otpSent") + " " + phone);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const phone = document.getElementById("phone").value.trim();
    const otp = document.getElementById("otp").value.trim();

    if (!phone) {
      alert(t(lang, "phoneRequired"));
      document.getElementById("phone").focus();
      return;
    }

    if (!otp) {
      alert(t(lang, "enterOtp"));
      document.getElementById("otp").focus();
      return;
    }

    const otpPattern = /^\d{4,6}$/;

    if (!otpPattern.test(otp)) {
      alert(t(lang, "invalidOtp"));
      document.getElementById("otp").focus();
      return;
    }

    console.log({ phone, otp });

    alert(t(lang, "loginSuccess"));
  };

  return (
    <div className="page-root">
      <FormCard logintitle={t(lang, "login")}>
        <form ref={formRef} className="form" onSubmit={handleSubmit}>
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

          <div className="otp-row">
            <label className="field otp-field">
              <span className="label-text">{t(lang, "otp")}</span>
              <input
                id="otp"
                type="tel"
                placeholder={t(lang, "enterOtp")}
                onFocus={ensureMobileFocus}
                className="input"
              />
            </label>

            <button type="button" className="btn send-otp" onClick={sendOtp}>
              {otpSent ? t(lang, "resendOtp") : t(lang, "sendOtp")}
            </button>
          </div>

          <button className="submit-btn" type="submit">
            {t(lang, "login")}
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

          .btn {
            height: 44px;
            border-radius: 10px;
            border: none;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
          }

          .send-otp {
            background: #4f8a52;
            padding: 0 12px;
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
        `}</style>
      </FormCard>
    </div>
  );
}
