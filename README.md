# Article Reader

AI-powered article summarizer. Paste a link or raw text — get a structured
breakdown: summary, key points, tags, and estimated reading time.

<!-- TODO: screenshot -->

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **Vercel AI SDK 7** — model calls and structured output
- **OpenAI** `gpt-4o-mini`
- **Zod** — schema definition and runtime validation
- **@mozilla/readability + jsdom** — article extraction
- **shadcn/ui + Tailwind CSS**
- **TypeScript**

## Getting started

```bash
npm install
```

Create `.env.local` in the project root:
