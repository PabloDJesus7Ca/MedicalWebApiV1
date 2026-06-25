import jwt from "jsonwebtoken";
import { config } from "../../configurations/configs";
import { JwtPayload } from "../types/model.jwt.payload";

export function SingToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN ?? "1h" });
}

export function VeriyToken(token: string): JwtPayload {
  return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
}
