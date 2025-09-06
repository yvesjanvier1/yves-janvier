
import { useState } from "react";
import { Link, NavLink, useLocation, Outlet } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, Briefcase, MessageSquare, BarChart2, User, LogOut, MessageCircle, UserRound, BookOpen, TrendingUp, FolderOpen, Clock } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Helper function to check if a route is active
  const isRouteActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarProvider defaultOpen={true} open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex flex-1 h-screen overflow-hidden bg-muted/20">
        <Sidebar>
          <SidebarHeader className="flex flex-row items-center justify-between p-4">
            <Logo size="sm" showText={sidebarOpen} />
            <SidebarTrigger />
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive("/dashboard") && location.pathname === "/dashboard"}>
                  <NavLink to="/dashboard" end>
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive("/dashboard/blog")}>
                  <NavLink to="/dashboard/blog">
                    <FileText className="w-5 h-5 mr-2" />
                    <span>Blog Posts</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive("/dashboard/portfolio")}>
                  <NavLink to="/dashboard/portfolio">
                    <Briefcase className="w-5 h-5 mr-2" />
                    <span>Portfolio</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive("/dashboard/journal")}>
                  <NavLink to="/dashboard/journal">
                    <BookOpen className="w-5 h-5 mr-2" />
                    <span>Journal</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive("/dashboard/now")}>
                  <NavLink to="/dashboard/now">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>Now Page</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive("/dashboard/testimonials")}>
                  <NavLink to="/dashboard/testimonials">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    <span>Testimonials</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive("/dashboard/services")}>
                  <NavLink to="/dashboard/services">
                    <Briefcase className="w-5 h-5 mr-2" />
                    <span>Services</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive("/dashboard/resources")}>
                  <NavLink to="/dashboard/resources">
                    <FolderOpen className="w-5 h-5 mr-2" />
                    <span>Resources</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive("/dashboard/about")}>
                  <NavLink to="/dashboard/about">
                    <UserRound className="w-5 h-5 mr-2" />
                    <span>About Page</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive("/dashboard/messages")}>
                  <NavLink to="/dashboard/messages">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    <span>Messages</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive("/dashboard/analytics")}>
                  <NavLink to="/dashboard/analytics">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    <span>Insights & Analytics</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          
          <div className="mt-auto p-4">
            {user && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium truncate">{user.email}</span>
                </div>
                <Button variant="outline" className="w-full" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('auth.signOut')}
                </Button>
              </div>
            )}
          </div>
        </Sidebar>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
