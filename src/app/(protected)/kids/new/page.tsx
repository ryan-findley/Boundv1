import { KidProfileForm } from "@/components/kids/kid-profile-form";

export default function NewKidPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add a child profile</h1>
        <p className="text-muted mt-1">
          Create a profile for your child to start using Bound safely.
        </p>
      </div>

      <KidProfileForm />
    </div>
  );
}
