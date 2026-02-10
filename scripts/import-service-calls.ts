import "dotenv/config";
import fs from "fs";
import { parse } from "csv-parse/sync";
import PrismaClient from "@prisma/client";


const prisma = new PrismaClient();

async function main() {
  const csvFile = fs.readFileSync("service_call_raw.csv");

  const records = parse(csvFile, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Found ${records.length} rows`);

  for (const row of records) {
    // VERY IMPORTANT: minimal & safe insert
    await prisma.service.create({
      data: {
        description: JSON.stringify(row), // RAW store
        status: "PENDING", // default enum
      },
    });
  }

  console.log("✅ Service calls imported");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
