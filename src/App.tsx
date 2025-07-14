
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PortfolioPage from './pages/PortfolioPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import JournalPage from './pages/JournalPage';
import ContactPage from './pages/ContactPage';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';
import DashboardLoginPage from './pages/DashboardLoginPage';
import ProtectedRoute from './components/dashboard/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import { AuthProvider } from './components/dashboard/AuthProvider';
import { LanguageProvider } from './contexts/LanguageContext';
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import BlogManagePage from './pages/dashboard/BlogManagePage';
import PortfolioManagePage from './pages/dashboard/PortfolioManagePage';
import MessagesPage from './pages/dashboard/MessagesPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import BlogFormPage from './pages/dashboard/BlogFormPage';
import PortfolioFormPage from './pages/dashboard/PortfolioFormPage';
import TestimonialsManagePage from './pages/dashboard/TestimonialsManagePage';
import TestimonialsFormPage from './pages/dashboard/TestimonialsFormPage';
import ServicesManagePage from './pages/dashboard/ServicesManagePage';
import ServiceFormPage from './pages/dashboard/ServiceFormPage';
import AboutManagePage from './pages/dashboard/AboutManagePage';
import JournalManagePage from './pages/dashboard/JournalManagePage';
import JournalFormPage from './pages/dashboard/JournalFormPage';
import ResourcesPage from './pages/ResourcesPage';
import ResourcesManagePage from './pages/dashboard/ResourcesManagePage';
import ResourceFormPage from './pages/dashboard/ResourceFormPage';
import { ThemeProvider } from './components/theme/theme-provider';
import { Toaster } from './components/ui/toaster';
import { PageViewTracker } from './components/PageViewTracker';
import { PerformanceTracker } from './components/analytics/PerformanceTracker';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="theme">
        <LanguageProvider>
          <Router>
            <AuthProvider>
              <PageViewTracker />
              <PerformanceTracker />
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="portfolio" element={<PortfolioPage />} />
                <Route path="portfolio/:id" element={<ProjectDetailPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/page/:page" element={<BlogPage />} />
                <Route path="blog/:id" element={<BlogPostPage />} />
                <Route path="journal" element={<JournalPage />} />
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="contact" element={<ContactPage />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/dashboard/login" element={<DashboardLoginPage />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
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
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
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
                </Route>
              </Route>

              {/* Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
              <Toaster />
            </AuthProvider>
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
