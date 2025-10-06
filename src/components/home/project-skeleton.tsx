import { useTranslation } from "react-i18next";

export const ProjectSkeleton = () => {
  const { t } = useTranslation("portfolio");

  return (
    <div className="bg-card rounded-lg overflow-hidden border shadow-sm">
      {/* Image Placeholder */}
      <div className="aspect-video bg-muted animate-pulse" />

      <div className="p-5 space-y-3">
        {/* Title placeholder */}
        <div className="h-4 bg-muted animate-pulse rounded" />

        {/* Description placeholder */}
        <div className="h-3 bg-muted animate-pulse rounded w-2/3" />

        {/* Tech stack placeholders */}
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-muted animate-pulse rounded-full">
            <span className="sr-only">{t("loading")}</span>
          </div>
          <div className="h-6 w-20 bg-muted animate-pulse rounded-full">
            <span className="sr-only">{t("loading")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
