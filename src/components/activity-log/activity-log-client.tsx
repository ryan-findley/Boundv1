"use client";

import { useState, useTransition } from "react";
import {
  getActivityLog,
  exportActivityLogCsv,
  type ActivityLogFilters,
} from "@/app/actions/activity-log";
import { AUDIT_EVENT_LABELS, AUDIT_EVENT_CATEGORIES } from "@/lib/constants";

interface ActivityItem {
  id: string;
  action: string;
  label: string;
  category: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: string;
}

interface ActivityLogClientProps {
  kidId: string;
  initialItems: ActivityItem[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getEventDetail(item: ActivityItem): string {
  const meta = item.metadata;
  if (!meta) return "";

  if (item.action === "time_extended" && meta.additionalMinutes) {
    return `+${meta.additionalMinutes}m (${meta.previousLimit}→${meta.newLimit}m)`;
  }
  if (item.action === "time_limit_settings_updated") {
    const parts: string[] = [];
    if (meta.dailyTimeLimitMinutes !== undefined) parts.push(`Limit: ${meta.dailyTimeLimitMinutes ?? "none"}m`);
    if (meta.quietHoursStart) parts.push(`Quiet: ${meta.quietHoursStart}–${meta.quietHoursEnd}`);
    return parts.join(", ");
  }
  if (item.action === "kid_profile_created" || item.action === "kid_profile_updated") {
    if (meta.nickname) return String(meta.nickname);
  }
  return "";
}

export function ActivityLogClient({
  kidId,
  initialItems,
  initialNextCursor,
  initialHasMore,
}: ActivityLogClientProps) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [eventCategory, setEventCategory] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function applyFilters() {
    startTransition(async () => {
      const filters: ActivityLogFilters = {
        eventCategory: eventCategory !== "all" ? eventCategory : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      const result = await getActivityLog(kidId, filters);
      setItems(result.items);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    });
  }

  function loadMore() {
    if (!nextCursor) return;
    startTransition(async () => {
      const filters: ActivityLogFilters = {
        eventCategory: eventCategory !== "all" ? eventCategory : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        cursor: nextCursor,
      };
      const result = await getActivityLog(kidId, filters);
      setItems((prev) => [...prev, ...result.items]);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    });
  }

  function handleExportCsv() {
    startTransition(async () => {
      const csv = await exportActivityLogCsv(kidId, {
        eventCategory: eventCategory !== "all" ? eventCategory : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-log-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Event type</label>
          <select
            value={eventCategory}
            onChange={(e) => setEventCategory(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm"
          >
            {AUDIT_EVENT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm"
          />
        </div>
        <button
          onClick={applyFilters}
          disabled={isPending}
          className="bg-slate-800 text-white px-4 py-1.5 rounded text-sm hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? "Loading..." : "Apply"}
        </button>
        <button
          onClick={handleExportCsv}
          disabled={isPending}
          className="bg-white border border-slate-300 text-slate-700 px-4 py-1.5 rounded text-sm hover:bg-slate-50 disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Details</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Actor</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No activity found
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                  {formatTimestamp(item.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="ml-2 text-xs text-slate-400 hidden lg:inline">
                    {item.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                  {getEventDetail(item)}
                </td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                  {item.actor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="text-sm text-slate-600 underline hover:text-slate-800 disabled:opacity-50"
          >
            {isPending ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
