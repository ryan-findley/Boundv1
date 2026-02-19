import { getParentProfile } from "@/app/actions/auth";
import { getThreadList } from "@/app/actions/visibility";
import { redirect } from "next/navigation";
import { ConversationsClient } from "@/components/conversations/conversations-client";

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ kid?: string }>;
}) {
  const parent = await getParentProfile();
  if (!parent) redirect("/login");

  const { kid: kidParam } = await searchParams;
  const kids = parent.kidProfiles;

  if (kids.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Conversations</h1>
        <p className="text-sm text-muted">Add a child profile first to view conversations.</p>
      </div>
    );
  }

  const selectedKidId = kidParam && kids.some((k) => k.id === kidParam)
    ? kidParam
    : kids[0].id;

  if (!kidParam || !kids.some((k) => k.id === kidParam)) {
    redirect(`/conversations?kid=${selectedKidId}`);
  }

  const selectedKid = kids.find((k) => k.id === selectedKidId)!;
  const threads = await getThreadList(selectedKidId);

  return (
    <ConversationsClient
      kidId={selectedKidId}
      kidNickname={selectedKid.nickname}
      initialThreads={threads}
    />
  );
}
