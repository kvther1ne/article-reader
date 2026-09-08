import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { summarySchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

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

  return Response.json(saved);
}
