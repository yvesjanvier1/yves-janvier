import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { useTranslation } from "react-i18next";
import { useFeaturedProjects } from "@/hooks/useFeaturedProjects";
import { ProjectCard } from "./project-card";
import { ProjectSkeleton } from "./project-skeleton";

export const FeaturedProjects = () => {
  // 🧠 Use both "portfolio" and "common" namespaces
  const { t } = useTranslation(["portfolio", "common"]);
  const { projects, isLoading, error, refetch } = useFeaturedProjects();

  if (error) {
    return (
      <section className="section bg-muted/30">
        <div className="container px-4 mx-auto">
          <SectionHeader
            title={t("featuredProjects")}
            subtitle={t("featuredProjectsSubtitle")}
            centered
          />
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              {t("common.retry")}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-muted/30">
      <div className="container px-4 mx-auto">
        <SectionHeader
          title={t("featuredProjects")}
          subtitle={t("featuredProjectsSubtitle")}
          centered
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProjectSkeleton key={index} />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              {t("noProjectsFound")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("checkBackLater")}
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/portfolio">{t("viewAll")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
