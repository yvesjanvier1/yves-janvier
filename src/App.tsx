
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PortfolioPage from './pages/PortfolioPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ContactPage from './pages/ContactPage';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';
import DashboardLoginPage from './pages/DashboardLoginPage';
import ProtectedRoute from './components/dashboard/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import { AuthProvider } from './components/dashboard/AuthProvider';
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import BlogManagePage from './pages/dashboard/BlogManagePage';
import PortfolioManagePage from './pages/dashboard/PortfolioManagePage';
import MessagesPage from './pages/dashboard/MessagesPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import BlogFormPage from './pages/dashboard/BlogFormPage';
import PortfolioFormPage from './pages/dashboard/PortfolioFormPage';
import { ThemeProvider } from './components/theme/theme-provider';
import { Toaster } from './components/ui/toaster';
import { PageViewTracker } from './components/PageViewTracker';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <Router>
        <AuthProvider>
          <PageViewTracker />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
              <Route path="portfolio/:id" element={<ProjectDetailPage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:id" element={<BlogPostPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/admin" element={<DashboardLoginPage />} />
            
            {/* Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
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

            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
