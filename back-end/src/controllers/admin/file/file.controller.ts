import { Request, Response, NextFunction } from "express";
import fileUpload from "express-fileupload";
import fs from "fs";
import path from "path";
import {
  deleteProductImage,
  gatAllProudct,
  importAllProductData,
} from "../../../models/admin/product/product.model";
import Excel from "exceljs";

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. 從 req.body 解析出非文件欄位
    const { type, oracle_id, brand } = req.body;

    // 2. 驗證必要欄位是否存在
    if (!type || !oracle_id || !brand) {
      res.status(400).json({
        success: false,
        message: "請求中缺少必要的欄位 (type, oracle_id, brand)",
      });
      return;
    }
    const files = req.files as fileUpload.FileArray | null | undefined;
    if (!files || Object.keys(files).length === 0) {
      res.status(400).json({ success: false, message: "沒有提供圖片" });
      return;
    }
    // 解析檔名陣列
    const fileNames: string[] = JSON.parse(req.body.fileNames || "[]");

    // 3. 根據傳入的參數動態建立目標路徑
    const networkRootPath = "\\\\10.1.1.132\\DMaker\\html\\upload\\Ecommerce";
    const targetDir = path.join(networkRootPath, brand, type);

    // 4. 確保目標目錄存在，如果不存在則遞歸創建
    //    fs.mkdirSync with { recursive: true } is like `mkdir -p`
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    } catch (mkdirError) {
      console.error("創建目錄時出錯:", mkdirError);
      res
        .status(500)
        .json({ success: false, message: "伺服器無法建立儲存目錄" });
      return;
    }

    const uploadResults: { filePath: string }[] = [];
    for (let i = 0; i < fileNames.length; i++) {
      const fieldName = `images${i}`;
      const file = files[fieldName];
      if (!file) continue;
      const image = file as fileUpload.UploadedFile;
      // 用前端檔名或加前綴
      const fileName = fileNames[i]; // 或 `${oracle_id}_${fileNames[i]}`
      const filePath = path.join(targetDir, fileName);

      await fs.promises.writeFile(filePath, image.data);

      uploadResults.push({
        filePath: filePath,
      });
    }

    console.log("成功上傳:", uploadResults);
    const publicBaseUrl = "https://comeon.zenitron.com.tw";
    const localBasePath = "\\\\10.1.1.132\\DMaker\\html";
    const publicFilePaths = uploadResults.map((f) =>
      f.filePath.replace(localBasePath, publicBaseUrl).replace(/\\/g, "/"),
    );
    res.json({
      success: true,
      message: "圖片上傳成功",
      // 後端應返回相對路徑，讓前端可以組合出完整的圖片URL
      file_paths: publicFilePaths,
    });
  } catch (error) {
    console.error("上傳圖片時出錯:", error);
    res.status(500).json({ success: false, message: "上傳圖片時發生內部錯誤" });
  }
};

export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const formData = req.body;
    console.log("formData", formData);
    const oracle_id = formData.map((item: any) => item.id);
    const filePath = formData.map((item: any) => item.url);
    let deleteResult = false;
    if (filePath.length === 0) {
      res.status(400).json({ success: false, message: "沒有提供圖片" });
      return;
    }
    const publicBaseUrl = "https://comeon.zenitron.com.tw";
    const localBasePath = "\\\\10.1.1.132\\DMaker\\html";
    const allowedRoot = "\\\\10.1.1.132\\DMaker\\html\\upload\\Ecommerce";
    const localFilePaths = filePath.map((f: string) =>
      f.replace(publicBaseUrl, localBasePath).replace(/\//g, "\\"),
    );
    console.log("localFilePaths", localFilePaths);
    for (const file of localFilePaths) {
      if (!file.startsWith(allowedRoot)) {
        res
          .status(403)
          .json({ success: false, message: "不允許刪除此路徑的檔案" });
        return;
      }
      if (fs.existsSync(file)) {
        await fs.promises.unlink(file);
        console.log("刪除成功", file);
        deleteResult = true;
      } else {
        res.status(404).json({ success: false, message: "檔案不存在" });
        return;
      }
    }
    const result = await deleteProductImage(oracle_id);
    console.log("delete img result", result);
    if (result.success && deleteResult) {
      res.json({ success: true, message: "圖片刪除成功" });
    } else {
      res.status(500).json({ success: false, message: "圖片刪除失敗" });
    }
  } catch (error) {
    console.error("刪除圖片時出錯:", error);
    res.status(500).json({ success: false, message: "刪除圖片時發生內部錯誤" });
  }
};

