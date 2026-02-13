import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { KidModeClient } from "@/components/kid-mode/kid-mode-client";

export default async function KidModePage({ params }: { params: Promise<{ kidId: string }> }) {
  const { kidId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parent = await prisma.parentUser.findUnique({
    where: { supabaseUserId: user.id },
  });
  if (!parent) redirect("/login");

  const kid = await prisma.kidProfile.findUnique({
    where: { id: kidId },
    include: { settings: true },
  });

  if (!kid || kid.parentUserId !== parent.id) {
    notFound();
  }

  // Get or create active session
  let session = await prisma.kidSession.findFirst({
    where: {
      kidProfileId: kidId,
      endedAt: null,
      revokedAt: null,
    },
    orderBy: { startedAt: "desc" },
  });

  if (!session) {
    // End any stale sessions
    await prisma.kidSession.updateMany({
      where: { kidProfileId: kidId, endedAt: null, revokedAt: null },
      data: { endedAt: new Date() },
    });

    session = await prisma.kidSession.create({
      data: {
        kidProfileId: kidId,
        parentUserId: parent.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        parentUserId: parent.id,
        kidProfileId: kidId,
        action: "kid_session_started",
        metadata: { sessionId: session.id },
      },
    });
  }

  // Get today's usage
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const usage = await prisma.kidDailyUsage.findUnique({
    where: { kidProfileId_date: { kidProfileId: kidId, date: today } },
  });

  return (
    <KidModeClient
      kidName={kid.nickname}
      kidAge={kid.age}
      kidGrade={kid.grade}
      kidProfileId={kid.id}
      sessionId={session.id}
      timeLimitMinutes={kid.settings?.dailyTimeLimitMinutes ?? null}
      initialUsedSeconds={usage?.activeSeconds ?? 0}
    />
  );
}
