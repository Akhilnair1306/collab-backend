import dotenv from 'dotenv'
dotenv.config()

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client';
// console.log(
//   "DATABASE_URL loaded:",
//   process.env.DATABASE_URL ? "YES" : "NO"
// );
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

console.log("RUNTIME DB:", process.env.DATABASE_URL); //

export default prisma

// import "dotenv/config";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export default prisma;
