import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, toUIMessageStream, createUIMessageStreamResponse, UIMessage } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    const body: {messages: UIMessage[]} = await req.json();
    
    const result = streamText({
        model: openai('gpt-4o-mini'),
        messages: await convertToModelMessages(body.messages),
    });
    
    return createUIMessageStreamResponse({stream: toUIMessageStream(result)});
}