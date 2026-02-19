"use client";

interface ParentAccountsCardProps {
  email: string;
}

export function ParentAccountsCard({ email }: ParentAccountsCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="font-semibold text-slate-800 mb-4">Parent Accounts</h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-2 rounded bg-slate-50">
          <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center text-sm font-bold">
            {email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-700 text-sm truncate">
              {email}
            </div>
            <div className="text-xs text-slate-400">Owner</div>
          </div>
        </div>
      </div>

      {/* TODO: Multi-parent support requires auth redesign */}
      <button
        disabled
        className="mt-4 w-full border border-dashed border-slate-300 rounded py-2 text-sm text-slate-400 cursor-not-allowed"
      >
        + Invite parent{" "}
        <span className="text-xs bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded ml-1">
          Coming soon
        </span>
      </button>
    </div>
  );
}
