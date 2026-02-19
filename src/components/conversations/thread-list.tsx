"use client";

interface ThreadSummary {
  id: string;
  title: string;
  messageCount: number;
  durationMinutes: number;
  flagLevel: "red" | "yellow" | null;
  lastMessageAt: string;
}

interface ThreadListProps {
  threads: ThreadSummary[];
  selectedThreadId: string | null;
  onSelect: (threadId: string) => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (isToday) return `Today ${time}`;
  if (isYesterday) return `Yesterday ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ` ${time}`;
}

export function ThreadList({ threads, selectedThreadId, onSelect }: ThreadListProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">
        Conversations
      </div>

      {threads.length === 0 && (
        <p className="text-sm text-slate-500">No conversations yet</p>
      )}

      {threads.map((thread) => (
        <div
          key={thread.id}
          onClick={() => onSelect(thread.id)}
          className={`p-3 rounded cursor-pointer border-2 ${
            selectedThreadId === thread.id
              ? "border-slate-800 bg-slate-50"
              : "border-transparent hover:bg-slate-50"
          } ${thread.flagLevel === "red" ? "border-l-4 border-l-red-500" : ""} ${
            thread.flagLevel === "yellow" ? "border-l-4 border-l-amber-500" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            {thread.flagLevel === "red" && <span className="text-xs">🔴</span>}
            {thread.flagLevel === "yellow" && <span className="text-xs">🟡</span>}
            <span className="font-medium text-sm text-slate-800 truncate">
              {thread.title}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {formatTime(thread.lastMessageAt)} &middot; {thread.durationMinutes} min
          </div>
        </div>
      ))}
    </div>
  );
}
