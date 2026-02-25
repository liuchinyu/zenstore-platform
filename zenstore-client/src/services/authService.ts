import axiosInstance, { axios } from "@/lib/axios";
import { ApiResponse, LoginCredentials, RegisterCredentials } from "@/types";

class AuthService {
  // 靜態快取相關屬性
  private static userDataCache: Map<string, { data: any; timestamp: number }> =
    new Map(); //針對跨時間進行快取
  private static companyDataCache: Map<
    string,
    { data: any; timestamp: number }
  > = new Map();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5分鐘快取時間
  private static userDataPromises: Map<string, Promise<ApiResponse>> =
    new Map(); //針對同時性進行快取
  private static companyDataPromises: Map<string, Promise<ApiResponse>> =
    new Map();

  // 清除快取的方法
  static clearUserDataCache(member_id?: string) {
    if (member_id) {
      AuthService.userDataCache.delete(member_id);
      AuthService.userDataPromises.delete(member_id);
    } else {
      AuthService.userDataCache.clear();
      AuthService.userDataPromises.clear();
    }
  }

  static clearCompanyDataCache(member_id?: string) {
    if (member_id) {
      AuthService.companyDataCache.delete(member_id);
      AuthService.companyDataPromises.delete(member_id);
    } else {
      AuthService.companyDataCache.clear();
      AuthService.companyDataPromises.clear();
    }
  }

