
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
            <PaginationLink 
              as={Link}
              to={getPageUrl(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink 
            as={Link}
            to={getPageUrl(1)}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
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
            <PaginationLink 
              as={Link}
              to={getPageUrl(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
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
            <PaginationLink 
              as={Link}
              to={getPageUrl(totalPages)}
              isActive={currentPage === totalPages}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="text-sm text-muted-foreground">
        {t('common.page')} {currentPage} {t('common.of')} {totalPages}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              as={currentPage > 1 ? Link : 'span'}
              to={currentPage > 1 ? getPageUrl(currentPage - 1) : undefined}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {renderPageNumbers()}
          
          <PaginationItem>
            <PaginationNext 
              as={currentPage < totalPages ? Link : 'span'}
              to={currentPage < totalPages ? getPageUrl(currentPage + 1) : undefined}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
