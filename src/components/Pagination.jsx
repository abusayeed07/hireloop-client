"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = "",
  siblingsCount = 1,
  size = "md",
  showPreviousNext = true,
  previousLabel = "Previous",
  nextLabel = "Next",
  color = "primary",
  showTotal = false,
  totalItems = 0,
  itemsPerPage = 0,
}) {
  if (totalPages <= 1) return null;

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange?.(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const total = totalPages;
    const current = currentPage;
    const siblings = siblingsCount;

    pages.push(1);

    let start = Math.max(2, current - siblings);
    let end = Math.min(total - 1, current + siblings);

    if (start > 2) {
      pages.push("ellipsis-start");
    }

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < total) {
        pages.push(i);
      }
    }

    if (end < total - 1) {
      pages.push("ellipsis-end");
    }

    if (total > 1) {
      pages.push(total);
    }

    return [...new Set(pages)];
  };

  const pageNumbers = getPageNumbers();

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const buttonSizeClasses = {
    sm: "px-2 py-1 min-w-[28px] h-7 text-xs",
    md: "px-3 py-1.5 min-w-[36px] h-9 text-sm",
    lg: "px-4 py-2 min-w-[44px] h-11 text-base",
  };

  const colorClasses = {
    primary: {
      active: "bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700",
      inactive: "bg-white/80 dark:bg-[#111214] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-blue-500/50",
      border: "border border-zinc-200/50 dark:border-white/5",
    },
    secondary: {
      active: "bg-purple-600 dark:bg-purple-600 text-white hover:bg-purple-700 dark:hover:bg-purple-700",
      inactive: "bg-white/80 dark:bg-[#111214] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-purple-500/50",
      border: "border border-zinc-200/50 dark:border-white/5",
    },
    success: {
      active: "bg-emerald-600 dark:bg-emerald-600 text-white hover:bg-emerald-700 dark:hover:bg-emerald-700",
      inactive: "bg-white/80 dark:bg-[#111214] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-emerald-500/50",
      border: "border border-zinc-200/50 dark:border-white/5",
    },
    warning: {
      active: "bg-yellow-600 dark:bg-yellow-600 text-white hover:bg-yellow-700 dark:hover:bg-yellow-700",
      inactive: "bg-white/80 dark:bg-[#111214] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-yellow-500/50",
      border: "border border-zinc-200/50 dark:border-white/5",
    },
    danger: {
      active: "bg-red-600 dark:bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-700",
      inactive: "bg-white/80 dark:bg-[#111214] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-red-500/50",
      border: "border border-zinc-200/50 dark:border-white/5",
    },
  };

  const colors = colorClasses[color] || colorClasses.primary;

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {showTotal && totalItems > 0 && (
        <div className="text-sm text-zinc-500 dark:text-zinc-500">
          Showing <span className="text-zinc-900 dark:text-white font-medium">{startItem}</span> -{" "}
          <span className="text-zinc-900 dark:text-white font-medium">{endItem}</span> of{" "}
          <span className="text-zinc-900 dark:text-white font-medium">{totalItems}</span> items
        </div>
      )}

      <nav
        role="navigation"
        aria-label="Pagination"
        className="flex items-center gap-1 flex-wrap justify-center"
      >
        {showPreviousNext && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`cursor-pointer flex items-center gap-1 rounded-lg transition-all duration-200 ${buttonSizeClasses[size]} ${sizeClasses[size]} font-medium ${colors.border} ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : colors.inactive}`}
            aria-label="Previous page"
          >
            <ChevronLeft className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />
            <span className={size === 'sm' ? 'hidden sm:inline' : 'inline'}>{previousLabel}</span>
          </button>
        )}

        {pageNumbers.map((page, index) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <span
                key={`${page}-${index}`}
                className={`cursor-pointer flex items-center justify-center ${buttonSizeClasses[size]} text-zinc-500 dark:text-zinc-500`}
              >
                …
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`cursor-pointer flex items-center justify-center rounded-lg transition-all duration-200 ${buttonSizeClasses[size]} ${sizeClasses[size]} font-medium ${isActive ? colors.active : colors.inactive} ${colors.border}`}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          );
        })}

        {showPreviousNext && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`cursor-pointer flex items-center gap-1 rounded-lg transition-all duration-200 ${buttonSizeClasses[size]} ${sizeClasses[size]} font-medium ${colors.border} ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : colors.inactive}`}
            aria-label="Next page"
          >
            <span className={size === 'sm' ? 'hidden sm:inline' : 'inline'}>{nextLabel}</span>
            <ChevronRight className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />
          </button>
        )}
      </nav>
    </div>
  );
}