import { CategoryNode } from "@/types/products/categoryType";

export const CategoryItem = ({
  category,
  level = 1,
  handleValueClick,
}: {
  category: CategoryNode;
  level?: number;
  handleValueClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <div key={category.CATEGORY_ID}>
      <div
        className="alert alert-success my-2 py-2 d-flex align-items-center "
        data-bs-parentid={category.CATEGORY_ID}
        style={{ marginLeft: `${level * 1.5}rem` }}
      >
        <div>
          <i className="fa-solid fa-grip-vertical text-secondary me-3 d-none d-sm-inline-block"></i>
          <i className="fa-solid fa-chevron-right text-secondary me-3 d-none d-sm-inline-block"></i>
          {category.CATEGORY_TITLE}
        </div>
        <div className="ms-auto">
          {level < 3 ? (
            <>
              <button
                className="btn btn-primary ms-2 px-1 py-0"
                data-bs-toggle="modal"
                data-bs-target="#inputTag"
                data-bs-value={++level}
                data-bs-title={level == 2 ? "新增中分類" : "新增小分類"}
                data-bs-parentid={category.CATEGORY_ID}
                data-bs-props="create"
                onClick={handleValueClick}
                disabled={category.CATEGORY_TYPE === "製造商"}
              >
                <i className="fa-solid fa-plus text-center"></i>
              </button>
              <button
                className="btn btn-warning ms-2 px-1 py-0"
                data-bs-toggle="modal"
                data-bs-target="#inputTag"
                data-bs-title={level == 2 ? "修改大分類" : "修改中分類"}
                data-bs-parentid={category.CATEGORY_ID}
                data-bs-props="update"
                onClick={handleValueClick}
              >
                <i className="fa-regular fa-pen-to-square"></i>
              </button>
              <button
                className="btn btn-danger ms-2 px-1 py-0"
                data-bs-toggle="modal"
                data-bs-target="#inputTag"
                data-bs-title={level == 2 ? "刪除大分類" : "刪除中分類"}
                data-bs-parentid={category.CATEGORY_ID}
                data-bs-props="delete"
                onClick={handleValueClick}
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-warning ms-2 px-1 py-0"
                data-bs-toggle="modal"
                data-bs-target="#inputTag"
                data-bs-title="修改小分類"
                data-bs-parentid={category.CATEGORY_ID}
                data-bs-props="update"
                onClick={handleValueClick}
              >
                <i className="fa-regular fa-pen-to-square"></i>
              </button>
              <button
                className="btn btn-danger ms-2 px-1 py-0"
                data-bs-toggle="modal"
                data-bs-target="#inputTag"
                data-bs-title="刪除小分類"
                data-bs-parentid={category.CATEGORY_ID}
                data-bs-props="delete"
                onClick={handleValueClick}
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </>
          )}
        </div>
      </div>
      {category.children.map((child) => (
        <CategoryItem
          key={child.CATEGORY_ID}
          category={child}
          level={level}
          handleValueClick={handleValueClick}
        />
      ))}
    </div>
  );
};
