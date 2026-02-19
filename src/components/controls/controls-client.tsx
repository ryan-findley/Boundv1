"use client";

import { TimeControls } from "./time-controls";
import { ContentSensitivity } from "./content-sensitivity";
import { CustomKeywords } from "./custom-keywords";
import { NotificationPreferences } from "./notification-preferences";

interface ControlsClientProps {
  kidProfileId: string;
  kidNickname: string;
  settings: {
    timeLimit: {
      dailyTimeLimitMinutes: number | null;
      quietHoursStart: string | null;
      quietHoursEnd: string | null;
      weekendTimeLimitAdjustment: number | null;
    };
    sensitivityRules: { category: string; alertLevel: string }[];
    customKeywords: {
      alertKeywords: string[];
      exceptionKeywords: string[];
    };
    notifications: {
      instantPush: boolean;
      instantEmail: boolean;
      instantSms: boolean;
      weeklyDigestEmail: boolean;
      lessonCompletionNotify: boolean;
      kidShareNotify: boolean;
    } | null;
  };
}

export function ControlsClient({ kidProfileId, kidNickname, settings }: ControlsClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Controls</h1>
        <p className="text-slate-500 text-sm">
          Time limits, content settings, and notifications for {kidNickname}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <TimeControls kidProfileId={kidProfileId} initial={settings.timeLimit} />
        <ContentSensitivity
          kidProfileId={kidProfileId}
          initialRules={settings.sensitivityRules}
        />
        <CustomKeywords
          kidProfileId={kidProfileId}
          initialAlertKeywords={settings.customKeywords.alertKeywords}
          initialExceptionKeywords={settings.customKeywords.exceptionKeywords}
        />
        <NotificationPreferences
          kidProfileId={kidProfileId}
          initial={settings.notifications}
        />
      </div>
    </div>
  );
}
