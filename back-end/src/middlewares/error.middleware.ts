import { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // 開發環境
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    // 生產環境
    if (err.isOperational) {
      // 已知的操作錯誤：發送訊息給客戶端
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    } else {
      // 未知的程式錯誤或其它錯誤
      console.error("ERROR 💥", err);
      res.status(500).json({
        success: false,
        message: "發生了未知的錯誤，請稍後再試",
      });
    }
  }
};
