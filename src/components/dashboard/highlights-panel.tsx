"use client";

// TODO: Replace mock data with real data when Highlights model is implemented.
// Highlights require kid-facing "share with parent" features that don't exist yet.

const MOCK_HIGHLIGHTS = [
  {
    emoji: "🐉",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    iconBg: "bg-emerald-200",
    timeColor: "text-emerald-600",
    title: 'Shared: "My dragon story idea!"',
    description:
      "Brainstormed a story about a dragon living in a library who eats boring books. Creative worldbuilding!",
    time: "Today at 3:40 PM",
  },
  {
    emoji: "🎓",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconBg: "bg-blue-200",
    timeColor: "text-blue-600",
    title: 'Lesson completed: "Why AI Hallucinates"',
    description:
      "Learned about AI confidence vs accuracy. Ask them about it!",
    time: "Yesterday at 4:30 PM",
  },
  {
    emoji: "🐢",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    iconBg: "bg-purple-200",
    timeColor: "text-purple-600",
    title: 'Shared: "Sea turtle facts!"',
    description:
      "Researched sea turtle migration patterns for a school project.",
    time: "Yesterday at 4:15 PM",
  },
];

interface HighlightsPanelProps {
  kidNickname: string;
}

export function HighlightsPanel({ kidNickname }: HighlightsPanelProps) {
  return (
    <div className="bg-white border-2 border-slate-400 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">
          Highlights
        </div>
        <button className="text-sm text-slate-600 underline">View all</button>
      </div>

      <div className="space-y-3">
        {MOCK_HIGHLIGHTS.map((item, i) => (
          <div
            key={i}
            className={`${item.bgColor} border ${item.borderColor} rounded-lg p-3`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 ${item.iconBg} rounded flex items-center justify-center text-lg`}
              >
                {item.emoji}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {kidNickname} {item.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {item.description}
                </p>
                <p className={`text-xs ${item.timeColor} mt-1`}>{item.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
