import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("DB URL:", process.env.DATABASE_URL);

  const users = await prisma.user.findMany();
  console.log("USERS:", users);
}

main()
  .catch((e) => {
    console.error("ERROR:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