export const exportToExcel = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 獲取產品和圖片數據
    const selectedProducts = req.query.selectedProducts as string[] | null;
    const result = await gatAllProudct(selectedProducts);

    if (!result || !result.success) {
      res.status(500).json({ success: false, message: "獲取產品數據失敗" });
      return;
    }

    const productData = result.data.product;
    const imageData = result.data.images;
    const pricesData = result.data.prices;
    const tagsData = result.data.tags;
    const categoryData = result.data.category;
    const categoryMappingData = result.data.categoryMapping;
    const tagMappingData = result.data.tagMapping;

    // 創建新的Excel工作簿
    const workbook = new Excel.Workbook();

    // 添加產品數據工作表
    const productSheet = workbook.addWorksheet("產品資料");

    // 定義產品表的欄位標題映射
    const productColumnMapping: Record<string, string> = {
      0: "物件編號",
      1: "零件編號",
      2: "品牌",
      3: "商品描述",
      4: "庫存",
      5: "供應商交貨時間",
      6: "單位淨重-克",
      7: "最小包裝量",
      8: "包裝方式",
      9: "圖片網址",
      10: "上/下架",
      11: "最高溫度",
      12: "最高電壓",
      13: "最低溫度",
      14: "最低電壓",
      15: "產品應用",
      16: "SEO描述",
    };

    // 如果有產品數據，設置表頭
    if (productData && productData.length > 0) {
      // 從第一筆數據獲取列名，使用類型斷言
      console.log("productData[0]", productData[0]);
      const productKeys = Object.keys(productData[0] as Record<string, any>);
      const productColumns = productKeys.map((key, index) => ({
        header: productColumnMapping[index] || key, // 使用映射的標題或原始鍵名
        key: key,
        width: 20,
      }));

      productSheet.columns = productColumns;

      // 添加數據行
      productSheet.addRows(productData);
    }

    // 添加圖片數據工作表
    const imageSheet = workbook.addWorksheet("圖片資料");

    // 定義圖片表的欄位標題映射
    const imageColumnMapping: Record<string, string> = {
      0: "物件編號",
      1: "圖片網址",
      2: "圖片類型",
    };

    // 如果有圖片數據，設置表頭
    if (imageData && imageData.length > 0) {
      // 從第一筆數據獲取列名，使用類型斷言
      const imageKeys = Object.keys(imageData[0] as Record<string, any>);
      const imageColumns = imageKeys.map((key, index) => ({
        header: imageColumnMapping[index] || key, // 使用映射的標題或原始鍵名
        key: key,
        width: 20,
      }));

      imageSheet.columns = imageColumns;

      // 添加數據行
      imageSheet.addRows(imageData);
    }

    // 添加價格數據工作表
    const priceSheet = workbook.addWorksheet("價格資料");

    // 定義價格表的欄位標題映射
    const priceColumnMapping: Record<string, string> = {
      0: "物件編號",
      1: "最小數量",
      2: "最大數量",
      3: "價格",
      4: "幣別",
      5: "單位",
    };

    // 如果有價格數據，設置表頭
    if (pricesData && pricesData.length > 0) {
      // 從第一筆數據獲取列名，使用類型斷言
      const pricesKeys = Object.keys(pricesData[0] as Record<string, any>);
      const pricesColumns = pricesKeys.map((key, index) => ({
        header: priceColumnMapping[index] || key, // 使用映射的標題或原始鍵名
        key: key,
        width: 20,
      }));

      priceSheet.columns = pricesColumns;

      // 添加數據行
      priceSheet.addRows(pricesData);
    }

    // 添加標籤數據工作表
    const tagSheet = workbook.addWorksheet("標籤資料");

    // 定義標籤表的欄位標題映射
    const tagColumnMapping: Record<string, string> = {
      0: "物件編號",
      1: "標籤編號",
    };

    // 如果有標籤數據，設置表頭
    if (tagsData && tagsData.length > 0) {
      // 從第一筆數據獲取列名，使用類型斷言
      const tagsKeys = Object.keys(tagsData[0] as Record<string, any>);
      const tagsColumns = tagsKeys.map((key, index) => ({
        header: tagColumnMapping[index] || key, // 使用映射的標題或原始鍵名
        key: key,
        width: 20,
      }));

      tagSheet.columns = tagsColumns;

      // 添加數據行
      tagSheet.addRows(tagsData);
    }

    // 添加分類數據工作表
    const categorySheet = workbook.addWorksheet("分類資料");

    // 定義分類表的欄位標題映射
    const categoryColumnMapping: Record<string, string> = {
      0: "物件編號",
      1: "分類編號",
    };

    // 如果有分類數據，設置表頭
    if (categoryData && categoryData.length > 0) {
      // 從第一筆數據獲取列名，使用類型斷言
      const categoryKeys = Object.keys(categoryData[0] as Record<string, any>);
      const categoryColumns = categoryKeys.map((key, index) => ({
        header: categoryColumnMapping[index] || key, // 使用映射的標題或原始鍵名
        key: key,
        width: 20,
      }));

      categorySheet.columns = categoryColumns;

      // 添加數據行
      categorySheet.addRows(categoryData);
    }

    const tagMappingSheet = workbook.addWorksheet("標籤對應資料");

    // 定義標籤對應表的欄位標題映射
    const tagMappingColumnMapping: Record<string, string> = {
      0: "標籤編號",
      1: "標籤名稱",
    };
    // 如果有標籤對應數據，設置表頭
    if (tagMappingData && tagMappingData.length > 0) {
      // 從第一筆數據獲取列名，使用類型斷言
      const tagMappingKeys = Object.keys(
        tagMappingData[0] as Record<string, any>,
      );
      const tagMappingColumns = tagMappingKeys.map((key, index) => ({
        header: tagMappingColumnMapping[index] || key, // 使用映射的標題或原始鍵名
        key: key,
        width: 20,
      }));

      tagMappingSheet.columns = tagMappingColumns;

      // 添加數據行
      tagMappingSheet.addRows(tagMappingData);
    }

    const categoryMappingSheet = workbook.addWorksheet("分類對應資料");

    // 定義分類對應表的欄位標題映射
    const categoryMappingColumnMapping: Record<string, string> = {
      0: "分類編號",
      1: "分類名稱",
      2: "分類層級",
      3: "分類類型",
    };
    // 如果有分類對應數據，設置表頭
    if (categoryMappingData && categoryMappingData.length > 0) {
      // 從第一筆數據獲取列名，使用類型斷言
      const categoryMappingKeys = Object.keys(
        categoryMappingData[0] as Record<string, any>,
      );
      const categoryMappingColumns = categoryMappingKeys.map((key, index) => ({
        header: categoryMappingColumnMapping[index] || key, // 使用映射的標題或原始鍵名
        key: key,
        width: 20,
      }));
      categoryMappingSheet.columns = categoryMappingColumns;
      // 添加數據行
      categoryMappingSheet.addRows(categoryMappingData);
    }

    // 設置輸出路徑
    const outputDir = "\\\\10.1.1.12\\機密文件\\MIS\\67_Jerry";
    // 產生格式為: 商品資料轉出_20250728_095455.xlsx
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const fileName = `商品資料轉出_${year}${month}${day}_${hours}${minutes}${seconds}.xlsx`;
    const outputPath = path.join(outputDir, fileName);

    // 確保目錄存在
    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
    } catch (mkdirError) {
      console.error("創建目錄時出錯:", mkdirError);
      res
        .status(500)
        .json({ success: false, message: "伺服器無法建立儲存目錄" });
      return;
    }

    // 寫入Excel文件
    await workbook.xlsx.writeFile(outputPath);

    res.json({
      success: true,
      message: "Excel匯出成功",
      filePath: outputPath,
    });
  } catch (error) {
    console.error("匯出Excel時出錯:", error);
    res
      .status(500)
      .json({ success: false, message: "匯出Excel時發生內部錯誤" });
  }
};

