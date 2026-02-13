"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Header({ email, role }: { email: string; role: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-lg">
            Bound
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-muted hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/kids" className="text-muted hover:text-foreground transition-colors">
              Kids
            </Link>
            {role === "admin" && (
              <Link href="/admin" className="text-muted hover:text-foreground transition-colors">
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted">{email}</span>
          <button
            onClick={handleSignOut}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
