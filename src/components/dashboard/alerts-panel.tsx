"use client";

import { markAlertReviewed } from "@/app/actions/alerts";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

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

interface AlertsPanelProps {
  alerts: Alert[];
  kidId: string;
}

function formatAlertTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) return `Today ${time}`;
  if (isYesterday) return `Yesterday ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ` ${time}`;
}

export function AlertsPanel({ alerts, kidId }: AlertsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleMarkReviewed(alertId: string) {
    startTransition(async () => {
      await markAlertReviewed(alertId);
      router.refresh();
    });
  }

  const unreviewedAlerts = alerts.filter((a) => !a.reviewedAt);

  return (
    <div className="bg-white border-2 border-slate-400 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">
          Alerts
        </div>
        <button className="text-sm text-slate-600 underline">View all</button>
      </div>

      <div className="space-y-3">
        {unreviewedAlerts.length === 0 && alerts.length === 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
            <p className="text-sm text-slate-500">No alerts this week</p>
          </div>
        )}

        {alerts.slice(0, 3).map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg p-3 ${
              alert.alertLevel === "red"
                ? "bg-red-50 border border-red-300"
                : "bg-amber-50 border border-amber-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium text-sm ${
                      alert.alertLevel === "red"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  >
                    {alert.alertLevel === "red" ? "Immediate" : "Flagged"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatAlertTime(alert.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-slate-800 mt-1">{alert.summary}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Category: {alert.category}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                {alert.threadId && (
                  <button className={`text-xs underline ${
                    alert.alertLevel === "red" ? "text-red-700" : "text-amber-700"
                  }`}>
                    View chat
                  </button>
                )}
                {!alert.reviewedAt && (
                  <button
                    onClick={() => handleMarkReviewed(alert.id)}
                    disabled={isPending}
                    className="text-xs text-slate-600 underline"
                  >
                    Mark reviewed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {alerts.length > 0 && unreviewedAlerts.length === 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
            <p className="text-sm text-slate-500">
              All alerts reviewed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
