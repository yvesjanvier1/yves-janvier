import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/HomePage";
import About from "@/pages/AboutPage";
import Contact from "@/pages/ContactPage";
import Blog from "@/pages/BlogPage";
import BlogPost from "@/pages/BlogPostPage";
import Portfolio from "@/pages/PortfolioPage";
import ProjectDetail from "@/pages/ProjectDetailPage";
import Services from "@/pages/ServicesPage";
import Journal from "@/pages/JournalPage";
import Now from "@/pages/NowPage";
import Resources from "@/pages/ResourcesPage";
import ErrorPage from "@/pages/NotFound";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/dashboard/ProtectedRoute";
import DashboardHomePage from "@/pages/dashboard/DashboardHomePage";
import DashboardBlog from "@/pages/dashboard/BlogManagePage";
import BlogFormPage from "@/pages/dashboard/BlogFormPage";
import DashboardPortfolio from "@/pages/dashboard/PortfolioManagePage";
import PortfolioFormPage from "@/pages/dashboard/PortfolioFormPage";
import DashboardJournal from "@/pages/dashboard/JournalManagePage";
import JournalFormPage from "@/pages/dashboard/JournalFormPage";
import DashboardNow from "@/pages/dashboard/NowManagePage";
import DashboardTestimonials from "@/pages/dashboard/TestimonialsManagePage";
import TestimonialsFormPage from "@/pages/dashboard/TestimonialsFormPage";
import DashboardServices from "@/pages/dashboard/ServicesManagePage";
import ServiceFormPage from "@/pages/dashboard/ServiceFormPage";
import DashboardResources from "@/pages/dashboard/ResourcesManagePage";
import ResourceFormPage from "@/pages/dashboard/ResourceFormPage";
import DashboardAbout from "@/pages/dashboard/AboutManagePage";
import DashboardMessages from "@/pages/dashboard/MessagesPage";
import DashboardAnalytics from "@/pages/dashboard/AnalyticsPage";
import Login from "@/pages/DashboardLoginPage";

export default function AppRouter() {
  return (
    <Routes>
      {/* Main routes with Layout wrapper */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="services" element={<Services />} />

        {/* Portfolio */}
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="portfolio/:slug" element={<ProjectDetail />} />

        {/* Blog & Content */}
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="journal" element={<Journal />} />
        <Route path="now" element={<Now />} />

        {/* Resources */}
        <Route path="resources" element={<Resources />} />
        <Route path="resources/tools" element={<Resources />} />
        <Route path="resources/guides" element={<Resources />} />
        <Route path="resources/downloads" element={<Resources />} />
      </Route>

      {/* Dashboard routes */}
      <Route path="/dashboard/login" element={<Login />} />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHomePage />} />
        <Route path="blog" element={<DashboardBlog />} />
        <Route path="blog/new" element={<BlogFormPage />} />
        <Route path="blog/edit/:id" element={<BlogFormPage />} />

        <Route path="portfolio" element={<DashboardPortfolio />} />
        <Route path="portfolio/new" element={<PortfolioFormPage />} />
        <Route path="portfolio/edit/:id" element={<PortfolioFormPage />} />

        <Route path="journal" element={<DashboardJournal />} />
        <Route path="journal/new" element={<JournalFormPage />} />
        <Route path="journal/edit/:id" element={<JournalFormPage />} />

        <Route path="now" element={<DashboardNow />} />

        <Route path="testimonials" element={<DashboardTestimonials />} />
        <Route path="testimonials/new" element={<TestimonialsFormPage />} />
        <Route path="testimonials/edit/:id" element={<TestimonialsFormPage />} />

        <Route path="services" element={<DashboardServices />} />
        <Route path="services/new" element={<ServiceFormPage />} />
        <Route path="services/edit/:id" element={<ServiceFormPage />} />

        <Route path="resources" element={<DashboardResources />} />
        <Route path="resources/new" element={<ResourceFormPage />} />
        <Route path="resources/edit/:id" element={<ResourceFormPage />} />

        <Route path="about" element={<DashboardAbout />} />
        <Route path="messages" element={<DashboardMessages />} />
        <Route path="analytics" element={<DashboardAnalytics />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
