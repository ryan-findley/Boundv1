import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getActivityLog } from "@/app/actions/activity-log";
import { ActivityLogClient } from "@/components/activity-log/activity-log-client";

export default async function ActivityLogPage({
  searchParams,
}: {
  searchParams: Promise<{ kid?: string }>;
}) {
  const { kid: kidId } = await searchParams;

  if (!kidId) {
    // Redirect to dashboard if no kid selected
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in");

    const parent = await prisma.parentUser.findUnique({
      where: { supabaseUserId: user.id },
      include: { kidProfiles: { orderBy: { createdAt: "asc" }, take: 1 } },
    });

    if (parent?.kidProfiles[0]) {
      redirect(`/activity-log?kid=${parent.kidProfiles[0].id}`);
    }
    redirect("/dashboard");
  }

  const { items, nextCursor, hasMore } = await getActivityLog(kidId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Activity Log</h1>
      <p className="text-sm text-slate-500">
        Complete audit trail of all actions and events.
      </p>
      <ActivityLogClient
        kidId={kidId}
        initialItems={items}
        initialNextCursor={nextCursor}
        initialHasMore={hasMore}
      />
    </div>
  );
}
