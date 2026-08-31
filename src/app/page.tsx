"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, clearError } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    clearError();
    sendMessage({ text: input });
    setInput("");
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
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Article Reader</h1>

      <div className="space-y-4 pb-32">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">
                {message.role === "user" ? "Article" : "Summary"}
              </p>
              <div className="whitespace-pre-wrap text-sm">
                {message.parts.map((part, i) =>
                  part.type === "text" ? (
                    <span key={i}>{part.text}</span>
                  ) : null,
                )}
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
            disabled={isBusy}
            onKeyDown={handleKeyDown}
          />

          {status === "error" && (
            <p className="text-sm text-destructive">{error?.message}</p>
          )}

          <Button onClick={handleSubmit} disabled={isBusy}>
            {isBusy ? "Processing..." : "Make a summary"}
          </Button>
        </div>
      </div>
    </div>
  );
}
