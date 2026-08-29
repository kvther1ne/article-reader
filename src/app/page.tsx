"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col w-full max-w-2xl py-24 mx-auto">
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap mb-4">
          <strong>{message.role === "user" ? "Вы: " : "AI: "}</strong>

          {message.parts.map((part, i) =>
            part.type === "text" ? <span key={i}>{part.text}</span> : null,
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-2xl p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Напиши что-нибудь..."
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== "ready"}
        />
      </form>
    </div>
  );
}
