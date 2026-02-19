"use client";

import { useState, useTransition } from "react";
import {
  exportUserData,
  deleteConversationHistory,
  deleteAccount,
} from "@/app/actions/settings";

interface DataPrivacyCardProps {
  kidIds: { id: string; nickname: string }[];
}

export function DataPrivacyCard({ kidIds }: DataPrivacyCardProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmAccountDelete, setConfirmAccountDelete] = useState(false);

  function handleExport() {
    startTransition(async () => {
      const json = await exportUserData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bound-data-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function handleDeleteHistory(kidId: string) {
    startTransition(async () => {
      await deleteConversationHistory(kidId);
      setConfirmDelete(null);
    });
  }

  function handleDeleteAccount() {
    startTransition(async () => {
      await deleteAccount();
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="font-semibold text-slate-800 mb-4">Data & Privacy</h3>

      <div className="space-y-3">
        {/* Export */}
        <button
          onClick={handleExport}
          disabled={isPending}
          className="w-full border border-slate-300 rounded py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Export all data (JSON)
        </button>

        {/* Delete conversation history per child */}
        {kidIds.map((kid) => (
          <div key={kid.id}>
            {confirmDelete === kid.id ? (
              <div className="border border-red-200 bg-red-50 rounded p-3">
                <p className="text-xs text-red-700 mb-2">
                  Delete all conversations for {kid.nickname}? This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteHistory(kid.id)}
                    disabled={isPending}
                    className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {isPending ? "Deleting..." : "Confirm delete"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="text-xs text-slate-500 underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(kid.id)}
                className="w-full border border-slate-300 rounded py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Delete conversations &mdash; {kid.nickname}
              </button>
            )}
          </div>
        ))}

        {/* Delete account */}
        <div className="pt-2 border-t border-slate-100">
          {confirmAccountDelete ? (
            <div className="border border-red-200 bg-red-50 rounded p-3">
              <p className="text-xs text-red-700 mb-2">
                Permanently delete your account and all associated data? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isPending}
                  className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isPending ? "Deleting..." : "Permanently delete account"}
                </button>
                <button
                  onClick={() => setConfirmAccountDelete(false)}
                  className="text-xs text-slate-500 underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmAccountDelete(true)}
              className="w-full border border-red-300 rounded py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete account
            </button>
          )}
        </div>

        {/* COPPA notice */}
        <p className="text-xs text-slate-400 mt-3">
          All data is handled in compliance with COPPA regulations.
          Deleting your account removes all personal data from our systems.
        </p>
      </div>
    </div>
  );
}
