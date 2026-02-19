"use client";

interface ConversationFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterSpeaker: string;
  onSpeakerChange: (value: string) => void;
  filterFlag: string;
  onFlagChange: (value: string) => void;
  onSearch: () => void;
}

export function ConversationFilters({
  searchQuery,
  onSearchChange,
  filterFlag,
  onFlagChange,
  onSearch,
}: ConversationFiltersProps) {
  return (
    <div className="bg-white border-2 border-slate-400 rounded-lg p-4">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-xs uppercase tracking-wide text-slate-500 font-bold">
            Search conversations
          </label>
          <input
            type="text"
            placeholder='Search by keyword (e.g., "homework", "story")'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
            className="mt-1 w-full border-2 border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-500 font-bold">
            Flag status
          </label>
          <select
            value={filterFlag}
            onChange={(e) => onFlagChange(e.target.value)}
            className="mt-1 border-2 border-slate-300 rounded px-3 py-2 text-sm"
          >
            <option value="all">All conversations</option>
            <option value="red">🔴 Red flags only</option>
            <option value="yellow">🟡 Yellow flags only</option>
            <option value="flagged">Any flagged</option>
          </select>
        </div>
        <button
          onClick={onSearch}
          className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700"
        >
          Search
        </button>
      </div>
    </div>
  );
}
