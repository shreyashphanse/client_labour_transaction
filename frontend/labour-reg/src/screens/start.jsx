import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormCard from "../components/FormCard";

export default function StartScreen() {
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    setShowOptions(true);
  };

  const handleClientClick = () => {
    navigate("/client");
  };

  const handleLabourClick = () => {
    navigate("/labour");
  };

  const handleLoginClick = () => {
    alert("Login screen coming soon!");
  };

  return (
    <div className="page-root">
      <FormCard title="Welcome">
        {!showOptions ? (
          <div className="button-group">
            <button className="btn register" onClick={handleRegisterClick}>
              Register
            </button>
            <button className="btn login" onClick={handleLoginClick}>
              Login
            </button>
          </div>
        ) : (
          <div className="choice-section">
            <h3 className="question">Are you a?</h3>
            <div className="button-group">
              <button className="btn client" onClick={handleClientClick}>
                Client
              </button>
              <button className="btn labour" onClick={handleLabourClick}>
                Labour
              </button>
            </div>
          </div>
        )}

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
            background-color: #facc15; /* bright yellow */
            color: #000;
          }

          .login {
            background-color: #2563eb; /* blue */
          }

          /* swapped colors here */
          .client {
            background-color: #f59e0b; /* orangish-yellow (was labour) */
            color: #000;
          }

          .labour {
            background-color: #e85d04; /* reddish-yellow (new) */
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
      </FormCard>
    </div>
  );
}
