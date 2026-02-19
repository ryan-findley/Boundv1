"use client";

import { useState, useTransition } from "react";
import { updateContentSensitivity } from "@/app/actions/controls";
import { CONTENT_SENSITIVITY_CATEGORIES } from "@/lib/constants";

interface ContentSensitivityProps {
  kidProfileId: string;
  initialRules: { category: string; alertLevel: string }[];
}

export function ContentSensitivity({ kidProfileId, initialRules }: ContentSensitivityProps) {
  const [rules, setRules] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const r of initialRules) {
      map[r.category] = r.alertLevel;
    }
    return map;
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleChange(category: string, level: string) {
    setRules((prev) => ({ ...prev, [category]: level }));
  }

  function handleSave() {
    startTransition(async () => {
      const rulesList = CONTENT_SENSITIVITY_CATEGORIES.map((cat) => ({
        category: cat.id,
        alertLevel: rules[cat.id] ?? "yellow",
      }));
      await updateContentSensitivity(kidProfileId, rulesList);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="bg-white border-2 border-slate-400 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">
        Content Sensitivity
      </div>
      <p className="text-xs text-slate-500 mt-1">Set alert levels by category</p>

      <div className="mt-4 space-y-3">
        {CONTENT_SENSITIVITY_CATEGORIES.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between">
            <span className="text-sm text-slate-700">{cat.label}</span>
            <select
              value={rules[cat.id] ?? "yellow"}
              onChange={(e) => handleChange(cat.id, e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="red">🔴 Instant alert</option>
              <option value="yellow">🟡 Weekly digest</option>
              <option value="green">🟢 No flag</option>
            </select>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={isPending}
        className="mt-4 bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
      >
        {isPending ? "Saving..." : saved ? "Saved!" : "Save"}
      </button>
    </div>
  );
}
