import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ allowedType }) {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={allowedType === "CUSTOMER" ? "/customer/login" : "/login"} replace />;
  }

  if (allowedType && userType !== allowedType) {
    return <Navigate to={userType === "CUSTOMER" ? "/customer/portal" : "/dashboard"} replace />;
  }

  return <Outlet />;
}
