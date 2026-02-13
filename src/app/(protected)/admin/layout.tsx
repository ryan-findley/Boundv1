import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parent = await prisma.parentUser.findUnique({
    where: { supabaseUserId: user.id },
  });

  if (!parent || parent.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
