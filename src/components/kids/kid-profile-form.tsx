"use client";

import { useState } from "react";
import { createKidProfile } from "@/app/actions/kids";

export function KidProfileForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await createKidProfile(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
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
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="What do you call them?"
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
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="e.g. 3rd, K, Pre-K"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-border p-4">
        <input
          type="checkbox"
          name="attestation"
          value="true"
          required
          className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
        />
        <span className="text-sm">
          I agree to the Terms & Conditions for creating this child profile. I am the parent or legal guardian of this child.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
      >
        {loading ? "Creating profile..." : "Create profile"}
      </button>
    </form>
  );
}
