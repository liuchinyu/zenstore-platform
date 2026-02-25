import axios from "axios";
import { chatwootConfig } from "../../config/chatwoot";

// 定義 Chatwoot 聯絡人和對話的類型
interface ChatwootContact {
  id: number;
  identifier?: string; // 設為可選，因為搜尋到的聯絡人可能尚未設置
  email?: string;
}

interface ChatwootConversation {
  id: number;
  // 其他您可能需要的對話屬性
}

// 定義傳入的使用者資訊類型
interface MemberInfo {
  identifier: string; // 唯一識別碼，例如 MEMBER_ID
  name: string;
  email: string;
}

class ChatwootService {
  private api;

  constructor() {
    // 檢查必要的設定是否已提供
    if (
      !chatwootConfig.accountId ||
      !chatwootConfig.apiToken ||
      !chatwootConfig.inboxId
    ) {
      throw new Error(
        "Chatwoot configuration is missing (accountId, apiToken, or inboxId)."
      );
    }

    // 建立一個 axios 實例，預先設定好 baseURL 和認證標頭
    this.api = axios.create({
      baseURL: `${chatwootConfig.baseUrl}/api/v1/accounts/${chatwootConfig.accountId}`,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        api_access_token: chatwootConfig.apiToken,
      },
    });
  }

  /**
   * 透過唯一識別碼 (identifier) 尋找或建立 Chatwoot 聯絡人
   * @param memberInfo - 使用者資訊
   * @returns Chatwoot 聯絡人物件
   */
  private async findOrCreateContact(
    memberInfo: MemberInfo
  ): Promise<ChatwootContact> {
    try {
      // 步驟 1: 改用 email 進行更精準的搜尋
      const searchResponse = await this.api.get("/contacts/search", {
        params: { q: memberInfo.email },
      });

      const contacts: ChatwootContact[] = searchResponse.data.payload;
      // 從搜尋結果中過濾出 email 完全相符的聯絡人
      const existingContact = contacts.find(
        (contact) => contact.email === memberInfo.email
      );

      if (existingContact) {
        // 步驟 2: 如果找到聯絡人，確保其 identifier (MEMBER_ID) 是最新的
        if (existingContact.identifier !== memberInfo.identifier) {
          // 如果 identifier 不符或不存在，則更新它，並同時同步姓名
          await this.api.put(`/contacts/${existingContact.id}`, {
            identifier: memberInfo.identifier,
            name: memberInfo.name,
          });
        }
        return existingContact;
      }

      // 步驟 3: 如果完全找不到，才建立新的聯絡人
      const createResponse = await this.api.post("/contacts", {
        inbox_id: chatwootConfig.inboxId,
        name: memberInfo.name,
        email: memberInfo.email,
        identifier: memberInfo.identifier,
      });

      return createResponse.data.payload.contact;
    } catch (error: any) {
      console.error(
        "在 findOrCreateContact 中發生錯誤:",
        error.response?.data || error.message
      );
      throw new Error("尋找或建立 Chatwoot 聯絡人失敗。");
    }
  }

  /**
   * 尋找或建立一個對話
   * @param contactId - Chatwoot 聯絡人 ID
   * @returns Chatwoot 對話物件
   */
  private async findOrCreateConversation(
    contact: ChatwootContact
  ): Promise<ChatwootConversation> {
    try {
      // 1. 尋找該聯絡人現有的對話
      const convResponse = await this.api.get(
        `/contacts/${contact.id}/conversations`
      );

      // 2. 從中篩選出屬於我們設定的收件匣的對話
      const existingConversation = convResponse.data.payload.find(
        (conv: any) =>
          conv.inbox_id.toString() === chatwootConfig.inboxId?.toString()
      );

      // 如果找到了符合的對話，就直接回傳
      if (existingConversation) {
        return existingConversation;
      }

      // 2. 如果沒有，則建立新對話
      const createConvResponse = await this.api.post("/conversations", {
        inbox_id: chatwootConfig.inboxId,
        contact_id: contact.id,
        source_id: contact.identifier,
        status: "open", // 將對話標示為開啟
      });
      return createConvResponse.data;
    } catch (error: any) {
      console.log(
        "在 findOrCreateConversation 中發生錯誤:",
        error.response?.data || error.message
      );
      throw new Error("尋找或建立 Chatwoot 對話失敗。");
    }
  }

  /**
   * 發送訊息到指定的對話中
   * @param conversationId - Chatwoot 對話 ID
   * @param message - 要發送的訊息內容
   */
  private async sendMessage(
    conversationId: number,
    message: string
  ): Promise<void> {
    await this.api.post(`/conversations/${conversationId}/messages`, {
      content: message,
      message_type: "outgoing", // 'outgoing' 表示由管理者發出
      private: false, // false 表示客戶可見
    });
  }

  /**
   * 主要的公開方法：發送訊息給指定的使用者
   * @param memberInfo - 使用者資訊
   * @param message - 要發送的訊息內容
   */
  public async sendMessageToMember(
    memberInfo: MemberInfo,
    message: string
  ): Promise<void> {
    try {
      // 步驟一：尋找或建立聯絡人
      const contact = await this.findOrCreateContact(memberInfo);
      // 步驟二：尋找或建立對話
      const conversation = await this.findOrCreateConversation(contact);
      // 步驟三：發送訊息
      await this.sendMessage(conversation.id, message);
      console.log(
        `Message sent to member ${memberInfo.identifier} in conversation ${conversation.id}`
      );
    } catch (error: any) {
      console.error(
        "Failed to send Chatwoot message:",
        error.response?.data || error.message
      );
      throw new Error("Failed to send message via Chatwoot.");
    }
  }
}

// 匯出一個單例，確保整個應用程式共用同一個服務實例
export const chatwootService = new ChatwootService();
