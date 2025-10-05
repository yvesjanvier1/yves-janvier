import { useState, useEffect } from "react";
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
import { LanguageSelector } from "@/components/language/LanguageSelector";
import AppRouter from "@/router/AppRouter";

const queryClient = new QueryClient();

function App() {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already chosen a language
    const languageChosen = localStorage.getItem("languageChosen");
    if (!languageChosen) {
      setShowLanguageSelector(true);
    }
    setIsLoading(false);
  }, []);

  const handleLanguageSelectorComplete = () => {
    setShowLanguageSelector(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <BrowserRouter>
              <LanguageProvider>
                <SecurityProvider>
                  <AuthProvider>
                    <SecurityHeaders />
                    {showLanguageSelector && (
                      <LanguageSelector onComplete={handleLanguageSelectorComplete} />
                    )}
                    <div className="min-h-screen bg-background font-sans antialiased">
                      <AppRouter />
                    </div>
                    <Toaster />
                  </AuthProvider>
                </SecurityProvider>
              </LanguageProvider>
            </BrowserRouter>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
