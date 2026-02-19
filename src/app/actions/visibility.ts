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

export async function getThreadList(
  kidProfileId: string,
  filters?: {
    search?: string;
    flagFilter?: "all" | "red" | "yellow" | "flagged";
    dateStart?: string;
    dateEnd?: string;
  }
) {
  await verifyKidOwnership(kidProfileId);

  const threads = await prisma.chatThread.findMany({
    where: { kidProfileId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
          flaggedAt: true,
        },
      },
    },
  });

  let results = threads.map((thread) => {
    const msgs = thread.messages;
    const firstMsg = msgs[0];
    const lastMsg = msgs[msgs.length - 1];
    const kidMessages = msgs.filter((m) => m.role === "kid");
    const flaggedMessages = msgs.filter((m) => m.flaggedAt !== null);

    const title =
      thread.title ??
      (kidMessages[0]?.content.slice(0, 50) || "Untitled conversation");

    const durationMs =
      firstMsg && lastMsg
        ? lastMsg.createdAt.getTime() - firstMsg.createdAt.getTime()
        : 0;
    const durationMinutes = Math.max(1, Math.round(durationMs / 60000));

    let flagLevel: "red" | "yellow" | null = null;
    if (flaggedMessages.length > 0) flagLevel = "red";

    return {
      id: thread.id,
      title,
      messageCount: msgs.length,
      durationMinutes,
      flagLevel,
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString(),
      lastMessageAt: lastMsg?.createdAt.toISOString() ?? thread.updatedAt.toISOString(),
    };
  });

  // Apply filters
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter((r) => r.title.toLowerCase().includes(q));
  }

  if (filters?.flagFilter && filters.flagFilter !== "all") {
    if (filters.flagFilter === "flagged") {
      results = results.filter((r) => r.flagLevel !== null);
    } else {
      results = results.filter((r) => r.flagLevel === filters.flagFilter);
    }
  }

  if (filters?.dateStart) {
    const start = new Date(filters.dateStart);
    results = results.filter((r) => new Date(r.lastMessageAt) >= start);
  }
  if (filters?.dateEnd) {
    const end = new Date(filters.dateEnd);
    end.setHours(23, 59, 59, 999);
    results = results.filter((r) => new Date(r.createdAt) <= end);
  }

  // Save auto-generated titles for threads that don't have one
  const titlesToUpdate = threads.filter((t) => !t.title);
  if (titlesToUpdate.length > 0) {
    await Promise.all(
      titlesToUpdate.map((t) => {
        const kidMsg = t.messages.find((m) => m.role === "kid");
        const title = kidMsg?.content.slice(0, 50) || "Untitled conversation";
        return prisma.chatThread.update({
          where: { id: t.id },
          data: { title },
        });
      })
    );
  }

  return results;
}

export async function getThreadTranscript(
  kidProfileId: string,
  threadId: string
) {
  await verifyKidOwnership(kidProfileId);

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
  });
  if (!thread || thread.kidProfileId !== kidProfileId) {
    throw new Error("Not found");
  }

  const messages = await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
  });

  return {
    threadId: thread.id,
    title: thread.title,
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      safetyDecision: m.safetyDecision,
      matchedTopics: m.matchedTopics,
      flaggedAt: m.flaggedAt?.toISOString() ?? null,
    })),
  };
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
