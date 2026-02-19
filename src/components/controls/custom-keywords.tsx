"use client";

import { useState, useTransition } from "react";
import { updateCustomKeywords } from "@/app/actions/controls";

interface CustomKeywordsProps {
  kidProfileId: string;
  initialAlertKeywords: string[];
  initialExceptionKeywords: string[];
}

export function CustomKeywords({
  kidProfileId,
  initialAlertKeywords,
  initialExceptionKeywords,
}: CustomKeywordsProps) {
  const [alertKeywords, setAlertKeywords] = useState(initialAlertKeywords);
  const [exceptionKeywords, setExceptionKeywords] = useState(initialExceptionKeywords);
  const [newAlert, setNewAlert] = useState("");
  const [newException, setNewException] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function addAlertKeyword() {
    const trimmed = newAlert.trim();
    if (!trimmed || alertKeywords.includes(trimmed)) return;
    setAlertKeywords([...alertKeywords, trimmed]);
    setNewAlert("");
  }

  function addExceptionKeyword() {
    const trimmed = newException.trim();
    if (!trimmed || exceptionKeywords.includes(trimmed)) return;
    setExceptionKeywords([...exceptionKeywords, trimmed]);
    setNewException("");
  }

  function handleSave() {
    startTransition(async () => {
      await updateCustomKeywords(kidProfileId, { alertKeywords, exceptionKeywords });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="bg-white border-2 border-slate-400 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">
        Custom Keywords
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Always alert me about:
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {alertKeywords.map((kw) => (
              <span
                key={kw}
                className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm"
              >
                {kw}{" "}
                <button
                  onClick={() => setAlertKeywords(alertKeywords.filter((k) => k !== kw))}
                  className="ml-1"
                >
                  x
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add keyword..."
            value={newAlert}
            onChange={(e) => setNewAlert(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAlertKeyword(); } }}
            className="mt-2 w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Never flag these (exceptions):
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {exceptionKeywords.map((kw) => (
              <span
                key={kw}
                className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm"
              >
                {kw}{" "}
                <button
                  onClick={() => setExceptionKeywords(exceptionKeywords.filter((k) => k !== kw))}
                  className="ml-1"
                >
                  x
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add exception..."
            value={newException}
            onChange={(e) => setNewException(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addExceptionKeyword(); } }}
            className="mt-2 w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? "Saving..." : saved ? "Saved!" : "Save"}
        </button>
      </div>
    </div>
  );
}
