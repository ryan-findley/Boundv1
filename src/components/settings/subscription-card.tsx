"use client";

export function SubscriptionCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="font-semibold text-slate-800 mb-4">Subscription</h3>

      {/* TODO: Stripe integration needed for real subscription management */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Current plan</span>
          <span className="text-sm font-medium text-slate-800">
            Free Beta
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Status</span>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
            Active
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <button
          disabled
          className="w-full border border-slate-300 rounded py-2 text-sm text-slate-400 cursor-not-allowed"
        >
          Upgrade plan{" "}
          <span className="text-xs bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded ml-1">
            Coming soon
          </span>
        </button>
        <button
          disabled
          className="w-full border border-slate-300 rounded py-2 text-sm text-slate-400 cursor-not-allowed"
        >
          Billing history{" "}
          <span className="text-xs bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded ml-1">
            Coming soon
          </span>
        </button>
      </div>
    </div>
  );
}
