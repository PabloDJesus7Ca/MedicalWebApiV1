import dotenv from "dotenv";
dotenv.config();

interface CorsOriginOptions {
  ListOfDomainType?: string[];
  methods?: string[];
}

interface IEConfig {
  PORT: number;
}

interface IEApiKey {
  NAMEAPYKEY: string;
}

const config: IEConfig = {
  PORT: Number(process.env.PORT) ?? 3006,
};

const apiKeys: IEApiKey = {
  NAMEAPYKEY: process.env.GEMINI_API_KEY || "No Posee La Api Key En Estos Momentos",
};

export { config, apiKeys };
export type { CorsOriginOptions };
