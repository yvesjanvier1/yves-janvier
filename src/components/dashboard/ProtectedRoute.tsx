
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/dashboard/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
