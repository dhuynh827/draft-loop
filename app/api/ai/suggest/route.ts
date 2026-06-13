import { NextResponse } from "next/server";
import { generateSuggestion } from "@/lib/gemini";
import { isAiMode } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || !isAiMode(body.mode)) {
    return NextResponse.json({ error: "Invalid AI mode." }, { status: 400 });
  }

  if (typeof body.instruction !== "string") {
    return NextResponse.json({ error: "Instruction is required." }, { status: 400 });
  }

  if (typeof body.documentText !== "string") {
    return NextResponse.json({ error: "Document text is required." }, { status: 400 });
  }

  try {
    const suggestion = await generateSuggestion({
      mode: body.mode,
      instruction: body.instruction,
      documentText: body.documentText,
      selectedText:
        typeof body.selectedText === "string" ? body.selectedText : undefined
    });

    return NextResponse.json(suggestion);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate suggestion.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
