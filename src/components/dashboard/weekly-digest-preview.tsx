"use client";

// TODO: Replace mock data with real data when NLP/summarization pipeline
// is implemented for top topics and discussion prompt generation.

export function WeeklyDigestPreview() {
  return (
    <div className="bg-white border-2 border-slate-300 border-dashed rounded-lg p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">
        Weekly Digest
      </div>
      <p className="text-xs text-slate-500">Full report emailed Sunday</p>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-slate-700">Top Topics</p>
          <p className="text-sm text-slate-500">
            1. Creative writing (dragon story)
          </p>
          <p className="text-sm text-slate-500">
            2. Sea turtles &amp; marine biology
          </p>
          <p className="text-sm text-slate-500">3. Math homework help</p>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700">
            Discussion Prompts
          </p>
          <p className="text-sm text-slate-500 italic">
            &quot;Ask about the dragon character they created—who discovers it in the library?&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
