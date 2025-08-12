
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Layout from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import SkipNavigation from "@/components/accessibility/SkipNavigation";
import { PerformanceTracker } from "@/components/analytics/PerformanceTracker";
import { PageViewTracker } from "@/components/PageViewTracker";
import { AuthProvider } from "@/components/dashboard/AuthProvider";
import "./App.css";

// Lazy load components for better performance
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const PortfolioPage = lazy(() => import("@/pages/PortfolioPage"));
const ProjectDetailPage = lazy(() => import("@/pages/ProjectDetailPage"));
const JournalPage = lazy(() => import("@/pages/JournalPage"));
const ResourcesPage = lazy(() => import("@/pages/ResourcesPage"));
const NowPage = lazy(() => import("@/pages/NowPage"));
const UnsubscribePage = lazy(() => import("@/pages/UnsubscribePage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Dashboard pages
const DashboardLoginPage = lazy(() => import("@/pages/DashboardLoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        defaultTheme="system"
        storageKey="ui-theme"
      >
        <LanguageProvider>
          <TooltipProvider>
            <BrowserRouter>
              <SkipNavigation />
              <PerformanceTracker />
              <PageViewTracker />
              
              <div className="relative flex min-h-screen flex-col bg-background">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="about" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <AboutPage />
                      </Suspense>
                    } />
                    <Route path="blog" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <BlogPage />
                      </Suspense>
                    } />
                    <Route path="blog/:slug" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <BlogPostPage />
                      </Suspense>
                    } />
                    <Route path="contact" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <ContactPage />
                      </Suspense>
                    } />
                    <Route path="portfolio" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <PortfolioPage />
                      </Suspense>
                    } />
                    <Route path="portfolio/:slug" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <ProjectDetailPage />
                      </Suspense>
                    } />
                    <Route path="journal" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <JournalPage />
                      </Suspense>
                    } />
                    <Route path="resources" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <ResourcesPage />
                      </Suspense>
                    } />
                    <Route path="now" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <NowPage />
                      </Suspense>
                    } />
                    <Route path="unsubscribe" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <UnsubscribePage />
                      </Suspense>
                    } />
                  </Route>

                  {/* Dashboard routes - wrap both login and main dashboard with AuthProvider */}
                  <Route path="/dashboard/*" element={
                    <AuthProvider>
                      <Routes>
                        <Route path="login" element={
                          <Suspense fallback={<div>Loading...</div>}>
                            <DashboardLoginPage />
                          </Suspense>
                        } />
                        <Route path="*" element={
                          <Suspense fallback={<div>Loading...</div>}>
                            <DashboardPage />
                          </Suspense>
                        } />
                      </Routes>
                    </AuthProvider>
                  } />

                  {/* 404 route */}
                  <Route path="*" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <NotFound />
                    </Suspense>
                  } />
                </Routes>
              </div>
              
              <Toaster />
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
