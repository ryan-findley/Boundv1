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

export async function getTranscript(
  kidProfileId: string,
  startDate?: string,
  endDate?: string,
  flaggedOnly?: boolean
) {
  await verifyKidOwnership(kidProfileId);

  const dateFilter: Record<string, Date> = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }

  const threads = await prisma.chatThread.findMany({
    where: { kidProfileId },
    select: { id: true },
  });

  if (threads.length === 0) return [];

  const threadIds = threads.map((t) => t.id);

  interface WhereClause {
    threadId: { in: string[] };
    createdAt?: Record<string, Date>;
    flaggedAt?: { not: null };
  }

  const where: WhereClause = { threadId: { in: threadIds } };

  if (Object.keys(dateFilter).length > 0) {
    where.createdAt = dateFilter;
  }

  if (flaggedOnly) {
    where.flaggedAt = { not: null };
  }

  const messages = await prisma.chatMessage.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });

  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    safetyDecision: m.safetyDecision,
    safetyReason: m.safetyReason,
    matchedTopics: m.matchedTopics,
    flaggedAt: m.flaggedAt?.toISOString() ?? null,
  }));
}

export async function getDailyUsageSummary(
  kidProfileId: string,
  startDate?: string,
  endDate?: string
) {
  const { kid } = await verifyKidOwnership(kidProfileId);

  const dateFilter: Record<string, Date> = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }

  interface WhereClause {
    kidProfileId: string;
    date?: Record<string, Date>;
  }

  const where: WhereClause = { kidProfileId };
  if (Object.keys(dateFilter).length > 0) {
    where.date = dateFilter;
  }

  const usageRows = await prisma.kidDailyUsage.findMany({
    where,
    orderBy: { date: "asc" },
  });

  const totalSeconds = usageRows.reduce((sum, row) => sum + row.activeSeconds, 0);

  return {
    days: usageRows.map((row) => ({
      date: row.date.toISOString().split("T")[0],
      activeSeconds: row.activeSeconds,
      activeMinutes: Math.floor(row.activeSeconds / 60),
    })),
    totalSeconds,
    totalMinutes: Math.floor(totalSeconds / 60),
    dailyLimitMinutes: kid.settings?.dailyTimeLimitMinutes ?? null,
  };
}
