
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import { AuthProvider } from "@/components/dashboard/AuthProvider";
import AppRouter from "@/router/AppRouter";

const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LanguageProvider>
              <SecurityProvider>
                <BrowserRouter>
                  <AuthProvider>
                    <SecurityHeaders />
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
    </HelmetProvider>
  );
}

export default App;
