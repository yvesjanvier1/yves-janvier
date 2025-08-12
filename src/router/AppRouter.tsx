import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
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

// Dashboard routes
import DashboardLoginPage from "@/pages/DashboardLoginPage";
import DashboardPage from "@/pages/DashboardPage";
import DashboardHomePage from "@/pages/dashboard/DashboardHomePage";
import BlogManagePage from "@/pages/dashboard/BlogManagePage";
import BlogFormPage from "@/pages/dashboard/BlogFormPage";
import PortfolioManagePage from "@/pages/dashboard/PortfolioManagePage";
import PortfolioFormPage from "@/pages/dashboard/PortfolioFormPage";
import JournalManagePage from "@/pages/dashboard/JournalManagePage";
import JournalFormPage from "@/pages/dashboard/JournalFormPage";
import NowManagePage from "@/pages/dashboard/NowManagePage";
import TestimonialsManagePage from "@/pages/dashboard/TestimonialsManagePage";
import TestimonialsFormPage from "@/pages/dashboard/TestimonialsFormPage";
import ServicesManagePage from "@/pages/dashboard/ServicesManagePage";
import ServiceFormPage from "@/pages/dashboard/ServiceFormPage";
import ResourcesManagePage from "@/pages/dashboard/ResourcesManagePage";
import ResourceFormPage from "@/pages/dashboard/ResourceFormPage";
import AboutManagePage from "@/pages/dashboard/AboutManagePage";
import MessagesPage from "@/pages/dashboard/MessagesPage";
import AnalyticsPage from "@/pages/dashboard/AnalyticsPage";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/dashboard/ProtectedRoute";

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

      {/* Dashboard routes */}
      <Route path="/dashboard/login" element={<DashboardLoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Routes>
              <Route index element={<DashboardHomePage />} />
              <Route path="blog" element={<BlogManagePage />} />
              <Route path="blog/new" element={<BlogFormPage />} />
              <Route path="blog/edit/:id" element={<BlogFormPage />} />
              <Route path="portfolio" element={<PortfolioManagePage />} />
              <Route path="portfolio/new" element={<PortfolioFormPage />} />
              <Route path="portfolio/edit/:id" element={<PortfolioFormPage />} />
              <Route path="journal" element={<JournalManagePage />} />
              <Route path="journal/new" element={<JournalFormPage />} />
              <Route path="journal/edit/:id" element={<JournalFormPage />} />
              <Route path="now" element={<NowManagePage />} />
              <Route path="testimonials" element={<TestimonialsManagePage />} />
              <Route path="testimonials/new" element={<TestimonialsFormPage />} />
              <Route path="testimonials/edit/:id" element={<TestimonialsFormPage />} />
              <Route path="services" element={<ServicesManagePage />} />
              <Route path="services/new" element={<ServiceFormPage />} />
              <Route path="services/edit/:id" element={<ServiceFormPage />} />
              <Route path="resources" element={<ResourcesManagePage />} />
              <Route path="resources/new" element={<ResourceFormPage />} />
              <Route path="resources/edit/:id" element={<ResourceFormPage />} />
              <Route path="about" element={<AboutManagePage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
