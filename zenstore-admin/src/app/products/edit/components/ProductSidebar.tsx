"use client";

import { ProductSidebar as SharedProductSidebar } from "../../components/ProductSidebar";

interface Props {
  tags: any[];
  selectedTags: number[];
  onTagChange: (id: number) => void;
  onFieldChange: (name: string) => void;
}

export const ProductSidebar = ({
  tags,
  selectedTags,
  onTagChange,
  onFieldChange,
}: Props) => (
  <SharedProductSidebar
    tags={tags}
    selectedTags={selectedTags}
    onTagChange={onTagChange}
    onFieldChange={onFieldChange}
    publishOptions={[
      { value: "1", label: "上架" },
      { value: "0", label: "下架" },
    ]}
    valueAsNumberForPublish={false}
  />
);
