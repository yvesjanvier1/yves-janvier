import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Bell } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

const ComingSoonPage = () => {
  return (
    <>
      <SEOHead 
        title="Coming Soon - Yves Janvier"
        description="This feature is coming soon. Stay tuned for updates."
        url="/coming-soon"
      />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="container px-4 max-w-2xl text-center">
          <div className="space-y-8">
            {/* Logo/Brand */}
            <div className="flex justify-center">
              <Link to="/" className="text-2xl font-bold">
                Yves Janvier
              </Link>
            </div>

            {/* Coming Soon Animation */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <Clock className="h-16 w-16 text-primary/60 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold">Coming Soon</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                This feature is currently under development. 
                We're working hard to bring you something amazing!
              </p>
            </div>

            {/* Navigation Options */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/content/blog" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Read Blog
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/work/portfolio">
                  View Portfolio
                </Link>
              </Button>
            </div>

            {/* Additional Info */}
            <div className="pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                Want to be notified when this feature launches?{" "}
                <Link to="/contact" className="text-primary hover:underline">
                  Get in touch
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComingSoonPage;