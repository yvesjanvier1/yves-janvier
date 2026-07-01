import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

type AppRole = "admin" | "moderator" | "user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Optional required role. If provided, the current user MUST have this role
   * in `public.user_roles` — otherwise they are redirected to `/`.
   * Defaults to "admin" for backwards compatibility with the dashboard.
   */
  requireRole?: AppRole | null;
}

const Spinner = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    <p className="ml-3">{label}</p>
  </div>
);

const ProtectedRoute = ({ children, requireRole = "admin" }: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated, roles, rolesLoaded } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner label="Loading authentication..." />;

  if (!isAuthenticated) {
    return <Navigate to="/dashboard/login" state={{ from: location.pathname }} replace />;
  }

  if (requireRole) {
    if (!rolesLoaded) return <Spinner label="Checking permissions..." />;
    if (!roles.includes(requireRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