  // 檢查快取是否有效
  private static isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < AuthService.CACHE_TTL;
  }

  static async login(credentials: LoginCredentials) {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      return {
        success: true,
        message: response.data.message || "登入成功",
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log("errorss", error.response.data);
        return {
          success: error.response.data.success,
          message:
            error.response.data.message ||
            "登入失敗，請確認輸入信箱密碼是否正確",
          email: error.response.data.email,
          token: error.response.data.token,
          userName: error.response.data.userName,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async logout() {
    try {
      const response = await axiosInstance.post("/auth/logout");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log("logout失敗", error.response.data);
        return {
          success: error.response.data.success,
          message: error.response.data.message || "登出失敗，請稍後再試",
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async register(credentials: RegisterCredentials) {
    try {
      const response = await axiosInstance.post("/auth/register", credentials);
      return response;
    } catch (error) {
      console.log("註冊失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        // 從API回傳的錯誤中提取訊息
        return {
          success: false,
          message: error.response.data.message || "註冊失敗，請稍後再試",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  //路由token驗證
  static async validateVerificationToken(
    email: string,
    token: string,
    userName: string,
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post(
        "/auth/validate-verification-token",
        { email, token, userName },
      );
      return {
        success: true,
        message: response.data.message || "驗證成功",
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message:
            error.response.data.message || "驗證失敗，無效或已過期的驗證連結",
          status: error.response.status,
        };
      }

      return {
        success: false,
        message: "系統錯誤，請稍後再試",
      };
    }
  }

  static async resendVerificationEmail(
    email: string,
    userName: string,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post(
        "/auth/resend-verification-email",
        { email, userName, token },
      );
      return {
        success: true,
        message: response.data.message || "驗證郵件已重新發送",
        data: response.data,
      };
    } catch (error) {
      console.error("重發驗證郵件失敗:", error);

      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "無法發送驗證郵件",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return {
        success: false,
        message: "系統錯誤，請稍後再試",
      };
    }
  }

  //身分驗證
  static async memberVerified(email: string): Promise<boolean> {
    try {
      const response = await axiosInstance.post(`/auth/member-verified`, {
        email,
      });
      return response.data.success;
    } catch (error) {
      console.error("驗證失敗:", error);
      return false;
    }
  }

  //重設密碼身分認證
  static async forgotPassword(email: string, mobilePhone: string) {
    try {
      const response = await axiosInstance.post("/auth/forgot-password", {
        email,
        mobilePhone,
      });
      if (response.data.success) {
        return {
          success: true,
          message:
            response.data.message || "重設密碼郵件已發送，請檢查您的信箱",
          userData: response.data.userData,
        };
      }
      return {
        success: false,
        message: response.data.message || "輸入的電子郵件或行動電話錯誤",
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log("error.response", error.response);
        return {
          success: false,
          message:
            error.response.data.message || "輸入的電子郵件或行動電話錯誤",
        };
      }
      console.log("重設密碼失敗:", error);
      return {
        success: false,
        message: "系統錯誤，請稍後再試",
      };
    }
  }

  //發送重設密碼郵件
  static async sendResetPasswordEmail(
    email: string,
    userName: string,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post("/auth/reset-password-email", {
        email,
        userName,
        token,
      });
      console.log("response", response);
      return {
        success: true,
        message: response.data.message || "重設密碼郵件已發送，請檢查您的信箱",
        data: response.data,
      };
    } catch (error) {
      console.error("發送重設密碼郵件失敗:", error);

      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "無法發送驗證郵件",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return {
        success: false,
        message: "系統錯誤，請稍後再試",
      };
    }
  }

  static async checkPassword(email: string, password: string) {
    try {
      const response = await axiosInstance.get(`/auth/check-password`, {
        params: { email, password },
      });
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || "密碼認證成功",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "密碼認證失敗",
        };
      }
    } catch (error) {
      console.log("認證密碼錯誤!", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "密碼認證失敗",
        };
      }
      return {
        success: false,
        message: "系統錯誤，請稍後再試",
      };
    }
  }

  //重設密碼
  static async resetPassword(email: string, password: string) {
    try {
      const response = await axiosInstance.post("/auth/reset-password", {
        email,
        password,
      });
      return {
        success: true,
        message: response.data.message || "密碼已重設，請已修改後的密碼登入",
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message:
            error.response.data.message || "重設密碼失敗，請稍後再試一次",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return {
        success: false,
        message: "系統錯誤，請稍後再試",
      };
    }
  }

  //取得當前身分
  static async getCurrentUser(): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.get("/auth/status", {});
      if (response.data.isLoggedIn) {
        return {
          success: true,
          message: response.data.message || "取得當前身分成功",
          data: response.data,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "未登入",
          status: response.data.status,
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "未登入",
          status: error.response.status,
        };
      }
      return {
        success: false,
        message: "系統錯誤，請稍後再試",
      };
    }
  }

  //取得用戶資料 - 優化版本
  static async getUserData(member_id: string): Promise<ApiResponse> {
    try {
      // 檢查快取
      // const cached = AuthService.userDataCache.get(member_id);
      // if (cached && AuthService.isCacheValid(cached.timestamp)) {
      //   return {
      //     success: true,
      //     message: "取得用戶資料成功（快取）",
      //     data: cached.data,
      //   };
      // }

      // 檢查是否已有進行中的請求
      // if (AuthService.userDataPromises.has(member_id)) {
      //   return AuthService.userDataPromises.get(member_id)!;
      // }

      // 創建新的請求
      const requestPromise = axiosInstance
        .get(`/auth/user-data`, {
          params: { member_id },
        })
        .then((response) => {
          console.log("response....", response);
          const arr = response.data.userData["0"];
          const userData = {
            MEMBER_ID: arr[0],
            EMAIL: arr[1],
            MEMBER_TYPE: arr[2],
            ISVERIFIED: arr[3],
            STATUS: arr[4],
            USER_NAME: arr[5],
            VERIFICATION_TOKEN: arr[6],
            MOBILE_PHONE: arr[7],
            GENDER: arr[8],
            BIRTHDAY: arr[9],
            REGION: arr[10],
            CITY: arr[11],
            ADDRESS: arr[12],
            PHONE: arr[13],
          };

          // 儲存到快取
          AuthService.userDataCache.set(member_id, {
            data: userData,
            timestamp: Date.now(),
          });

          return {
            success: true,
            message: response.data.message || "取得用戶資料成功",
            data: userData,
          };
        })
        .catch((error) => {
          console.log("取得用戶資料失敗:", error);
          return {
            success: false,
            message: "系統錯誤，請稍後再試",
          };
        })
        .finally(() => {
          // 清除進行中的請求
          AuthService.userDataPromises.delete(member_id);
        });

      // 儲存進行中的請求
      AuthService.userDataPromises.set(member_id, requestPromise);
      return requestPromise;
    } catch (error) {
      console.log("取得用戶資料失敗:", error);
      return {
        success: false,
        message: "系統錯誤，請稍後再試",
      };
    }
  }

  //取得公司資料 - 優化版本
  static async getCompanyData(member_id: string): Promise<ApiResponse> {
    try {
      // 檢查快取
      const cached = AuthService.companyDataCache.get(member_id);
      if (cached && AuthService.isCacheValid(cached.timestamp)) {
        return {
          success: true,
          message: "取得公司資料成功（快取）",
          data: cached.data,
        };
      }

      // 檢查是否已有進行中的請求
      if (AuthService.companyDataPromises.has(member_id)) {
        return AuthService.companyDataPromises.get(member_id)!;
      }

      // 創建新的請求
      const requestPromise = axiosInstance
        .get(`/auth/company-data`, {
          params: { member_id },
        })
        .then((response) => {
          // 儲存到快取
          AuthService.companyDataCache.set(member_id, {
            data: response.data,
            timestamp: Date.now(),
          });

          return {
            success: true,
            message: response.data.message || "取得公司資料成功",
            data: response.data,
          };
        })
        .catch((error) => {
          console.error("取得公司資料失敗:", error);
          if (axios.isAxiosError(error) && error.response) {
            return {
              success: false,
              message: error.response.data.message || "取得公司資料失敗",
              status: error.response.status,
              errors: error.response.data.errors,
            };
          }
          return {
            success: false,
            message: "系統錯誤，請稍後再試",
          };
        })
        .finally(() => {
          // 清除進行中的請求
          AuthService.companyDataPromises.delete(member_id);
        });

      // 儲存進行中的請求
      AuthService.companyDataPromises.set(member_id, requestPromise);
      return requestPromise;
    } catch (error) {
      console.error("取得公司資料失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "取得公司資料失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return {
        success: false,
        message: "系統錯誤，請稍後再試",
      };
    }
  }

  //更新用戶資料 - 優化版本
  static async updateUser(
    member_id: string,
    updateData: any,
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post(`/auth/update-user`, {
        member_id,
        updateData,
      });

      // 更新成功後清除快取
      AuthService.clearUserDataCache(member_id);

      return {
        success: true,
        message: response.data.message || "用戶資料更新成功",
        data: response.data,
      };
    } catch (error) {
      console.error("更新用戶資料失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "更新用戶資料失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return {
        success: false,
        message: "系統錯誤，請稍後再試",
      };
    }
  }
  static async updateCompanyData(
    member_id: string,
    updateData: any,
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post(`/auth/update-company-data`, {
        member_id,
        updateData,
      });
      return {
        success: true,
        message: response.data.message || "公司資料更新成功",
        data: response.data,
      };
    } catch (error) {
      console.error("更新公司資料失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "更新公司資料失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return {
        success: false,
        message: "系統錯誤，請稍後再試",
      };
    }
  }

  static async updateCompanyIndustries(
    member_id: string,
    updateData: any,
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post(
        `/auth/update-company-industries`,
        { member_id, updateData },
      );
      return {
        success: true,
        message: response.data.message || "公司行業別更新成功",
        data: response.data,
      };
    } catch (error) {
      console.error("更新公司行業別失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "更新公司行業別失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return {
        success: false,
        message: "系統錯誤，請稍後再試",
      };
    }
  }

  //獲取 Chatwoot 身份驗證 HMAC
  static async getChatwootHmac(userId: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post("/auth/chatwoot-hmac", {
        userId,
      });
      console.log("chatwoot response", response);
      return {
        success: true,
        message: "獲取 Chatwoot HMAC 成功",
        data: response.data,
      };
    } catch (error) {
      console.error("獲取 Chatwoot HMAC 失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "獲取 Chatwoot HMAC 失敗",
          status: error.response.status,
        };
      }
      return {
        success: false,
        message: "系統錯誤，請稍後再試",
      };
    }
  }
}

export default AuthService;
