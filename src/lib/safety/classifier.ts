import { SAFETY_PROMPT_VERSION, SYSTEM_BLOCKED_TOPICS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { SafetyDecision, SafetyClassifierInput, SafetyClassifierResult } from "./types";

function buildSafetyPrompt(input: SafetyClassifierInput): string {
  return `You are a child safety classifier. Your job is to determine whether a child's message touches on any blocked topics.

BLOCKED TOPICS:
${input.blockedTopics.map((t) => `- ${t}`).join("\n")}

CHILD CONTEXT:
- Age: ${input.kidAge}
- Grade: ${input.kidGrade}

INSTRUCTIONS:
1. Compare the child's message against the blocked topics by MEANING and INTENT, not just exact string match.
2. Consider euphemisms, indirect references, and coded language.
3. When in doubt, err on the side of BLOCKING (conservative approach).
4. Return ONLY valid JSON. No other text.

JSON OUTPUT FORMAT:
{
  "decision": "ALLOW" or "BLOCK",
  "matched_topics": ["topic1", "topic2"],
  "reason": "direct_request" | "indirect_reference" | "euphemism" | "unclear_but_risky" | "none" | "other",
  "confidence": 0.0 to 1.0,
  "notes": "optional explanation"
}

CHILD'S MESSAGE:
"${input.promptText}"

Respond with ONLY the JSON object.`;
}

function parseDecision(raw: string): SafetyDecision {
  try {
    // Extract JSON from response (in case model adds extra text)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.decision || !["ALLOW", "BLOCK"].includes(parsed.decision)) {
      throw new Error("Invalid decision");
    }

    return {
      decision: parsed.decision,
      matched_topics: Array.isArray(parsed.matched_topics) ? parsed.matched_topics : [],
      reason: parsed.reason || "other",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      notes: parsed.notes,
    };
  } catch {
    // Fail closed
    return {
      decision: "BLOCK",
      matched_topics: [],
      reason: "classifier_error",
      confidence: 0,
      notes: "Failed to parse classifier output",
    };
  }
}

export async function getAggregatedBlockedTopics(kidProfileId: string): Promise<string[]> {
  // Get parent-configured topics
  const settings = await prisma.kidProfileSettings.findUnique({
    where: { kidProfileId },
  });

  const parentTopics = settings?.blockedTopics ?? [];

  // Get system topics from DB
  const systemTopics = await prisma.systemBlockedTopic.findMany();
  const systemTopicList = systemTopics.map((t) => t.topic);

  // Merge + dedupe (fallback to constant if DB is empty)
  const allSystemTopics = systemTopicList.length > 0 ? systemTopicList : SYSTEM_BLOCKED_TOPICS;

  const combined = [...new Set([...allSystemTopics, ...parentTopics])];
  return combined;
}

export async function classifySafety(input: SafetyClassifierInput): Promise<SafetyClassifierResult> {
  const provider = process.env.LLM_PROVIDER || "mock";
  const model = process.env.LLM_MODEL || "mock";
  const apiKey = process.env.LLM_API_KEY;

  // Mock provider for development
  if (provider === "mock" || !apiKey || apiKey === "your_openai_api_key_here") {
    return mockClassify(input);
  }

  try {
    const prompt = buildSafetyPrompt(input);
    let responseText: string;

    if (provider === "anthropic") {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 500,
          messages: [{ role: "user", content: prompt }],
          temperature: 0,
        }),
      });

      if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);

      const data = await response.json();
      responseText = data.content?.[0]?.text || "";
    } else if (provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0,
          max_tokens: 500,
        }),
      });

      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

      const data = await response.json();
      responseText = data.choices[0]?.message?.content || "";
    } else {
      // Default to OpenAI-compatible API
      const baseUrl = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0,
          max_tokens: 500,
        }),
      });

      if (!response.ok) throw new Error(`LLM API error: ${response.status}`);

      const data = await response.json();
      responseText = data.choices[0]?.message?.content || "";
    }

    const decision = parseDecision(responseText);

    return {
      decision,
      provider,
      model,
      rawJson: responseText,
    };
  } catch (error) {
    console.error("[Safety Classifier Error]", error);
    // Fail closed
    return {
      decision: {
        decision: "BLOCK",
        matched_topics: [],
        reason: "classifier_error",
        confidence: 0,
        notes: `Classifier error: ${error instanceof Error ? error.message : "unknown"}`,
      },
      provider,
      model,
      rawJson: null,
    };
  }
}

function mockClassify(input: SafetyClassifierInput): SafetyClassifierResult {
  const lower = input.promptText.toLowerCase();

  // Simple keyword matching for mock
  const matches = input.blockedTopics.filter((topic) => {
    const topicLower = topic.toLowerCase();
    const words = topicLower.split(/\s+/);
    return words.some((word) => lower.includes(word)) || lower.includes(topicLower);
  });

  return {
    decision: {
      decision: matches.length > 0 ? "BLOCK" : "ALLOW",
      matched_topics: matches,
      reason: matches.length > 0 ? "direct_request" : "none",
      confidence: matches.length > 0 ? 0.9 : 0.95,
    },
    provider: "mock",
    model: "mock-classifier",
    rawJson: { mock: true },
  };
}
