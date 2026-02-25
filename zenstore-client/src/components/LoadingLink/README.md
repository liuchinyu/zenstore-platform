# LoadingLink 組件使用說明

## 概述

`LoadingLink` 是一個帶有等待動畫的 Link 組件，可以在頁面跳轉時顯示統一的等待動畫。

## 基本用法

### 1. 替換現有的 Link 組件

```tsx
// 原本的寫法
<Link href="/products">產品列表</Link>

// 使用 LoadingLink
<LoadingLink href="/products">產品列表</LoadingLink>
```

### 2. 自定義等待文字

```tsx
<LoadingLink href="/account/profile" loadingText="正在載入帳號資料...1">
  帳號資料
</LoadingLink>
```

### 3. 自定義等待時間

```tsx
<LoadingLink href="/products" loadingText="正在載入產品列表..." delay={500}>
  產品列表
</LoadingLink>
```

### 4. 保持原有的 onClick 處理

```tsx
<LoadingLink
  href="/products"
  onClick={(e) => {
    // 自定義處理邏輯
    console.log("點擊了產品連結");
  }}
>
  產品列表
</LoadingLink>
```

## 屬性說明

| 屬性          | 類型       | 預設值        | 說明                     |
| ------------- | ---------- | ------------- | ------------------------ |
| `href`        | `string`   | -             | 跳轉路徑（必需）         |
| `loadingText` | `string`   | `"載入中..."` | 等待動畫顯示的文字       |
| `delay`       | `number`   | `300`         | 等待時間（毫秒）         |
| `onClick`     | `function` | -             | 點擊事件處理函數         |
| `className`   | `string`   | -             | CSS 類名                 |
| 其他          | `any`      | -             | 支援所有 Link 組件的屬性 |

## 使用 useGlobalLoading Hook

```tsx
import { useGlobalLoading } from "@/hooks/useGlobalLoading";

const MyComponent = () => {
  const { navigateWithLoading, showLoading, hideLoading } = useGlobalLoading();

  const handleClick = () => {
    // 程式化導航
    navigateWithLoading("/products", "正在載入產品...");
  };

  return <button onClick={handleClick}>跳轉到產品頁面</button>;
};
```

## 注意事項

1. **自動處理**：LoadingLink 會自動處理等待動畫，無需手動管理狀態
2. **事件處理**：如果提供了 `onClick` 並調用 `e.preventDefault()`，則不會觸發等待動畫
3. **效能優化**：預設等待時間為 300ms，平衡了用戶體驗和效能
4. **全域狀態**：等待動畫狀態由 Redux 統一管理
