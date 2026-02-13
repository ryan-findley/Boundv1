"use client";

import { useState } from "react";
import { updateTimeLimit } from "@/app/actions/kids";

export function TimeLimitManager({
  kidProfileId,
  initialMinutes,
}: {
  kidProfileId: string;
  initialMinutes: number | null;
}) {
  const [enabled, setEnabled] = useState(initialMinutes !== null);
  const [minutes, setMinutes] = useState(initialMinutes ?? 60);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await updateTimeLimit(kidProfileId, enabled ? minutes : null);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            setEnabled(e.target.checked);
            setSaved(false);
          }}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        <span className="text-sm font-medium">Enable daily time limit</span>
      </label>

      {enabled && (
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={minutes}
            onChange={(e) => {
              setMinutes(parseInt(e.target.value, 10) || 0);
              setSaved(false);
            }}
            min={5}
            max={480}
            className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <span className="text-sm text-muted">minutes per day</span>
        </div>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save time limit"}
      </button>
    </div>
  );
}
