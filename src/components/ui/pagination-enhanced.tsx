
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface PaginationEnhancedProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export const PaginationEnhanced = ({ 
  currentPage, 
  totalPages, 
  baseUrl,
  className 
}: PaginationEnhancedProps) => {
  const { t } = useLanguage();
  
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    if (page === 1) return baseUrl;
    return `${baseUrl}/page/${page}`;
  };

  const renderPageNumbers = () => {
    const items = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <Link
              to={getPageUrl(i)}
              className={cn(
                buttonVariants({
                  variant: currentPage === i ? "outline" : "ghost",
                  size: "icon",
                }),
                "h-9 w-9"
              )}
              aria-current={currentPage === i ? "page" : undefined}
            >
              {i}
            </Link>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <Link
            to={getPageUrl(1)}
            className={cn(
              buttonVariants({
                variant: currentPage === 1 ? "outline" : "ghost",
                size: "icon",
              }),
              "h-9 w-9"
            )}
            aria-current={currentPage === 1 ? "page" : undefined}
          >
            1
          </Link>
        </PaginationItem>
      );

      // Show ellipsis or pages around current page
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <Link
              to={getPageUrl(i)}
              className={cn(
                buttonVariants({
                  variant: currentPage === i ? "outline" : "ghost",
                  size: "icon",
                }),
                "h-9 w-9"
              )}
              aria-current={currentPage === i ? "page" : undefined}
            >
              {i}
            </Link>
          </PaginationItem>
        );
      }

      // Show ellipsis before last page if needed
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <Link
              to={getPageUrl(totalPages)}
              className={cn(
                buttonVariants({
                  variant: currentPage === totalPages ? "outline" : "ghost",
                  size: "icon",
                }),
                "h-9 w-9"
              )}
              aria-current={currentPage === totalPages ? "page" : undefined}
            >
              {totalPages}
            </Link>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <div className="text-sm text-muted-foreground">
        {t('common.page')} {currentPage} {t('common.of')} {totalPages}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            {currentPage > 1 ? (
              <Link
                to={getPageUrl(currentPage - 1)}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "default" }),
                  "gap-1 pl-2.5"
                )}
                aria-label="Go to previous page"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>{t('common.previous')}</span>
              </Link>
            ) : (
              <span className={cn(
                buttonVariants({ variant: "ghost", size: "default" }),
                "gap-1 pl-2.5 pointer-events-none opacity-50"
              )}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>{t('common.previous')}</span>
              </span>
            )}
          </PaginationItem>
          
          {renderPageNumbers()}
          
          <PaginationItem>
            {currentPage < totalPages ? (
              <Link
                to={getPageUrl(currentPage + 1)}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "default" }),
                  "gap-1 pr-2.5"
                )}
                aria-label="Go to next page"
              >
                <span>{t('common.next')}</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span className={cn(
                buttonVariants({ variant: "ghost", size: "default" }),
                "gap-1 pr-2.5 pointer-events-none opacity-50"
              )}>
                <span>{t('common.next')}</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
