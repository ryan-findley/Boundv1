"use client";

import { useState, useEffect } from "react";
import { getTranscript, getDailyUsageSummary } from "@/app/actions/visibility";
import { useRouter } from "next/navigation";

interface TranscriptMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  safetyDecision?: string | null;
  safetyReason?: string | null;
  matchedTopics?: string[];
  flaggedAt?: string | null;
}

interface DayUsage {
  date: string;
  activeSeconds: number;
  activeMinutes: number;
}

interface UsageSummary {
  days: DayUsage[];
  totalSeconds: number;
  totalMinutes: number;
  dailyLimitMinutes: number | null;
}

export function VisibilityClient({
  kidId,
  kidName,
  kidList,
}: {
  kidId: string;
  kidName: string;
  kidList: Array<{ id: string; nickname: string }>;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"chat" | "usage">("chat");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Default date range: last 7 days
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const [startDate, setStartDate] = useState(weekAgo.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (tab === "chat") {
        const msgs = await getTranscript(kidId, startDate, endDate, flaggedOnly);
        setMessages(msgs);
      } else {
        const data = await getDailyUsageSummary(kidId, startDate, endDate);
        setUsage(data);
      }
      setLoading(false);
    }
    load();
  }, [kidId, tab, startDate, endDate, flaggedOnly]);

  return (
    <div className="space-y-6">
      {/* Kid selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Child:</label>
        <select
          value={kidId}
          onChange={(e) => router.push(`/visibility/${e.target.value}`)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
        >
          {kidList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nickname}
            </option>
          ))}
        </select>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setTab("chat")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "chat" ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Chat History
        </button>
        <button
          onClick={() => setTab("usage")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "usage" ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Usage
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8 text-muted text-sm">Loading...</div>
      ) : tab === "chat" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flaggedOnly}
                onChange={(e) => setFlaggedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <span className="text-sm">Flagged prompts only</span>
            </label>
          </div>

          {messages.length === 0 ? (
            <div className="rounded-xl border border-border p-8 text-center text-muted text-sm">
              {flaggedOnly ? "No flagged prompts in this date range." : "No messages in this date range."}
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg p-3 text-sm ${
                    msg.flaggedAt
                      ? "border-2 border-danger/50 bg-red-50 dark:bg-red-950/20"
                      : "border border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      msg.role === "kid"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : msg.role === "assistant"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}>
                      {msg.role === "kid" ? kidName : msg.role}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                    {msg.flaggedAt && (
                      <span className="text-xs bg-danger/10 text-danger px-1.5 py-0.5 rounded font-medium">
                        BLOCKED
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.flaggedAt && msg.matchedTopics && msg.matchedTopics.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.matchedTopics.map((topic) => (
                        <span key={topic} className="text-xs bg-danger/10 text-danger px-2 py-0.5 rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                  {msg.flaggedAt && msg.safetyReason && (
                    <p className="mt-1 text-xs text-muted">
                      Reason: {msg.safetyReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {usage ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-sm text-muted">Total active time</p>
                  <p className="text-2xl font-bold">{usage.totalMinutes} min</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-sm text-muted">Days active</p>
                  <p className="text-2xl font-bold">{usage.days.filter((d) => d.activeSeconds > 0).length}</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-sm text-muted">Daily limit</p>
                  <p className="text-2xl font-bold">
                    {usage.dailyLimitMinutes ? `${usage.dailyLimitMinutes} min` : "No limit"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border divide-y divide-border">
                {usage.days.length === 0 ? (
                  <div className="p-4 text-center text-muted text-sm">No usage data for this range.</div>
                ) : (
                  usage.days.map((day) => (
                    <div key={day.date} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm">{day.date}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{day.activeMinutes} min</span>
                        {usage.dailyLimitMinutes && (
                          <span className="text-xs text-muted">
                            / {usage.dailyLimitMinutes} min
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted text-sm">No usage data yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
