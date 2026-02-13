"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { KID_ATTESTATION_VERSION } from "@/lib/constants";
import { redirect } from "next/navigation";
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
    include: { settings: true },
  });

  if (!kid || kid.parentUserId !== parent.id) {
    throw new Error("Not found");
  }

  return { parent, kid };
}

export async function createKidProfile(formData: FormData) {
  const parent = await getAuthenticatedParent();
  if (!parent) redirect("/login");

  const nickname = formData.get("nickname") as string;
  const age = parseInt(formData.get("age") as string, 10);
  const grade = formData.get("grade") as string;
  const attestation = formData.get("attestation") === "true";

  if (!nickname || !age || !grade || !attestation) {
    throw new Error("All fields are required including attestation");
  }

  if (age < 3 || age > 17) {
    throw new Error("Age must be between 3 and 17");
  }

  const kid = await prisma.kidProfile.create({
    data: {
      parentUserId: parent.id,
      nickname: nickname.trim(),
      age,
      grade: grade.trim(),
      createdAttestationAt: new Date(),
      createdAttestationVersion: KID_ATTESTATION_VERSION,
      settings: {
        create: {
          blockedTopics: [],
          dailyTimeLimitMinutes: null,
        },
      },
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      parentUserId: parent.id,
      kidProfileId: kid.id,
      action: "kid_profile_created",
      metadata: { nickname, age, grade },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/kids");
  redirect("/kids");
}

export async function updateKidProfile(kidProfileId: string, formData: FormData) {
  const { parent } = await verifyKidOwnership(kidProfileId);

  const nickname = formData.get("nickname") as string;
  const age = parseInt(formData.get("age") as string, 10);
  const grade = formData.get("grade") as string;

  if (!nickname || !age || !grade) {
    throw new Error("All fields are required");
  }

  await prisma.kidProfile.update({
    where: { id: kidProfileId },
    data: {
      nickname: nickname.trim(),
      age,
      grade: grade.trim(),
    },
  });

  await prisma.auditLog.create({
    data: {
      parentUserId: parent.id,
      kidProfileId,
      action: "kid_profile_updated",
      metadata: { nickname, age, grade },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/kids");
  revalidatePath(`/kids/${kidProfileId}`);
  redirect(`/kids/${kidProfileId}`);
}

export async function updateBlockedTopics(kidProfileId: string, topics: string[]) {
  const { parent, kid } = await verifyKidOwnership(kidProfileId);

  if (!kid.settings) {
    await prisma.kidProfileSettings.create({
      data: {
        kidProfileId,
        blockedTopics: topics,
      },
    });
  } else {
    await prisma.kidProfileSettings.update({
      where: { kidProfileId },
      data: { blockedTopics: topics },
    });
  }

  await prisma.auditLog.create({
    data: {
      parentUserId: parent.id,
      kidProfileId,
      action: "blocked_topics_updated",
      metadata: { topics },
    },
  });

  revalidatePath(`/kids/${kidProfileId}`);
}

export async function updateTimeLimit(kidProfileId: string, minutes: number | null) {
  const { parent, kid } = await verifyKidOwnership(kidProfileId);

  if (!kid.settings) {
    await prisma.kidProfileSettings.create({
      data: {
        kidProfileId,
        blockedTopics: [],
        dailyTimeLimitMinutes: minutes,
      },
    });
  } else {
    await prisma.kidProfileSettings.update({
      where: { kidProfileId },
      data: { dailyTimeLimitMinutes: minutes },
    });
  }

  await prisma.auditLog.create({
    data: {
      parentUserId: parent.id,
      kidProfileId,
      action: "time_limit_updated",
      metadata: { dailyTimeLimitMinutes: minutes },
    },
  });

  revalidatePath(`/kids/${kidProfileId}`);
}

export async function deleteKidProfile(kidProfileId: string) {
  const { parent } = await verifyKidOwnership(kidProfileId);

  await prisma.auditLog.create({
    data: {
      parentUserId: parent.id,
      kidProfileId,
      action: "kid_profile_deleted",
    },
  });

  // Cascade delete handled by Prisma relations
  await prisma.kidProfile.delete({
    where: { id: kidProfileId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/kids");
  redirect("/kids");
}

export async function getKidProfile(kidProfileId: string) {
  const { kid } = await verifyKidOwnership(kidProfileId);
  return kid;
}

export async function getKidProfiles() {
  const parent = await getAuthenticatedParent();
  if (!parent) return [];

  return prisma.kidProfile.findMany({
    where: { parentUserId: parent.id },
    include: { settings: true },
    orderBy: { createdAt: "asc" },
  });
}
