import dotenv from "dotenv";
import { SignOptions } from "jsonwebtoken";
import { envSchema } from "@/config/validation/env.validation";

dotenv.config();

const env = envSchema.parse(process.env);

interface CorsOriginOptions {
  ListOfDomainType?: string[];
  methods?: string[];
}

interface IEConfig {
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: SignOptions["expiresIn"];
  NAMEAPYKEY: string;
  DATABASE_URL: string;
  NODE_ENV: string;
}

const configSystem: IEConfig = {
  PORT: env.PORT,
  JWT_SECRET: env.JWT_SECRET,
  JWT_EXPIRES_IN: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  NAMEAPYKEY: env.GEMINI_API_KEY,
  DATABASE_URL: env.DATABASE_URL,
  NODE_ENV: env.NODE_ENV,
};

export { configSystem };
export type { CorsOriginOptions };
