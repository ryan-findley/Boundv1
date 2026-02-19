"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { classifySafety, getAggregatedBlockedTopics } from "@/lib/safety/classifier";
import { generateChatResponse } from "@/lib/safety/chat";
import { SAFETY_PROMPT_VERSION, SAFETY_REFUSAL_MESSAGE, CHAT_SYSTEM_PROMPT_VERSION, CHAT_RATE_LIMIT_PER_MINUTE } from "@/lib/constants";

async function getAuthenticatedParent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return prisma.parentUser.findUnique({
    where: { supabaseUserId: user.id },
  });
}

function validateSession(session: { endedAt: Date | null; revokedAt: Date | null } | null) {
  if (!session) return false;
  if (session.endedAt || session.revokedAt) return false;
  return true;
}

export async function submitKidPrompt(
  kidProfileId: string,
  sessionId: string,
  promptText: string
) {
  const parent = await getAuthenticatedParent();
  if (!parent) return { error: "unauthorized" };

  // Validate kid ownership
  const kid = await prisma.kidProfile.findUnique({
    where: { id: kidProfileId },
    include: { settings: true },
  });
  if (!kid || kid.parentUserId !== parent.id) {
    return { error: "not_found" };
  }

  // Validate session
  const session = await prisma.kidSession.findUnique({
    where: { id: sessionId },
  });
  if (!validateSession(session) || session?.kidProfileId !== kidProfileId) {
    return { error: "invalid_session" };
  }

  // Rate limiting: count messages in last minute
  const oneMinuteAgo = new Date(Date.now() - 60000);
  const recentCount = await prisma.chatMessage.count({
    where: {
      thread: { kidProfileId },
      role: "kid",
      createdAt: { gte: oneMinuteAgo },
    },
  });
  if (recentCount >= CHAT_RATE_LIMIT_PER_MINUTE) {
    return {
      error: "rate_limited",
      message: "You're sending messages really fast! Take a breath and try again in a moment.",
    };
  }

  // Find or create active thread
  let thread = await prisma.chatThread.findFirst({
    where: { kidProfileId, archivedAt: null },
    orderBy: { updatedAt: "desc" },
  });
  if (!thread) {
    thread = await prisma.chatThread.create({
      data: { kidProfileId },
    });
  }

  // Step 1: Safety classification
  const blockedTopics = await getAggregatedBlockedTopics(kidProfileId);
  const safetyResult = await classifySafety({
    promptText,
    blockedTopics,
    kidAge: kid.age,
    kidGrade: kid.grade,
    promptVersion: SAFETY_PROMPT_VERSION,
    alertKeywords: kid.settings?.alertKeywords ?? [],
    exceptionKeywords: kid.settings?.exceptionKeywords ?? [],
  });

  const { decision } = safetyResult;

  // Step 2: Persist kid message with safety metadata
  const kidMessage = await prisma.chatMessage.create({
    data: {
      threadId: thread.id,
      role: "kid",
      content: promptText,
      safetyDecision: decision.decision,
      safetyReason: decision.reason,
      matchedTopics: decision.matched_topics,
      safetyModel: safetyResult.model,
      safetyProvider: safetyResult.provider,
      safetyPromptVersion: SAFETY_PROMPT_VERSION,
      safetyRawJson: safetyResult.rawJson as object,
      flaggedAt: decision.decision === "BLOCK" ? new Date() : null,
    },
  });

  // Step 2.5: Check content sensitivity rules for tiered alerts
  if (decision.matched_topics.length > 0) {
    const sensitivityRules = await prisma.contentSensitivityRule.findMany({
      where: { kidProfileId },
    });
    const ruleMap = new Map(sensitivityRules.map((r) => [r.category, r.alertLevel]));

    // Find the highest alert level among matched topics
    let highestLevel: "red" | "yellow" | null = null;
    let alertCategory = decision.matched_topics[0] ?? "unknown";

    for (const topic of decision.matched_topics) {
      const level = ruleMap.get(topic);
      if (level === "red") {
        highestLevel = "red";
        alertCategory = topic;
        break;
      }
      if (level === "yellow" && highestLevel === null) {
        highestLevel = "yellow";
        alertCategory = topic;
      }
    }

    if (highestLevel) {
      await prisma.alertEvent.create({
        data: {
          kidProfileId,
          chatMessageId: kidMessage.id,
          alertLevel: highestLevel,
          category: alertCategory,
          summary: `Message flagged: "${promptText.substring(0, 100)}${promptText.length > 100 ? "..." : ""}"`,
        },
      });
    }
  }

  // Step 3: Handle BLOCK
  if (decision.decision === "BLOCK") {
    console.log("[SAFETY BLOCK]", {
      parentUserId: parent.id,
      kidProfileId,
      promptSnippet: promptText.substring(0, 100),
      matchedTopics: decision.matched_topics,
      provider: safetyResult.provider,
      model: safetyResult.model,
    });

    // Create email alert for red-level blocks
    await prisma.emailOutbox.create({
      data: {
        toEmail: parent.email,
        subject: `[Bound] ${kid.nickname} asked about a blocked topic`,
        bodyText: buildAlertEmail(kid.nickname, promptText, decision.matched_topics),
      },
    });

    return {
      blocked: true,
      refusalMessage: SAFETY_REFUSAL_MESSAGE,
      kidMessageId: kidMessage.id,
    };
  }

  // Step 4: Generate chat response
  const recentMessages = await prisma.chatMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const chatResult = await generateChatResponse({
    messages: recentMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    kidAge: kid.age,
    kidGrade: kid.grade,
    systemPromptVersion: CHAT_SYSTEM_PROMPT_VERSION,
  });

  // Step 5: Persist assistant message
  const assistantMessage = await prisma.chatMessage.create({
    data: {
      threadId: thread.id,
      role: "assistant",
      content: chatResult.text,
      llmProvider: chatResult.provider,
      llmModel: chatResult.model,
      promptVersion: CHAT_SYSTEM_PROMPT_VERSION,
      usageJson: chatResult.usage as object ?? null,
      latencyMs: chatResult.latencyMs,
    },
  });

  return {
    blocked: false,
    kidMessageId: kidMessage.id,
    assistantMessage: {
      id: assistantMessage.id,
      content: assistantMessage.content,
      createdAt: assistantMessage.createdAt.toISOString(),
    },
  };
}

export async function getThreadMessages(kidProfileId: string) {
  const parent = await getAuthenticatedParent();
  if (!parent) return [];

  const kid = await prisma.kidProfile.findUnique({
    where: { id: kidProfileId },
  });
  if (!kid || kid.parentUserId !== parent.id) return [];

  const thread = await prisma.chatThread.findFirst({
    where: { kidProfileId, archivedAt: null },
    orderBy: { updatedAt: "desc" },
  });

  if (!thread) return [];

  const messages = await prisma.chatMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
  });

  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    safetyDecision: m.safetyDecision,
    flaggedAt: m.flaggedAt?.toISOString() ?? null,
  }));
}

function buildAlertEmail(
  kidNickname: string,
  promptText: string,
  matchedTopics: string[]
): string {
  return `Hello,

Your child "${kidNickname}" attempted to ask about a blocked topic on Bound.

Prompt: "${promptText}"

Matched blocked topics: ${matchedTopics.join(", ")}

Time: ${new Date().toISOString()}

This message was automatically blocked and your child was shown a safe refusal message.

— Bound Safety System`;
}
