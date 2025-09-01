
import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/HomePage";
import About from "@/pages/AboutPage";
import Contact from "@/pages/ContactPage";
import Blog from "@/pages/BlogPage";
import Portfolio from "@/pages/PortfolioPage";
import Services from "@/pages/Index";
import Journal from "@/pages/JournalPage";
import Now from "@/pages/NowPage";
import Resources from "@/pages/ResourcesPage";
import ErrorPage from "@/pages/NotFound";
import ComingSoon from "@/pages/Index";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Dashboard from "@/pages/dashboard/DashboardHomePage";
import DashboardBlog from "@/pages/dashboard/BlogManagePage";
import DashboardPortfolio from "@/pages/dashboard/PortfolioManagePage";
import DashboardJournal from "@/pages/dashboard/JournalManagePage";
import DashboardNow from "@/pages/dashboard/NowManagePage";
import DashboardTestimonials from "@/pages/dashboard/TestimonialsManagePage";
import DashboardServices from "@/pages/dashboard/ServicesManagePage";
import DashboardResources from "@/pages/dashboard/ResourcesManagePage";
import DashboardAbout from "@/pages/dashboard/AboutManagePage";
import DashboardMessages from "@/pages/dashboard/MessagesPage";
import DashboardAnalytics from "@/pages/dashboard/AnalyticsPage";
import Login from "@/pages/DashboardLoginPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="content/blog" element={<Blog />} />
        <Route path="work" element={<Portfolio />} />
        <Route path="services" element={<Services />} />
        <Route path="content/journal" element={<Journal />} />
        <Route path="content/now" element={<Now />} />
        <Route path="resources" element={<Resources />} />
        <Route path="coming-soon" element={<ComingSoon />} />
        <Route path="login" element={<Login />} />
      </Route>
      
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
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
      
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
