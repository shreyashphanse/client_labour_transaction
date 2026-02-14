import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormCard from "../components/FormCard";
import { t } from "../utils/i18n";

export default function StartScreen({ lang }) {
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="page-root">
      <FormCard title={t(lang, "welcome")}>
        {!showOptions ? (
          <div className="button-group">
            <button
              className="btn register"
              onClick={() => setShowOptions(true)}
            >
              {t(lang, "register")}
            </button>

            <button className="btn login" onClick={() => navigate("/login")}>
              {t(lang, "login")}
            </button>
          </div>
        ) : (
          <div className="choice-section">
            <h3 className="question">{t(lang, "areYouA")}</h3>

            <div className="button-group">
              <button
                className="btn client"
                onClick={() => navigate("/client")}
              >
                {t(lang, "customer")}
              </button>

              <button
                className="btn labour"
                onClick={() => navigate("/labour")}
              >
                {t(lang, "serviceProvider")}
              </button>
            </div>
          </div>
        )}
      </FormCard>

      <style jsx>{`
        .page-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #f3f6ff;
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 10px;
        }

        .btn {
          height: 46px;
          border-radius: 10px;
          border: none;
          color: #fff;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .btn:active {
          transform: scale(0.97);
        }

        .register {
          background-color: #facc15;
          color: #000;
        }

        .login {
          background-color: #2563eb;
        }

        .client {
          background-color: #f59e0b;
          color: #000;
        }

        .labour {
          background-color: #e85d04;
          color: #000;
        }

        .question {
          font-size: 16px;
          font-weight: 600;
          color: #1747c8;
          margin-bottom: 10px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
