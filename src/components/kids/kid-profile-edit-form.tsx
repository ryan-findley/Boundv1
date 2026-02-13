"use client";

import { useState } from "react";
import { updateKidProfile } from "@/app/actions/kids";

interface Kid {
  id: string;
  nickname: string;
  age: number;
  grade: string;
}

export function KidProfileEditForm({ kid }: { kid: Kid }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await updateKidProfile(kid.id, formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-danger dark:bg-red-950">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="nickname" className="block text-sm font-medium mb-1">
          Nickname
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          required
          maxLength={50}
          defaultValue={kid.nickname}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="age" className="block text-sm font-medium mb-1">
            Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            required
            min={3}
            max={17}
            defaultValue={kid.age}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="grade" className="block text-sm font-medium mb-1">
            Grade
          </label>
          <input
            id="grade"
            name="grade"
            type="text"
            required
            defaultValue={kid.grade}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
        <a
          href={`/kids/${kid.id}`}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-foreground/5 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
