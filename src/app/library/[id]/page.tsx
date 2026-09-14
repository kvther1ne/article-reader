import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await prisma.summary.findUnique({ where: { id } });

  if (!item) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to library
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{item.title}</h1>
        <p className="text-muted-foreground mt-2">{item.summary}</p>
      </div>

      <ul className="space-y-3">
        {item.keyPoints.map((point, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-muted-foreground">{i + 1}.</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        {item.tags.map((tag, i) => (
          <Badge key={i} variant="secondary">
            {tag}
          </Badge>
        ))}
        <span className="text-muted-foreground ml-auto text-xs">
          {item.readingTime} min read
        </span>
      </div>

      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline"
        >
          Read the original
        </a>
      )}
    </div>
  );
}
