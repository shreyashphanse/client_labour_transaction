// src/components/RequireAdmin.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Protects admin routes. If admin flag not present in sessionStorage,
 * redirects to /admin (login).
 */
export default function RequireAdmin({ children }) {
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";
  const location = useLocation();

  if (!isAdmin) {
    // Not authenticated -> send to admin login
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return children;
}
