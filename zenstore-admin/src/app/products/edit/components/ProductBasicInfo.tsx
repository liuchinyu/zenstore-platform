"use client";

import { ProductBasicInfo as SharedProductBasicInfo } from "../../components/ProductBasicInfo";

interface Props {
  onFieldChange: (name: string) => void;
}

export const ProductBasicInfo = ({ onFieldChange }: Props) => (
  <SharedProductBasicInfo
    onFieldChange={onFieldChange}
    disableOracleId
    showPriceField
    minFixedLot={1}
  />
);
