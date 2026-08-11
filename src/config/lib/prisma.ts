import { PrismaClient } from "@generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { configSystem } from "@/config/system.config";

const adapter = new PrismaPg({ connectionString: configSystem.DATABASE_URL });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (configSystem.NODE_ENV === "development") globalForPrisma.prisma = prisma;
