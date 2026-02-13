import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get or create parent profile
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

  // Check if terms are accepted; if not, redirect to onboarding
  // (except if already on onboarding page)
  if (!parent.termsAcceptedAt) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen">
      <Header email={parent.email} role={parent.role} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
