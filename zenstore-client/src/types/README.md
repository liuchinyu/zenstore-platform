# Types 架構說明文件

## 📁 目錄結構

```
src/types/
├── index.ts                    # 統一匯出點
├── common.ts                   # 通用類型定義
└── models/                     # 領域模型
    ├── user.ts                 # 用戶相關類型
    ├── address.ts              # 地址相關類型
    ├── payment.ts              # 支付相關類型
    ├── product.ts              # 產品相關類型
    ├── category.ts             # 分類相關類型
    ├── cart.ts                 # 購物車相關類型
    ├── order.ts                # 訂單相關類型
    └── wishlist.ts             # 收藏清單相關類型
```

## 🎯 設計原則

### 1. **混合式架構（Hybrid Approach）**

- **共享類型集中管理**：通用的 API 回應格式、分頁參數等放在 `common.ts`
- **領域模型分層**：按業務領域（user、product、order 等）分別建立檔案
- **就近原則**：Service 和 Slice 特定的類型仍保留在各自檔案中

### 2. **統一匯出點**

所有類型都透過 `src/types/index.ts` 統一匯出，使用方式：

```typescript
// ✅ 推薦：從統一匯出點 import
import { ApiResponse, UserData, CartItem, Product } from "@/types";

// ❌ 避免：直接從子檔案 import
import { UserData } from "@/types/models/user";
```

## 📋 檔案說明

### `common.ts` - 通用類型

包含所有 Service 層共用的類型：

- `ApiResponse<T>` - 統一的 API 回應格式
- `PaginationParams` - 分頁參數
- `DateRange` - 日期範圍篩選
- `SortParams` - 排序參數
- `FilterParams` - 通用篩選參數

### `models/user.ts` - 用戶相關

- `UserData` - 用戶資料介面
- `CompanyData` - 公司資料介面
- `LoginCredentials` - 登入憑證
- `RegisterCredentials` - 註冊憑證
- `MemberType` - 會員類型列舉
- `MemberStatus` - 會員狀態列舉

### `models/address.ts` - 地址相關

- `ShippingAddress` - 基礎收件地址
- `UpdateShippingAddress` - 更新地址請求
- `CheckoutShippingInfo` - 結帳用收件資訊
- `DeliveryMethod` - 配送方式列舉
- `DeliveryTime` - 配送時段列舉

### `models/payment.ts` - 支付相關

- `PaymentInfo` - 支付資訊介面
- `PaymentMethod` - 支付方式列舉
- `InvoiceType` - 發票類型列舉
- `InvoiceHandling` - 發票處理方式列舉
- `CreditCardType` - 信用卡類型列舉

### `models/product.ts` - 產品相關

- `Product` - 產品基本資訊
- `ProductCategory` - 產品分類
- `ProductImage` - 產品圖片
- `ProductPrice` - 產品價格
- `ProductDetailData` - 產品詳細資料
- `PriceRange` - 價格區間

### `models/category.ts` - 分類相關

- `Category` - 分類資料介面
- `RawCategory` - 原始分類資料（API 回傳格式）

### `models/cart.ts` - 購物車相關

- `CartItem` - 購物車項目
- `AddToCartRequest` - 加入購物車請求
- `UpdateCartItemRequest` - 更新購物車項目請求
- `CartAnimatingItem` - 購物車動畫項目
- `CartState` - 購物車 Redux State

### `models/order.ts` - 訂單相關

- `OrderItem` - 訂單項目
- `OrderFilterParams` - 訂單篩選參數
- `CreateOrderRequest` - 建立訂單請求
- `OrderMaster` - 訂單主檔資料
- `OrderDetail` - 訂單詳細資料
- `OrderStatus` - 訂單狀態列舉

### `models/wishlist.ts` - 收藏清單相關

- `WishlistItem` - 收藏清單項目
- `WishlistState` - 收藏清單 Redux State

## 🔄 遷移記錄

### 已完成的重構

1. ✅ 建立新的 types 目錄結構
2. ✅ 移除 Service 層的重複 `ApiResponse` 定義
3. ✅ 統一 `ShippingAddress` 和相關地址類型
4. ✅ 統一 `LoginCredentials`、`RegisterCredentials` 等認證類型
5. ✅ 更新所有 import 路徑從 `@/types/category` 改為 `@/types`
6. ✅ 更新所有 import 路徑從 `@/types/wishlist` 改為 `@/types`

### 已更新的檔案清單

**Services:**

- `authService.ts`
- `accountService.ts`
- `orderService.ts`
- `wishlistService.ts`
- `cartService.ts`

**Redux Slices:**

- `cartSlice.ts`
- `checkoutSlice.ts`
- `authSlice.ts`
- `productSlice.ts`
- `headerSlice.ts`
- `wishlistSlice.ts`

**Hooks:**

- `useCart.ts`
- `useFetchCategories.ts`
- `useProductCategories.ts`

**Components:**

- `ProductListTable.tsx`
- `ProductFilter.tsx`
- `ProductCard.tsx`
- `CategoryList.tsx`
- `CartItem.tsx`
- `WishlistCard.tsx`

**Pages:**

- `app/checkout/page.tsx`
- `app/products/[category_title]/page.tsx`

## 💡 最佳實踐

### 1. **新增類型時的決策流程**

```
是否為多個模組共用？
├─ 是 → 放在 types/common.ts 或 types/models/
└─ 否 → 放在使用該類型的 Service/Slice 檔案中
```

### 2. **命名規範**

- **Interface**: 使用 PascalCase，例如 `UserData`、`ApiResponse`
- **Enum**: 使用 PascalCase，例如 `OrderStatus`、`PaymentMethod`
- **Type Alias**: 使用 PascalCase，例如 `UpdateUserData`

### 3. **泛型使用**

```typescript
// ✅ 推薦：使用泛型提供類型安全
const response: ApiResponse<UserData> = await AuthService.getUserData(id);

// ❌ 避免：使用 any
const response: ApiResponse = await AuthService.getUserData(id);
```

### 4. **類型繼承與組合**

```typescript
// ✅ 推薦：使用 extends 或 Partial 組合類型
export interface CheckoutShippingInfo extends ShippingAddress {
  deliveryTime: string;
  deliveryMethod: string;
}

export type UpdateShippingAddress = Partial<ShippingAddress> & {
  id: string;
};
```

## 🚀 未來擴展建議

1. **新增 Enums 目錄**（如果列舉類型增多）

   ```
   types/
   └── enums/
       ├── orderStatus.ts
       ├── memberType.ts
       └── paymentMethod.ts
   ```

2. **新增 DTOs 目錄**（如果需要區分前後端資料格式）

   ```
   types/
   └── dtos/
       ├── request/
       └── response/
   ```

3. **新增 Utilities 類型**
   ```typescript
   // types/utils.ts
   export type Nullable<T> = T | null;
   export type Optional<T> = T | undefined;
   export type ID = string | number;
   ```

## 📚 參考資源

- [TypeScript Handbook - Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
- [TypeScript Deep Dive - Project Structure](https://basarat.gitbook.io/typescript/project/project-structure)
- [Airbnb TypeScript Style Guide](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-typescript)

---

**最後更新日期**: 2025-12-24  
**維護者**: Development Team
