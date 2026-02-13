import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SYSTEM_BLOCKED_TOPICS = [
  { topic: "self-harm", category: "safety" },
  { topic: "suicide", category: "safety" },
  { topic: "weapons and how to make them", category: "safety" },
  { topic: "illegal drugs and how to obtain them", category: "safety" },
  { topic: "explicit sexual content", category: "content" },
  { topic: "violence and gore", category: "content" },
  { topic: "child exploitation", category: "safety" },
  { topic: "terrorism", category: "safety" },
  { topic: "eating disorders promotion", category: "safety" },
  { topic: "bullying and harassment tactics", category: "safety" },
];

async function main() {
  console.log("Seeding system blocked topics...");

  for (const item of SYSTEM_BLOCKED_TOPICS) {
    await prisma.systemBlockedTopic.create({
      data: {
        topic: item.topic,
        category: item.category,
      },
    });
  }

  console.log(`Seeded ${SYSTEM_BLOCKED_TOPICS.length} system blocked topics.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
