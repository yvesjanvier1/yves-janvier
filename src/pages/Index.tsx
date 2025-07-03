
import { useResponsive } from "@/hooks/useResponsive";
import { LazyImage } from "@/components/ui/lazy-image";
import { ResponsiveContainer } from "@/components/ui/responsive-container";

const Index = () => {
  const { isMobile, isTablet } = useResponsive();
  
  const titleSize = isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl md:text-5xl';
  const descriptionSize = isMobile ? 'text-base' : 'text-lg xl:text-xl';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 py-16">
      <ResponsiveContainer>
        <div className="text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <LazyImage
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Development workspace"
              className={`mx-auto rounded-lg shadow-lg ${isMobile ? 'w-full max-w-sm' : isTablet ? 'w-full max-w-md' : 'w-2/3'}`}
            />
            
            <div className="space-y-6">
              <h1 className={`font-bold text-gradient ${titleSize} leading-tight`}>
                Welcome to Your Portfolio
              </h1>
              <p className={`text-muted-foreground leading-relaxed ${descriptionSize}`}>
                Your professional portfolio application is ready. This page serves as a fallback while you customize your content.
              </p>
              <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-col sm:flex-row'} gap-4 justify-center items-center pt-4`}>
                <a 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium w-full sm:w-auto min-h-[44px]"
                >
                  Access Dashboard
                </a>
                <a 
                  href="/portfolio" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium w-full sm:w-auto min-h-[44px]"
                >
                  View Portfolio
                </a>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
};

export default Index;
