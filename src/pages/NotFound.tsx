
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container px-4 max-w-2xl text-center">
        <div className="space-y-8">
          {/* Logo/Brand */}
          <div className="flex justify-center">
            <Link to="/" className="text-2xl font-bold">
              Yves Janvier
            </Link>
          </div>

          {/* 404 Animation */}
          <div className="space-y-4">
            <h1 className="text-8xl font-bold text-primary/20 animate-pulse">404</h1>
            <h2 className="text-3xl font-semibold">Page Not Found</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </p>
          </div>

          {/* Search Input */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for content..."
                className="pl-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value;
                    if (query.trim()) {
                      window.location.href = `/blog?search=${encodeURIComponent(query)}`;
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Navigation Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="flex items-center gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link to="/blog">
                <Search className="h-4 w-4" />
                Browse Blog
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link to="/portfolio">
                Portfolio
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="pt-8 border-t">
            <p className="text-sm text-muted-foreground mb-4">Popular pages:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/about" className="text-sm text-primary hover:underline">About</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/contact" className="text-sm text-primary hover:underline">Contact</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/dashboard" className="text-sm text-primary hover:underline">Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
