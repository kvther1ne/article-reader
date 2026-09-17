import { openai } from "@ai-sdk/openai";
import {
  streamText,
  toUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { prisma } from "@/lib/prisma";
import { getEmbedding } from "@/lib/embeddings";

export const maxDuration = 30;

type Match = {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  distance: number;
};

export async function POST(req: Request) {
  const { messages } = await req.json();

  const last = messages[messages.length - 1];

  const question =
    last?.parts?.find((p: { type: string }) => p.type === "text")?.text ?? "";

  if (!question?.trim()) {
    return Response.json({ error: "Empty question" }, { status: 400 });
  }

  const queryVector = await getEmbedding(question);

  const matches = await prisma.$queryRaw<Match[]>`
    SELECT id, title, summary, "keyPoints",
           embedding <=> ${JSON.stringify(queryVector)}::vector AS distance
    FROM "Summary"
    WHERE embedding IS NOT NULL
    ORDER BY distance
    LIMIT 3
  `;

  const context = matches
    .map(
      (m, i) =>
        `Статья ${i + 1}: ${m.title}\n${m.summary}\n${m.keyPoints.join("\n")}`,
    )
    .join("\n\n---\n\n");

  const result = streamText({
    model: openai("gpt-4o-mini"),
    temperature: 0.3,
    prompt: `Ответь на вопрос, опираясь ТОЛЬКО на статьи ниже. Если ответа в них нет, так и скажи. Ссылайся на статьи по названию.

${context}

Вопрос: ${question}`,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
