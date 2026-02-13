import { getKidProfile } from "@/app/actions/kids";
import { notFound } from "next/navigation";
import { KidProfileEditForm } from "@/components/kids/kid-profile-edit-form";

export default async function EditKidPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let kid;
  try {
    kid = await getKidProfile(id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit {kid.nickname}&apos;s Profile</h1>
        <p className="text-muted mt-1">Update your child&apos;s basic information.</p>
      </div>

      <KidProfileEditForm kid={kid} />
    </div>
  );
}
