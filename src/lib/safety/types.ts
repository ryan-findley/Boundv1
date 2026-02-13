export interface SafetyDecision {
  decision: "ALLOW" | "BLOCK";
  matched_topics: string[];
  reason:
    | "direct_request"
    | "indirect_reference"
    | "euphemism"
    | "unclear_but_risky"
    | "classifier_error"
    | "none"
    | "other";
  confidence: number;
  notes?: string;
}

export interface SafetyClassifierInput {
  promptText: string;
  blockedTopics: string[];
  kidAge: number;
  kidGrade: string;
  promptVersion: string;
}

export interface SafetyClassifierResult {
  decision: SafetyDecision;
  provider: string;
  model: string;
  rawJson: unknown;
}

export interface ChatGenerationInput {
  messages: Array<{ role: string; content: string }>;
  kidAge: number;
  kidGrade: string;
  systemPromptVersion: string;
}

export interface ChatGenerationResult {
  text: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  latencyMs: number;
}
