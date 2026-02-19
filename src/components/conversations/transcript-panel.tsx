"use client";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  flaggedAt: string | null;
}

interface TranscriptPanelProps {
  title: string | null;
  messages: Message[];
  kidNickname: string;
}

export function TranscriptPanel({ title, messages, kidNickname }: TranscriptPanelProps) {
  function handleExport() {
    window.print();
  }

  return (
    <div className="bg-white border-2 border-slate-400 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-800">
            {title || "Conversation"}
          </h3>
          <p className="text-sm text-slate-500">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="border-2 border-slate-400 text-slate-700 px-4 py-2 rounded text-sm font-medium hover:bg-slate-50"
        >
          Export PDF
        </button>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "kid" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-md p-3 rounded-lg ${
                msg.role === "kid"
                  ? "bg-blue-100 text-blue-900"
                  : "bg-slate-100 text-slate-800"
              } ${msg.flaggedAt ? "ring-2 ring-red-400" : ""}`}
            >
              <div className="text-xs font-medium mb-1">
                {msg.role === "kid" ? kidNickname : "Bound AI"}
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {messages.length === 0 && (
        <div className="text-center text-sm text-slate-500 py-8">
          Select a conversation to view the transcript
        </div>
      )}
    </div>
  );
}
