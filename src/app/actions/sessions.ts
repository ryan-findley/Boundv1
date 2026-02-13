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

export async function startKidSession(kidProfileId: string) {
  const parent = await getAuthenticatedParent();
  if (!parent) redirect("/login");

  // Verify ownership
  const kid = await prisma.kidProfile.findUnique({
    where: { id: kidProfileId },
  });
  if (!kid || kid.parentUserId !== parent.id) {
    throw new Error("Not found");
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

  // Check time limit
  const limit = session.kidProfile.settings?.dailyTimeLimitMinutes;
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
