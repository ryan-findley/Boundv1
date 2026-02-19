"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { AUDIT_EVENT_LABELS } from "@/lib/constants";

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
  });

  if (!kid || kid.parentUserId !== parent.id) {
    throw new Error("Not found");
  }

  return { parent, kid };
}

export interface ActivityLogFilters {
  eventCategory?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  cursor?: string;
}

export async function getActivityLog(
  kidProfileId: string,
  filters: ActivityLogFilters = {}
) {
  await verifyKidOwnership(kidProfileId);

  const { eventCategory, dateFrom, dateTo, limit = 25, cursor } = filters;

  // Build where clause
  const where: Prisma.AuditLogWhereInput = { kidProfileId };

  // Filter by category -> find matching action keys
  if (eventCategory && eventCategory !== "all") {
    const matchingActions = Object.entries(AUDIT_EVENT_LABELS)
      .filter(([, v]) => v.category === eventCategory)
      .map(([k]) => k);
    if (matchingActions.length > 0) {
      where.action = { in: matchingActions };
    }
  }

  // Date range filter
  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      createdAt.lte = end;
    }
    where.createdAt = createdAt;
  }

  // Cursor-based pagination
  const entries = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" as const },
    take: limit + 1, // fetch one extra to detect hasMore
    include: {
      parent: { select: { email: true } },
    },
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = entries.length > limit;
  const items = hasMore ? entries.slice(0, limit) : entries;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return {
    items: items.map((e) => {
      const labelInfo = AUDIT_EVENT_LABELS[e.action];
      return {
        id: e.id,
        action: e.action,
        label: labelInfo?.label ?? e.action,
        category: labelInfo?.category ?? "other",
        metadata: e.metadata as Record<string, unknown> | null,
        createdAt: e.createdAt.toISOString(),
        actor: e.parentUserId ? (e.parent?.email ?? "Parent") : "System",
      };
    }),
    nextCursor,
    hasMore,
  };
}

export async function exportActivityLogCsv(
  kidProfileId: string,
  filters: Omit<ActivityLogFilters, "limit" | "cursor"> = {}
) {
  await verifyKidOwnership(kidProfileId);

  const { eventCategory, dateFrom, dateTo } = filters;

  const where: Prisma.AuditLogWhereInput = { kidProfileId };

  if (eventCategory && eventCategory !== "all") {
    const matchingActions = Object.entries(AUDIT_EVENT_LABELS)
      .filter(([, v]) => v.category === eventCategory)
      .map(([k]) => k);
    if (matchingActions.length > 0) {
      where.action = { in: matchingActions };
    }
  }

  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      createdAt.lte = end;
    }
    where.createdAt = createdAt;
  }

  const entries = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      parent: { select: { email: true } },
    },
    take: 5000, // cap CSV at 5000 rows
  });

  // Build CSV
  const header = "Timestamp,Event,Category,Details,Actor";
  const rows = entries.map((e) => {
    const labelInfo = AUDIT_EVENT_LABELS[e.action];
    const label = labelInfo?.label ?? e.action;
    const category = labelInfo?.category ?? "other";
    const details = e.metadata ? JSON.stringify(e.metadata).replace(/"/g, '""') : "";
    const actor = e.parentUserId ? (e.parent?.email ?? "Parent") : "System";
    const timestamp = e.createdAt.toISOString();
    return `"${timestamp}","${label}","${category}","${details}","${actor}"`;
  });

  return [header, ...rows].join("\n");
}
