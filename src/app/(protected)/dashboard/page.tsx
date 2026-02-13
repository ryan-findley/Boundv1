import { getParentProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const parent = await getParentProfile();

  if (!parent) {
    redirect("/login");
  }

  const kids = parent.kidProfiles;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted mt-1">
          Welcome back. Manage your children&apos;s AI experience.
        </p>
      </div>

      {kids.length === 0 ? (
        <div className="rounded-xl border border-border p-12 text-center">
          <div className="mx-auto max-w-sm space-y-4">
            <div className="text-4xl">👋</div>
            <h2 className="text-xl font-semibold">Add your first child</h2>
            <p className="text-muted text-sm">
              Create a kid profile to get started. You&apos;ll be able to set safety
              controls, time limits, and monitor their AI conversations.
            </p>
            <Link
              href="/kids/new"
              className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Add a child profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Kid Profiles</h2>
            <Link
              href="/kids/new"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Add child
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kids.map((kid) => (
              <div
                key={kid.id}
                className="rounded-xl border border-border p-6 space-y-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{kid.nickname}</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Age {kid.age}
                  </span>
                </div>
                <p className="text-sm text-muted">Grade: {kid.grade}</p>
                {kid.settings && (
                  <div className="text-xs text-muted space-y-1">
                    {kid.settings.blockedTopics.length > 0 && (
                      <p>{kid.settings.blockedTopics.length} blocked topics</p>
                    )}
                    {kid.settings.dailyTimeLimitMinutes && (
                      <p>{kid.settings.dailyTimeLimitMinutes} min/day limit</p>
                    )}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/kids/${kid.id}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View / Edit
                  </Link>
                  <span className="text-border">|</span>
                  <Link
                    href={`/kid-mode/${kid.id}`}
                    className="text-xs font-medium text-success hover:underline"
                  >
                    Start Kid Mode
                  </Link>
                  <span className="text-border">|</span>
                  <Link
                    href={`/visibility/${kid.id}`}
                    className="text-xs font-medium text-muted hover:underline"
                  >
                    Activity
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
