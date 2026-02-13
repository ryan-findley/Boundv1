import { getKidProfile } from "@/app/actions/kids";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BlockedTopicsManager } from "@/components/kids/blocked-topics-manager";
import { TimeLimitManager } from "@/components/kids/time-limit-manager";
import { DeleteKidButton } from "@/components/kids/delete-kid-button";

export default async function KidProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let kid;
  try {
    kid = await getKidProfile(id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{kid.nickname}</h1>
          <p className="text-muted mt-1">
            Age {kid.age} &middot; Grade {kid.grade}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/kids/${kid.id}/edit`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors"
          >
            Edit profile
          </Link>
          <Link
            href={`/kid-mode/${kid.id}`}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            Start Kid Mode
          </Link>
        </div>
      </div>

      {/* Blocked Topics Section */}
      <div className="rounded-xl border border-border p-6 space-y-4">
        <h2 className="font-semibold">Blocked Topics</h2>
        <p className="text-sm text-muted">
          Add topics you want to block for this child. These will be checked before any AI response.
        </p>
        <BlockedTopicsManager
          kidProfileId={kid.id}
          initialTopics={kid.settings?.blockedTopics ?? []}
        />
      </div>

      {/* Time Limit Section */}
      <div className="rounded-xl border border-border p-6 space-y-4">
        <h2 className="font-semibold">Daily Time Limit</h2>
        <p className="text-sm text-muted">
          Optionally set a daily time limit for Kid Mode sessions.
        </p>
        <TimeLimitManager
          kidProfileId={kid.id}
          initialMinutes={kid.settings?.dailyTimeLimitMinutes ?? null}
        />
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-danger/30 p-6 space-y-4">
        <h2 className="font-semibold text-danger">Danger Zone</h2>
        <p className="text-sm text-muted">
          Deleting this profile will permanently remove all associated data including chat history, sessions, and usage logs.
        </p>
        <DeleteKidButton kidProfileId={kid.id} nickname={kid.nickname} />
      </div>
    </div>
  );
}
