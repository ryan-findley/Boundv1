"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSelectedKid } from "@/lib/hooks/use-selected-kid";

interface Kid {
  id: string;
  nickname: string;
  age: number;
}

interface ParentPortalNavProps {
  kids: Kid[];
  email: string;
  role: string;
}

const screens = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "conversations", label: "Conversations", href: "/conversations" },
  { id: "controls", label: "Controls", href: "/controls" },
  { id: "activity-log", label: "Activity Log", href: "/activity-log" },
  { id: "settings", label: "Settings", href: "/settings" },
];

function getInitials(email: string): string {
  const name = email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

export function ParentPortalNav({ kids, email, role }: ParentPortalNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedKidId, setSelectedKid } = useSelectedKid(kids);

  function buildHref(href: string) {
    if (selectedKidId) {
      return `${href}?kid=${selectedKidId}`;
    }
    return href;
  }

  function getActiveScreen() {
    for (const screen of screens) {
      if (pathname.startsWith(screen.href)) return screen.id;
    }
    return "dashboard";
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const activeScreen = getActiveScreen();

  return (
    <div className="bg-slate-800 text-white px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-xl tracking-tight">
            BOUND
          </Link>
          <span className="text-slate-400 text-sm">Parent Portal</span>
        </div>

        <nav className="flex items-center gap-1">
          {screens.map((screen) => (
            <Link
              key={screen.id}
              href={buildHref(screen.href)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                activeScreen === screen.id
                  ? "bg-white text-slate-800 font-medium"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {screen.label}
            </Link>
          ))}
          {role === "admin" && (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded text-sm text-slate-400 hover:text-white transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {kids.length > 0 && (
            <select
              value={selectedKidId ?? ""}
              onChange={(e) => setSelectedKid(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm text-white"
            >
              {kids.map((kid) => (
                <option key={kid.id} value={kid.id}>
                  {kid.nickname} ({kid.age})
                </option>
              ))}
            </select>
          )}
          <div
            className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-xs cursor-pointer"
            title={email}
            onClick={handleSignOut}
          >
            {getInitials(email)}
          </div>
        </div>
      </div>
    </div>
  );
}
