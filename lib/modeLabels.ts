import type { AiMode } from "@/lib/types";

export const modeLabels: Record<
  AiMode,
  {
    action: string;
    assistantTitle: string;
    suggestionTitle: string;
  }
> = {
  draft: {
    action: "Draft",
    assistantTitle: "Draft with AI",
    suggestionTitle: "AI draft"
  },
  rewrite: {
    action: "Rewrite",
    assistantTitle: "Rewrite with AI",
    suggestionTitle: "AI rewrite"
  },
  critique: {
    action: "Critique",
    assistantTitle: "Review with AI",
    suggestionTitle: "AI critique"
  },
  summarize: {
    action: "Summarize",
    assistantTitle: "Summarize with AI",
    suggestionTitle: "AI summary"
  }
};
