"use client";

import { useState } from "react";
import { deleteKidProfile } from "@/app/actions/kids";

export function DeleteKidButton({
  kidProfileId,
  nickname,
}: {
  kidProfileId: string;
  nickname: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteKidProfile(kidProfileId);
  }

  if (confirming) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-danger">
          Are you sure you want to delete {nickname}&apos;s profile? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Deleting..." : "Yes, delete permanently"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-lg border border-danger/50 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
    >
      Delete this profile
    </button>
  );
}
