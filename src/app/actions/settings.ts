"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function exportUserData() {
  const parent = await getAuthenticatedParent();
  if (!parent) throw new Error("Unauthorized");

  const kids = await prisma.kidProfile.findMany({
    where: { parentUserId: parent.id },
    include: {
      settings: true,
      threads: {
        include: { messages: true },
      },
      sessions: true,
      dailyUsage: true,
      auditLogs: true,
      contentSensitivityRules: true,
      alertEvents: true,
    },
  });

  const data = {
    exportedAt: new Date().toISOString(),
    parent: {
      email: parent.email,
      role: parent.role,
      createdAt: parent.createdAt.toISOString(),
    },
    children: kids.map((kid) => ({
      nickname: kid.nickname,
      age: kid.age,
      grade: kid.grade,
      createdAt: kid.createdAt.toISOString(),
      settings: kid.settings,
      conversations: kid.threads.map((t) => ({
        title: t.title,
        createdAt: t.createdAt.toISOString(),
        messages: t.messages.map((m) => ({
          role: m.role,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
      })),
      sessions: kid.sessions.map((s) => ({
        startedAt: s.startedAt.toISOString(),
        endedAt: s.endedAt?.toISOString() ?? null,
      })),
      dailyUsage: kid.dailyUsage.map((u) => ({
        date: u.date.toISOString().split("T")[0],
        activeSeconds: u.activeSeconds,
      })),
      alerts: kid.alertEvents.map((a) => ({
        alertLevel: a.alertLevel,
        category: a.category,
        summary: a.summary,
        createdAt: a.createdAt.toISOString(),
      })),
    })),
  };

  return JSON.stringify(data, null, 2);
}

export async function deleteConversationHistory(kidProfileId: string) {
  const { parent } = await verifyKidOwnership(kidProfileId);

  // Delete all threads (messages cascade via onDelete: Cascade)
  await prisma.chatThread.deleteMany({
    where: { kidProfileId },
  });

  await prisma.auditLog.create({
    data: {
      parentUserId: parent.id,
      kidProfileId,
      action: "conversation_history_deleted",
    },
  });

  revalidatePath("/conversations");
  revalidatePath("/dashboard");
}

export async function deleteAccount() {
  const parent = await getAuthenticatedParent();
  if (!parent) throw new Error("Unauthorized");

  // Delete all kid profiles (cascades to settings, threads, messages, sessions, etc.)
  await prisma.kidProfile.deleteMany({
    where: { parentUserId: parent.id },
  });

  // Delete notification preferences
  await prisma.notificationPreference.deleteMany({
    where: { parentUserId: parent.id },
  });

  // Delete audit logs
  await prisma.auditLog.deleteMany({
    where: { parentUserId: parent.id },
  });

  // Delete parent user
  await prisma.parentUser.delete({
    where: { id: parent.id },
  });

  // Sign out from Supabase
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}
