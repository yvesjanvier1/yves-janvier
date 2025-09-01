
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import { AuthProvider } from "@/components/dashboard/AuthProvider";
import { SEOInternational } from "@/components/seo/SEOInternational";
import AppRouter from "@/router/AppRouter";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <SEOInternational />
            <SecurityProvider>
              <BrowserRouter>
                <AuthProvider>
                  <div className="min-h-screen bg-background font-sans antialiased">
                    <AppRouter />
                  </div>
                  <Toaster />
                </AuthProvider>
              </BrowserRouter>
            </SecurityProvider>
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
