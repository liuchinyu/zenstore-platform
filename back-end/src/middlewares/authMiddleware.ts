import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const authenticateToken: RequestHandler = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ success: false, message: "未登入" });
    // middleware不應return，而是應該使用next()
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // 將解碼後的用戶資訊存到 req.user
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Token 驗證失敗" });
    // middleware不應return，而是應該使用next()
    return;
  }
};
