import { getKidProfiles } from "@/app/actions/kids";
import Link from "next/link";

export default async function KidsPage() {
  const kids = await getKidProfiles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kid Profiles</h1>
          <p className="text-muted mt-1">Manage your children&apos;s profiles and safety settings.</p>
        </div>
        <Link
          href="/kids/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          Add child
        </Link>
      </div>

      {kids.length === 0 ? (
        <div className="rounded-xl border border-border p-12 text-center">
          <div className="mx-auto max-w-sm space-y-4">
            <h2 className="text-xl font-semibold">No kid profiles yet</h2>
            <p className="text-muted text-sm">
              Create a kid profile to set up safety controls and start using Kid Mode.
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kids.map((kid) => (
            <Link
              key={kid.id}
              href={`/kids/${kid.id}`}
              className="block rounded-xl border border-border p-6 space-y-3 hover:border-primary/50 transition-colors"
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
                    <p>{kid.settings.blockedTopics.length} blocked topic(s)</p>
                  )}
                  {kid.settings.dailyTimeLimitMinutes ? (
                    <p>{kid.settings.dailyTimeLimitMinutes} min/day limit</p>
                  ) : (
                    <p>No time limit set</p>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
