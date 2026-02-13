import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getTotalCounts } from "@/app/actions/admin";

export default async function AdminPage() {
  const totals = await getTotalCounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted mt-1">Platform analytics and content management.</p>
      </div>

      {/* Total Counts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-muted">Total Parents</p>
          <p className="text-3xl font-bold">{totals.parents}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-muted">Total Kids</p>
          <p className="text-3xl font-bold">{totals.kids}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-muted">Total Prompts</p>
          <p className="text-3xl font-bold">{totals.messages}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-muted">Flagged Prompts</p>
          <p className="text-3xl font-bold text-danger">{totals.flagged}</p>
        </div>
      </div>

      <AdminDashboard />
    </div>
  );
}
