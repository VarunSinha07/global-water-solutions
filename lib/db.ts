import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;

// Suppress "SECURITY WARNING" from pg by explicitly using verify-full if require is set
// effectively preserving current behavior but silencing the future-change warning.
const finalConnectionString = connectionString.includes("sslmode=require")
  ? connectionString.replace("sslmode=require", "sslmode=verify-full")
  : connectionString;

const pool = new Pool({ connectionString: finalConnectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma_v2: PrismaClient };

export const prisma =
  globalForPrisma.prisma_v2 || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v2 = prisma;
