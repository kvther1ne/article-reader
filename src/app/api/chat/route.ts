import { openai } from "@ai-sdk/openai";
import {
  streamText,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
  UIMessage,
} from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const lastMessage = messages[messages.length - 1];
  const text = lastMessage.parts.find(p => p.type === 'text')?.text ?? '';

  if (text.trim().length < 200) {
    return new Response('The text is too short for a summary', { status: 400 });
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: await convertToModelMessages(messages),
    system: `You are a helper who makes short summaries from articles.

    You only process articles. Any other input — question, greeting, one word, connection check — do not process.

    In this case, answer with exactly one phrase: "This is not a article. Please paste the article text."

    Do not answer questions. Do not start a conversation. Do not greet.

    If you receive an article — return:
    1. One sentence about what the article is about.
    2. Five key points.
    3. For whom the article is useful.`,
    temperature: 0.3,
  });

  return createUIMessageStreamResponse({ stream: toUIMessageStream(result) });
}
