"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { TERMS_VERSION } from "@/lib/constants";
import { redirect } from "next/navigation";

export async function getOrCreateParentProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  let parent = await prisma.parentUser.findUnique({
    where: { supabaseUserId: user.id },
  });

  if (!parent) {
    parent = await prisma.parentUser.create({
      data: {
        supabaseUserId: user.id,
        email: user.email!,
      },
    });
  }

  return parent;
}

export async function acceptTerms() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parent = await prisma.parentUser.findUnique({
    where: { supabaseUserId: user.id },
  });

  if (!parent) {
    // Create parent profile if it doesn't exist
    await prisma.parentUser.create({
      data: {
        supabaseUserId: user.id,
        email: user.email!,
        termsAcceptedAt: new Date(),
        termsVersion: TERMS_VERSION,
      },
    });
  } else {
    await prisma.parentUser.update({
      where: { id: parent.id },
      data: {
        termsAcceptedAt: new Date(),
        termsVersion: TERMS_VERSION,
      },
    });
  }

  redirect("/dashboard");
}

export async function getParentProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return prisma.parentUser.findUnique({
    where: { supabaseUserId: user.id },
    include: {
      kidProfiles: {
        include: { settings: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
