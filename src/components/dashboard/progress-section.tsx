"use client";

// TODO: Replace mock data with real data when pillar models (Safety lessons,
// Sandbox conversations, Skilling challenges) are implemented.

export function ProgressSection() {
  return (
    <div className="bg-white border-2 border-slate-300 border-dashed rounded-lg p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">
        Progress
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-700">Safety</span>
            <span className="text-slate-500">4/6 lessons</span>
          </div>
          <div className="mt-1 h-2 bg-slate-200 rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: "66%" }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Latest: &quot;Why AI Hallucinates&quot;
          </p>
        </div>

        <div>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-700">Sandbox</span>
            <span className="text-slate-500">12 conversations</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Topics: dragons, sea turtles, fractions
          </p>
        </div>

        <div>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-700">Skilling</span>
            <span className="text-slate-500">2/8 challenges</span>
          </div>
          <div className="mt-1 h-2 bg-slate-200 rounded-full">
            <div
              className="h-2 bg-purple-500 rounded-full"
              style={{ width: "25%" }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            In progress: &quot;Iterate an Image&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
