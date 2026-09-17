import { prisma } from "../src/lib/prisma";
import { getEmbedding } from "../src/lib/embeddings";

type Row = {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
};

async function main() {
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT id, title, summary, "keyPoints"
    FROM "Summary"
    WHERE embedding IS NULL
  `;

  console.log(`Found ${rows.length} rows without embeddings`);

  for (const row of rows) {
    const text = [row.title, row.summary, ...row.keyPoints].join("\n");
    const vector = await getEmbedding(text);

    await prisma.$executeRaw`
      UPDATE "Summary"
      SET embedding = ${JSON.stringify(vector)}::vector
      WHERE id = ${row.id}
    `;

    console.log(`✓ ${row.title}`);
  }
}

main();
