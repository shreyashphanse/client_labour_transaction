import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import StartScreen from "./screens/start";
import LabourRegi from "./screens/labour/labour_regi";
import ClientRegi from "./screens/client/client_regi";
import Login from "./screens/login";
import LabourProfileTop from "./screens/labour/labour_profile";
import ClientProfileTop from "./screens/client/client_profile";

import AdminLogin from "./screens/admin/admin_login";
import AdminPanel from "./screens/admin/admin_panel";
import RequireAdmin from "./components/RequireAdmin";

export default function App() {
  const [lang, setLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    if (!langOpen) return;

    const timer = setTimeout(() => {
      setLangOpen(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [langOpen]);

  return (
    <>
      {/* 🌐 LANGUAGE SWITCHER */}
      <div style={switcherStyles.wrapper}>
        {!langOpen ? (
          <button
            onClick={() => setLangOpen(true)}
            style={switcherStyles.circleBtn}
          >
            🌐
          </button>
        ) : (
          <div style={switcherStyles.dropdown}>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={switcherStyles.select}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>
        )}
      </div>

      <Routes>
        <Route path="/" element={<StartScreen lang={lang} />} />
        <Route path="/labour" element={<LabourRegi lang={lang} />} />
        <Route path="/client" element={<ClientRegi lang={lang} />} />
        <Route path="/login" element={<Login lang={lang} />} />

        <Route
          path="/labourprofile"
          element={<LabourProfileTop lang={lang} />}
        />

        <Route
          path="/clientprofile"
          element={<ClientProfileTop lang={lang} />}
        />

        <Route path="/admin" element={<AdminLogin lang={lang} />} />

        <Route
          path="/admin/panel"
          element={
            <RequireAdmin>
              <AdminPanel lang={lang} />
            </RequireAdmin>
          }
        />

        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

        <Route
          path="*"
          element={<div style={{ padding: 24 }}>Page not found</div>}
        />
      </Routes>
    </>
  );
}

/* ✅ STYLES OUTSIDE COMPONENT */
const switcherStyles = {
  wrapper: {
    position: "fixed",
    top: 12,
    right: 12,
    zIndex: 999,
  },

  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    background: "linear-gradient(180deg, #32373b, #1f2427)",
    color: "#fff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
  },

  dropdown: {
    background: "white",
    padding: "6px 10px",
    borderRadius: 22,
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  },

  select: {
    border: "none",
    outline: "none",
    fontSize: 14,
    cursor: "pointer",
    background: "transparent",
  },
};
