"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchCategories } from "@/store/categorySlice";
import { fetchTags } from "@/store/tagSlice";
import { useToast } from "@/components/ui/Toast";
import productService from "@/services/productService";
import { ProductFormData } from "../types";
import { selectTags } from "@/store/selectors/tagSelector";

export const useCreateProduct = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [mainImagePreview, setMainImagePreview] = useState<string[]>([]);
  const [detailImagePreview, setDetailImagePreview] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const detailFileInputRef = useRef<HTMLInputElement | null>(null);

  const methods = useForm<ProductFormData>({
    defaultValues: {
      is_published: 1,
      priceRanges: [
        { minQuantity: "", maxQuantity: "", unit: "", unitPrice: "" },
      ],
      tags: [],
      main_images: [],
      detail_images: [],
    },
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    resetField,
  } = methods;

  const {
    fields: priceRangeFields,
    append: appendPriceRange,
    remove: removePriceRange,
  } = useFieldArray({
    control,
    name: "priceRanges",
    rules: {
      required: "請至少新增一個價格區間",
      validate: (value) => value.length > 0 || "請至少新增一個價格區間",
    },
  });

  const tags = useAppSelector(selectTags);
  const { categories } = useAppSelector((state) => state.category);

  const manufactureCategory = categories.filter(
    (cat) => cat.CATEGORY_TYPE === "製造商",
  );
  const productCategory = categories.filter(
    (cat) => cat.CATEGORY_TYPE === "產品",
  );

  const selectedManufacture = watch("brand_id");
  const selectedMainProductCategory = watch("main_product_category");
  const selectedSecondProductCategory = watch("second_product_category");
  const mainImageFiles = watch("main_images", []);
  const detailImageFiles = watch("detail_images", []);
  const selectedTags = watch("tags", []);

  useEffect(() => {
    if (tags.length === 0) {
      dispatch(fetchTags());
    }
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, tags.length, categories.length]);

  useEffect(() => {
    if (selectedManufacture) {
      const selectedBrand = manufactureCategory.find(
        (m) => m.CATEGORY_ID.toString() === selectedManufacture,
      );
      if (selectedBrand) {
        setValue("brand", selectedBrand.CATEGORY_TITLE);
      }
    } else {
      setValue("brand", "");
    }
  }, [selectedManufacture, manufactureCategory, setValue]);

  useEffect(() => {
    resetField("second_product_category");
    resetField("third_product_category");
  }, [selectedMainProductCategory, resetField]);

  useEffect(() => {
    resetField("third_product_category");
  }, [selectedSecondProductCategory, resetField]);

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "main" | "detail",
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);

    const existingFiles = type === "main" ? mainImageFiles : detailImageFiles;
    const fileLimit = type === "main" ? 10 : 20;

    const totalFiles = existingFiles.length + newFiles.length;
    if (totalFiles > fileLimit) {
      setUploadStatus(`最多只能上傳${fileLimit}個檔案`);
      return;
    }

    const updatedFiles = [...existingFiles, ...newFiles].slice(0, fileLimit);
    setValue(type === "main" ? "main_images" : "detail_images", updatedFiles, {
      shouldValidate: true,
    });

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          if (type === "main") {
            setMainImagePreview((prev) => [
              ...prev,
              e.target?.result as string,
            ]);
          } else {
            setDetailImagePreview((prev) => [
              ...prev,
              e.target?.result as string,
            ]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number, type: "main" | "detail") => {
    if (type === "main") {
      setMainImagePreview((prev) => prev.filter((_, i) => i !== index));
      const updatedFiles = mainImageFiles.filter((_, i) => i !== index);
      setValue("main_images", updatedFiles, { shouldValidate: true });
    } else {
      setDetailImagePreview((prev) => prev.filter((_, i) => i !== index));
      const updatedFiles = detailImageFiles.filter((_, i) => i !== index);
      setValue("detail_images", updatedFiles, { shouldValidate: true });
    }
  };

  const handleTagChange = (tagId: number) => {
    const currentTags = selectedTags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId];
    setValue("tags", newTags, { shouldValidate: true });
  };

  const handleFieldChange = (fieldName: string) => {
    // 預留欄位變更追蹤，後續若需擴充可集中於此
    return fieldName;
  };

  const uploadImagesToServer = useCallback(
    async (
      files: File[],
      type: "main" | "detail",
      oracle_id: string,
      brand: string,
    ) => {
      if (!files || files.length === 0) {
        return { success: true, file_paths: [] as string[] };
      }
      try {
        const formData = new FormData();
        files.forEach((file, index) => {
          formData.append(`images${index}`, file);
        });
        const fileNames = files.map((file) => file.name);
        formData.append("fileNames", JSON.stringify(fileNames));
        const response = await productService.uploadImage(
          formData,
          type,
          oracle_id,
          brand,
        );
        if (response.success) {
          return { success: true, file_paths: response.file_paths as string[] };
        }
        return { success: false, message: response.message };
      } catch (error) {
        let message = "上傳失敗";
        if (error instanceof Error) {
          message = error.message;
        }
        return { success: false, message };
      }
    },
    [],
  );

  const onSubmit = async (data: ProductFormData) => {
    setUploadStatus("處理中...");

    const mainImagesResult = await uploadImagesToServer(
      data.main_images,
      "main",
      data.oracle_id,
      data.brand,
    );
    if (!mainImagesResult.success) {
      setUploadStatus(`主要圖片上傳失敗: ${mainImagesResult.message}`);
      return;
    }

    const detailImagesResult = await uploadImagesToServer(
      data.detail_images,
      "detail",
      data.oracle_id,
      data.brand,
    );
    if (!detailImagesResult.success) {
      setUploadStatus(`詳情圖片上傳失敗: ${detailImagesResult.message}`);
      return;
    }

    const processedData = {
      ...data,
      main_images: mainImagesResult.file_paths,
      detail_images: detailImagesResult.file_paths,
      is_published: Number(data.is_published),
      priceRanges: data.priceRanges.map((p) => ({
        ...p,
        minQuantity: Number(p.minQuantity),
        maxQuantity: Number(p.maxQuantity),
        unitPrice: Number(p.unitPrice),
      })),
    };

    try {
      setUploadStatus("正在儲存商品...");
      const response = await productService.createProduct(processedData);
      if (response.success) {
        setUploadStatus("商品新增成功");
        showToast({
          type: "success",
          title: "商品新增成功",
          message: "商品新增成功",
        });
      } else {
        setUploadStatus(`商品新增失敗: ${response.message}`);
        showToast({
          type: "error",
          title: "商品新增失敗",
          message: `商品新增失敗: ${response.message}`,
        });
      }
    } catch (error) {
      setUploadStatus("新增商品時發生錯誤");
      showToast({
        type: "error",
        title: "商品新增失敗",
        message: "新增商品時發生錯誤",
      });
    }
  };

  return {
    methods,
    state: {
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
      errors,
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
      },
      removePriceRange: (index: number) => {
        removePriceRange(index);
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
    form: {
      register,
      setValue,
    },
  };
};
