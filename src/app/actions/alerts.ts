"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function getAlerts(
  kidProfileId: string,
  options?: { limit?: number; level?: "red" | "yellow" }
) {
  await verifyKidOwnership(kidProfileId);

  const limit = options?.limit ?? 10;

  const where: {
    kidProfileId: string;
    alertLevel?: string;
  } = { kidProfileId };

  if (options?.level) {
    where.alertLevel = options.level;
  }

  const alerts = await prisma.alertEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      chatMessage: {
        select: { id: true, content: true, threadId: true },
      },
    },
  });

  return alerts.map((a) => ({
    id: a.id,
    alertLevel: a.alertLevel,
    category: a.category,
    summary: a.summary,
    reviewedAt: a.reviewedAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    chatMessageId: a.chatMessageId,
    threadId: a.chatMessage?.threadId ?? null,
    messageContent: a.chatMessage?.content ?? null,
  }));
}

export async function markAlertReviewed(alertId: string) {
  const parent = await getAuthenticatedParent();
  if (!parent) throw new Error("Unauthorized");

  const alert = await prisma.alertEvent.findUnique({
    where: { id: alertId },
    include: { kidProfile: true },
  });

  if (!alert || alert.kidProfile.parentUserId !== parent.id) {
    throw new Error("Not found");
  }

  await prisma.alertEvent.update({
    where: { id: alertId },
    data: {
      reviewedAt: new Date(),
      reviewedBy: parent.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      parentUserId: parent.id,
      kidProfileId: alert.kidProfileId,
      action: "alert_reviewed",
      metadata: { alertId, alertLevel: alert.alertLevel, category: alert.category },
    },
  });

  revalidatePath(`/dashboard`);
}

export async function getUnreviewedAlertCount(kidProfileId: string) {
  await verifyKidOwnership(kidProfileId);

  return prisma.alertEvent.count({
    where: {
      kidProfileId,
      reviewedAt: null,
    },
  });
}
