# Approach

## Task Summary

I chose the "Where People and Agents Write Together" prompt.

The product direction is a lightweight collaborative writing workspace where a human author and an AI agent work in the same document loop. The user can write or paste document content, ask the AI to draft, rewrite, critique, or summarize, then decide whether to accept or reject the AI output.

The core idea is not to make the AI the owner of the document. The document remains user-controlled, and AI output is treated as a suggestion that must be reviewed before it changes the canonical document.

## Original MVP Scope

The MVP scope is intentionally narrow:

- A single-document workspace.
- A Markdown-based document editor.
- A rendered Markdown preview.
- An AI assistant panel with a small set of modes.
- A server-side Gemini integration.
- A suggestion review flow with accept/reject actions.
- Local document persistence for the current draft.

This avoids turning the first version into a full Google Docs replacement, chat product, or multiplayer collaboration system. For this assessment, "collaboration" means the user and AI agent are participating in one authoring/review loop.

## Game Plan

1. Scaffold the app with Next.js App Router, TypeScript, Material UI, and a clean component structure.
2. Build the main workspace: document editor on the left, assistant panel on the right.
3. Keep the editor simple first, using Markdown text as the document representation.
4. Add AI modes as product-level actions rather than separate agents.
5. Route AI requests through a Next.js API route so provider credentials stay server-side.
6. Start with mocked AI behavior, then replace the mock with a Gemini provider.
7. Render document and suggestion content as Markdown so generated content can include headings, lists, and structured feedback.
8. Add formatting, linting, type checking, and build validation early enough to keep iteration clean.

## Decisions Made So Far

- Used Next.js App Router as the application framework.
- Used TypeScript throughout the app.
- Used Material UI for layout and controls.
- Used Yarn as the package manager.
- Added Prettier with project-level formatting scripts.
- Kept the app as a single-page workspace for now.
- Split the UI into focused components:
  - `DocumentEditor`
  - `AssistantPanel`
  - `ModeSelector`
  - `SuggestionCard`
  - `Providers`
- Kept shared app types in `lib/types.ts`.
- Kept Gemini integration isolated in `lib/gemini.ts`.
- Kept prompt construction isolated in `lib/prompts.ts`.
- Added a `GeminiProvider` class that initializes `GoogleGenAI`.
- Used `GEMINI_API_KEY` for provider authentication.
- Added optional `GEMINI_MODEL`, defaulting to `gemini-3.1-flash-lite`.
- Chose `gemini-3.1-flash-lite` as the development default because its higher quota limits make iteration less likely to block on provider rate limits.
- Mapped each `AiMode` to mode-specific Gemini generation settings.
- Asked Gemini for JSON matching the internal `SuggestionResponse` shape.
- Added a plain-text fallback if Gemini returns unstructured output.
- Kept AI responses as suggestions rather than directly mutating the document.
- Used `react-markdown` to render document and suggestion content.
- Changed the document body UI to two tabs:
  - Preview as the default view.
  - Markdown as the raw editing view.
- Stored the current document in localStorage for lightweight persistence.
- Deferred TipTap until after the core authoring/review loop is working.
- Deferred auth, database persistence, document history, multiplayer collaboration, inline comments, and complex diffing.

## Current Implementation

The current app supports:

- Editing a document title.
- Editing raw Markdown document content.
- Previewing rendered Markdown content.
- Selecting an AI mode: draft, rewrite, critique, or summarize.
- Sending the current document and user instruction to the `/api/ai/suggest` route.
- Calling Gemini server-side through `GeminiProvider`.
- Rendering the suggestion as Markdown.
- Accepting replacement suggestions into the document.
- Rejecting suggestions.
- Local document persistence.

## What I Intentionally Left Out For Now

- Real-time human-human collaboration.
- Authentication.
- Database-backed documents.
- Full version history.
- Inline diffing or track-changes UI.
- Range-based editing against selected text.
- TipTap rich text editing.
- Streaming AI responses.
- Multi-agent orchestration.

These are valuable, but they are not required to prove the core loop: write, ask AI, review, decide.
