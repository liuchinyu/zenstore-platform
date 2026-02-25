import axios from "axios";
import { BlockMember } from "@/types/products/memberType";

class MemberService {
  private readonly API_URL: string;

  constructor() {
    this.API_URL =
      process.env.NEXT_PUBLIC_API_URL + "/member" ||
      "http://localhost:8080/api/admin/member";
  }

  // 取得所有會員
  async getMemberList(page: number, pageSize: number, filters: any) {
    try {
      const response = await axios.get(this.API_URL, {
        params: { page, pageSize, filters },
      });
      return response.data;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  //取得指定會員
  async getMemberById(member_id: string) {
    try {
      const response = await axios.get(this.API_URL + "/" + member_id);
      return response.data;
    } catch (error) {
      console.error("Error fetching member by id:", error);
      throw error;
    }
  }

  // 更新會員資料
  async updateMember(member_id: string, data: any) {
    try {
      const response = await axios.patch(this.API_URL + "/" + member_id, {
        data,
      });
      if (response.data.success) {
        return {
          success: true,
          message: "資料更新成功",
        };
      }
    } catch (error) {
      console.error("Error updating member:", error);
      throw error;
    }
  }

  // 發送修改密碼信件
  async sendResetPasswordEmail(email: string, mobilePhone: string) {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/forgot-password",
        { email, mobilePhone },
      );
      if (response.data.success) {
        const { USER_NAME, EMAIL, VERIFICATION_TOKEN } = response.data.userData;
        const email = EMAIL;
        const userName = USER_NAME;
        const token = VERIFICATION_TOKEN;
        const sendData = await axios.post(
          "http://localhost:8080/api/auth/reset-password-email",
          { email, userName, token },
        );
        if (sendData.data.success) {
          return {
            success: true,
            message: "重設密碼郵件已發送，請檢查您的信箱",
            userData: response.data.userData,
          };
        }
      }
    } catch (error) {
      console.log("error", error);
      return { success: false, message: "系統有誤，請聯絡系統管理員" };
    }
  }

  // 停權 or 解封會員
  async MemberOperation(blockMember: BlockMember) {
    try {
      const response = await axios.post(this.API_URL + "/operation", {
        blockMember,
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }
  // 新增會員群組
  async createGroup(groupName: string) {
    try {
      const response = await axios.post(this.API_URL + "/group", { groupName });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }
  // 查詢會員群組
  async getGroupList() {
    try {
      const response = await axios.get(this.API_URL + "/group");
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }
  // 取得會員群組關聯
  async getGroupRelation() {
    try {
      const response = await axios.get(this.API_URL + "/groupRelation");
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async applyGroup(payload: any) {
    try {
      const response = await axios.post(this.API_URL + "/applyGroup", {
        payload,
      });
      if (response.data && response.data.success) {
        await this.updateGroupMemberCount();
      }
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async updateGroupMemberCount() {
    try {
      const response = await axios.patch(
        this.API_URL + "/updateGroupCount",
        {},
      );
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async sendInstantMessage(
    memberId: string,
    email: string,
    userName: string,
    message: string,
  ) {
    try {
      console.log("email", email);
      const response = await axios.post(`${this.API_URL}/${memberId}/message`, {
        email,
        userName,
        message,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to send message to member ${memberId}:`, error);
      throw error;
    }
  }
}

export default new MemberService();
