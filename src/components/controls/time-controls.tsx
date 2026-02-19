"use client";

import { useState, useTransition } from "react";
import { updateTimeLimitSettings } from "@/app/actions/controls";
import { TIME_LIMIT_MIN, TIME_LIMIT_MAX } from "@/lib/constants";

interface TimeControlsProps {
  kidProfileId: string;
  initial: {
    dailyTimeLimitMinutes: number | null;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
    weekendTimeLimitAdjustment: number | null;
  };
}

export function TimeControls({ kidProfileId, initial }: TimeControlsProps) {
  const [limit, setLimit] = useState(initial.dailyTimeLimitMinutes ?? 45);
  const [quietStart, setQuietStart] = useState(initial.quietHoursStart ?? "21:00");
  const [quietEnd, setQuietEnd] = useState(initial.quietHoursEnd ?? "07:00");
  const [weekendAdj, setWeekendAdj] = useState(initial.weekendTimeLimitAdjustment ?? 0);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await updateTimeLimitSettings(kidProfileId, {
        dailyTimeLimitMinutes: limit,
        quietHoursStart: quietStart,
        quietHoursEnd: quietEnd,
        weekendTimeLimitAdjustment: weekendAdj || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="bg-white border-2 border-slate-400 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">
        Time Limits
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Daily time limit</label>
          <div className="flex items-center gap-4 mt-2">
            <input
              type="range"
              min={TIME_LIMIT_MIN}
              max={TIME_LIMIT_MAX}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-bold text-slate-800 w-20">{limit} min</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Quiet hours (no access)
          </label>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="time"
              value={quietStart}
              onChange={(e) => setQuietStart(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <span className="text-sm text-slate-500">to</span>
            <input
              type="time"
              value={quietEnd}
              onChange={(e) => setQuietEnd(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Weekend adjustment</label>
          <select
            value={weekendAdj}
            onChange={(e) => setWeekendAdj(Number(e.target.value))}
            className="mt-2 w-full border rounded px-3 py-2 text-sm"
          >
            <option value={0}>Same as weekdays ({limit} min)</option>
            <option value={15}>+15 minutes ({limit + 15} min)</option>
            <option value={30}>+30 minutes ({limit + 30} min)</option>
            <option value={limit}>Double time ({limit * 2} min)</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? "Saving..." : saved ? "Saved!" : "Save"}
        </button>
      </div>
    </div>
  );
}
