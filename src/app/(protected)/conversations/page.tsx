import { redirect } from "next/navigation";

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ kid?: string }>;
}) {
  const { kid } = await searchParams;

  // Stub: redirect to existing visibility page until Conversations is built
  if (kid) {
    redirect(`/visibility/${kid}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Conversations</h1>
      <p className="text-sm text-muted">Select a child to view conversation logs.</p>
    </div>
  );
}
