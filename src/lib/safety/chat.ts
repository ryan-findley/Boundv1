import { CHAT_SYSTEM_PROMPT_VERSION } from "@/lib/constants";
import type { ChatGenerationInput, ChatGenerationResult } from "./types";

function buildSystemPrompt(kidAge: number, kidGrade: string): string {
  return `You are a friendly, helpful AI assistant designed for children. You are talking to a ${kidAge}-year-old in grade ${kidGrade}.

RULES:
1. Use age-appropriate language and tone.
2. Be educational and encouraging.
3. Keep responses concise and easy to understand.
4. If asked about something you're unsure is appropriate, gently redirect the conversation.
5. Never share personal information, adult content, or anything inappropriate for children.
6. Be patient and kind. Encourage curiosity and learning.
7. If a child seems upset, be supportive and suggest they talk to a trusted adult.`;
}

export async function generateChatResponse(input: ChatGenerationInput): Promise<ChatGenerationResult> {
  const provider = process.env.LLM_PROVIDER || "mock";
  const model = process.env.LLM_MODEL || "mock";
  const apiKey = process.env.LLM_API_KEY;

  const startTime = Date.now();

  // Mock provider for development
  if (provider === "mock" || !apiKey || apiKey === "your_openai_api_key_here") {
    return mockChat(input, startTime);
  }

  try {
    const systemPrompt = buildSystemPrompt(input.kidAge, input.kidGrade);
    let responseText: string;
    let usage: ChatGenerationResult["usage"];

    if (provider === "anthropic") {
      const chatMessages = input.messages.map((m) => ({
        role: m.role === "kid" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1000,
          system: systemPrompt,
          messages: chatMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);

      const data = await response.json();
      responseText = data.content?.[0]?.text || "";
      usage = data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
          }
        : undefined;
    } else {
      const messages = [
        { role: "system", content: systemPrompt },
        ...input.messages.map((m) => ({
          role: m.role === "kid" ? "user" : m.role,
          content: m.content,
        })),
      ];

      const baseUrl = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) throw new Error(`LLM API error: ${response.status}`);

      const data = await response.json();
      responseText = data.choices[0]?.message?.content || "";
      usage = data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined;
    }

    const latencyMs = Date.now() - startTime;

    return {
      text: responseText || "I'm sorry, I couldn't think of a response. Could you try asking again?",
      provider,
      model,
      usage,
      latencyMs,
    };
  } catch (error) {
    console.error("[Chat Generation Error]", error);
    return {
      text: "Oops! I had a little trouble thinking. Could you try asking me again?",
      provider,
      model,
      latencyMs: Date.now() - startTime,
    };
  }
}

function mockChat(input: ChatGenerationInput, startTime: number): ChatGenerationResult {
  const lastMessage = input.messages[input.messages.length - 1];
  const content = lastMessage?.content?.toLowerCase() || "";

  let response: string;

  if (content.includes("hello") || content.includes("hi")) {
    response = `Hi there! I'm your learning buddy. What would you like to talk about today?`;
  } else if (content.includes("math") || content.includes("number")) {
    response = `Math is awesome! I'd love to help you with that. What kind of math are you working on?`;
  } else if (content.includes("story") || content.includes("book")) {
    response = `I love stories! Do you want me to help you with a story you're reading, or would you like to make up a story together?`;
  } else if (content.includes("science")) {
    response = `Science is so cool! There are so many amazing things to explore. What science topic are you curious about?`;
  } else {
    response = `That's a great question! Let me think about that... I'd say the best way to learn about it is to stay curious and keep exploring. Would you like to know more?`;
  }

  return {
    text: response,
    provider: "mock",
    model: "mock-chat",
    usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
    latencyMs: Date.now() - startTime,
  };
}
