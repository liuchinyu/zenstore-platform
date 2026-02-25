# 後台管理系統 Google Analytics 4 設定說明

## 1. 建立環境變數檔案

在專案根目錄建立 `.env.local` 檔案，並加入以下內容：

```bash
# Google Analytics 4 測量 ID
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

請將 `G-XXXXXXXXXX` 替換為您在 Google Analytics 4 中取得的實際測量 ID。

## 2. 功能說明

此實作包含以下 GA4 追蹤功能：

- **頁面瀏覽追蹤**：自動追蹤所有頁面瀏覽
- **管理員登入追蹤**：追蹤管理員登入行為
- **管理操作追蹤**：追蹤各種管理操作
- **產品管理追蹤**：追蹤產品增刪改操作
- **訂單管理追蹤**：追蹤訂單狀態變更
- **用戶管理追蹤**：追蹤用戶管理操作

## 3. 使用方法

### 基本事件追蹤

```typescript
import { event } from "@/lib/gtag";

// 追蹤自定義事件
event({
  action: "button_click",
  category: "admin",
  label: "Content_refresh",
  value: 1,
});
```

### 管理員登入追蹤

```typescript
import { adminLogin } from "@/lib/gtag";

// 追蹤管理員登入
adminLogin("ADMIN_001");
```

### 管理操作追蹤

```typescript
import { adminAction } from "@/lib/gtag";

// 追蹤管理操作
adminAction("export_data", "orders", "CSV export");
```

### 產品管理追蹤

```typescript
import { productManagement } from "@/lib/gtag";

// 追蹤產品操作
productManagement("create", "PROD_001");
productManagement("update", "PROD_001");
productManagement("delete", "PROD_001");
```

### 訂單管理追蹤

```typescript
import { orderManagement } from "@/lib/gtag";

// 追蹤訂單操作
orderManagement("view", "ORD_001");
orderManagement("update_status", "ORD_001");
orderManagement("cancel", "ORD_001");
```

### 用戶管理追蹤

```typescript
import { userManagement } from "@/lib/gtag";

// 追蹤用戶操作
userManagement("view", "USER_001");
userManagement("block", "USER_001");
userManagement("unblock", "USER_001");
```

## 4. 建議追蹤的管理操作

### 產品管理

- 新增產品
- 編輯產品
- 刪除產品
- 產品狀態變更
- 產品分類管理

### 訂單管理

- 查看訂單詳情
- 更新訂單狀態
- 取消訂單
- 訂單出貨
- 訂單退款

### 用戶管理

- 查看用戶資料
- 封鎖/解封用戶
- 用戶權限變更
- 用戶群組管理

### 系統管理

- 登入/登出
- 資料匯出
- 系統設定變更
- 備份操作

## 5. 注意事項

- 確保環境變數 `NEXT_PUBLIC_GA_ID` 已正確設定
- 在開發環境中，GA4 事件會正常發送但可能不會出現在 GA4 報表中
- 建議在生產環境中測試 GA4 追蹤功能
- 注意追蹤敏感資訊時要遵守隱私法規
