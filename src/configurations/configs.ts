import dotenv from "dotenv";
import { SignOptions } from "jsonwebtoken";
dotenv.config();

interface CorsOriginOptions {
  ListOfDomainType?: string[];
  methods?: string[];
}

interface IEConfig {
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: SignOptions["expiresIn"];
}

interface IEApiKey {
  NAMEAPYKEY: string;
}

const config: IEConfig = {
  PORT: Number(process.env.PORT) || 3006,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || "1h") as SignOptions["expiresIn"],
};

const apiKeys: IEApiKey = {
  NAMEAPYKEY: process.env.GEMINI_API_KEY || "No Posee La Api Key En Estos Momentos",
};

export { config, apiKeys };
export type { CorsOriginOptions };
