/**
 * Chatwoot TypeScript 型別定義
 * 擴展 Window 介面以支援 Chatwoot SDK
 */

export interface ChatwootConfig {
  websiteToken: string;
  baseUrl: string;
}

export interface ChatwootUserConfig {
  email: string;
  name: string;
  identifier_hash: string;
}

export interface ChatwootSDK {
  run: (config: ChatwootConfig) => void;
}

export interface ChatwootAPI {
  setUser: (userId: string, userConfig: ChatwootUserConfig) => void;
  toggleBubbleVisibility: (visibility: "show" | "hide") => void;
  toggle: (state: "open" | "close") => void;
}

declare global {
  interface Window {
    chatwootSDK?: ChatwootSDK;
    $chatwoot?: ChatwootAPI;
    __chatwoot_initialized?: boolean;
  }
}

export {};
