import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Link, NavLink } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, Briefcase, MessageSquare, BarChart2, User, LogOut, MessageCircle, UserRound, BookOpen } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";

const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <SidebarProvider defaultOpen={true} open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex flex-1 h-screen overflow-hidden bg-muted/20">
        <Sidebar>
          <SidebarHeader className="flex flex-row items-center justify-between p-4">
            <Link to="/" className="text-lg font-bold">Yves Janvier</Link>
            <SidebarTrigger />
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard" end 
                    className={({ isActive }) => isActive ? "text-primary font-medium" : "text-foreground"}>
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard/blog" 
                    className={({ isActive }) => isActive ? "text-primary font-medium" : "text-foreground"}>
                    <FileText className="w-5 h-5 mr-2" />
                    <span>Blog Posts</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard/portfolio" 
                    className={({ isActive }) => isActive ? "text-primary font-medium" : "text-foreground"}>
                    <Briefcase className="w-5 h-5 mr-2" />
                    <span>Portfolio</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard/journal" 
                    className={({ isActive }) => isActive ? "text-primary font-medium" : "text-foreground"}>
                    <BookOpen className="w-5 h-5 mr-2" />
                    <span>Journal</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard/testimonials" 
                    className={({ isActive }) => isActive ? "text-primary font-medium" : "text-foreground"}>
                    <MessageCircle className="w-5 h-5 mr-2" />
                    <span>Testimonials</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard/services" 
                    className={({ isActive }) => isActive ? "text-primary font-medium" : "text-foreground"}>
                    <Briefcase className="w-5 h-5 mr-2" />
                    <span>Services</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard/about" 
                    className={({ isActive }) => isActive ? "text-primary font-medium" : "text-foreground"}>
                    <UserRound className="w-5 h-5 mr-2" />
                    <span>About Page</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard/messages" 
                    className={({ isActive }) => isActive ? "text-primary font-medium" : "text-foreground"}>
                    <MessageSquare className="w-5 h-5 mr-2" />
                    <span>Messages</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard/analytics" 
                    className={({ isActive }) => isActive ? "text-primary font-medium" : "text-foreground"}>
                    <BarChart2 className="w-5 h-5 mr-2" />
                    <span>Analytics</span>
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
                  Sign Out
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
