"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  timeLimitSettingsSchema,
  contentSensitivitySchema,
  customKeywordsSchema,
  notificationPreferencesSchema,
} from "@/lib/validations";
import { DEFAULT_SENSITIVITY_RULES, CONTENT_SENSITIVITY_CATEGORIES } from "@/lib/constants";

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

export async function getControlSettings(kidProfileId: string) {
  const { kid } = await verifyKidOwnership(kidProfileId);

  const [sensitivityRules, notificationPrefs] = await Promise.all([
    prisma.contentSensitivityRule.findMany({
      where: { kidProfileId },
    }),
    prisma.notificationPreference.findFirst({
      where: {
        parentUserId: kid.parentUserId,
        kidProfileId,
      },
    }),
  ]);

  return {
    timeLimit: {
      dailyTimeLimitMinutes: kid.settings?.dailyTimeLimitMinutes ?? null,
      quietHoursStart: kid.settings?.quietHoursStart ?? null,
      quietHoursEnd: kid.settings?.quietHoursEnd ?? null,
      weekendTimeLimitAdjustment: kid.settings?.weekendTimeLimitAdjustment ?? null,
    },
    sensitivityRules: sensitivityRules.map((r) => ({
      category: r.category,
      alertLevel: r.alertLevel,
    })),
    customKeywords: {
      alertKeywords: kid.settings?.alertKeywords ?? [],
      exceptionKeywords: kid.settings?.exceptionKeywords ?? [],
    },
    notifications: notificationPrefs
      ? {
          instantPush: notificationPrefs.instantPush,
          instantEmail: notificationPrefs.instantEmail,
          instantSms: notificationPrefs.instantSms,
          weeklyDigestEmail: notificationPrefs.weeklyDigestEmail,
          lessonCompletionNotify: notificationPrefs.lessonCompletionNotify,
          kidShareNotify: notificationPrefs.kidShareNotify,
        }
      : null,
  };
}

export async function updateTimeLimitSettings(
  kidProfileId: string,
  data: {
    dailyTimeLimitMinutes: number | null;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
    weekendTimeLimitAdjustment: number | null;
  }
) {
  const { parent, kid } = await verifyKidOwnership(kidProfileId);
  const parsed = timeLimitSettingsSchema.parse(data);

  if (!kid.settings) {
    await prisma.kidProfileSettings.create({
      data: {
        kidProfileId,
        blockedTopics: [],
        ...parsed,
      },
    });
  } else {
    await prisma.kidProfileSettings.update({
      where: { kidProfileId },
      data: parsed,
    });
  }

  await prisma.auditLog.create({
    data: {
      parentUserId: parent.id,
      kidProfileId,
      action: "time_limit_settings_updated",
      metadata: parsed as object,
    },
  });

  revalidatePath(`/controls`);
  revalidatePath(`/dashboard`);
}

export async function updateContentSensitivity(
  kidProfileId: string,
  rules: { category: string; alertLevel: string }[]
) {
  const { parent } = await verifyKidOwnership(kidProfileId);
  const parsed = contentSensitivitySchema.parse({ rules });

  // Upsert each rule
  await Promise.all(
    parsed.rules.map((rule) =>
      prisma.contentSensitivityRule.upsert({
        where: {
          kidProfileId_category: {
            kidProfileId,
            category: rule.category,
          },
        },
        update: { alertLevel: rule.alertLevel },
        create: {
          kidProfileId,
          category: rule.category,
          alertLevel: rule.alertLevel,
        },
      })
    )
  );

  await prisma.auditLog.create({
    data: {
      parentUserId: parent.id,
      kidProfileId,
      action: "content_sensitivity_updated",
      metadata: { rules: parsed.rules },
    },
  });

  revalidatePath(`/controls`);
}

export async function updateCustomKeywords(
  kidProfileId: string,
  data: { alertKeywords: string[]; exceptionKeywords: string[] }
) {
  const { parent, kid } = await verifyKidOwnership(kidProfileId);
  const parsed = customKeywordsSchema.parse(data);

  if (!kid.settings) {
    await prisma.kidProfileSettings.create({
      data: {
        kidProfileId,
        blockedTopics: [],
        ...parsed,
      },
    });
  } else {
    await prisma.kidProfileSettings.update({
      where: { kidProfileId },
      data: parsed,
    });
  }

  await prisma.auditLog.create({
    data: {
      parentUserId: parent.id,
      kidProfileId,
      action: "custom_keywords_updated",
      metadata: parsed as object,
    },
  });

  revalidatePath(`/controls`);
}

export async function updateNotificationPreferences(
  kidProfileId: string,
  data: {
    instantPush: boolean;
    instantEmail: boolean;
    instantSms: boolean;
    weeklyDigestEmail: boolean;
    lessonCompletionNotify: boolean;
    kidShareNotify: boolean;
  }
) {
  const { parent } = await verifyKidOwnership(kidProfileId);
  const parsed = notificationPreferencesSchema.parse(data);

  await prisma.notificationPreference.upsert({
    where: {
      parentUserId_kidProfileId: {
        parentUserId: parent.id,
        kidProfileId,
      },
    },
    update: parsed,
    create: {
      parentUserId: parent.id,
      kidProfileId,
      ...parsed,
    },
  });

  await prisma.auditLog.create({
    data: {
      parentUserId: parent.id,
      kidProfileId,
      action: "notification_preferences_updated",
      metadata: parsed as object,
    },
  });

  revalidatePath(`/controls`);
}

export async function extendTimeLimit(kidProfileId: string, additionalMinutes: number) {
  const { parent, kid } = await verifyKidOwnership(kidProfileId);

  if (additionalMinutes < 1 || additionalMinutes > 120) {
    throw new Error("Invalid time extension");
  }

  const currentLimit = kid.settings?.dailyTimeLimitMinutes;
  if (currentLimit === null || currentLimit === undefined) {
    // No limit set; nothing to extend
    return;
  }

  const newLimit = currentLimit + additionalMinutes;

  await prisma.kidProfileSettings.update({
    where: { kidProfileId },
    data: { dailyTimeLimitMinutes: newLimit },
  });

  await prisma.auditLog.create({
    data: {
      parentUserId: parent.id,
      kidProfileId,
      action: "time_extended",
      metadata: { additionalMinutes, previousLimit: currentLimit, newLimit },
    },
  });

  revalidatePath(`/dashboard`);
  revalidatePath(`/controls`);
}

export async function seedDefaultSensitivityRules(kidProfileId: string) {
  const rules = CONTENT_SENSITIVITY_CATEGORIES.map((cat) => ({
    kidProfileId,
    category: cat.id,
    alertLevel: DEFAULT_SENSITIVITY_RULES[cat.id],
  }));

  await prisma.contentSensitivityRule.createMany({
    data: rules,
    skipDuplicates: true,
  });
}
