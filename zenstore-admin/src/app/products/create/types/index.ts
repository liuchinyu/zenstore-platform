export type PriceRange = {
  minQuantity: string | number;
  maxQuantity: string | number;
  unit: string;
  unitPrice: string | number;
};

export type ProductFormData = {
  oracle_id: string;
  product_id: string;
  description: string;
  fixed_lot_multiplier: number;
  unit_weight: number;
  brand_id: string;
  brand: string;
  main_product_category: string;
  second_product_category?: string;
  third_product_category?: string;
  package_method: string;
  seo_title?: string;
  seo_description?: string;
  priceRanges: PriceRange[];
  is_published: number;
  inventory: number;
  vendor_lead_time: number;
  tags: number[];
  main_images: File[];
  detail_images: File[];
  high_voltage: string;
  low_voltage: string;
  high_temp: string;
  low_temp: string;
  product_application: string;
};
