"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchProducts, publishProduct } from "@/store/productSlice";
import {
  applyCategory,
  fetchCategoryRelation,
  fetchManufactureCategories,
  fetchProductCategories,
} from "@/store/categorySlice";
import { fetchTags, fetchTagRelation, applyTag } from "@/store/tagSlice";
import { useToast } from "@/components/ui/Toast";
import { usePagination } from "@/hooks/usePagination";

// 商品Selector
import {
  selectProducts,
  selectProductLoading,
  selectProductError,
  selectProductPagination,
} from "@/store/selectors/productSelector";

// 分類Selector
import {
  selectCategoryRelation,
  selectManufactureCategories,
  selectProductCategories,
} from "@/store/selectors/categorySelector";

// 標籤Selector
import { selectTags, selectTagRelation } from "@/store/selectors/tagSelector";
import { FilterConditions } from "@/components/ProductSettingsModal/FilterModal";
import { CategoryType } from "@/types/products/categoryType";

export const useProductManagement = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  // --- Data from Redux ---
  const products = useAppSelector(selectProducts);
  const isLoading = useAppSelector(selectProductLoading);
  const error = useAppSelector(selectProductError);
  const { totalPages: reduxTotalPages, totalItems: reduxTotalItems } =
    useAppSelector(selectProductPagination);

  // 製造商分類
  const manufactureCategories = useAppSelector(selectManufactureCategories);
  // 商品分類
  const productCategories = useAppSelector(selectProductCategories);
  const categoryRelation = useAppSelector(selectCategoryRelation);
  const tags = useAppSelector(selectTags);
  const tagRelation = useAppSelector(selectTagRelation);

  // --- Pagination Hook ---
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    setTotalPages,
    setTotalItems,
  } = usePagination();

  // --- UI States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Filter conditions
  const [filters, setFilters] = useState<FilterConditions>({
    publishStatus: "",
    brand: null,
    categoryLevel1: null,
    categoryLevel2: null,
    categoryLevel3: null,
    tag: null,
    keyword: "",
  });

  // Modal temporary states for Category/Tag settings
  const [selectedManufacturerCategory, setSelectedManufacturerCategory] =
    useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number[]>([]);
  const [selectedTag, setSelectedTag] = useState<number[]>([]);

  // Initial states for restoration on cancel
  const [initialManufacturerCategory, setInitialManufacturerCategory] =
    useState<number | null>(null);
  const [initialCategory, setInitialCategory] = useState<number[]>([]);
  const [initialTags, setInitialTags] = useState<number[]>([]);

  const updateBrand = useMemo(() => {
    return manufactureCategories.find(
      (item: CategoryType) => item.CATEGORY_ID === selectedManufacturerCategory,
    )?.CATEGORY_TITLE;
  }, [manufactureCategories, selectedManufacturerCategory]);

  // --- API Actions ---
  const getProductList = useCallback(
    async (page = currentPage, currentFilters = filters) => {
      await dispatch(
        fetchProducts({
          page,
          pageSize: itemsPerPage,
          filters: currentFilters,
        }),
      );
      setSelectedProducts([]);
    },
    [dispatch, currentPage, itemsPerPage, filters],
  );

  // Initial Data Fetching
  useEffect(() => {
    getProductList();
  }, [getProductList]);

  // 製造商分類
  useEffect(() => {
    if (manufactureCategories.length === 0)
      dispatch(fetchManufactureCategories());
  }, [manufactureCategories]);

  // 商品分類
  useEffect(() => {
    if (productCategories.length === 0) dispatch(fetchProductCategories());
  }, [productCategories]);

  // 分類關聯
  useEffect(() => {
    if (categoryRelation.length === 0) dispatch(fetchCategoryRelation());
  }, [categoryRelation]);

  // 標籤
  useEffect(() => {
    if (tags.length === 0) dispatch(fetchTags());
  }, [tags]);

  // 標籤關聯
  useEffect(() => {
    if (tagRelation.length === 0) dispatch(fetchTagRelation());
  }, [tagRelation]);

  // Sync Redux Pagination
  useEffect(() => {
    if (reduxTotalPages !== undefined) setTotalPages(reduxTotalPages);
    if (reduxTotalItems !== undefined) setTotalItems(reduxTotalItems);
  }, [reduxTotalPages, reduxTotalItems, setTotalPages, setTotalItems]);

  // --- Handlers ---

  // Selection
  const handleSelectProduct = (oracleId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(oracleId)
        ? prev.filter((id) => id !== oracleId)
        : [...prev, oracleId],
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p: any) => p.ORACLE_ID));
    }
  };

  // Image Preview
  const handleImagePreview = useCallback((src: string) => {
    setPreviewImage(src);
    setShowPreviewModal(true);
  }, []);

  const closePreviewModal = useCallback(() => {
    setShowPreviewModal(false);
    setPreviewImage(null);
  }, []);

  // Filtering
  const handleFilterChange = (filterType: string, value: any) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleBatchFilterChange = (updates: Partial<FilterConditions>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const applyFilters = useCallback(
    async (passedFilters?: FilterConditions) => {
      const currentFilters = passedFilters || filters;
      handlePageChange(1);
      await getProductList(1, currentFilters);
    },
    [filters, handlePageChange, getProductList],
  );

  const handleSearch = useCallback(() => {
    const updatedFilters = { ...filters, keyword: searchTerm };
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  }, [searchTerm, filters, applyFilters]);

  const resetFilters = () => {
    const defaultFilters = {
      publishStatus: "",
      brand: null,
      categoryLevel1: null,
      categoryLevel2: null,
      categoryLevel3: null,
      tag: null,
      keyword: "",
    };
    setFilters(defaultFilters);
    setSearchTerm("");
    applyFilters(defaultFilters);
  };

  const handlePublishToggle = (isPublished: number) => {
    const actionName = isPublished === 1 ? "上架" : "下架";
    dispatch(
      publishProduct({
        oracle_id: selectedProducts,
        is_published: isPublished,
      }),
    )
      .unwrap()
      .then(() => {
        showToast({
          type: "success",
          title: `${actionName}成功`,
          message: `已成功${actionName} ${selectedProducts.length} 個商品`,
        });
      })
      .catch((err) => {
        showToast({
          type: "error",
          title: `${actionName}失敗`,
          message: err.message || "操作失敗，請稍後再試",
        });
      });
  };

  const openCategoryModal = () => {
    if (selectedProducts.length === 1) {
      const selectedOracleId = selectedProducts[0];
      // 取得被選擇的商品關聯
      const relations = categoryRelation.filter(
        (rel: any) => rel.ORACLE_ID === selectedOracleId,
      );

      // 判斷被選擇的商品是否有選擇製造商分類，若有則在製造商分類中選取該分類
      const manufacturerCategory = manufactureCategories.find(
        (cat: CategoryType) =>
          relations.some((rel: any) => rel.CATEGORY_ID === cat.CATEGORY_ID),
      );

      // 判斷被選擇的商品是否有選擇商品分類，若有則在商品分類中選取該分類
      const selectedCats = productCategories
        .filter((cat: CategoryType) =>
          relations.some((rel: any) => rel.CATEGORY_ID === cat.CATEGORY_ID),
        )
        .map((cat: CategoryType) => cat.CATEGORY_ID);

      const mId = manufacturerCategory?.CATEGORY_ID ?? null;
      setSelectedManufacturerCategory(mId);
      setSelectedCategory(selectedCats);
      setInitialManufacturerCategory(mId);
      setInitialCategory(selectedCats);
    } else {
      setSelectedManufacturerCategory(null);
      setSelectedCategory([]);
      setInitialManufacturerCategory(null);
      setInitialCategory([]);
    }
    setShowCategoryModal(true);
  };

  const handleProductCategoryChange = (
    catId: number,
    secondId?: number,
    thirdId?: number,
  ) => {
    const newCats = [catId];
    if (secondId) newCats.push(secondId);
    if (thirdId) newCats.push(thirdId);
    setSelectedCategory(newCats);
  };

  // 商品套用分類
  const handleApplyCategories = async () => {
    try {
      await dispatch(
        applyCategory({
          productIds: selectedProducts,
          categoryIds: [
            ...selectedCategory,
            selectedManufacturerCategory,
          ].filter(Boolean),
          brand: updateBrand,
        }),
      );

      setShowCategoryModal(false);
      showToast({
        type: "success",
        title: "分類設定成功",
        message: "操作成功",
      });
    } catch {
      showToast({
        type: "error",
        title: "分類設定失敗",
        message: "請稍後再試",
      });
    }
  };

  // 標籤Modal 設定
  const openTagModal = () => {
    if (selectedProducts.length === 1) {
      const selectedOracleId = selectedProducts[0];
      const tagIds = tagRelation
        .filter((rel: any) => rel.ORACLE_ID === selectedOracleId)
        .map((rel: any) => rel.TAG_ID);
      setSelectedTag(tagIds);
      setInitialTags(tagIds);
    } else {
      setSelectedTag([]);
      setInitialTags([]);
    }
    setShowTagModal(true);
  };

  const handleSelectTag = (tagId: number) => {
    setSelectedTag((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleApplyTag = async () => {
    try {
      await dispatch(
        applyTag({ productIds: selectedProducts, tagIds: selectedTag }),
      ).unwrap();
      setShowTagModal(false);
      showToast({
        type: "success",
        title: "標籤設定成功",
        message: "操作成功",
      });
    } catch {
      showToast({
        type: "error",
        title: "標籤設定失敗",
        message: "請稍後再試",
      });
    }
  };

  return {
    // States
    products,
    isLoading,
    error,
    selectedProducts,
    searchTerm,
    filters,
    manufactureCategories,
    productCategories,
    tags,

    // Pagination
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      handlePageChange,
    },

    // Modal States
    modalStates: {
      showCategoryModal,
      showTagModal,
      showPreviewModal,
      previewImage,
      selectedManufacturerCategory,
      selectedCategory,
      selectedTag,
    },

    // Actions
    actions: {
      setSearchTerm,
      handleSearch,
      handleSelectProduct,
      handleSelectAll,
      handleImagePreview,
      closePreviewModal,
      handleFilterChange,
      handleBatchFilterChange,
      applyFilters,
      resetFilters,
      handlePublish: () => handlePublishToggle(1),
      handleUnpublish: () => handlePublishToggle(0),
      openCategoryModal,
      closeCategoryModal: () => setShowCategoryModal(false),
      handleManufacturerCategoryChange: setSelectedManufacturerCategory,
      handleProductCategoryChange,
      handleApplyCategories,
      openTagModal,
      closeTagModal: () => setShowTagModal(false),
      handleSelectTag,
      handleApplyTag,
      onImportSuccess: getProductList,
    },
  };
};
