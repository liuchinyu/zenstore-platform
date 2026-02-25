import React from "react";

const ProductSkeleton = () => {
  return (
    <div className="col-12">
      {/* 主分類骨架屏 */}
      <div className="mb-5">
        <div className="skeleton-text bg-secondary bg-opacity-25 w-25 h4 mb-3"></div>
        <hr />
        {/* 子分類骨架屏 */}
        <div className="d-flex flex-wrap gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="d-inline-flex align-items-center">
              <div
                className="skeleton-text bg-secondary bg-opacity-25"
                style={{ width: "120px", height: "24px" }}
              ></div>
              <div
                className="skeleton-text bg-secondary bg-opacity-25 ms-2"
                style={{ width: "50px", height: "20px" }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {/* 重複區塊 */}
      <div className="mb-5">
        <div className="skeleton-text bg-secondary bg-opacity-25 w-25 h4 mb-3"></div>
        <hr />
        <div className="d-flex flex-wrap gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="d-inline-flex align-items-center">
              <div
                className="skeleton-text bg-secondary bg-opacity-25"
                style={{ width: "120px", height: "24px" }}
              ></div>
              <div
                className="skeleton-text bg-secondary bg-opacity-25 ms-2"
                style={{ width: "50px", height: "20px" }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className="skeleton-text bg-secondary bg-opacity-25 w-25 h4 mb-3"></div>
        <hr />
        <div className="d-flex flex-wrap gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="d-inline-flex align-items-center">
              <div
                className="skeleton-text bg-secondary bg-opacity-25"
                style={{ width: "120px", height: "24px" }}
              ></div>
              <div
                className="skeleton-text bg-secondary bg-opacity-25 ms-2"
                style={{ width: "50px", height: "20px" }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className="skeleton-text bg-secondary bg-opacity-25 w-25 h4 mb-3"></div>
        <hr />
        <div className="d-flex flex-wrap gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="d-inline-flex align-items-center">
              <div
                className="skeleton-text bg-secondary bg-opacity-25"
                style={{ width: "120px", height: "24px" }}
              ></div>
              <div
                className="skeleton-text bg-secondary bg-opacity-25 ms-2"
                style={{ width: "50px", height: "20px" }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductSkeletonRow = () => (
  <tr>
    <td>
      <div
        className="bg-secondary bg-opacity-25 animate-pulse"
        style={{ width: "100px", height: "100px" }}
      ></div>
    </td>
    <td>
      <div
        className="bg-secondary bg-opacity-25 animate-pulse"
        style={{ width: "100%", height: "20px" }}
      ></div>
    </td>
    <td>
      <div
        className="bg-secondary bg-opacity-25 animate-pulse"
        style={{ width: "100%", height: "40px" }}
      ></div>
    </td>
    <td>
      <div
        className="bg-secondary bg-opacity-25 animate-pulse"
        style={{ width: "100%", height: "20px" }}
      ></div>
    </td>
    <td>
      <div
        className="bg-secondary bg-opacity-25 animate-pulse"
        style={{ width: "100%", height: "20px" }}
      ></div>
    </td>
    <td>
      <div
        className="bg-secondary bg-opacity-25 animate-pulse"
        style={{ width: "100%", height: "20px" }}
      ></div>
    </td>
    <td>
      <div
        className="bg-secondary bg-opacity-25 animate-pulse"
        style={{ width: "100%", height: "20px" }}
      ></div>
    </td>
  </tr>
);

export const ProductListSkeleton = ({ count }: { count: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeletonRow key={index} />
      ))}
    </>
  );
};

export default ProductSkeleton;
