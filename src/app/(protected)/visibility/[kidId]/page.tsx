import { redirect } from "next/navigation";

// Redirect old visibility route to new conversations page
export default async function VisibilityPage({ params }: { params: Promise<{ kidId: string }> }) {
  const { kidId } = await params;
  redirect(`/conversations?kid=${kidId}`);
}
