
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/dashboard/AuthProvider";
import ProtectedRoute from "@/components/dashboard/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHomePage from "@/pages/dashboard/DashboardHomePage";
import BlogManagePage from "@/pages/dashboard/BlogManagePage";
import BlogFormPage from "@/pages/dashboard/BlogFormPage";
import PortfolioManagePage from "@/pages/dashboard/PortfolioManagePage";
import PortfolioFormPage from "@/pages/dashboard/PortfolioFormPage";
import JournalManagePage from "@/pages/dashboard/JournalManagePage";
import JournalFormPage from "@/pages/dashboard/JournalFormPage";
import TestimonialsManagePage from "@/pages/dashboard/TestimonialsManagePage";
import TestimonialsFormPage from "@/pages/dashboard/TestimonialsFormPage";
import ServicesManagePage from "@/pages/dashboard/ServicesManagePage";
import ServiceFormPage from "@/pages/dashboard/ServiceFormPage";
import ResourcesManagePage from "@/pages/dashboard/ResourcesManagePage";
import ResourceFormPage from "@/pages/dashboard/ResourceFormPage";
import AboutManagePage from "@/pages/dashboard/AboutManagePage";
import MessagesPage from "@/pages/dashboard/MessagesPage";
import AnalyticsPage from "@/pages/dashboard/AnalyticsPage";
import NowManagePage from "@/pages/dashboard/NowManagePage";

const DashboardPage = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <DashboardLayout>
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
          </Routes>
        </DashboardLayout>
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default DashboardPage;
