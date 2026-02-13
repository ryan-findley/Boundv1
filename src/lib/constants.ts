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
