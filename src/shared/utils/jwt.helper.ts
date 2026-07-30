import jwt from "jsonwebtoken";
import { configSystem } from "@/config/system.config";
import { JwtPayload } from "@shared/model/jwt-payload.model";

export function SingToken(payload: JwtPayload): string {
  return jwt.sign(payload, configSystem.JWT_SECRET, {
    expiresIn: configSystem.JWT_EXPIRES_IN ?? "1h",
  });
}

export function VeriyToken(token: string): JwtPayload {
  return jwt.verify(token, configSystem.JWT_SECRET) as JwtPayload;
}
