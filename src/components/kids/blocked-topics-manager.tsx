"use client";

import { useState } from "react";
import { updateBlockedTopics } from "@/app/actions/kids";

export function BlockedTopicsManager({
  kidProfileId,
  initialTopics,
}: {
  kidProfileId: string;
  initialTopics: string[];
}) {
  const [topics, setTopics] = useState<string[]>(initialTopics);
  const [newTopic, setNewTopic] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function addTopic() {
    const trimmed = newTopic.trim();
    if (!trimmed || topics.includes(trimmed)) return;
    setTopics([...topics, trimmed]);
    setNewTopic("");
    setSaved(false);
  }

  function removeTopic(topic: string) {
    setTopics(topics.filter((t) => t !== topic));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    await updateBlockedTopics(kidProfileId, topics);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTopic();
            }
          }}
          maxLength={200}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="e.g. dating, cryptocurrency..."
        />
        <button
          type="button"
          onClick={addTopic}
          disabled={!newTopic.trim()}
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-foreground/5 disabled:opacity-50 transition-colors"
        >
          Add
        </button>
      </div>

      {topics.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm"
            >
              {topic}
              <button
                type="button"
                onClick={() => removeTopic(topic)}
                className="text-muted hover:text-danger transition-colors"
              >
                x
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted">No custom blocked topics. System-level topics still apply.</p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save topics"}
      </button>
    </div>
  );
}
