import { Routes, Route, Navigate } from "react-router-dom";

import Register from "../features/auth/Register";
import Login from "../features/auth/Login";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/register" element={<Register />} />

      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
