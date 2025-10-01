
import { Routes, Route, Navigate } from "react-router-dom";
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
import ComingSoon from "@/pages/ComingSoonPage";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/dashboard/ProtectedRoute";
import Dashboard from "@/pages/dashboard/DashboardHomePage";
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
      {/* Root redirect to default language */}
      <Route path="/" element={<Navigate to="/fr" replace />} />
      
      {/* Localized routes */}
      <Route path="/:lang" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="services" element={<Services />} />
        
        {/* Work Routes */}
        <Route path="work">
          <Route index element={<Portfolio />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="portfolio/:slug" element={<ProjectDetail />} />
        </Route>
        
        {/* Content Routes */}
        <Route path="content">
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="journal" element={<Journal />} />
          <Route path="now" element={<Now />} />
        </Route>
        
        {/* Resources Routes */}
        <Route path="resources">
          <Route index element={<Resources />} />
          <Route path="tools" element={<Resources />} />
          <Route path="guides" element={<Resources />} />
          <Route path="downloads" element={<Resources />} />
        </Route>
        
        {/* Canonical routes for direct navigation */}
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="portfolio/:slug" element={<ProjectDetail />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="journal" element={<Journal />} />
        <Route path="now" element={<Now />} />
      </Route>
      
      {/* Non-localized routes */}
      <Route path="/legacy" element={<Layout />}>
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="services" element={<Services />} />
        <Route path="work/portfolio" element={<Portfolio />} />
        <Route path="content/blog" element={<Blog />} />
        <Route path="content/journal" element={<Journal />} />
        <Route path="content/now" element={<Now />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="blog" element={<Blog />} />
        <Route path="journal" element={<Journal />} />
        <Route path="now" element={<Now />} />
      </Route>
      
      
      {/* Dashboard Routes - Protected */}
      <Route path="/dashboard/login" element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
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
      
      
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
