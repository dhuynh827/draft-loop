import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
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

const defaultModel = "gemini-3.1-flash-lite";

const geminiSuggestionResponseSchema = {
  type: Type.OBJECT,
  properties: {
    kind: {
      type: Type.STRING,
      format: "enum",
      enum: ["replacement", "critique"],
      description:
        "Whether the response can replace document content or is critique-only feedback."
    },
    content: {
      type: Type.STRING,
      description: "The draft, rewrite, critique, or summary text."
    },
    rationale: {
      type: Type.STRING,
      nullable: true,
      description: "A short explanation of what changed or why the feedback matters."
    }
  },
  required: ["kind", "content"],
  propertyOrdering: ["kind", "content", "rationale"]
};

function normalizeTextValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof String) {
    return value.toString();
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.text === "string") {
      return record.text;
    }

    if (typeof record.value === "string") {
      return record.value;
    }

    if (typeof record.content === "string") {
      return record.content;
    }
  }

  return value;
}

const textValueSchema = z.preprocess(normalizeTextValue, z.string().trim().min(1));

const suggestionResponseSchema = z.object({
  kind: z.enum(["replacement", "critique"]),
  content: textValueSchema,
  rationale: textValueSchema.optional()
});

const modeConfig: Record<AiMode, ModeConfig> = {
  draft: {
    kind: "replacement",
    temperature: 0.7,
    maxOutputTokens: 1800,
    systemInstruction: `
      You are an expert technical writer.

      Generate useful document drafts from the user's instructions.

      If the user input lacks context:
      - Make reasonable assumptions.
      - Clearly label assumptions.
      - Include open questions.

      Return only valid JSON matching the provided schema.
  `
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
    const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;

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
        responseMimeType: "application/json",
        responseSchema: geminiSuggestionResponseSchema
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
      const parsed = suggestionResponseSchema.parse(JSON.parse(trimmedText));
      const kind = parsed.kind ?? fallbackKind;

      return {
        kind,
        content: parsed.content,
        rationale: parsed.rationale
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
