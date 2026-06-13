"use client";

import { useEffect, useMemo, useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AssistantPanel } from "@/components/AssistantPanel";
import { DocumentEditor } from "@/components/DocumentEditor";
import type { AiMode, SuggestionResponse } from "@/lib/types";
import { loadLocalDocument, saveLocalDocument } from "@/storage/localDocument";

const initialDocument = {
  title: "Untitled product spec",
  body: ""
};

export default function Home() {
  const [title, setTitle] = useState(initialDocument.title);
  const [body, setBody] = useState(initialDocument.body);
  const [mode, setMode] = useState<AiMode>("draft");
  const [instruction, setInstruction] = useState("");
  const [suggestion, setSuggestion] = useState<SuggestionResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadLocalDocument();

    if (saved) {
      // Browser-only localStorage state is loaded after hydration.
      setTitle(saved.title);
      setBody(saved.body);
    }
  }, []);

  useEffect(() => {
    saveLocalDocument({ title, body });
  }, [title, body]);

  const wordCount = useMemo(() => {
    return body.trim() ? body.trim().split(/\s+/).length : 0;
  }, [body]);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mode,
          instruction,
          documentText: body
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate a suggestion.");
      }

      const data = (await response.json()) as SuggestionResponse;
      setSuggestion(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while generating a suggestion."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleAccept(content: string) {
    if (suggestion?.kind === "replacement") {
      setBody(content);
    }

    setSuggestion(null);
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        component="header"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper"
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 72
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <AutoAwesomeIcon color="primary" />
              <Box>
                <Typography variant="h6" component="h1">
                  DraftLoop
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI-assisted document drafting and review
                </Typography>
              </Box>
            </Stack>
            <Button variant="outlined" size="small" disabled>
              Saved locally
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={3}
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: "none", lg: "block" } }}
            />
          }
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <DocumentEditor
              title={title}
              body={body}
              wordCount={wordCount}
              onTitleChange={setTitle}
              onBodyChange={setBody}
            />
          </Box>
          <Box sx={{ width: { xs: "100%", lg: 440 }, flexShrink: 0 }}>
            <AssistantPanel
              mode={mode}
              instruction={instruction}
              suggestion={suggestion}
              isGenerating={isGenerating}
              error={error}
              onModeChange={setMode}
              onInstructionChange={setInstruction}
              onGenerate={handleGenerate}
              onAccept={handleAccept}
              onReject={() => setSuggestion(null)}
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
