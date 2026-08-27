import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Loader from "./Loader";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen label="Loading QuBrains…" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen label="Loading QuBrains…" />;
  if (user) return <Navigate to="/" replace />;
  return children;
}
