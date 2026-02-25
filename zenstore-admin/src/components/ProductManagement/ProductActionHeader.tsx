import { useRef } from "react";
import { useRouter } from "next/navigation";
import productService from "@/services/productService";
import { useToast } from "@/components/ui/Toast";

interface ProductActionHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleSearch: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  selectedProducts: string[];
  onImportSuccess: () => void;
}

const ProductActionHeader = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
  handleKeyDown,
  selectedProducts,
  onImportSuccess,
}: ProductActionHeaderProps) => {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("excelFile", file);

    try {
      showToast({
        type: "info",
        title: "檔案上傳中",
        message: "正在上傳並處理 Excel 檔案...",
      });

      const result = await productService.importExcel(formData);
      if (result.success) {
        showToast({
          type: "success",
          title: "匯入成功",
          message: "Excel 檔案已成功匯入",
        });
      } else {
        showToast({
          type: "error",
          title: "匯入失敗",
          message: result.message,
        });
      }
      onImportSuccess();
    } catch (error) {
      console.error("匯入失敗:", error);
      showToast({
        type: "error",
        title: "匯入失敗",
        message: "無法匯入 Excel 檔案，請檢查檔案格式是否正確",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleExportExcel = async () => {
    const result = await productService.exportExcel(selectedProducts);
    if (result.success) {
      showToast({
        type: "success",
        title: "匯出成功",
        message: "Excel 檔案已成功匯出",
      });
    } else {
      showToast({
        type: "error",
        title: "匯出失敗",
        message: "無法匯出 Excel 檔案，請稍後再試",
      });
    }
  };

  return (
    <div className="row mb-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        style={{ display: "none" }}
      />
      <div className="col-md-8">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="搜尋"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={handleSearch}
          >
            <i className="bi bi-search"></i>
          </button>
        </div>
      </div>
      <div className="col-md-4 text-end">
        <button
          className="btn btn-outline-primary me-2"
          onClick={() => router.push("/products/create")}
        >
          <i className="bi bi-plus-circle me-1"></i> 新增商品
        </button>
        <button
          className="btn btn-primary me-2"
          data-bs-toggle="modal"
          data-bs-target="#filterModal"
        >
          篩選
        </button>
        <div className="dropdown d-inline-block">
          <button
            className="btn btn-primary me-2"
            id="exportImportDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="bi bi-three-dots"></i>
          </button>
          <ul className="dropdown-menu" aria-labelledby="exportImportDropdown">
            <li>
              <button className="dropdown-item" onClick={handleImportExcel}>
                <i className="bi bi-file-earmark-arrow-up me-2"></i>匯入 Excel
              </button>
            </li>
            <li>
              <button className="dropdown-item" onClick={handleExportExcel}>
                <i className="bi bi-file-earmark-arrow-down me-2"></i>匯出 Excel
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductActionHeader;