export const importFromExcel = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 檢查是否有上傳檔案
    const files = req.files as fileUpload.FileArray | null | undefined;
    if (!files || Object.keys(files).length === 0) {
      res.status(400).json({ success: false, message: "沒有提供Excel檔案" });
      return;
    }

    // 獲取上傳的Excel檔案
    const excelFile = files.excelFile as fileUpload.UploadedFile;
    if (!excelFile) {
      res.status(400).json({ success: false, message: "找不到Excel檔案" });
      return;
    }

    // 讀取Excel工作簿
    const workbook = new Excel.Workbook();
    // 使用 as any 避開型別定義不匹配的問題 (Buffer vs Buffer<ArrayBufferLike>)
    await workbook.xlsx.load(excelFile.data as any);

    // 讀取工作表
    const sheets = {
      product: workbook.getWorksheet("產品資料"),
      image: workbook.getWorksheet("圖片資料"),
      price: workbook.getWorksheet("價格資料"),
      tag: workbook.getWorksheet("標籤資料"),
      category: workbook.getWorksheet("分類資料"),
    };

    // 檢查必要工作表是否存在
    const missingSheets = [];
    if (!sheets.product) missingSheets.push("產品資料");
    // 其他工作表可以是可選的，根據您的需求調整
    if (!sheets.image) missingSheets.push("圖片資料");
    if (!sheets.price) missingSheets.push("價格資料");
    if (!sheets.tag) missingSheets.push("標籤資料");
    if (!sheets.category) missingSheets.push("分類資料");
    if (missingSheets.length > 0) {
      // await fs.promises.unlink(tempFilePath); // 改為記憶體讀取，無需刪除檔案
      res.status(400).json({
        success: false,
        message: `Excel檔案中缺少以下工作表: ${missingSheets.join(", ")}`,
        missingSheets,
      });
      return;
    }

    // 準備各表資料
    const productRows: any[] = [];
    const imageRows: any[] = [];
    const priceRows: any[] = [];
    const tagRows: any[] = [];
    const categoryRows: any[] = [];

    // 驗證產品資料表標題行
    const productHeaderRow = sheets.product?.getRow(1);
    const expectedHeaders = [
      { index: 1, output: "A", validNames: ["物件編號", "ORACLE_ID"] },
      { index: 2, output: "B", validNames: ["零件編號"] },
      { index: 3, output: "C", validNames: ["品牌"] },
      { index: 4, output: "D", validNames: ["商品描述"] },
      { index: 5, output: "E", validNames: ["庫存"] },
      { index: 6, output: "F", validNames: ["供應商交貨時間"] },
      { index: 7, output: "G", validNames: ["價格"] },
      { index: 8, output: "H", validNames: ["單位淨重-克"] },
      { index: 9, output: "I", validNames: ["最小包裝量"] },
      { index: 10, output: "J", validNames: ["包裝方式"] },
      { index: 11, output: "K", validNames: ["上/下架"] },
      { index: 12, output: "L", validNames: ["圖片網址"] },
      { index: 13, output: "M", validNames: ["最高溫度"] },
      { index: 14, output: "N", validNames: ["最高電壓"] },
      { index: 15, output: "O", validNames: ["最低溫度"] },
      { index: 16, output: "P", validNames: ["最低電壓"] },
      { index: 17, output: "Q", validNames: ["產品應用"] },
      { index: 18, output: "R", validNames: ["SEO描述"] },
    ];
    const validationErrors: string[] = [];
    const actualHeaders: Record<string, string> = {};

    for (const header of expectedHeaders) {
      const cellValue =
        // 取得第一排標題名稱，getCell(1)為Excel第一個欄位(A欄)，getCell(2)為Excel第二個欄位(B欄)，以此類推
        productHeaderRow?.getCell(header.index).value?.toString().trim() || "";
      actualHeaders[`Column${header.output}`] = cellValue;
      // 檢查是否包含任一預期名稱
      const isValid = header.validNames.some((name) =>
        cellValue.includes(name),
      );

      if (!isValid) {
        validationErrors.push(
          `欄位 ${header.output} 標題錯誤: 預期包含 "${header.validNames.join('" 或 "')}", 實際為 "${cellValue}"`,
        );
      }
    }
    // 若有錯誤則回傳
    if (validationErrors.length > 0) {
      // await fs.promises.unlink(tempFilePath); // 改為記憶體讀取，無需刪除檔案
      res.status(400).json({
        success: false,
        message: "產品資料表格式不正確" + validationErrors.join(", "),
        errors: validationErrors,
        expected: expectedHeaders.map(
          (h) => `${h.output}: ${h.validNames.join("/")}`,
        ),
        actual: actualHeaders,
      });
      return;
    }

    // 從產品資料表讀取資料
    const importErrors: string[] = [];

    sheets.product?.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // 跳過標題行

      // 1. 定義必填欄位 (根據您的選擇，設定 1-10 欄為必填)
      const requiredFields = [
        { idx: 1, name: "物件編號" },
        { idx: 2, name: "零件編號" },
        { idx: 3, name: "品牌" },
        { idx: 4, name: "商品描述" },
        { idx: 5, name: "庫存" },
        { idx: 6, name: "供應商交貨時間" },
        { idx: 7, name: "價格" },
        { idx: 8, name: "單位淨重-克" },
        { idx: 9, name: "最小包裝量" },
        { idx: 10, name: "包裝方式" },
        { idx: 11, name: "上/下架" },
      ];

      // 2. 檢查是否整行全空 (避免 Excel 殘留格式造成的空行)
      const hasAnyData = requiredFields.some((f) => {
        const val = row.getCell(f.idx).value;
        return (
          val !== null && val !== undefined && val.toString().trim() !== ""
        );
      });

      if (!hasAnyData) return; // 若整行無有效資料，視為結尾或空行，直接跳過

      // 3. 逐一檢查必填欄位
      const missingFields: string[] = [];
      requiredFields.forEach((field) => {
        const val = row.getCell(field.idx).value;
        if (val === null || val === undefined || val.toString().trim() === "") {
          missingFields.push(field.name);
        }
      });

      if (missingFields.length > 0) {
        importErrors.push(
          `第 ${rowNumber} 列資料不完整，缺少: ${missingFields.join("、")}`,
        );
        return; // 資料不全，不進行處理，直接換下一筆
      }

      // 4. 資料讀取 (驗證通過後才讀取)
      const oracle_id = row.getCell(1).value?.toString().trim() || "";
      const product_id = row.getCell(2).value?.toString().trim() || "";
      const brand = row.getCell(3).value?.toString().trim() || "";
      const description = row.getCell(4).value?.toString().trim() || "";

      // 數值型別轉換 (注意：若 Excel 格子內容非數字，Number 會轉成 NaN，可能需要進一步檢查)
      const inventory = Number(row.getCell(5).value) || 0;
      const vendor_lead_time = Number(row.getCell(6).value) || 0;
      const price = Number(row.getCell(7).value) || 0;
      const unit_weight = Number(row.getCell(8).value) || 0;
      const fixed_lot_multiplier = Number(row.getCell(9).value) || 0;

      const package_method = row.getCell(10).value?.toString().trim() || "";

      // 非必填欄位 (L-R 欄及其他)
      const image_url = row.getCell(11).value?.toString().trim() || "";
      const is_published = Number(row.getCell(12).value) || 1;
      const high_temp = row.getCell(13).value?.toString().trim() || "";
      const high_voltage = row.getCell(14).value?.toString().trim() || "";
      const low_temp = row.getCell(15).value?.toString().trim() || "";
      const low_voltage = row.getCell(16).value?.toString().trim() || "";
      const product_application =
        row.getCell(17).value?.toString().trim() || "";
      const seo_description = row.getCell(18).value?.toString().trim() || "";

      productRows.push({
        oracle_id,
        product_id,
        brand,
        description,
        inventory,
        vendor_lead_time,
        price,
        unit_weight,
        fixed_lot_multiplier,
        package_method,
        image_url,
        is_published,
        high_temp,
        high_voltage,
        low_temp,
        low_voltage,
        product_application,
        seo_description,
      });
    });

    // 5. 總結檢查：如果有任何驗證錯誤，回傳 400 並列出所有錯誤
    if (importErrors.length > 0) {
      // await fs.promises.unlink(tempFilePath); // 改為記憶體讀取，無需刪除檔案
      res.status(400).json({
        success: false,
        message: "匯入資料驗證失敗" + importErrors.join(", "),
        errors: importErrors, // 前端可展示這個陣列給使用者看
      });
      return;
    }

    // 驗證圖片資料表標題行
    if (sheets.image) {
      const imageHeaderRow = sheets.image.getRow(1);
      const imageColumnA = imageHeaderRow.getCell(1).value?.toString() || "";
      const imageColumnB = imageHeaderRow.getCell(2).value?.toString() || "";

      if (
        (imageColumnA.includes("物件編號") ||
          imageColumnA.includes("ORACLE_ID")) &&
        (imageColumnB.includes("圖片網址") ||
          imageColumnB.includes("IMAGE_URL"))
      ) {
        // 從圖片資料表讀取資料
        sheets.image.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber === 1) return; // 跳過標題行

          const oracle_id = row.getCell(1).value?.toString() || "";
          const image_url = row.getCell(2).value?.toString() || "";
          const image_type = row.getCell(3).value?.toString() || "";

          if (oracle_id && image_url) {
            imageRows.push({
              oracle_id,
              image_url,
              image_type: image_type || "main", // 如果未提供圖片類型，默認為主圖
            });
          }
        });
      }
    }

    // 驗證價格資料表標題行
    if (sheets.price) {
      const priceHeaderRow = sheets.price.getRow(1);
      const priceColumnA = priceHeaderRow.getCell(1).value?.toString() || "";

      if (
        priceColumnA.includes("物件編號") ||
        priceColumnA.includes("ORACLE_ID")
      ) {
        // 從價格資料表讀取資料
        sheets.price.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber === 1) return; // 跳過標題行

          const oracle_id = row.getCell(1).value?.toString() || "";
          const min = row.getCell(2).value?.toString() || "";
          const max = row.getCell(3).value?.toString() || "";
          const price = row.getCell(4).value?.toString() || "";
          const currency = row.getCell(5).value?.toString() || "NTD";
          const unit = row.getCell(6).value?.toString() || "";

          if (oracle_id && price) {
            priceRows.push({
              oracle_id,
              min,
              max,
              price,
              currency,
              unit,
            });
          }
        });
      }
    }

    // 驗證標籤資料表標題行
    if (sheets.tag) {
      const tagHeaderRow = sheets.tag.getRow(1);
      const tagColumnA = tagHeaderRow.getCell(1).value?.toString() || "";

      if (tagColumnA.includes("物件編號") || tagColumnA.includes("ORACLE_ID")) {
        // 從標籤資料表讀取資料
        sheets.tag.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber === 1) return; // 跳過標題行

          const oracle_id = row.getCell(1).value?.toString() || "";
          const tag_id = row.getCell(2).value?.toString() || "";

          if (oracle_id && tag_id) {
            tagRows.push({
              oracle_id,
              tag_id,
            });
          }
        });
      }
    }

    // 驗證分類資料表標題行
    if (sheets.category) {
      const categoryHeaderRow = sheets.category.getRow(1);
      const categoryColumnA =
        categoryHeaderRow.getCell(1).value?.toString() || "";

      if (
        categoryColumnA.includes("物件編號") ||
        categoryColumnA.includes("ORACLE_ID")
      ) {
        // 從分類資料表讀取資料
        sheets.category.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber === 1) return; // 跳過標題行

          const oracle_id = row.getCell(1).value?.toString() || "";
          const category_id = row.getCell(2).value?.toString() || "";

          if (oracle_id && category_id) {
            categoryRows.push({
              oracle_id,
              category_id,
            });
          }
        });
      }
    }

    // 刪除臨時檔案
    // await fs.promises.unlink(tempFilePath); // 改為記憶體讀取，無需刪除檔案

    console.log(
      `從Excel讀取資料：產品: ${productRows.length}筆，圖片: ${imageRows.length}筆，價格: ${priceRows.length}筆，標籤: ${tagRows.length}筆，分類: ${categoryRows.length}筆`,
    );

    // 呼叫model函數批次匯入資料並處理事務
    const result = await importAllProductData({
      products: productRows,
      images: imageRows,
      prices: priceRows,
      tags: tagRows,
      categories: categoryRows,
    });

    if (result.success) {
      res.json({
        success: true,
        message: `成功匯入資料，產品: ${result.productCount}筆，圖片: ${result.imageCount}筆，價格: ${result.priceCount}筆，標籤: ${result.tagCount}筆，分類: ${result.categoryCount}筆`,
        detail: {
          productCount: result.productCount,
          imageCount: result.imageCount,
          priceCount: result.priceCount,
          tagCount: result.tagCount,
          categoryCount: result.categoryCount,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: "匯入資料時發生錯誤，所有變更已回滾",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("匯入Excel時出錯:", error);
    res
      .status(500)
      .json({ success: false, message: "匯入Excel時發生內部錯誤" });
  }
};
