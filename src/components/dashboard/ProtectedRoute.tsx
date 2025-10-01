import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  // Still loading → show spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3">{t("auth.loadingAuthentication")}</p>
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/dashboard/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Authenticated → render children
  return <>{children}</>;
};

export default ProtectedRoute;
