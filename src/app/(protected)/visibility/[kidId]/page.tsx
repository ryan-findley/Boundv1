import { getParentProfile } from "@/app/actions/auth";
import { redirect, notFound } from "next/navigation";
import { VisibilityClient } from "@/components/visibility/visibility-client";

export default async function VisibilityPage({ params }: { params: Promise<{ kidId: string }> }) {
  const { kidId } = await params;

  const parent = await getParentProfile();
  if (!parent) redirect("/login");

  const kid = parent.kidProfiles.find((k) => k.id === kidId);
  if (!kid) notFound();

  const kidList = parent.kidProfiles.map((k) => ({
    id: k.id,
    nickname: k.nickname,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity & Visibility</h1>
        <p className="text-muted mt-1">
          Review chat history and usage for your children.
        </p>
      </div>

      <VisibilityClient
        kidId={kidId}
        kidName={kid.nickname}
        kidList={kidList}
      />
    </div>
  );
}
