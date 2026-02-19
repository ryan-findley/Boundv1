// Terms & Conditions
export const TERMS_VERSION = "v1";

// Kid Profile
export const KID_AGE_MIN = 3;
export const KID_AGE_MAX = 17;
export const KID_ATTESTATION_VERSION = "v1";

// System blocked topics (Epic 2.9 / 4.2) - always applied to every kid
export const SYSTEM_BLOCKED_TOPICS = [
  "self-harm",
  "suicide",
  "weapons and how to make them",
  "illegal drugs and how to obtain them",
  "explicit sexual content",
  "violence and gore",
  "child exploitation",
  "terrorism",
  "eating disorders promotion",
  "bullying and harassment tactics",
];

// Safety Classifier (Epic 4)
export const SAFETY_PROMPT_VERSION = "v1";

export const SAFETY_REFUSAL_MESSAGE =
  "I'm not able to talk about that topic. If you're curious, ask your parent or guardian — they can help!";

// Chat (Epic 5)
export const CHAT_SYSTEM_PROMPT_VERSION = "chat_v1";
export const CHAT_RATE_LIMIT_PER_MINUTE = 10;

// Kid Mode (Epic 3)
export const HEARTBEAT_INTERVAL_SECONDS = 15;
export const IDLE_TIMEOUT_SECONDS = 60;
export const TIME_WARNING_MINUTES = 5;

// Content Sensitivity (Phase 2)
export const CONTENT_SENSITIVITY_CATEGORIES = [
  { id: "sexual", label: "Sexual content" },
  { id: "violence", label: "Violence" },
  { id: "religious", label: "Religious topics" },
  { id: "political", label: "Political topics" },
  { id: "relationships", label: "Relationships/dating" },
  { id: "mental_health", label: "Mental health" },
  { id: "drugs", label: "Drugs/alcohol" },
] as const;

export type SensitivityCategory = typeof CONTENT_SENSITIVITY_CATEGORIES[number]["id"];

export const DEFAULT_SENSITIVITY_RULES: Record<SensitivityCategory, string> = {
  sexual: "red",
  violence: "red",
  religious: "yellow",
  political: "yellow",
  relationships: "red",
  mental_health: "yellow",
  drugs: "red",
};

export const ALERT_LEVELS = {
  red: { label: "Instant alert" },
  yellow: { label: "Weekly digest" },
  green: { label: "No flag" },
} as const;

export const TIME_LIMIT_MIN = 15;
export const TIME_LIMIT_MAX = 120;

// Activity Log (Phase 5)
export const AUDIT_EVENT_LABELS: Record<string, { label: string; category: string }> = {
  kid_session_started: { label: "Session started", category: "sessions" },
  kid_session_ended: { label: "Session ended", category: "sessions" },
  kid_profile_created: { label: "Profile created", category: "profiles" },
  kid_profile_updated: { label: "Profile updated", category: "profiles" },
  kid_profile_deleted: { label: "Profile deleted", category: "profiles" },
  blocked_topics_updated: { label: "Blocked topics changed", category: "controls" },
  time_limit_updated: { label: "Time limit changed", category: "controls" },
  time_limit_settings_updated: { label: "Time settings changed", category: "controls" },
  time_extended: { label: "Time extended", category: "controls" },
  alert_reviewed: { label: "Alert reviewed", category: "alerts" },
  content_sensitivity_updated: { label: "Sensitivity updated", category: "controls" },
  custom_keywords_updated: { label: "Keywords updated", category: "controls" },
  notification_preferences_updated: { label: "Notifications updated", category: "controls" },
};

export const AUDIT_EVENT_CATEGORIES = [
  { id: "all", label: "All events" },
  { id: "sessions", label: "Sessions" },
  { id: "profiles", label: "Profiles" },
  { id: "controls", label: "Controls" },
  { id: "alerts", label: "Alerts" },
] as const;
