import { getParentProfile } from "@/app/actions/auth";
import { getControlSettings } from "@/app/actions/controls";
import { redirect } from "next/navigation";
import { ControlsClient } from "@/components/controls/controls-client";

export default async function ControlsPage({
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
        <h1 className="text-2xl font-bold">Controls</h1>
        <p className="text-sm text-muted">Add a child profile first to manage controls.</p>
      </div>
    );
  }

  const selectedKidId = kidParam && kids.some((k) => k.id === kidParam)
    ? kidParam
    : kids[0].id;

  if (!kidParam || !kids.some((k) => k.id === kidParam)) {
    redirect(`/controls?kid=${selectedKidId}`);
  }

  const selectedKid = kids.find((k) => k.id === selectedKidId)!;
  const settings = await getControlSettings(selectedKidId);

  return (
    <ControlsClient
      kidProfileId={selectedKidId}
      kidNickname={selectedKid.nickname}
      settings={settings}
    />
  );
}
