export const aiModes = ["draft", "rewrite", "critique", "summarize"] as const;

export type AiMode = (typeof aiModes)[number];

export type SuggestionKind = "replacement" | "critique";

export type SuggestionRequest = {
  mode: AiMode;
  instruction: string;
  documentText: string;
  selectedText?: string;
};

export type SelectedContext = {
  text: string;
  start: number;
  end: number;
};

export type SuggestionResponse = {
  kind: SuggestionKind;
  content: string;
  rationale?: string;
};

export type LocalDocument = {
  title: string;
  body: string;
};

export function isAiMode(value: unknown): value is AiMode {
  return typeof value === "string" && aiModes.includes(value as AiMode);
}
