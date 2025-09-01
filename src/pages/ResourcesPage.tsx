
import { useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { SectionHeader } from "@/components/ui/section-header";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, BookOpen, Wrench } from "lucide-react";

const ResourcesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  // Determine active tab from URL path or search params
  const getActiveTab = () => {
    if (location.pathname === "/resources/tools") return "tools";
    if (location.pathname === "/resources/guides") return "guides";
    if (location.pathname === "/resources/downloads") return "downloads";
    return searchParams.get("category") || "downloads";
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    // Update search params when tab changes via URL
    if (location.pathname !== "/resources") {
      const category = location.pathname.split("/resources/")[1];
      if (category && ["tools", "guides", "downloads"].includes(category)) {
        setSearchParams({ category });
      }
    }
  }, [location.pathname, setSearchParams]);

  const handleTabChange = (value: string) => {
    setSearchParams({ category: value });
  };

  const resourcesData = {
    downloads: [
      {
        title: "React Component Library",
        description: "A collection of reusable React components built with TypeScript and Tailwind CSS.",
        type: "ZIP File",
        size: "2.3 MB",
        icon: Download,
        downloadUrl: "#"
      },
      {
        title: "Project Templates",
        description: "Starter templates for various types of web applications.",
        type: "ZIP File",
        size: "5.1 MB",
        icon: Download,
        downloadUrl: "#"
      }
    ],
    guides: [
      {
        title: "Full-Stack Development Guide",
        description: "Complete guide to building modern web applications with React and Node.js.",
        type: "PDF Guide",
        pages: "45 pages",
        icon: BookOpen,
        downloadUrl: "#"
      },
      {
        title: "API Design Best Practices",
        description: "Learn how to design scalable and maintainable REST APIs.",
        type: "Online Guide",
        readTime: "15 min read",
        icon: ExternalLink,
        downloadUrl: "#"
      }
    ],
    tools: [
      {
        title: "Development Environment Setup",
        description: "Automated scripts to set up a complete development environment.",
        type: "Shell Scripts",
        compatibility: "macOS, Linux",
        icon: Wrench,
        downloadUrl: "#"
      },
      {
        title: "Code Quality Tools",
        description: "ESLint, Prettier, and TypeScript configurations for consistent code quality.",
        type: "Config Files",
        compatibility: "All platforms",
        icon: Wrench,
        downloadUrl: "#"
      }
    ]
  };

  const renderResourceCard = (resource: any, index: number) => (
    <AnimatedSection key={resource.title} delay={index * 0.1}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <resource.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{resource.title}</CardTitle>
              <CardDescription className="text-sm">
                {resource.type} • {resource.size || resource.pages || resource.readTime || resource.compatibility}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{resource.description}</p>
          <Button className="w-full" onClick={() => window.open(resource.downloadUrl, '_blank')}>
            {resource.type === "Online Guide" ? (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Guide
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </AnimatedSection>
  );

  return (
    <ResponsiveContainer className="py-16 md:py-24">
      <AnimatedSection>
        <SectionHeader
          title="Resources"
          subtitle="Free tools, guides, and downloads to help with your development projects"
          centered
        />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="downloads" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resourcesData.downloads.map((resource, index) => renderResourceCard(resource, index))}
            </div>
          </TabsContent>

          <TabsContent value="guides" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resourcesData.guides.map((resource, index) => renderResourceCard(resource, index))}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resourcesData.tools.map((resource, index) => renderResourceCard(resource, index))}
            </div>
          </TabsContent>
        </Tabs>
      </AnimatedSection>
    </ResponsiveContainer>
  );
};

export default ResourcesPage;
