"use client";

import { useState, useTransition } from "react";
import { getThreadList, getThreadTranscript } from "@/app/actions/visibility";
import { ThreadList } from "./thread-list";
import { TranscriptPanel } from "./transcript-panel";
import { ConversationFilters } from "./conversation-filters";

interface ThreadSummary {
  id: string;
  title: string;
  messageCount: number;
  durationMinutes: number;
  flagLevel: "red" | "yellow" | null;
  lastMessageAt: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  safetyDecision: string | null;
  matchedTopics: string[];
  flaggedAt: string | null;
}

interface ConversationsClientProps {
  kidId: string;
  kidNickname: string;
  initialThreads: ThreadSummary[];
}

export function ConversationsClient({
  kidId,
  kidNickname,
  initialThreads,
}: ConversationsClientProps) {
  const [threads, setThreads] = useState(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    initialThreads[0]?.id ?? null
  );
  const [transcript, setTranscript] = useState<{
    title: string | null;
    messages: Message[];
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpeaker, setFilterSpeaker] = useState("all");
  const [filterFlag, setFilterFlag] = useState("all");
  const [isPending, startTransition] = useTransition();

  function handleSelectThread(threadId: string) {
    setSelectedThreadId(threadId);
    startTransition(async () => {
      const result = await getThreadTranscript(kidId, threadId);
      setTranscript(result);
    });
  }

  function handleSearch() {
    startTransition(async () => {
      const result = await getThreadList(kidId, {
        search: searchQuery || undefined,
        flagFilter: filterFlag as "all" | "red" | "yellow" | "flagged",
      });
      setThreads(result);
      setSelectedThreadId(null);
      setTranscript(null);
    });
  }

  // Load first thread transcript on mount
  if (selectedThreadId && !transcript && !isPending) {
    startTransition(async () => {
      const result = await getThreadTranscript(kidId, selectedThreadId);
      setTranscript(result);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Conversation Logs</h1>
        <p className="text-slate-500 text-sm">
          Full transcripts of {kidNickname}&apos;s chats
        </p>
      </div>

      <ConversationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterSpeaker={filterSpeaker}
        onSpeakerChange={setFilterSpeaker}
        filterFlag={filterFlag}
        onFlagChange={setFilterFlag}
        onSearch={handleSearch}
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <ThreadList
            threads={threads}
            selectedThreadId={selectedThreadId}
            onSelect={handleSelectThread}
          />
        </div>
        <div className="col-span-2">
          {isPending ? (
            <div className="bg-white border-2 border-slate-400 rounded-lg p-8 text-center text-slate-500">
              Loading...
            </div>
          ) : transcript ? (
            <TranscriptPanel
              title={transcript.title}
              messages={transcript.messages}
              kidNickname={kidNickname}
            />
          ) : (
            <div className="bg-white border-2 border-slate-400 rounded-lg p-8 text-center text-slate-500">
              Select a conversation to view the transcript
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
