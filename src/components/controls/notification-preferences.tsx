"use client";

import { useState, useTransition } from "react";
import { updateNotificationPreferences } from "@/app/actions/controls";

interface NotificationPreferencesProps {
  kidProfileId: string;
  initial: {
    instantPush: boolean;
    instantEmail: boolean;
    instantSms: boolean;
    weeklyDigestEmail: boolean;
    lessonCompletionNotify: boolean;
    kidShareNotify: boolean;
  } | null;
}

export function NotificationPreferences({ kidProfileId, initial }: NotificationPreferencesProps) {
  const defaults = initial ?? {
    instantPush: true,
    instantEmail: true,
    instantSms: false,
    weeklyDigestEmail: true,
    lessonCompletionNotify: true,
    kidShareNotify: false,
  };

  const [prefs, setPrefs] = useState(defaults);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggle(key: keyof typeof prefs) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    startTransition(async () => {
      await updateNotificationPreferences(kidProfileId, prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="bg-white border-2 border-slate-400 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">
        Notification Preferences
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Instant alerts (red flags)
          </label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.instantPush}
                onChange={() => toggle("instantPush")}
                disabled
              />
              <span className="text-sm text-slate-400">
                Push notification <span className="text-xs">(Coming soon)</span>
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.instantEmail}
                onChange={() => toggle("instantEmail")}
              />
              <span className="text-sm">Email</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.instantSms}
                onChange={() => toggle("instantSms")}
                disabled
              />
              <span className="text-sm text-slate-400">
                SMS <span className="text-xs">(Coming soon)</span>
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Weekly digest</label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.weeklyDigestEmail}
                onChange={() => toggle("weeklyDigestEmail")}
              />
              <span className="text-sm">Email (Sundays at 9am)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Progress updates</label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.lessonCompletionNotify}
                onChange={() => toggle("lessonCompletionNotify")}
              />
              <span className="text-sm">When a lesson is completed</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.kidShareNotify}
                onChange={() => toggle("kidShareNotify")}
              />
              <span className="text-sm">When something is shared with me</span>
            </label>
          </div>
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
