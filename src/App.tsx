
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import PortfolioPage from "@/pages/PortfolioPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import DashboardPage from "@/pages/DashboardPage";
import NotFound from "@/pages/NotFound";
import { ThemeProvider } from "@/components/theme/theme-provider";

// Dashboard pages
import DashboardLoginPage from "@/pages/DashboardLoginPage";
import { AuthProvider } from "@/components/dashboard/AuthProvider";
import ProtectedRoute from "@/components/dashboard/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHomePage from "@/pages/dashboard/DashboardHomePage";
import BlogManagePage from "@/pages/dashboard/BlogManagePage";
import BlogFormPage from "@/pages/dashboard/BlogFormPage";
import PortfolioManagePage from "@/pages/dashboard/PortfolioManagePage";
import PortfolioFormPage from "@/pages/dashboard/PortfolioFormPage";
import MessagesPage from "@/pages/dashboard/MessagesPage";
import AnalyticsPage from "@/pages/dashboard/AnalyticsPage";
import PageViewTracker from "@/components/PageViewTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="yves-janvier-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <PageViewTracker />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="portfolio" element={<PortfolioPage />} />
                <Route path="portfolio/:projectId" element={<ProjectDetailPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/:postId" element={<BlogPostPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              
              {/* Dashboard routes */}
              <Route path="/dashboard/login" element={<DashboardLoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardHomePage />} />
                  <Route path="blog" element={<BlogManagePage />} />
                  <Route path="blog/new" element={<BlogFormPage />} />
                  <Route path="blog/edit/:id" element={<BlogFormPage />} />
                  <Route path="portfolio" element={<PortfolioManagePage />} />
                  <Route path="portfolio/new" element={<PortfolioFormPage />} />
                  <Route path="portfolio/edit/:id" element={<PortfolioFormPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
