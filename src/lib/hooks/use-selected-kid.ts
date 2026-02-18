"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useSelectedKid(kids: { id: string; nickname: string; age: number }[]) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const kidParam = searchParams.get("kid");
  const selectedKidId = kidParam && kids.some((k) => k.id === kidParam)
    ? kidParam
    : kids[0]?.id ?? null;

  const setSelectedKid = useCallback(
    (kidId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("kid", kidId);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const selectedKid = kids.find((k) => k.id === selectedKidId) ?? null;

  return { selectedKidId, selectedKid, setSelectedKid };
}
