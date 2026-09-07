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
- **Prisma 7** — ORM and migrations
- **Neon** — serverless PostgreSQL
- **@mozilla/readability + jsdom** — article extraction
- **shadcn/ui + Tailwind CSS**
- **TypeScript 5**

## Getting started

```bash
npm install
```

Create `.env.local` in the project root:

```
OPENAI_API_KEY=sk-proj-...
DATABASE_URL=postgresql://...          # direct connection, used for migrations
DATABASE_URL_POOLED=postgresql://...   # pooled connection, used by the app
```

Apply the schema and generate the Prisma client:

```bash
npx prisma migrate dev
```

Then:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## How it works

1. User submits a URL or raw article text.
2. If it's a URL, `/api/extract` fetches the page and strips navigation, ads,
   and comments with Readability, leaving the article body.
3. `/api/summarize` sends the text to the model with a Zod schema attached.
   The SDK constrains the output and validates it before returning.
4. The result is written to Postgres and returned with its generated `id` and
   `createdAt`. The library loads from `/api/summaries` on mount, newest first.

## Design notes

**Two separate routes instead of one.** Extraction and summarization are
independent concerns: extraction is plain HTTP and DOM parsing with no AI
involved, summarization never needs to know where the text came from. Keeping
them apart also makes each one testable with a single `curl` call.

**Structured output over streaming.** An earlier version streamed plain text
token by token. It looked nicer, but the result was an opaque string — no way
to render tags as badges, sort key points, or store fields separately. Trading
the typing animation for a typed object made the UI possible.

**Schema lives in `lib/`, not in the route.** Next.js only allows HTTP method
exports from `route.ts`, and importing from a route file into a client
component would pull server-only packages into the browser bundle. A shared
module keeps one source of truth: the route uses the schema for generation,
the client derives its type via `z.infer`.

**Cloud Postgres instead of a local database.** SQLite or a local Postgres
instance would be simpler to set up, but the app is meant to be deployed — and
Vercel's filesystem is read-only, so a file-based database would not survive.
Using Neon from the start avoids doing the work twice, and the same database
will host `pgvector` for the retrieval step later.

**Two connection strings.** The app connects through a pooler: serverless
functions are short-lived and each instance opens its own connection, so
without pooling the connection limit is reached quickly. Migrations use a
direct connection instead — they run multiple related statements that must
share one session, which a pooler cannot guarantee.

**Arrays in columns instead of a tags table.** `keyPoints` and `tags` are
stored as native Postgres `TEXT[]`. The normalized alternative — a separate
tags table with a join — would make renaming a tag and counting usage easier,
but adds complexity for something the app currently only renders as badges.
Worth revisiting if tag management becomes a feature.

## Roadmap

- [x] Streaming chat interface
- [x] Summarization with system prompt
- [x] URL-based article extraction
- [x] Structured output with Zod
- [x] Saved library persisted in Postgres
- [ ] Search and tag filtering
- [ ] Q&A over the saved library (RAG)
- [ ] Deploy
