"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function getAuthenticatedParent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return prisma.parentUser.findUnique({
    where: { supabaseUserId: user.id },
  });
}

async function verifyKidOwnership(kidProfileId: string) {
  const parent = await getAuthenticatedParent();
  if (!parent) throw new Error("Unauthorized");

  const kid = await prisma.kidProfile.findUnique({
    where: { id: kidProfileId },
    include: { settings: true },
  });

  if (!kid || kid.parentUserId !== parent.id) {
    throw new Error("Not found");
  }

  return { parent, kid };
}

export async function getWeeklyUsageSummary(kidProfileId: string) {
  const { kid } = await verifyKidOwnership(kidProfileId);

  // Get last 7 days of usage
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [usageRows, sessionCount] = await Promise.all([
    prisma.kidDailyUsage.findMany({
      where: {
        kidProfileId,
        date: { gte: sevenDaysAgo, lte: today },
      },
      orderBy: { date: "asc" },
    }),
    prisma.kidSession.count({
      where: {
        kidProfileId,
        startedAt: { gte: sevenDaysAgo },
      },
    }),
  ]);

  // Build a full 7-day array including days with no usage
  const days: { date: string; dayLabel: string; activeMinutes: number }[] = [];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const usage = usageRows.find(
      (r) => r.date.toISOString().split("T")[0] === dateStr
    );
    days.push({
      date: dateStr,
      dayLabel: dayLabels[d.getDay()],
      activeMinutes: usage ? Math.floor(usage.activeSeconds / 60) : 0,
    });
  }

  const totalMinutes = days.reduce((sum, d) => sum + d.activeMinutes, 0);

  // Today's usage
  const todayUsage = usageRows.find(
    (r) => r.date.toISOString().split("T")[0] === today.toISOString().split("T")[0]
  );
  const todayMinutes = todayUsage ? Math.floor(todayUsage.activeSeconds / 60) : 0;

  return {
    days,
    totalMinutes,
    sessionCount,
    todayMinutes,
    dailyLimitMinutes: kid.settings?.dailyTimeLimitMinutes ?? null,
  };
}

export async function getRecentActivity(kidProfileId: string, limit: number = 5) {
  await verifyKidOwnership(kidProfileId);

  const entries = await prisma.auditLog.findMany({
    where: { kidProfileId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      parent: { select: { email: true } },
    },
  });

  return entries.map((e) => ({
    id: e.id,
    action: e.action,
    metadata: e.metadata as Record<string, unknown> | null,
    createdAt: e.createdAt.toISOString(),
    actor: e.parentUserId ? (e.parent?.email ?? "Parent") : "System",
  }));
}

export async function getLastActiveTime(kidProfileId: string) {
  await verifyKidOwnership(kidProfileId);

  const lastSession = await prisma.kidSession.findFirst({
    where: { kidProfileId },
    orderBy: { lastSeenAt: "desc" },
  });

  return lastSession?.lastSeenAt.toISOString() ?? null;
}
