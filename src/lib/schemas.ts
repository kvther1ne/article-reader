import { z } from "zod";

export const summarySchema = z.object({
  title: z.string().describe("Article title"),
  summary: z.string().describe("What the article is about, one sentence"),
  keyPoints: z.array(z.string()).min(3).max(7).describe("Key points"),
  tags: z.array(z.string()).max(5).describe("Article themes, one-two words"),
  readingTime: z.number().describe("Estimated reading time in minutes"),
});

export type TSummaryType = z.infer<typeof summarySchema>;
