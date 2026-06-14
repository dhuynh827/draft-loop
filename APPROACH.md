# Approach

## Task Summary

I chose the "Where People and Agents Write Together" prompt. This document explains how I interpreted the prompt, what I chose to build, what I intentionally scoped out, and where the system would evolve next.

The product direction is DraftLoop: a lightweight collaborative writing workspace where a human author and an AI agent work in the same document loop. The user can write or paste document content, ask the AI to draft, rewrite, critique, or summarize, then decide whether to accept, reject, copy, or edit the AI output.

The core idea is that the AI never owns the document. For this assessment, "collaboration" means the user and AI agent are participating in one authoring and review loop.

## Original MVP Scope

The MVP scope was intentionally narrow:

- A single-document workspace.
- A Markdown-based document editor.
- A rendered Markdown preview.
- An AI assistant panel with a small set of modes.
- A server-side Gemini integration.
- A suggestion review flow with accept/reject actions.
- Local document persistence for the current draft.

This avoids turning the first version into a full Google Docs replacement, chat product, or multiplayer collaboration system. For this assessment, "collaboration" means the user and AI agent are participating in one authoring and review loop.

## Game Plan

1. Scaffold the app with Next.js App Router, TypeScript, Material UI, and a clean component structure.
2. Build the main workspace: document editor on the left, assistant panel on the right.
3. Keep the editor simple first, using Markdown text as the document representation.
4. Add AI modes as product-level actions rather than separate agents.
5. Route AI requests through a Next.js API route so provider credentials stay server-side.
6. Start with mocked AI behavior, then replace the mock with a Gemini provider.
7. Render document and suggestion content as Markdown so generated content can include headings, lists, and structured feedback.
8. Validate each AI mode through a user story: drafting from a vague prompt, rewriting selected text, critiquing document gaps, and summarizing content.
   Use those stories to shape the interaction model, empty states, validation, and accept/reject/apply behavior.
9. Establish checkpoints after each major workflow milestone to reassess the product against the original MVP scope, confirm the human-AI authoring/review loop remains the priority, and intentionally cut or defer features that introduce complexity without improving that loop.

## Current MVP Assessment

The project is feature complete for the MVP. It proves the core loop:

1. The user writes or previews a Markdown document.
2. The user chooses an AI mode manually or by selecting text.
3. The user optionally adds instructions.
4. Gemini returns a structured suggestion.
5. The user reviews and can edit the suggestion.
6. The user decides how the suggestion enters the document.

#### The implementation now goes beyond the original MVP in a few focused areas:

- Text selection context menu for `draft`, `rewrite`, `critique`, and `summarize`.
- Selected text replacement using raw Markdown `{ start, end, text }` ranges.
- Conservative preview-to-Markdown selection matching.
- Document editing lock while selected context is active.
- Destructive full-document replacement confirmation.
- Mode-switch protection when an unresolved suggestion exists.
- Append flows for summaries and critiques.
- Editable suggestion buffer with empty and unchanged-state validation.

## Current Implementation

The current app supports:

- Markdown editing and preview
- Full-document and selected-context AI assistance
- Draft, rewrite, summarize, and critique modes
- Editable AI suggestions with accept/reject/apply flows
- Server-side Gemini integration with structured output and Zod validation
- Local persistence for the active document

## Key Decisions

- Used Next.js App Router as the application framework for full stack capabilities during MVP development.
- Used Material UI for layout and controls.
- Kept the app as a single-page workspace.
- Kept Markdown as the source of truth for the MVP.
- Chose `react-markdown` over `TipTap` for simplicity of MVP.
- Split the UI into focused components:
  - `DocumentEditor`
  - `AssistantPanel`
  - `ModeSelector`
  - `SuggestionCard`
  - `Providers`
- Kept prompt construction isolated in `lib/prompts.ts`.
- Added a `GeminiProvider` class that initializes `GoogleGenAI` and Gemini integration isolated in `lib/gemini.ts` to keep provider-specific code isolated if the app later moved to another model provider.
- Added optional `GEMINI_MODEL`, defaulting to `gemini-3.1-flash-lite`.
- Used a Flash-Lite model during development to keep iteration fast and reduce the chance of hitting quota limits.
- Used `responseSchema` plus Zod validation to make provider output safer.
- Normalized the response via post parsing due to Gemini inconsistent content.
- Treated summarize and critique as append flows instead of destructive replacement flows.
- Used exact Markdown ranges for selected-text replacement instead of wrapping DOM nodes.
- Locked document editing while selected context is active to avoid stale range replacement.
- Treated summarize and critique as append flows instead of destructive replacement flows.

## Tradeoffs

- Markdown keeps the MVP simpler and debuggable, but it is less polished than rich text editing.
- Preview selection is convenient, but exact string matching can fail when rendered Markdown differs from source Markdown.
- Range replacement is straightforward while Markdown is the source of truth, but it would need a different model after TipTap integration.
- Local storage is enough for this assessment, but it does not support cross-device persistence or collaboration.
- The current state machine lives mostly in `app/page.tsx`. That is acceptable for MVP velocity, but it should be extracted into a dedicated workflow reducer or document operation layer if the interaction model grows.

## Known Limitations

- No authentication.
- No database-backed documents.
- No app-level undo or version history.
- No real-time human-human collaboration.
- No inline diff or track-changes UI.
- No streaming AI responses.
- No multi-document management.
- Preview text selection only works when the selected visible text appears exactly once in raw Markdown.
- Gemini failures are surfaced as a simple error message rather than retryable provider diagnostics.

## What Breaks First Under Pressure

- The single-page state model will get hard to maintain as more suggestion states and document mutations are added.
- Exact text matching for preview selection will become brittle with richer Markdown, formatting, or repeated phrases.
- Local storage will not be enough once users expect durable documents, history, or sharing.
- Full-document replacement without version history is risky even with the confirmation dialog.

## What I Would Build Next

- Extract suggestion application rules from `app/page.tsx` into a small document operation layer.
- Add app-level undo/history for accepted suggestions.
- Add a clearer visual diff for replacement suggestions.
- Add lightweight document history before adding multiplayer collaboration.
- Integrate TipTap once the document operation model is settled.
- Add persisted documents and basic share/auth flows.
