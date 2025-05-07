
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProtectedRoute = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute: Checking auth", { 
    isLoading, 
    isAuthenticated, 
    path: location.pathname, 
    userEmail: user?.email 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3">Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and remember where they were trying to go
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    return <Navigate to="/dashboard/login" state={{ from: location.pathname }} replace />;
  }

  console.log("ProtectedRoute: Authentication success, rendering protected content");
  return <Outlet />;
};

export default ProtectedRoute;
