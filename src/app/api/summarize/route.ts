import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { summarySchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { getEmbedding } from "@/lib/embeddings";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { text, url }: { text: string; url?: string } = await req.json();

  if (!text || text.trim().length < 200) {
    return Response.json(
      { error: "The text is too short for a summary" },
      { status: 400 },
    );
  }

  const result = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({
      schema: summarySchema,
    }),
    temperature: 0.3,
    prompt: `Make a breakdown of the article. Respond in article language.\n\n${text}`,
  });

  const saved = await prisma.summary.create({
    data: {
      ...result.output,
      tags: result.output.tags.map((t) => t.toLowerCase().trim()),
      url: url ?? null,
    },
  });

  const textForEmbedding = [
    saved.title,
    saved.summary,
    ...saved.keyPoints,
  ].join("\n");

  const vector = await getEmbedding(textForEmbedding);

  await prisma.$executeRaw`
    UPDATE "Summary"
    SET embedding = ${JSON.stringify(vector)}::vector
    WHERE id = ${saved.id}
  `;

  return Response.json(saved);
}
