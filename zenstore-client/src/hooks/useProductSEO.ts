import { useCallback, useEffect } from "react";

interface Product {
  PRODUCT_ID: string;
  BRAND: string;
  SEO_TITLE?: string | null;
  SEO_DESCRIPTION?: string | null;
  DESCRIPTION?: string | null;
  IMAGE_URL?: string | null;
  PRICE?: number | null;
  INVENTORY?: number | null;
  ORACLE_ID?: string | null;
}

interface Category {
  CATEGORY_TITLE?: string;
}

interface ProductImage {
  IMAGE_URL?: string;
}

interface UseProductSEOProps {
  product: Product | undefined;
  main_images: ProductImage[];
  main_category?: Category;
  sub_category?: Category;
  detail_category?: Category;
}

export const useProductSEO = ({
  product,
  main_images,
  main_category,
  sub_category,
  detail_category,
}: UseProductSEOProps) => {
  // 輔助函數：更新或創建 meta tag
  const updateMetaTag = useCallback(
    (property: string, content: string, attribute: "name" | "property") => {
      if (!content) return;

      let metaTag = document.querySelector(`meta[${attribute}="${property}"]`);

      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute(attribute, property);
        document.head.appendChild(metaTag);
      }

      metaTag.setAttribute("content", content);
    },
    [],
  );

  // 添加結構化數據
  const addStructuredData = useCallback(() => {
    if (!product) return;

    // 移除舊的結構化數據
    const existingScript = document.querySelector(
      'script[data-seo="structured-data"]',
    );
    if (existingScript) {
      existingScript.remove();
    }

    // 創建新的結構化數據
    const script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.setAttribute("data-seo", "structured-data");

    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.PRODUCT_ID,
      description: product.DESCRIPTION,
      brand: {
        "@type": "Brand",
        name: product.BRAND,
      },
      image: main_images?.[0]?.IMAGE_URL || product.IMAGE_URL,
      offers: {
        "@type": "Offer",
        price: product.PRICE,
        priceCurrency: "TWD",
        availability:
          product.INVENTORY && product.INVENTORY > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
      },
      category: [
        main_category?.CATEGORY_TITLE,
        sub_category?.CATEGORY_TITLE,
        detail_category?.CATEGORY_TITLE,
      ].filter(Boolean),
    };

    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }, [product, main_images, main_category, sub_category, detail_category]);

  // 執行 SEO 優化
  const applySEO = useCallback(() => {
    if (!product) return;

    // 更新頁面標題
    const seoTitle =
      product.SEO_TITLE || `${product.PRODUCT_ID} - ${product.BRAND}`;
    document.title = seoTitle;

    // 更新 meta description
    const seoDescription =
      product.SEO_DESCRIPTION || product.DESCRIPTION || "商品詳情";
    updateMetaTag("description", seoDescription, "name");

    // 更新 Open Graph tags (Facebook, Line, WeChat 等)
    updateMetaTag("og:title", seoTitle, "property");
    updateMetaTag("og:description", seoDescription, "property");
    updateMetaTag("og:type", "product", "property");
    updateMetaTag(
      "og:image",
      main_images?.[0]?.IMAGE_URL || product.IMAGE_URL || "",
      "property",
    );
    updateMetaTag("og:site_name", "增你強線上商城 ZT Store", "property");

    // 更新 keywords
    const keywords = [
      product.PRODUCT_ID,
      product.BRAND,
      main_category?.CATEGORY_TITLE,
      sub_category?.CATEGORY_TITLE,
      detail_category?.CATEGORY_TITLE,
    ]
      .filter(Boolean)
      .join(", ");
    updateMetaTag("keywords", keywords, "name");

    // 添加結構化數據
    addStructuredData();
  }, [
    product,
    main_images,
    main_category,
    sub_category,
    detail_category,
    updateMetaTag,
    addStructuredData,
  ]);

  // 自動執行 SEO 優化
  useEffect(() => {
    applySEO();
  }, [applySEO]);

  // 返回函數，讓組件可以手動調用
  return {
    applySEO,
    updateMetaTag,
    addStructuredData,
  };
};
