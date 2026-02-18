"use client";

import Link from "next/link";

interface ActivityEntry {
  id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: string;
}

interface RecentActivityFeedProps {
  activities: ActivityEntry[];
  kidId: string;
}

const ACTION_LABELS: Record<string, string> = {
  kid_session_started: "Session started",
  kid_session_ended: "Session ended",
  kid_profile_created: "Profile created",
  kid_profile_updated: "Profile updated",
  kid_profile_deleted: "Profile deleted",
  blocked_topics_updated: "Blocked topics changed",
  time_limit_updated: "Time limit changed",
  time_limit_settings_updated: "Time settings changed",
  time_extended: "Time extended",
  alert_reviewed: "Alert reviewed",
  content_sensitivity_updated: "Sensitivity updated",
  custom_keywords_updated: "Keywords updated",
  notification_preferences_updated: "Notifications updated",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getEventDetail(entry: ActivityEntry): string {
  const meta = entry.metadata;
  if (!meta) return "";

  if (entry.action === "time_extended" && meta.additionalMinutes) {
    return `+${meta.additionalMinutes}m`;
  }
  if (entry.action === "kid_session_ended" && meta.sessionId) {
    return "Completed";
  }
  return "";
}

export function RecentActivityFeed({ activities, kidId }: RecentActivityFeedProps) {
  return (
    <div className="bg-white border-2 border-slate-300 border-dashed rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">
          Recent Activity
        </div>
        <Link
          href={`/activity-log?kid=${kidId}`}
          className="text-xs text-slate-600 underline"
        >
          Full log
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        {activities.length === 0 && (
          <p className="text-sm text-slate-500">No recent activity</p>
        )}
        {activities.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0 text-xs"
          >
            <span className="text-slate-400 w-16">
              {formatTime(entry.createdAt)}
            </span>
            <span className="font-medium text-slate-700 flex-1">
              {ACTION_LABELS[entry.action] ?? entry.action}
            </span>
            <span className="text-slate-500">
              {getEventDetail(entry)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
