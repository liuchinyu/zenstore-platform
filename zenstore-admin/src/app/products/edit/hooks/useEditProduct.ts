"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchProductCategories,
  fetchManufactureCategories,
} from "@/store/categorySlice";
import { fetchTags } from "@/store/tagSlice";
import { useForm, useFieldArray } from "react-hook-form";
import { useToast } from "@/components/ui/Toast";
import productService from "@/services/productService";
import { ProductFormData, DeleteImageType } from "../types";
import {
  selectManufactureCategories,
  selectProductCategories,
} from "@/store/selectors/categorySelector";
import { selectTags } from "@/store/selectors/tagSelector";

export const useEditProduct = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const oracle_id = searchParams.get("oracle_id");

  const [mainImagePreview, setMainImagePreview] = useState<string[]>([]); // 主圖預覽
  const [detailImagePreview, setDetailImagePreview] = useState<string[]>([]); // 附圖預覽
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  const [manuallyChangedFields, setManuallyChangedFields] = useState<
    Record<string, boolean>
  >({});
  const [originalData, setOriginalData] = useState<ProductFormData | null>(
    null
  );
  const [deleteMainImage, setDeleteMainImage] = useState<DeleteImageType[]>([]);
  const [deleteDetailImage, setDeleteDetailImage] = useState<DeleteImageType[]>(
    []
  );
  const [brandTitle, setBrandTitle] = useState<string>("");

  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const detailFileInputRef = useRef<HTMLInputElement | null>(null);

  const methods = useForm<ProductFormData>({
    defaultValues: {
      tags: [],
      priceRanges: [],
      main_images: [],
      detail_images: [],
    },
  });

  // 將部分常用函數解構
  const {
    control,
    handleSubmit,
    formState: { dirtyFields },
    watch,
    setValue,
    reset,
  } = methods;

  const {
    fields: priceRangeFields,
    append: appendPriceRange,
    remove: removePriceRange,
  } = useFieldArray({
    control,
    name: "priceRanges",
    rules: { required: "請至少新增一個價格區間" },
  });

  // --- Selectors ---
  const tags = useAppSelector(selectTags);

  const manufactureCategory = useAppSelector(selectManufactureCategories);
  const productCategory = useAppSelector(selectProductCategories);

  const selectedMainProductCategory = watch("main_product_category");
  const selectedSecondProductCategory = watch("second_product_category");
  const mainImageFiles = watch("main_images", []);
  const detailImageFiles = watch("detail_images", []);
  const selectedTags = watch("tags", []);

  // 取得標籤內容
  useEffect(() => {
    if (tags.length === 0) dispatch(fetchTags());
  }, [dispatch, tags.length]);

  // 取得製造商分類內容
  useEffect(() => {
    if (manufactureCategory.length === 0)
      dispatch(fetchManufactureCategories());
  }, [dispatch, manufactureCategory.length]);

  // 取得產品分類內容
  useEffect(() => {
    if (productCategory.length === 0) dispatch(fetchProductCategories());
  }, [dispatch, productCategory.length]);

  // 取得商品明細資料
  const loadProductData = useCallback(async () => {
    if (!oracle_id) return;
    try {
      const response = await productService.getProductById(oracle_id);
      const {
        product,
        categories: prodCats,
        tags: prodTags,
        images,
        prices,
      } = response.data;

      // 欄位對應
      const data: Partial<ProductFormData> = {
        oracle_id: product[0],
        product_id: product[1],
        brand: product[2],
        description: product[3],
        fixed_lot_multiplier: product[4],
        unit_weight: product[5],
        package_method: product[6],
        high_voltage: product[7],
        low_voltage: product[8],
        high_temp: product[9],
        low_temp: product[10],
        product_application: product[11],
        inventory: product[12],
        price: product[13],
        vendor_lead_time: product[14],
        is_published: product[16].toString(),
        seo_description: product[17] || "",
        seo_title: product[18] || "",
      };

      setBrandTitle(product[2]);

      // 分類對應
      prodCats.forEach((cat: any, index: number) => {
        if (index === 0) data.brand_id = cat[0].toString();
        else if (index === 1) data.main_product_category = cat[0].toString();
        else if (index === 2) data.second_product_category = cat[0].toString();
        else if (index === 3) data.third_product_category = cat[0].toString();
      });

      // 標籤對應
      data.tags = prodTags.map((t: any) => t[0]);

      // 圖片對應
      const mImgs = images.filter((img: any) => img[3] === "main");
      const dImgs = images.filter((img: any) => img[3] === "detail");
      data.main_images = mImgs;
      data.detail_images = dImgs;
      setMainImagePreview(mImgs.map((img: any) => img[2]));
      setDetailImagePreview(dImgs.map((img: any) => img[2]));

      // 價格對應
      data.priceRanges = prices.map((p: any) => ({
        minQuantity: p[4],
        maxQuantity: p[5],
        unit: p[7],
        unitPrice: p[6],
      }));

      // 將API資料填入表單
      reset(data as ProductFormData);
      // 備份資料做為比對
      setOriginalData(data as ProductFormData);
    } catch (err) {
      showToast({
        type: "error",
        title: "載入失敗",
        message: "無法取得商品資料",
      });
    }
  }, [oracle_id, reset, showToast]);

  // 呼叫API取得商品資料
  useEffect(() => {
    loadProductData();
  }, [loadProductData]);

  // 手動欄位變更(陣列資料:圖片、標籤、動態價格)
  const handleFieldChange = (fieldName: string) => {
    setManuallyChangedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleTagChange = (tagId: number) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    setValue("tags", newTags, { shouldValidate: true });
    handleFieldChange("tags");
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "main" | "detail"
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    const existing = type === "main" ? mainImageFiles : detailImageFiles;
    const limit = type === "main" ? 10 : 20;

    if (existing.length + newFiles.length > limit) {
      setUploadStatus(`最多只能上傳${limit}個檔案`);
      return;
    }

    const updated = [...existing, ...newFiles].slice(0, limit);
    setValue(type === "main" ? "main_images" : "detail_images", updated, {
      shouldValidate: true,
    });
    handleFieldChange(type === "main" ? "main_images" : "detail_images");

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const res = e.target?.result as string;
        if (type === "main") setMainImagePreview((prev) => [...prev, res]);
        else setDetailImagePreview((prev) => [...prev, res]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number, type: "main" | "detail") => {
    const existing = type === "main" ? mainImageFiles : detailImageFiles;
    const target = existing[index];

    // If it's a server image (array format usually from Oracle view), track it for deletion
    if (target && !(target instanceof File)) {
      const deleteItem = { id: target[0], url: target[2] };
      if (type === "main") setDeleteMainImage((prev) => [...prev, deleteItem]);
      else setDeleteDetailImage((prev) => [...prev, deleteItem]);
    }

    const updated = existing.filter((_, i) => i !== index);
    setValue(type === "main" ? "main_images" : "detail_images", updated, {
      shouldValidate: true,
    });

    if (type === "main")
      setMainImagePreview((prev) => prev.filter((_, i) => i !== index));
    else setDetailImagePreview((prev) => prev.filter((_, i) => i !== index));

    handleFieldChange(type === "main" ? "main_images" : "detail_images");
  };

  // 動態價格驗算
  const validateLotMultiplier = (data: ProductFormData) => {
    const { fixed_lot_multiplier, priceRanges, price } = data;

    // 1. 驗證價格區間的連續性與正確性 (不論包裝量是否存在都需檢查)
    for (let i = 0; i < priceRanges.length; i++) {
      const range = priceRanges[i];
      const min = Number(range.minQuantity);
      const max = Number(range.maxQuantity);

      // 基本數量檢查：區間內最大必須 >= 最小
      if (max < min) {
        showToast({
          type: "error",
          title: "驗證失敗",
          message: `第 ${
            i + 1
          } 條價格區間的最大數量 (${max}) 不得小於最小數量 (${min})`,
        });
        return false;
      }

      // 檢查區間連續性：當前最小數量必須 > 前一條最大數量
      if (i > 0) {
        const prevMax = Number(priceRanges[i - 1].maxQuantity);
        if (min <= prevMax) {
          showToast({
            type: "error",
            title: "驗證失敗",
            message: `第 ${
              i + 1
            } 條價格區間的最小數量 (${min}) 必須大於前一條的最大數量 (${prevMax})`,
          });
          return false;
        }
      }
    }

    if (!fixed_lot_multiplier || fixed_lot_multiplier <= 0) return true;

    let max_price = 0;
    for (const range of priceRanges) {
      const min = Number(range.minQuantity);
      const max = Number(range.maxQuantity);

      if (
        min % fixed_lot_multiplier !== 0 ||
        max % fixed_lot_multiplier !== 0
      ) {
        showToast({
          type: "error",
          title: "驗證失敗",
          message: `數量必須是包裝量 ${fixed_lot_multiplier} 的倍數`,
        });
        return false;
      }
      // 取得動態價格裡最大的單價(最小批量區間)
      if (Number(range.unitPrice) > max_price)
        max_price = Number(range.unitPrice);
    }

    // 最小批量區間的價格需跟系統價格一致
    if (max_price > 0 && price !== max_price) {
      showToast({
        type: "error",
        title: "驗證失敗",
        message: `單價 ${price} 必須與最小批量價格 ${max_price} 相同`,
      });
      return false;
    }
    return true;
  };

  const getChangedData = (data: ProductFormData) => {
    const changes: any = { oracle_id: data.oracle_id };
    const allChanged: Record<string, boolean> = {
      ...Object.entries(dirtyFields)
        .filter(([_, v]) => v === true)
        .reduce<Record<string, boolean>>(
          (acc, [k]) => ({ ...acc, [k]: true }),
          {}
        ),
      ...manuallyChangedFields,
    };

    Object.keys(allChanged).forEach((key) => {
      if (key === "main_images" || key === "detail_images") {
        const files = (data[key] as any[]).filter(
          (item) => item instanceof File
        );
        if (files.length > 0) changes[`${key}_changed`] = files;
      } else {
        changes[key] = (data as any)[key];
      }
    });

    if (allChanged["brand_id"]) changes.brand = data.brand;
    return changes;
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!validateLotMultiplier(data)) return;

    setUploadStatus("處理中...");

    const hasChanges =
      Object.keys(dirtyFields).length > 0 ||
      Object.keys(manuallyChangedFields).length > 0;
    if (
      !hasChanges &&
      deleteMainImage.length === 0 &&
      deleteDetailImage.length === 0
    ) {
      showToast({ type: "info", title: "無變更", message: "未檢測到任何變更" });
      return;
    }

    try {
      // 1. Handle Deletions
      if (deleteMainImage.length > 0)
        await productService.deleteImage(deleteMainImage);
      if (deleteDetailImage.length > 0)
        await productService.deleteImage(deleteDetailImage);

      // 2. Prepare changed data
      const changedData = getChangedData(data);

      // 3. Upload New Images
      if (changedData.main_images_changed) {
        const res = await productService.uploadImage(
          createFormData(changedData.main_images_changed),
          "main",
          data.oracle_id,
          brandTitle
        );
        changedData.main_images_changed = res.file_paths;
      }
      if (changedData.detail_images_changed) {
        const res = await productService.uploadImage(
          createFormData(changedData.detail_images_changed),
          "detail",
          data.oracle_id,
          brandTitle
        );
        changedData.detail_images_changed = res.file_paths;
      }

      // 4. Update Product
      const result = await productService.updateProduct(changedData);
      if (result.success) {
        showToast({
          type: "success",
          title: "更新成功",
          message: "商品已成功更新",
        });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      showToast({
        type: "error",
        title: "更新失敗",
        message: err.message || "發生未知錯誤",
      });
    } finally {
      setUploadStatus("");
    }
  };

  const createFormData = (files: File[]) => {
    const fd = new FormData();
    files.forEach((f, i) => fd.append(`images${i}`, f));
    fd.append("fileNames", JSON.stringify(files.map((f) => f.name)));
    return fd;
  };

  return {
    methods,
    state: {
      isLoading: !originalData,
      mainImagePreview,
      detailImagePreview,
      uploadStatus,
      previewImage,
      showPreviewModal,
      manufactureCategory,
      productCategory,
      tags,
      priceRangeFields,
      selectedMainProductCategory,
      selectedSecondProductCategory,
      selectedTags,
      mainImageFiles,
      detailImageFiles,
    },
    actions: {
      onSubmit: handleSubmit(onSubmit),
      handleFieldChange,
      handleTagChange,
      handleImageUpload,
      removeImage,
      handleImagePreview: (src: string) => {
        setPreviewImage(src);
        setShowPreviewModal(true);
      },
      closePreviewModal: () => {
        setPreviewImage(null);
        setShowPreviewModal(false);
      },
      appendPriceRange: () => {
        appendPriceRange({
          minQuantity: "",
          maxQuantity: "",
          unit: "",
          unitPrice: "",
        });
        handleFieldChange("priceRanges");
      },
      removePriceRange: (index: number) => {
        removePriceRange(index);
        handleFieldChange("priceRanges");
      },
      triggerFileInput: (type: "main" | "detail") => {
        if (type === "main") mainFileInputRef.current?.click();
        else detailFileInputRef.current?.click();
      },
    },
    refs: {
      mainFileInputRef,
      detailFileInputRef,
    },
  };
};
