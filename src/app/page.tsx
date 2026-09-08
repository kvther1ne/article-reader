"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import type { Summary } from "@/generated/prisma/client";

export default function Chat() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = summaries.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    const url = activeTag
      ? `/api/summaries?tag=${encodeURIComponent(activeTag)}`
      : "/api/summaries";

    fetch(url)
      .then((res) => res.json())
      .then(setSummaries)
      .catch(() => setError("Failed to load library"));
  }, [activeTag]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setError(null);
    setIsLoading(true);

    const value = input.trim();
    const isUrl = URL.canParse(value);

    try {
      let text = value;

      if (isUrl) {
        const res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error);
          return;
        }

        text = `${data.title}\n\n${data.text}`;
      }

      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          url: isUrl ? value : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSummaries((prev) => [data, ...prev]);
      setInput("");
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/summaries/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSummaries((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Article Reader</h1>

      <Input
        placeholder="Search library..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 && summaries.length > 0 && (
        <p className="text-muted-foreground text-sm">Nothing found</p>
      )}

      <div className="space-y-4 pb-32">
        {filtered.map((item) => (
          <Card key={item.id}>
            <CardContent className="space-y-4 p-6">
              <div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.summary}
                </p>
              </div>

              <ul className="space-y-2">
                {item.keyPoints.map((point, j) => (
                  <li key={j} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-2">
                {item.tags.map((tag, j) => (
                  <Badge
                    key={j}
                    variant={activeTag === tag ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  >
                    {tag}
                  </Badge>
                ))}

                <span className="text-muted-foreground ml-auto text-xs">
                  {item.readingTime} min read
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-background fixed right-0 bottom-0 left-0 p-4">
        <div className="mx-auto max-w-3xl space-y-2">
          <Textarea
            rows={6}
            value={input}
            placeholder="Paste the article text"
            onChange={handleChange}
            disabled={isLoading}
            onKeyDown={handleKeyDown}
          />

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Processing..." : "Make a summary"}
          </Button>
        </div>
      </div>
    </div>
  );
}
