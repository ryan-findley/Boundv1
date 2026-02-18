"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { extendTimeLimit } from "@/app/actions/controls";
import { UsageChart } from "./usage-chart";
import { AlertsPanel } from "./alerts-panel";
import { HighlightsPanel } from "./highlights-panel";
import { ProgressSection } from "./progress-section";
import { WeeklyDigestPreview } from "./weekly-digest-preview";
import { RecentActivityFeed } from "./recent-activity-feed";

interface DayData {
  date: string;
  dayLabel: string;
  activeMinutes: number;
}

interface Alert {
  id: string;
  alertLevel: string;
  category: string;
  summary: string;
  reviewedAt: string | null;
  createdAt: string;
  chatMessageId: string | null;
  threadId: string | null;
  messageContent: string | null;
}

interface ActivityEntry {
  id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: string;
}

interface DashboardClientProps {
  kidId: string;
  kidNickname: string;
  lastActiveTime: string | null;
  weeklyUsage: {
    days: DayData[];
    totalMinutes: number;
    sessionCount: number;
    todayMinutes: number;
    dailyLimitMinutes: number | null;
  };
  alerts: Alert[];
  recentActivity: ActivityEntry[];
}

function formatLastActive(iso: string | null): string {
  if (!iso) return "No activity yet";
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  if (isToday) return `Last active: Today at ${time}`;
  return `Last active: ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${time}`;
}

export function DashboardClient({
  kidId,
  kidNickname,
  lastActiveTime,
  weeklyUsage,
  alerts,
  recentActivity,
}: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleExtend(minutes: number) {
    startTransition(async () => {
      await extendTimeLimit(kidId, minutes);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {kidNickname}&apos;s Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            {formatLastActive(lastActiveTime)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExtend(15)}
            disabled={isPending}
            className="border-2 border-slate-400 text-slate-700 px-4 py-2 rounded text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            + 15 min
          </button>
          <button
            onClick={() => handleExtend(30)}
            disabled={isPending}
            className="border-2 border-slate-400 text-slate-700 px-4 py-2 rounded text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            + 30 min
          </button>
          <button className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700">
            Custom time
          </button>
        </div>
      </div>

      {/* Hero: Usage Chart */}
      <UsageChart
        days={weeklyUsage.days}
        totalMinutes={weeklyUsage.totalMinutes}
        sessionCount={weeklyUsage.sessionCount}
        todayMinutes={weeklyUsage.todayMinutes}
        dailyLimitMinutes={weeklyUsage.dailyLimitMinutes}
      />

      {/* Highlights & Alerts side by side */}
      <div className="grid grid-cols-2 gap-6">
        <HighlightsPanel kidNickname={kidNickname} />
        <AlertsPanel alerts={alerts} kidId={kidId} />
      </div>

      {/* Lower Section: Progress, Weekly Digest, Recent Activity */}
      <div className="grid grid-cols-3 gap-6">
        <ProgressSection />
        <WeeklyDigestPreview />
        <RecentActivityFeed activities={recentActivity} kidId={kidId} />
      </div>
    </div>
  );
}
