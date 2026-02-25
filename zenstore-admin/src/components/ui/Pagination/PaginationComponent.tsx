import React from "react";

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // if (totalPages <= 1) return null;

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    page: number,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      onPageChange(page);
    }
  };

  return (
    <nav aria-label="訂單分頁">
      <ul className="pagination justify-content-end">
        <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
          <button
            className="page-link"
            tabIndex={0}
            aria-label="上一頁"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            onKeyDown={(e) => handleKeyDown(e, Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <li
            key={page}
            className={`page-item${currentPage === page ? " active" : ""}`}
          >
            <button
              className="page-link"
              tabIndex={0}
              aria-label={`第 ${page} 頁`}
              onClick={() => onPageChange(page)}
              onKeyDown={(e) => handleKeyDown(e, page)}
            >
              {page}
            </button>
          </li>
        ))}
        <li
          className={`page-item${
            currentPage === totalPages ? " disabled" : ""
          }`}
        >
          <button
            className="page-link"
            tabIndex={0}
            aria-label="下一頁"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            onKeyDown={(e) =>
              handleKeyDown(e, Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default PaginationComponent;
