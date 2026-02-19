import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const parent = await prisma.parentUser.findUnique({
    where: { supabaseUserId: user.id },
    include: {
      kidProfiles: {
        select: { id: true, nickname: true, age: true, grade: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!parent) redirect("/sign-in");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      <p className="text-sm text-slate-500">
        Manage your family account, child profiles, and privacy settings.
      </p>
      <SettingsClient email={parent.email} kids={parent.kidProfiles} />
    </div>
  );
}
