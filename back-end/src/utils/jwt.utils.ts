import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ZEN_STORE_SECRET";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export const generateToken = (payload: object): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): any => {
  try {
  } catch (e) {}
};
