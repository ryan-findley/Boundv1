import { getParentProfile } from "@/app/actions/auth";
import { getWeeklyUsageSummary, getRecentActivity, getLastActiveTime } from "@/app/actions/dashboard";
import { getAlerts } from "@/app/actions/alerts";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ kid?: string }>;
}) {
  const parent = await getParentProfile();
  if (!parent) redirect("/login");

  const kids = parent.kidProfiles;

  // No kids yet — show onboarding
  if (kids.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted mt-1">
            Welcome back. Manage your children&apos;s AI experience.
          </p>
        </div>
        <div className="rounded-xl border border-border p-12 text-center">
          <div className="mx-auto max-w-sm space-y-4">
            <div className="text-4xl">👋</div>
            <h2 className="text-xl font-semibold">Add your first child</h2>
            <p className="text-muted text-sm">
              Create a kid profile to get started. You&apos;ll be able to set
              safety controls, time limits, and monitor their AI conversations.
            </p>
            <Link
              href="/kids/new"
              className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Add a child profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Resolve selected kid from URL param
  const { kid: kidParam } = await searchParams;
  const selectedKidId = kidParam && kids.some((k) => k.id === kidParam)
    ? kidParam
    : kids[0].id;

  // If no kid param in URL, redirect to add it
  if (!kidParam || !kids.some((k) => k.id === kidParam)) {
    redirect(`/dashboard?kid=${selectedKidId}`);
  }

  const selectedKid = kids.find((k) => k.id === selectedKidId)!;

  // Fetch dashboard data in parallel
  const [weeklyUsage, alerts, recentActivity, lastActiveTime] = await Promise.all([
    getWeeklyUsageSummary(selectedKidId),
    getAlerts(selectedKidId, { limit: 5 }),
    getRecentActivity(selectedKidId, 5),
    getLastActiveTime(selectedKidId),
  ]);

  return (
    <DashboardClient
      kidId={selectedKidId}
      kidNickname={selectedKid.nickname}
      lastActiveTime={lastActiveTime}
      weeklyUsage={weeklyUsage}
      alerts={alerts}
      recentActivity={recentActivity}
    />
  );
}
