import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <section className="container section">
        <p>Checking session...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={adminOnly ? "/admin/login" : "/login"}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (userOnly && user.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
