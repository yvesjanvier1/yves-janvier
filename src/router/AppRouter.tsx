// src/router/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";

import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/dashboard/ProtectedRoute";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorPage from "@/pages/NotFound";
import ComingSoon from "@/pages/ComingSoonPage";
import Login from "@/pages/DashboardLoginPage";

// Lazy-loaded Public Pages
const Home = lazy(() => import("@/pages/HomePage"));
const About = lazy(() => import("@/pages/AboutPage"));
const Contact = lazy(() => import("@/pages/ContactPage"));
const Blog = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));
const Portfolio = lazy(() => import("@/pages/PortfolioPage"));
const ProjectDetailPage = lazy(() => import("@/pages/ProjectDetailPage"));
const Services = lazy(() => import("@/pages/Index"));
const Journal = lazy(() => import("@/pages/JournalPage"));
const Now = lazy(() => import("@/pages/NowPage"));
const Resources = lazy(() => import("@/pages/ResourcesPage"));

// Lazy-loaded Dashboard Pages
const DashboardLayout = lazy(() => import("@/components/dashboard/DashboardLayout"));
const Dashboard = lazy(() => import("@/pages/dashboard/DashboardHomePage"));
const DashboardBlog = lazy(() => import("@/pages/dashboard/BlogManagePage"));
const DashboardPortfolio = lazy(() => import("@/pages/dashboard/PortfolioManagePage"));
const DashboardJournal = lazy(() => import("@/pages/dashboard/JournalManagePage"));
const DashboardNow = lazy(() => import("@/pages/dashboard/NowManagePage"));
const DashboardTestimonials = lazy(() => import("@/pages/dashboard/TestimonialsManagePage"));
const DashboardServices = lazy(() => import("@/pages/dashboard/ServicesManagePage"));
const DashboardResources = lazy(() => import("@/pages/dashboard/ResourcesManagePage"));
const DashboardAbout = lazy(() => import("@/pages/dashboard/AboutManagePage"));
const DashboardMessages = lazy(() => import("@/pages/dashboard/MessagesPage"));
const DashboardAnalytics = lazy(() => import("@/pages/dashboard/AnalyticsPage"));

function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="services" element={<Services />} />

          {/* Work */}
          <Route path="work">
            <Route index element={<Portfolio />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="projects" element={<ComingSoon title="Projects" />} />
            <Route path="portfolio/:slug" element={<ProjectDetailPage />} />
          </Route>

          {/* Content */}
          <Route path="content">
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
            <Route path="journal" element={<Journal />} />
            <Route path="now" element={<Now />} />
          </Route>

          {/* Resources */}
          <Route path="resources">
            <Route index element={<Resources />} />
            <Route path="tools" element={<Resources tab="tools" />} />
            <Route path="guides" element={<Resources tab="guides" />} />
            <Route path="downloads" element={<Resources tab="downloads" />} />
          </Route>

          {/* Legacy Routes (Backward Compatibility) */}
          <Route path="portfolio" element={<Navigate to="/work/portfolio" replace />} />
          <Route path="portfolio/:slug" element={<Navigate to="/work/portfolio/:slug" replace />} />
          <Route path="blog" element={<Navigate to="/content/blog" replace />} />
          <Route path="blog/:slug" element={<Navigate to="/content/blog/:slug" replace />} />
          <Route path="journal" element={<Navigate to="/content/journal" replace />} />
          <Route path="now" element={<Navigate to="/content/now" replace />} />
        </Route>

        {/* Dashboard Routes */}
        <Route path="/dashboard">
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<Login />} />
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="home" element={<Dashboard />} />
            <Route path="blog" element={<DashboardBlog />} />
            <Route path="portfolio" element={<DashboardPortfolio />} />
            <Route path="journal" element={<DashboardJournal />} />
            <Route path="now" element={<DashboardNow />} />
            <Route path="testimonials" element={<DashboardTestimonials />} />
            <Route path="services" element={<DashboardServices />} />
            <Route path="resources" element={<DashboardResources />} />
            <Route path="about" element={<DashboardAbout />} />
            <Route path="messages" element={<DashboardMessages />} />
            <Route path="analytics" element={<DashboardAnalytics />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;