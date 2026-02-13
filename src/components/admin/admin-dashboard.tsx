"use client";

import { useState, useEffect } from "react";
import { getKpiData, getTimeSeriesData } from "@/app/actions/admin";

interface Kpi {
  label: string;
  current: number;
  prior: number;
  change: number | null;
}

interface TimeSeriesPoint {
  date: string;
  prompts: number;
  flagged: number;
}

export function AdminDashboard() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [startDate, setStartDate] = useState(weekAgo.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [kpiData, tsData] = await Promise.all([
          getKpiData(startDate, endDate),
          getTimeSeriesData(startDate, endDate),
        ]);
        setKpis(kpiData.kpis);
        setTimeSeries(tsData);
      } catch (err) {
        console.error("Failed to load admin data", err);
      }
      setLoading(false);
    }
    load();
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Date range picker */}
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="font-semibold">Period Analytics</h2>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          />
          <span className="text-muted">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted text-sm">Loading analytics...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-border p-4 space-y-1">
                <p className="text-xs text-muted">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.current}</p>
                <div className="flex items-center gap-1">
                  {kpi.change !== null ? (
                    <span
                      className={`text-xs font-medium ${
                        kpi.change > 0
                          ? "text-green-600"
                          : kpi.change < 0
                          ? "text-danger"
                          : "text-muted"
                      }`}
                    >
                      {kpi.change > 0 ? "+" : ""}
                      {kpi.change}%
                    </span>
                  ) : (
                    <span className="text-xs text-muted">--</span>
                  )}
                  <span className="text-xs text-muted">vs prior</span>
                </div>
                <p className="text-xs text-muted">Prior: {kpi.prior}</p>
              </div>
            ))}
          </div>

          {/* Time Series (simple table) */}
          {timeSeries.length > 0 && (
            <div className="rounded-xl border border-border">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-sm">Daily Prompt Activity</h3>
              </div>
              <div className="divide-y divide-border">
                <div className="grid grid-cols-3 px-4 py-2 text-xs text-muted font-medium">
                  <span>Date</span>
                  <span>Prompts</span>
                  <span>Flagged</span>
                </div>
                {timeSeries.map((point) => (
                  <div key={point.date} className="grid grid-cols-3 px-4 py-2 text-sm">
                    <span>{point.date}</span>
                    <span>{point.prompts}</span>
                    <span className={point.flagged > 0 ? "text-danger font-medium" : ""}>
                      {point.flagged}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* CMS Placeholder */}
      <div className="rounded-xl border border-border p-6 space-y-3">
        <h2 className="font-semibold">Content Management (Payload CMS)</h2>
        <p className="text-sm text-muted">
          Payload CMS integration for course, lesson, quiz, and badge authoring
          will be available here. Configure Payload CMS to enable content management.
        </p>
        <div className="text-xs text-muted bg-foreground/5 rounded-lg p-3">
          To set up Payload CMS:
          <ol className="list-decimal pl-4 mt-1 space-y-1">
            <li>Install: npm install payload @payloadcms/next</li>
            <li>Configure collections (courses, lessons, quizzes, badges)</li>
            <li>Set up Supabase Storage adapter for media</li>
            <li>Connect Payload admin panel at /admin/cms</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
