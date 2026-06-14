"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AssistantPanel, type AssistantPanelHandle } from "@/components/AssistantPanel";
import { DocumentEditor } from "@/components/DocumentEditor";
import type { AiMode, SelectedContext, SuggestionResponse } from "@/lib/types";
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
  const [selectedContext, setSelectedContext] = useState<SelectedContext | null>(null);
  const [suggestion, setSuggestion] = useState<SuggestionResponse | null>(null);
  const [pendingDocumentReplacement, setPendingDocumentReplacement] = useState<
    string | null
  >(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const assistantPanelRef = useRef<AssistantPanelHandle | null>(null);

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
          documentText: body,
          selectedText: selectedContext?.text || undefined
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
      if (mode === "summarize") {
        const summaryContent = content.trim().startsWith("#")
          ? content.trim()
          : `### Summary\n\n${content.trim()}`;

        setBody((currentBody) =>
          currentBody.trim()
            ? `${currentBody.trimEnd()}\n\n${summaryContent}`
            : summaryContent
        );
        setSelectedContext(null);
        setSuggestion(null);
        setInstruction("");
        return;
      }

      if (selectedContext) {
        const currentSelection = body.slice(selectedContext.start, selectedContext.end);

        if (currentSelection !== selectedContext.text) {
          setError(
            "The selected Markdown context changed. Clear the context and select the text again."
          );
          return;
        }

        setBody(
          body.slice(0, selectedContext.start) +
            content +
            body.slice(selectedContext.end)
        );
        setSelectedContext(null);
      } else {
        setPendingDocumentReplacement(content);
        return;
      }
    }

    setSuggestion(null);
    setInstruction("");
  }

  function handleConfirmDocumentReplacement() {
    if (!pendingDocumentReplacement) {
      return;
    }

    setBody(pendingDocumentReplacement);
    setPendingDocumentReplacement(null);
    setSuggestion(null);
    setInstruction("");
  }

  function handleCancelDocumentReplacement() {
    setPendingDocumentReplacement(null);
  }

  function handleRejectSuggestion() {
    setSuggestion(null);
    setSelectedContext(null);
    setInstruction("");
  }

  function handleClearSelectedContext() {
    setSelectedContext(null);
    setSuggestion(null);
  }

  function handleSelectionMode(nextMode: AiMode, nextSelectedContext: SelectedContext) {
    setMode(nextMode);
    setSelectedContext(nextSelectedContext);
    setSuggestion(null);
    setError(null);

    window.requestAnimationFrame(() => {
      assistantPanelRef.current?.focusInstruction();
    });
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
              selectedContext={selectedContext}
              onSelectionMode={handleSelectionMode}
            />
          </Box>
          <Box sx={{ width: { xs: "100%", lg: 440 }, flexShrink: 0 }}>
            <AssistantPanel
              ref={assistantPanelRef}
              mode={mode}
              instruction={instruction}
              selectedContext={selectedContext}
              suggestion={suggestion}
              isGenerating={isGenerating}
              error={error}
              onModeChange={setMode}
              onInstructionChange={setInstruction}
              onClearSelectedText={handleClearSelectedContext}
              onGenerate={handleGenerate}
              onAccept={handleAccept}
              onReject={handleRejectSuggestion}
            />
          </Box>
        </Stack>
      </Container>
      <Dialog
        open={Boolean(pendingDocumentReplacement)}
        onClose={handleCancelDocumentReplacement}
        aria-labelledby="replace-document-dialog-title"
        aria-describedby="replace-document-dialog-description"
      >
        <DialogTitle id="replace-document-dialog-title">
          Replace entire document?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="replace-document-dialog-description">
            No selected Markdown context is active, so applying this suggestion will
            replace the full document. This cannot be undone from the app.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDocumentReplacement}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleConfirmDocumentReplacement}
          >
            Replace document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
