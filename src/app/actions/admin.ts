"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function getAuthenticatedAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const parent = await prisma.parentUser.findUnique({
    where: { supabaseUserId: user.id },
  });

  if (!parent || parent.role !== "admin") return null;

  return parent;
}

export async function getKpiData(startDate: string, endDate: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Calculate prior period (same duration immediately preceding)
  const durationMs = end.getTime() - start.getTime();
  const priorEnd = new Date(start.getTime() - 1);
  const priorStart = new Date(priorEnd.getTime() - durationMs);

  // Current period KPIs
  const [
    parentAccounts,
    kidProfiles,
    kidPrompts,
    flaggedPrompts,
    activeProfiles,
  ] = await Promise.all([
    prisma.parentUser.count({
      where: { createdAt: { gte: start, lte: end } },
    }),
    prisma.kidProfile.count({
      where: { createdAt: { gte: start, lte: end } },
    }),
    prisma.chatMessage.count({
      where: { role: "kid", createdAt: { gte: start, lte: end } },
    }),
    prisma.chatMessage.count({
      where: { role: "kid", safetyDecision: "BLOCK", createdAt: { gte: start, lte: end } },
    }),
    prisma.kidDailyUsage.groupBy({
      by: ["kidProfileId"],
      where: { date: { gte: start, lte: end }, activeSeconds: { gt: 0 } },
    }).then((groups) => groups.length),
  ]);

  // Prior period KPIs
  const [
    priorParentAccounts,
    priorKidProfiles,
    priorKidPrompts,
    priorFlaggedPrompts,
    priorActiveProfiles,
  ] = await Promise.all([
    prisma.parentUser.count({
      where: { createdAt: { gte: priorStart, lte: priorEnd } },
    }),
    prisma.kidProfile.count({
      where: { createdAt: { gte: priorStart, lte: priorEnd } },
    }),
    prisma.chatMessage.count({
      where: { role: "kid", createdAt: { gte: priorStart, lte: priorEnd } },
    }),
    prisma.chatMessage.count({
      where: { role: "kid", safetyDecision: "BLOCK", createdAt: { gte: priorStart, lte: priorEnd } },
    }),
    prisma.kidDailyUsage.groupBy({
      by: ["kidProfileId"],
      where: { date: { gte: priorStart, lte: priorEnd }, activeSeconds: { gt: 0 } },
    }).then((groups) => groups.length),
  ]);

  function pctChange(current: number, prior: number): number | null {
    if (prior === 0) return current > 0 ? 100 : null;
    return Math.round(((current - prior) / prior) * 100);
  }

  return {
    period: { start: startDate, end: endDate },
    kpis: [
      {
        label: "Parent Accounts",
        current: parentAccounts,
        prior: priorParentAccounts,
        change: pctChange(parentAccounts, priorParentAccounts),
      },
      {
        label: "Kid Profiles",
        current: kidProfiles,
        prior: priorKidProfiles,
        change: pctChange(kidProfiles, priorKidProfiles),
      },
      {
        label: "Kid Prompts",
        current: kidPrompts,
        prior: priorKidPrompts,
        change: pctChange(kidPrompts, priorKidPrompts),
      },
      {
        label: "Flagged Prompts",
        current: flaggedPrompts,
        prior: priorFlaggedPrompts,
        change: pctChange(flaggedPrompts, priorFlaggedPrompts),
      },
      {
        label: "Active Profiles",
        current: activeProfiles,
        prior: priorActiveProfiles,
        change: pctChange(activeProfiles, priorActiveProfiles),
      },
    ],
  };
}

export async function getTimeSeriesData(startDate: string, endDate: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Get daily prompt counts
  const messages = await prisma.chatMessage.findMany({
    where: { role: "kid", createdAt: { gte: start, lte: end } },
    select: { createdAt: true, safetyDecision: true },
  });

  const dailyCounts: Record<string, { prompts: number; flagged: number }> = {};

  messages.forEach((msg) => {
    const day = msg.createdAt.toISOString().split("T")[0];
    if (!dailyCounts[day]) dailyCounts[day] = { prompts: 0, flagged: 0 };
    dailyCounts[day].prompts++;
    if (msg.safetyDecision === "BLOCK") dailyCounts[day].flagged++;
  });

  // Sort by date
  const sorted = Object.entries(dailyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));

  return sorted;
}

// Totals (cumulative, not period-scoped)
export async function getTotalCounts() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const [parents, kids, messages, flagged] = await Promise.all([
    prisma.parentUser.count(),
    prisma.kidProfile.count(),
    prisma.chatMessage.count({ where: { role: "kid" } }),
    prisma.chatMessage.count({ where: { role: "kid", safetyDecision: "BLOCK" } }),
  ]);

  return { parents, kids, messages, flagged };
}
