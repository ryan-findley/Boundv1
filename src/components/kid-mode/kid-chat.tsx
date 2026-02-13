"use client";

import { useState, useEffect, useRef } from "react";
import { submitKidPrompt, getThreadMessages } from "@/app/actions/chat";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  safetyDecision?: string | null;
  flaggedAt?: string | null;
}

export function KidChat({
  kidProfileId,
  sessionId,
  kidName,
  disabled,
}: {
  kidProfileId: string;
  sessionId: string;
  kidName: string;
  kidAge: number;
  kidGrade: string;
  disabled: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing messages on mount
  useEffect(() => {
    async function load() {
      const msgs = await getThreadMessages(kidProfileId);
      setMessages(msgs);
    }
    load();
  }, [kidProfileId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading || disabled) return;

    setInput("");
    setError(null);
    setLoading(true);

    // Optimistic: add kid message immediately
    const tempKidMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "kid",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempKidMsg]);

    try {
      const result = await submitKidPrompt(kidProfileId, sessionId, text);

      if (result.error) {
        if (result.error === "rate_limited") {
          setError(result.message || "Too many messages. Slow down!");
        } else {
          setError("Something went wrong. Try again.");
        }
        // Remove optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== tempKidMsg.id));
        setLoading(false);
        return;
      }

      // Update kid message with real ID
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempKidMsg.id
            ? { ...m, id: result.kidMessageId! }
            : m
        )
      );

      if (result.blocked) {
        // Add refusal as system message
        const refusalMsg: Message = {
          id: `refusal-${Date.now()}`,
          role: "system",
          content: result.refusalMessage!,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, refusalMsg]);
      } else if (result.assistantMessage) {
        // Add assistant response
        setMessages((prev) => [
          ...prev,
          {
            id: result.assistantMessage!.id,
            role: "assistant",
            content: result.assistantMessage!.content,
            createdAt: result.assistantMessage!.createdAt,
          },
        ]);
      }
    } catch {
      setError("Something went wrong. Try again.");
      setMessages((prev) => prev.filter((m) => m.id !== tempKidMsg.id));
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="text-center text-muted py-12">
            <p className="text-lg font-medium">Hi {kidName}!</p>
            <p className="text-sm mt-1">Ask me anything. I&apos;m here to help you learn.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "kid" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "kid"
                  ? "bg-primary text-white rounded-br-md"
                  : msg.role === "system"
                  ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800 rounded-bl-md"
                  : "bg-foreground/5 rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-foreground/5 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-muted">
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 text-sm text-danger text-center">
          {error}
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={disabled || loading}
            placeholder={disabled ? "Session ended" : "Type a message..."}
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || disabled}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
