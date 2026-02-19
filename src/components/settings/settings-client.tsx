"use client";

import { ChildProfilesCard } from "./child-profiles-card";
import { ParentAccountsCard } from "./parent-accounts-card";
import { SubscriptionCard } from "./subscription-card";
import { DataPrivacyCard } from "./data-privacy-card";

interface KidInfo {
  id: string;
  nickname: string;
  age: number;
  grade: string;
}

interface SettingsClientProps {
  email: string;
  kids: KidInfo[];
}

export function SettingsClient({ email, kids }: SettingsClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChildProfilesCard kids={kids} />
      <ParentAccountsCard email={email} />
      <SubscriptionCard />
      <DataPrivacyCard
        kidIds={kids.map((k) => ({ id: k.id, nickname: k.nickname }))}
      />
    </div>
  );
}
