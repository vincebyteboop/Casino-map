"use client";

import { useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulated };
          return updated;
        });
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong reaching the server. Try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Vince Halloran&apos;s AI</h1>
        <div className="badge">Sports Locks Specialist</div>
        <div className="tagline">Ask for a lock. Get an edge, not a guarantee.</div>
      </div>

      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-state">
            Ask about tonight&apos;s slate, a matchup, or say &quot;give me your lock of the
            day&quot; to get started.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role === "user" ? "user" : "ai"}`}>
            {m.content || (loading && i === messages.length - 1 ? "…" : "")}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="composer" onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Vince Halloran's AI for a lock..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
      <div className="disclaimer">
        For entertainment purposes only. No pick is guaranteed. Must be of legal age to bet in
        your jurisdiction. Gambling problem? Call 1-800-GAMBLER.
      </div>
    </div>
  );
}
