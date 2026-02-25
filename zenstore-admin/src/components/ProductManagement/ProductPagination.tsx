interface ProductPaginationProps {
  currentPage: number; //當前頁數
  totalPages: number; //總商品頁數
  totalItems: number; //總商品數目
  itemsPerPage: number; //每一頁商品數目
  currentItemsCount: number; //當前頁商品數目
  handlePageChange: (page: number) => void; //分頁變化時的處理函數
}

const ProductPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  currentItemsCount,
  handlePageChange,
}: ProductPaginationProps) => {
  if (totalPages < 1) return null;

  return (
    <div className="row">
      <div className="col-12">
        <nav
          aria-label="產品分頁"
          className="d-flex justify-content-center mt-4"
        >
          <ul
            className="pagination pagination-sm flex-wrap d-flex list-unstyled"
            style={{ gap: "4px" }}
          >
            <li className="page-item d-flex align-items-center me-3">
              {totalPages === 1 ? (
                <span>
                  顯示 1 - {currentItemsCount} / {currentItemsCount}
                </span>
              ) : (
                <span>
                  顯示 {(currentPage - 1) * itemsPerPage + 1} -
                  {currentPage === totalPages
                    ? totalItems
                    : currentPage * itemsPerPage}
                  / {totalItems}
                </span>
              )}
            </li>

            {/* 往前頁數按鈕 */}
            <li
              className={`page-item d-flex ${
                currentPage === 1 ? "disabled" : ""
              }`}
            >
              <button
                className="page-link mx-1"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                aria-label="回到第一頁"
                style={{ borderRadius: "4px" }}
              >
                <i className="bi bi-chevron-bar-left"></i>
              </button>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="上一頁"
                style={{ borderRadius: "4px" }}
              >
                &laquo;
              </button>
            </li>

            {/* 頁碼按鈕，當前頁數前後顯示5頁 */}
            {(() => {
              const pageNumbers = [];
              let startPage = Math.max(1, currentPage - 5);
              let endPage = Math.min(startPage + 9, totalPages);

              if (endPage - startPage < 9) {
                startPage = Math.max(1, endPage - 9);
              }

              for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(
                  <li key={i} className="page-item">
                    <button
                      className={`page-link ${
                        currentPage === i ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(i)}
                      style={{
                        borderRadius: "4px",
                        backgroundColor:
                          currentPage === i ? "#dc3545" : "white",
                        color: currentPage === i ? "white" : "#000",
                        border:
                          currentPage === i
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                      }}
                    >
                      {i}
                    </button>
                  </li>
                );
              }
              return pageNumbers;
            })()}

            {/* 往後頁數按鈕 */}
            <li
              className={`page-item d-flex ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="下一頁"
                style={{ borderRadius: "4px" }}
              >
                &raquo;
              </button>
              <button
                className="page-link mx-1"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="回到最後一頁"
                style={{ borderRadius: "4px" }}
              >
                <i className="bi bi-chevron-bar-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ProductPagination;
