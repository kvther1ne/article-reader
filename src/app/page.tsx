"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TSummaryType } from "@/lib/schemas";

export default function Chat() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<TSummaryType[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [summaries]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setError(null);
    setIsLoading(true);

    const value = input.trim();

    try {
      let text = value;

      if (URL.canParse(value)) {
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
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSummaries((prev) => [...prev, data]);
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

  return (
    <div className="mx-auto w-full max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Article Reader</h1>

      <div className="space-y-4 pb-32">
        {summaries.map((item, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold">{item.title}</h2>

                <p className="text-sm text-muted-foreground mt-1">
                  {item.summary}
                </p>
              </div>

              <ul className="space-y-2">
                {item.keyPoints.map((point, j) => (
                  <li key={j} className="text-sm flex gap-2">
                    <span className="text-muted-foreground">•</span>

                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2 items-center">
                {item.tags.map((tag, j) => (
                  <Badge key={j} variant="secondary">
                    {tag}
                  </Badge>
                ))}

                <span className="text-xs text-muted-foreground ml-auto">
                  {item.readingTime} min read
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background p-4">
        <div className="mx-auto max-w-3xl space-y-2">
          <Textarea
            rows={6}
            value={input}
            placeholder="Paste the article text"
            onChange={handleChange}
            disabled={isLoading}
            onKeyDown={handleKeyDown}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Processing..." : "Make a summary"}
          </Button>
        </div>
      </div>
    </div>
  );
}
