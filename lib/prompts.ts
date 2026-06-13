import type { AiMode } from "@/lib/types";

export const modeInstructions: Record<AiMode, string> = {
  draft:
    "Create new document content from the user's instruction. Use the current document only as context.",
  rewrite:
    "Rewrite the provided document or selected text while preserving the user's intent.",
  critique:
    "Give constructive feedback. Do not rewrite the document unless the user explicitly asks for an example.",
  summarize: "Summarize the document clearly and concisely."
};

export function buildPrompt({
  mode,
  instruction,
  documentText,
  selectedText
}: {
  mode: AiMode;
  instruction: string;
  documentText: string;
  selectedText?: string;
}) {
  const targetText = selectedText || documentText || "No document content yet.";

  return [
    "You are an AI writing collaborator.",
    modeInstructions[mode],
    `User instruction: ${instruction}`,
    "Document context:",
    targetText
  ].join("\n\n");
}
