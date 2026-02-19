"use client";

import Link from "next/link";

interface KidInfo {
  id: string;
  nickname: string;
  age: number;
  grade: string;
}

interface ChildProfilesCardProps {
  kids: KidInfo[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
];

export function ChildProfilesCard({ kids }: ChildProfilesCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="font-semibold text-slate-800 mb-4">Child Profiles</h3>

      <div className="space-y-3">
        {kids.map((kid, i) => (
          <div
            key={kid.id}
            className="flex items-center gap-3 p-2 rounded hover:bg-slate-50"
          >
            <div
              className={`w-9 h-9 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white flex items-center justify-center text-sm font-bold`}
            >
              {getInitials(kid.nickname)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-700 text-sm">
                {kid.nickname}
              </div>
              <div className="text-xs text-slate-400">
                Age {kid.age} &middot; {kid.grade}
              </div>
            </div>
            <Link
              href={`/kids/${kid.id}`}
              className="text-xs text-slate-500 underline hover:text-slate-700"
            >
              Edit
            </Link>
          </div>
        ))}
      </div>

      <Link
        href="/kids/new"
        className="mt-4 block text-center border border-dashed border-slate-300 rounded py-2 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-600"
      >
        + Add child
      </Link>
    </div>
  );
}
