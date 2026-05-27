import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const createClient = () => {
  if (global.prisma) {
    return global.prisma;
  }

  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is required.");
  }

  const prisma = new PrismaClient({
    datasourceUrl: url,
  });

  console.log("Connected to database");

  global.prisma = prisma;
  return prisma;
};

export const client = {
  get db() {
    return createClient();
  },
};
