
import { useEffect, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { SectionHeader } from "@/components/ui/section-header";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, BookOpen, Wrench, FileText } from "lucide-react";
import { useResources } from "@/hooks/useMultilingualData";
import { Skeleton } from "@/components/ui/skeleton";

const ResourcesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { data: resources, isLoading } = useResources();
  
  // Determine active tab from URL path or search params
  const getActiveTab = () => {
    if (location.pathname.includes("/tools")) return "tools";
    if (location.pathname.includes("/guides")) return "guides";
    if (location.pathname.includes("/downloads")) return "downloads";
    return searchParams.get("category") || "downloads";
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    // Update search params when tab changes via URL
    const pathParts = location.pathname.split("/");
    const category = pathParts[pathParts.length - 1];
    if (category && ["tools", "guides", "downloads"].includes(category)) {
      setSearchParams({ category });
    }
  }, [location.pathname, setSearchParams]);

  const handleTabChange = (value: string) => {
    setSearchParams({ category: value });
  };

  // Helper to get icon based on file type
  const getIcon = (fileType: string) => {
    switch (fileType?.toUpperCase()) {
      case 'ZIP':
      case 'RAR':
      case 'TAR':
        return Download;
      case 'PDF':
        return FileText;
      case 'ONLINE':
        return ExternalLink;
      case 'SCRIPT':
      case 'CONFIG':
      case 'APP':
        return Wrench;
      default:
        return BookOpen;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  // Group resources by category
  const resourcesByCategory = useMemo(() => {
    if (!resources) return { downloads: [], guides: [], tools: [] };
    
    return {
      downloads: resources.filter((r: any) => r.category === 'downloads'),
      guides: resources.filter((r: any) => r.category === 'guides'),
      tools: resources.filter((r: any) => r.category === 'tools'),
    };
  }, [resources]);

  const renderResourceCard = (resource: any, index: number) => {
    const Icon = getIcon(resource.file_type);
    const sizeInfo = formatFileSize(resource.file_size);
    
    return (
      <AnimatedSection key={resource.id} delay={index * 0.1}>
        <Card className="h-full hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription className="text-sm">
                  {resource.file_type}{sizeInfo ? ` • ${sizeInfo}` : ''}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{resource.description}</p>
            <Button 
              className="w-full" 
              onClick={() => window.open(resource.file_url, '_blank')}
            >
              {resource.file_type === 'ONLINE' ? (
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
  };

  const renderResourceGrid = (categoryResources: any[]) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-full">
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-6 w-3/4 mt-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!categoryResources || categoryResources.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No resources available in this category yet.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryResources.map((resource, index) => renderResourceCard(resource, index))}
      </div>
    );
  };

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
            {renderResourceGrid(resourcesByCategory.downloads)}
          </TabsContent>

          <TabsContent value="guides" className="mt-8">
            {renderResourceGrid(resourcesByCategory.guides)}
          </TabsContent>

          <TabsContent value="tools" className="mt-8">
            {renderResourceGrid(resourcesByCategory.tools)}
          </TabsContent>
        </Tabs>
      </AnimatedSection>
    </ResponsiveContainer>
  );
};

export default ResourcesPage;
