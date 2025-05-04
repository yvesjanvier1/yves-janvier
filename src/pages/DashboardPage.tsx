
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const DashboardPage = () => {
  // This page now just redirects to the new dashboard route
  return <Navigate to="/dashboard" replace />;
};

export default DashboardPage;
