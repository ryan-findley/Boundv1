"use client";

interface DayData {
  date: string;
  dayLabel: string;
  activeMinutes: number;
}

interface UsageChartProps {
  days: DayData[];
  totalMinutes: number;
  sessionCount: number;
  todayMinutes: number;
  dailyLimitMinutes: number | null;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function UsageChart({
  days,
  totalMinutes,
  sessionCount,
  todayMinutes,
  dailyLimitMinutes,
}: UsageChartProps) {
  const maxMinutes = Math.max(...days.map((d) => d.activeMinutes), 1);

  return (
    <div className="bg-white border-2 border-slate-400 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">
            This Week&apos;s Activity
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {formatTime(totalMinutes)} total
          </p>
          <p className="text-sm text-slate-500">
            across {sessionCount} session{sessionCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-32 mt-6">
        {days.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className="w-full flex flex-col-reverse"
              style={{ height: "100px" }}
            >
              <div
                className="w-full bg-emerald-500 rounded-t"
                style={{
                  height: `${(day.activeMinutes / maxMinutes) * 100}%`,
                  minHeight: day.activeMinutes > 0 ? "4px" : "0px",
                }}
              ></div>
            </div>
            <span className="text-xs text-slate-500 mt-2">{day.dayLabel}</span>
            <span className="text-xs text-slate-400">{day.activeMinutes}m</span>
          </div>
        ))}
      </div>

      {/* Time limit indicator */}
      {dailyLimitMinutes !== null && (
        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
          <div className="text-sm text-slate-600">
            <span className="font-medium">Today:</span> {todayMinutes} min used
            of {dailyLimitMinutes} min limit
          </div>
          <div className="w-48 h-2 bg-slate-200 rounded-full">
            <div
              className={`h-2 rounded-full ${
                todayMinutes >= dailyLimitMinutes
                  ? "bg-red-500"
                  : todayMinutes >= dailyLimitMinutes * 0.8
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.min((todayMinutes / dailyLimitMinutes) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
