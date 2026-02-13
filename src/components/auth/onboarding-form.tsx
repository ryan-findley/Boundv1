"use client";

import { useState } from "react";
import { acceptTerms } from "@/app/actions/auth";

export function OnboardingForm() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) return;
    setLoading(true);

    const formData = new FormData();
    formData.set("accepted", "true");

    await acceptTerms();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-border p-6 space-y-4">
        <h2 className="font-semibold">Terms & Conditions</h2>
        <div className="max-h-48 overflow-y-auto text-sm text-muted space-y-2 pr-2">
          <p>
            By using Bound, you agree to the following terms:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>You are a parent or legal guardian of the child(ren) you add to this platform.</li>
            <li>You acknowledge that AI-generated content is not guaranteed to be error-free.</li>
            <li>Bound uses AI safety systems to filter inappropriate content, but no system is perfect.</li>
            <li>You are responsible for reviewing your child&apos;s interactions through the parent dashboard.</li>
            <li>You consent to your child&apos;s conversations being stored for safety and transparency purposes.</li>
            <li>You agree to our data handling and privacy practices.</li>
          </ul>
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
        />
        <span className="text-sm">
          I have read and accept the Terms & Conditions (v1)
        </span>
      </label>

      <button
        type="submit"
        disabled={!accepted || loading}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
      >
        {loading ? "Setting up your account..." : "Accept & Continue"}
      </button>
    </form>
  );
}
