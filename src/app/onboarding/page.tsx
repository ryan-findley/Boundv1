import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if parent already completed onboarding
  const parent = await prisma.parentUser.findUnique({
    where: { supabaseUserId: user.id },
  });

  if (parent?.termsAcceptedAt) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Bound</h1>
          <p className="mt-2 text-muted">
            One last step before you get started
          </p>
        </div>

        <OnboardingForm />
      </div>
    </div>
  );
}
