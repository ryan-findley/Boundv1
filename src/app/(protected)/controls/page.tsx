import { redirect } from "next/navigation";

export default async function ControlsPage({
  searchParams,
}: {
  searchParams: Promise<{ kid?: string }>;
}) {
  const { kid } = await searchParams;

  // Stub: redirect to existing kid settings page until Controls is built
  if (kid) {
    redirect(`/kids/${kid}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Controls</h1>
      <p className="text-sm text-muted">Select a child to manage controls.</p>
    </div>
  );
}
