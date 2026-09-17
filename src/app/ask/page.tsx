"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function AskPage() {
  const [question, setQuestion] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ask" }),
  });

  const isBusy = status === "submitted" || status === "streaming";

  const handleAsk = () => {
    if (!question.trim()) return;
    sendMessage({ text: question });
    setQuestion("");
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to library
      </Link>

      <h1 className="text-2xl font-semibold">Ask your library</h1>

      <div className="flex gap-2">
        <Input
          value={question}
          placeholder="What did I read about AI safety?"
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          disabled={isBusy}
        />
        <Button onClick={handleAsk} disabled={isBusy}>
          {isBusy ? "Thinking..." : "Ask"}
        </Button>
      </div>

      <div className="space-y-4">
        {messages.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4">
              <p className="text-muted-foreground mb-2 text-xs">
                {m.role === "user" ? "Question" : "Answer"}
              </p>
              <div className="text-sm whitespace-pre-wrap">
                {m.parts.map((part, i) =>
                  part.type === "text" ? (
                    <span key={i}>{part.text}</span>
                  ) : null,
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
