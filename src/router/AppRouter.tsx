import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import Portfolio from "@/pages/Portfolio";
import Services from "@/pages/Services";
import Journal from "@/pages/Journal";
import Now from "@/pages/Now";
import Resources from "@/pages/Resources";
import ErrorPage from "@/pages/ErrorPage";
import ComingSoon from "@/pages/ComingSoon";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Dashboard from "@/pages/dashboard/Dashboard";
import DashboardBlog from "@/pages/dashboard/DashboardBlog";
import DashboardPortfolio from "@/pages/dashboard/DashboardPortfolio";
import DashboardJournal from "@/pages/dashboard/DashboardJournal";
import DashboardNow from "@/pages/dashboard/DashboardNow";
import DashboardTestimonials from "@/pages/dashboard/DashboardTestimonials";
import DashboardServices from "@/pages/dashboard/DashboardServices";
import DashboardResources from "@/pages/dashboard/DashboardResources";
import DashboardAbout from "@/pages/dashboard/DashboardAbout";
import DashboardMessages from "@/pages/dashboard/DashboardMessages";
import DashboardAnalytics from "@/pages/dashboard/DashboardAnalytics";
import Login from "@/pages/Login";

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
        element: <DashboardLayout />,
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
