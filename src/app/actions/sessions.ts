"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { HEARTBEAT_INTERVAL_SECONDS } from "@/lib/constants";

async function getAuthenticatedParent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return prisma.parentUser.findUnique({
    where: { supabaseUserId: user.id },
  });
}

/**
 * Check if the current time falls within quiet hours.
 * Handles overnight ranges (e.g. 21:00 -> 07:00).
 */
function isQuietHours(quietStart: string | null, quietEnd: string | null): boolean {
  if (!quietStart || !quietEnd) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = quietStart.split(":").map(Number);
  const [endH, endM] = quietEnd.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    // Same day range (e.g. 08:00 -> 12:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
  // Overnight range (e.g. 21:00 -> 07:00)
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

export async function startKidSession(kidProfileId: string) {
  const parent = await getAuthenticatedParent();
  if (!parent) redirect("/login");

  // Verify ownership
  const kid = await prisma.kidProfile.findUnique({
    where: { id: kidProfileId },
    include: { settings: true },
  });
  if (!kid || kid.parentUserId !== parent.id) {
    throw new Error("Not found");
  }

  // Check quiet hours
  if (kid.settings && isQuietHours(kid.settings.quietHoursStart, kid.settings.quietHoursEnd)) {
    throw new Error(
      `Sessions are not available during quiet hours (${kid.settings.quietHoursStart} - ${kid.settings.quietHoursEnd})`
    );
  }

  // End any existing active session for this kid
  await prisma.kidSession.updateMany({
    where: {
      kidProfileId,
      endedAt: null,
      revokedAt: null,
    },
    data: { endedAt: new Date() },
  });

  // Create new session
  const session = await prisma.kidSession.create({
    data: {
      kidProfileId,
      parentUserId: parent.id,
    },
  });

  // Log session start
  await prisma.auditLog.create({
    data: {
      parentUserId: parent.id,
      kidProfileId,
      action: "kid_session_started",
      metadata: { sessionId: session.id },
    },
  });

  return session;
}

export async function endKidSession(sessionId: string) {
  const parent = await getAuthenticatedParent();
  if (!parent) redirect("/login");

  const session = await prisma.kidSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.parentUserId !== parent.id) {
    throw new Error("Not found");
  }

  await prisma.kidSession.update({
    where: { id: sessionId },
    data: { endedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      parentUserId: parent.id,
      kidProfileId: session.kidProfileId,
      action: "kid_session_ended",
      metadata: { sessionId },
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function getActiveSession(kidProfileId: string) {
  const parent = await getAuthenticatedParent();
  if (!parent) return null;

  // Verify ownership
  const kid = await prisma.kidProfile.findUnique({
    where: { id: kidProfileId },
  });
  if (!kid || kid.parentUserId !== parent.id) return null;

  return prisma.kidSession.findFirst({
    where: {
      kidProfileId,
      endedAt: null,
      revokedAt: null,
    },
    orderBy: { startedAt: "desc" },
  });
}

export async function heartbeat(sessionId: string) {
  const parent = await getAuthenticatedParent();
  if (!parent) return { error: "unauthorized" };

  const session = await prisma.kidSession.findUnique({
    where: { id: sessionId },
    include: {
      kidProfile: {
        include: { settings: true },
      },
    },
  });

  if (!session || session.parentUserId !== parent.id) {
    return { error: "invalid_session" };
  }

  if (session.endedAt || session.revokedAt) {
    return { error: "session_ended" };
  }

  // Update last seen
  await prisma.kidSession.update({
    where: { id: sessionId },
    data: { lastSeenAt: new Date() },
  });

  // Upsert daily usage
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await prisma.kidDailyUsage.upsert({
    where: {
      kidProfileId_date: {
        kidProfileId: session.kidProfileId,
        date: today,
      },
    },
    create: {
      kidProfileId: session.kidProfileId,
      date: today,
      activeSeconds: HEARTBEAT_INTERVAL_SECONDS,
      lastHeartbeatAt: new Date(),
    },
    update: {
      activeSeconds: { increment: HEARTBEAT_INTERVAL_SECONDS },
      lastHeartbeatAt: new Date(),
    },
  });

  // Check time limit (with weekend adjustment)
  const settings = session.kidProfile.settings;
  let limit = settings?.dailyTimeLimitMinutes ?? null;

  if (limit !== null && isWeekend() && settings?.weekendTimeLimitAdjustment) {
    limit = limit + settings.weekendTimeLimitAdjustment;
  }

  const usedMinutes = Math.floor(usage.activeSeconds / 60);

  return {
    ok: true,
    activeSeconds: usage.activeSeconds,
    limitMinutes: limit,
    usedMinutes,
    exceeded: limit !== null && limit !== undefined ? usedMinutes >= limit : false,
    warningMinutes: limit !== null && limit !== undefined ? limit - usedMinutes : null,
  };
}

export async function getDailyUsage(kidProfileId: string) {
  const parent = await getAuthenticatedParent();
  if (!parent) return null;

  const kid = await prisma.kidProfile.findUnique({
    where: { id: kidProfileId },
    include: { settings: true },
  });
  if (!kid || kid.parentUserId !== parent.id) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await prisma.kidDailyUsage.findUnique({
    where: {
      kidProfileId_date: {
        kidProfileId,
        date: today,
      },
    },
  });

  return {
    activeSeconds: usage?.activeSeconds ?? 0,
    limitMinutes: kid.settings?.dailyTimeLimitMinutes ?? null,
  };
}
