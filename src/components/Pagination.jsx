"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable Pagination Component
 * @param {Object} props
 * @param {number} props.currentPage - Current active page
 * @param {number} props.totalPages - Total number of pages
 * @param {function} props.onPageChange - Callback when page changes (receives page number)
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.siblingsCount - Number of sibling pages to show (default: 1)
 * @param {string} props.size - Size of pagination: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} props.showPreviousNext - Show previous/next buttons (default: true)
 * @param {string} props.previousLabel - Label for previous button (default: 'Previous')
 * @param {string} props.nextLabel - Label for next button (default: 'Next')
 * @param {string} props.color - Color: 'primary', 'secondary', 'success', 'warning', 'danger' (default: 'primary')
 * @param {boolean} props.showTotal - Show total items info (default: false)
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.itemsPerPage - Items per page
 */
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

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const total = totalPages;
    const current = currentPage;
    const siblings = siblingsCount;

    // Always show first page
    pages.push(1);

    // Calculate range of pages to show around current
    let start = Math.max(2, current - siblings);
    let end = Math.min(total - 1, current + siblings);

    // If there's a gap before the start, add ellipsis
    if (start > 2) {
      pages.push("ellipsis-start");
    }

    // Add pages in the middle range
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < total) {
        pages.push(i);
      }
    }

    // If there's a gap after the end, add ellipsis
    if (end < total - 1) {
      pages.push("ellipsis-end");
    }

    // Always show last page if total > 1
    if (total > 1) {
      pages.push(total);
    }

    // Remove duplicates
    return [...new Set(pages)];
  };

  const pageNumbers = getPageNumbers();

  // Size classes
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Button size classes
  const buttonSizeClasses = {
    sm: "px-2 py-1 min-w-[28px] h-7 text-xs",
    md: "px-3 py-1.5 min-w-[36px] h-9 text-sm",
    lg: "px-4 py-2 min-w-[44px] h-11 text-base",
  };

  // Color classes
  const colorClasses = {
    primary: {
      active: "bg-blue-600 text-white hover:bg-blue-700",
      inactive: "bg-[#111214] text-zinc-400 hover:text-white hover:border-blue-500/50",
      border: "border border-white/5",
    },
    secondary: {
      active: "bg-purple-600 text-white hover:bg-purple-700",
      inactive: "bg-[#111214] text-zinc-400 hover:text-white hover:border-purple-500/50",
      border: "border border-white/5",
    },
    success: {
      active: "bg-emerald-600 text-white hover:bg-emerald-700",
      inactive: "bg-[#111214] text-zinc-400 hover:text-white hover:border-emerald-500/50",
      border: "border border-white/5",
    },
    warning: {
      active: "bg-yellow-600 text-white hover:bg-yellow-700",
      inactive: "bg-[#111214] text-zinc-400 hover:text-white hover:border-yellow-500/50",
      border: "border border-white/5",
    },
    danger: {
      active: "bg-red-600 text-white hover:bg-red-700",
      inactive: "bg-[#111214] text-zinc-400 hover:text-white hover:border-red-500/50",
      border: "border border-white/5",
    },
  };

  const colors = colorClasses[color] || colorClasses.primary;

  // Calculate showing range
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Total items info */}
      {showTotal && totalItems > 0 && (
        <div className="text-sm text-zinc-500">
          Showing <span className="text-white font-medium">{startItem}</span> -{" "}
          <span className="text-white font-medium">{endItem}</span> of{" "}
          <span className="text-white font-medium">{totalItems}</span> items
        </div>
      )}

      {/* Pagination */}
      <nav
        role="navigation"
        aria-label="Pagination"
        className="flex items-center gap-1 flex-wrap justify-center"
      >
        {/* Previous Button */}
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

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <span
                key={`${page}-${index}`}
                className={`cursor-pointer flex items-center justify-center ${buttonSizeClasses[size]} text-zinc-500`}
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

        {/* Next Button */}
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