import "express";

declare module "express" {
  export interface Request {
    user?: any; // 可根據 JWT payload 定義更嚴謹型別
  }
}
