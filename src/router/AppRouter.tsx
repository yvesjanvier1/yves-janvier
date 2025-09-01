
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import { Outlet } from "react-router-dom";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/content/blog",
        element: <Blog />,
      },
      {
        path: "/work",
        element: <Portfolio />,
      },
      {
        path: "/services",
        element: <Services />,
      },
      {
        path: "/content/journal",
        element: <Journal />,
      },
      {
        path: "/content/now",
        element: <Now />,
      },
      {
        path: "/resources",
        element: <Resources />,
      },
      {
        path: "/coming-soon",
        element: <ComingSoon />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/dashboard",
        element: <DashboardLayout><Outlet /></DashboardLayout>,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/dashboard/blog",
            element: <DashboardBlog />,
          },
          {
            path: "/dashboard/portfolio",
            element: <DashboardPortfolio />,
          },
          {
            path: "/dashboard/journal",
            element: <DashboardJournal />,
          },
          {
            path: "/dashboard/now",
            element: <DashboardNow />,
          },
          {
            path: "/dashboard/testimonials",
            element: <DashboardTestimonials />,
          },
          {
            path: "/dashboard/services",
            element: <DashboardServices />,
          },
          {
            path: "/dashboard/resources",
            element: <DashboardResources />,
          },
          {
            path: "/dashboard/about",
            element: <DashboardAbout />,
          },
          {
            path: "/dashboard/messages",
            element: <DashboardMessages />,
          },
          {
            path: "/dashboard/analytics",
            element: <DashboardAnalytics />,
          },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
