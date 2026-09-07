import { prisma } from "@/lib/prisma";

export async function GET() {
  const summaries = await prisma.summary.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json(summaries);
}
