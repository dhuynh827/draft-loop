import { GoogleGenAI } from "@google/genai";
import { buildPrompt } from "@/lib/prompts";
import type { AiMode, SuggestionRequest, SuggestionResponse } from "@/lib/types";

type GeminiProviderOptions = {
  apiKey?: string;
  model?: string;
};

type ModeConfig = {
  kind: SuggestionResponse["kind"];
  temperature: number;
  maxOutputTokens: number;
  systemInstruction: string;
};

const defaultModel = "gemini-2.5-flash";

const modeConfig: Record<AiMode, ModeConfig> = {
  draft: {
    kind: "replacement",
    temperature: 0.7,
    maxOutputTokens: 1800,
    systemInstruction:
      "You draft useful document content from the user's instruction. Return only JSON."
  },
  rewrite: {
    kind: "replacement",
    temperature: 0.35,
    maxOutputTokens: 1800,
    systemInstruction:
      "You rewrite the provided document or selected text while preserving meaning. Return only JSON."
  },
  critique: {
    kind: "critique",
    temperature: 0.25,
    maxOutputTokens: 1400,
    systemInstruction:
      "You critique documents with specific, constructive feedback. Do not rewrite unless asked. Return only JSON."
  },
  summarize: {
    kind: "replacement",
    temperature: 0.2,
    maxOutputTokens: 900,
    systemInstruction:
      "You summarize documents clearly and concisely. Return only JSON."
  }
};

export class GeminiProvider {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(options: GeminiProviderOptions = {}) {
    /*
     * GEMINI_API_KEY needs to be included in .env
     */
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required to call Gemini.");
    }

    this.client = new GoogleGenAI({ apiKey });
    this.model = options.model ?? process.env.GEMINI_MODEL ?? defaultModel;
  }

  async generateSuggestion(request: SuggestionRequest): Promise<SuggestionResponse> {
    const config = modeConfig[request.mode];
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: this.buildContents(request),
      config: {
        systemInstruction: config.systemInstruction,
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens,
        responseMimeType: "application/json"
      }
    });

    return this.parseSuggestion(response.text ?? "", config.kind);
  }

  private buildContents(request: SuggestionRequest) {
    return [
      buildPrompt(request),
      "",
      "Respond as JSON with this exact shape:",
      JSON.stringify({
        kind: modeConfig[request.mode].kind,
        content: "The draft, rewrite, critique, or summary text.",
        rationale: "A short explanation of what changed or why this feedback matters."
      }),
      "",
      "Do not include markdown fences or commentary outside the JSON object."
    ].join("\n");
  }

  private parseSuggestion(
    rawText: string,
    fallbackKind: SuggestionResponse["kind"]
  ): SuggestionResponse {
    const trimmedText = rawText.trim();

    if (!trimmedText) {
      throw new Error("Gemini returned an empty response.");
    }

    try {
      const parsed = JSON.parse(trimmedText) as Partial<SuggestionResponse>;
      const kind = parsed.kind === "critique" ? "critique" : fallbackKind;

      if (typeof parsed.content !== "string" || !parsed.content.trim()) {
        throw new Error("Gemini response did not include content.");
      }

      return {
        kind,
        content: parsed.content.trim(),
        rationale:
          typeof parsed.rationale === "string" && parsed.rationale.trim()
            ? parsed.rationale.trim()
            : undefined
      };
    } catch {
      return {
        kind: fallbackKind,
        content: trimmedText,
        rationale: "Gemini returned plain text instead of structured JSON."
      };
    }
  }
}

export async function generateSuggestion(
  request: SuggestionRequest
): Promise<SuggestionResponse> {
  return new GeminiProvider().generateSuggestion(request);
}
