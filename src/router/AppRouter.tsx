
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/dashboard/ProtectedRoute";

// Public pages
import HomePage from "@/pages/HomePage";
import PortfolioPage from "@/pages/PortfolioPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import JournalPage from "@/pages/JournalPage";
import NowPage from "@/pages/NowPage";
import ResourcesPage from "@/pages/ResourcesPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import NotFound from "@/pages/NotFound";
import DashboardLoginPage from "@/pages/DashboardLoginPage";

// Lazy load dashboard pages for better performance
const DashboardHomePage = lazy(() => import("@/pages/dashboard/DashboardHomePage"));
const BlogManagePage = lazy(() => import("@/pages/dashboard/BlogManagePage"));
const BlogFormPage = lazy(() => import("@/pages/dashboard/BlogFormPage"));
const PortfolioManagePage = lazy(() => import("@/pages/dashboard/PortfolioManagePage"));
const PortfolioFormPage = lazy(() => import("@/pages/dashboard/PortfolioFormPage"));
const JournalManagePage = lazy(() => import("@/pages/dashboard/JournalManagePage"));
const JournalFormPage = lazy(() => import("@/pages/dashboard/JournalFormPage"));
const NowManagePage = lazy(() => import("@/pages/dashboard/NowManagePage"));
const TestimonialsManagePage = lazy(() => import("@/pages/dashboard/TestimonialsManagePage"));
const TestimonialsFormPage = lazy(() => import("@/pages/dashboard/TestimonialsFormPage"));
const ServicesManagePage = lazy(() => import("@/pages/dashboard/ServicesManagePage"));
const ServiceFormPage = lazy(() => import("@/pages/dashboard/ServiceFormPage"));
const ResourcesManagePage = lazy(() => import("@/pages/dashboard/ResourcesManagePage"));
const ResourceFormPage = lazy(() => import("@/pages/dashboard/ResourceFormPage"));
const AboutManagePage = lazy(() => import("@/pages/dashboard/AboutManagePage"));
const MessagesPage = lazy(() => import("@/pages/dashboard/MessagesPage"));
const AnalyticsPage = lazy(() => import("@/pages/dashboard/AnalyticsPage"));

// Loading component for Suspense
const DashboardLoading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2 text-muted-foreground">Loading...</span>
  </div>
);

const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        
        {/* Work section */}
        <Route path="work" element={<PortfolioPage />} />
        <Route path="work/projects" element={<PortfolioPage />} />
        <Route path="work/projects/:id" element={<ProjectDetailPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="portfolio/:id" element={<ProjectDetailPage />} />
        
        {/* Content section */}
        <Route path="content/blog" element={<BlogPage />} />
        <Route path="content/blog/page/:page" element={<BlogPage />} />
        <Route path="content/blog/:id" element={<BlogPostPage />} />
        <Route path="content/journal" element={<JournalPage />} />
        <Route path="content/now" element={<NowPage />} />
        
        {/* Legacy blog routes */}
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/page/:page" element={<BlogPage />} />
        <Route path="blog/:id" element={<BlogPostPage />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="now" element={<NowPage />} />
        
        {/* Other pages */}
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>

      {/* Dashboard login route (outside protected routes) */}
      <Route path="/dashboard/login" element={<DashboardLoginPage />} />

      {/* Protected dashboard routes */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Suspense fallback={<DashboardLoading />}>
              <Routes>
                <Route index element={<DashboardHomePage />} />
                
                {/* Blog Management */}
                <Route path="blog" element={<BlogManagePage />} />
                <Route path="blog/new" element={<BlogFormPage />} />
                <Route path="blog/edit/:id" element={<BlogFormPage />} />
                
                {/* Portfolio Management */}
                <Route path="portfolio" element={<PortfolioManagePage />} />
                <Route path="portfolio/new" element={<PortfolioFormPage />} />
                <Route path="portfolio/edit/:id" element={<PortfolioFormPage />} />
                
                {/* Journal Management */}
                <Route path="journal" element={<JournalManagePage />} />
                <Route path="journal/new" element={<JournalFormPage />} />
                <Route path="journal/edit/:id" element={<JournalFormPage />} />
                
                {/* Now Page Management */}
                <Route path="now" element={<NowManagePage />} />
                
                {/* Testimonials Management */}
                <Route path="testimonials" element={<TestimonialsManagePage />} />
                <Route path="testimonials/new" element={<TestimonialsFormPage />} />
                <Route path="testimonials/edit/:id" element={<TestimonialsFormPage />} />
                
                {/* Services Management */}
                <Route path="services" element={<ServicesManagePage />} />
                <Route path="services/new" element={<ServiceFormPage />} />
                <Route path="services/edit/:id" element={<ServiceFormPage />} />
                
                {/* Resources Management */}
                <Route path="resources" element={<ResourcesManagePage />} />
                <Route path="resources/new" element={<ResourceFormPage />} />
                <Route path="resources/edit/:id" element={<ResourceFormPage />} />
                
                {/* About Management */}
                <Route path="about" element={<AboutManagePage />} />
                
                {/* Messages */}
                <Route path="messages" element={<MessagesPage />} />
                
                {/* Analytics */}
                <Route path="analytics" element={<AnalyticsPage />} />
                
                {/* Dashboard 404 fallback - redirect to dashboard home */}
                <Route path="*" element={<DashboardHomePage />} />
              </Routes>
            </Suspense>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Global 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
