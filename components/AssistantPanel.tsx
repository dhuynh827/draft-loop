import { forwardRef, useImperativeHandle, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ModeSelector } from "@/components/ModeSelector";
import { SuggestionCard } from "@/components/SuggestionCard";
import { modeLabels } from "@/lib/modeLabels";
import type { AiMode, SelectedContext, SuggestionResponse } from "@/lib/types";

type AssistantPanelProps = {
  mode: AiMode;
  instruction: string;
  selectedContext: SelectedContext | null;
  suggestion: SuggestionResponse | null;
  isGenerating: boolean;
  error: string | null;
  onModeChange: (mode: AiMode) => void;
  onInstructionChange: (instruction: string) => void;
  onClearSelectedText: () => void;
  onGenerate: () => void;
  onAccept: (content: string) => void;
  onReject: () => void;
};

export type AssistantPanelHandle = {
  focusInstruction: () => void;
};

export const AssistantPanel = forwardRef<AssistantPanelHandle, AssistantPanelProps>(
  function AssistantPanel(
    {
      mode,
      instruction,
      selectedContext,
      suggestion,
      isGenerating,
      error,
      onModeChange,
      onInstructionChange,
      onClearSelectedText,
      onGenerate,
      onAccept,
      onReject
    },
    ref
  ) {
    const labels = modeLabels[mode];
    const instructionRef = useRef<HTMLInputElement | null>(null);
    const hasPromptContext = Boolean(
      instruction.trim() || selectedContext?.text.trim()
    );

    useImperativeHandle(ref, () => ({
      focusInstruction() {
        instructionRef.current?.focus();
      }
    }));

    return (
      <Paper variant="outlined" sx={{ p: 2, position: "sticky", top: 24 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Assistant
            </Typography>
            <Typography variant="h6">{labels.assistantTitle}</Typography>
          </Box>

          <ModeSelector value={mode} onChange={onModeChange} />

          <TextField
            inputRef={instructionRef}
            label={selectedContext ? "Additional instruction" : "Instruction"}
            value={instruction}
            onChange={(event) => onInstructionChange(event.target.value)}
            placeholder={
              selectedContext
                ? "Optional: add direction for the selected text"
                : "Example: tighten the intro and call out unclear claims"
            }
            fullWidth
            multiline
            minRows={4}
          />

          {selectedContext ? (
            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                p: 1.25
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", mb: 0.75 }}
              >
                <Chip size="small" label="Selected Markdown context" />
                <Typography variant="caption" color="text.secondary">
                  {selectedContext.start}-{selectedContext.end}
                </Typography>
                <Button
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={onClearSelectedText}
                >
                  Clear
                </Button>
              </Stack>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 4,
                  whiteSpace: "pre-wrap"
                }}
              >
                {selectedContext.text}
              </Typography>
            </Box>
          ) : null}

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Button
            variant="contained"
            startIcon={isGenerating ? <CircularProgress size={18} /> : <SendIcon />}
            onClick={onGenerate}
            disabled={isGenerating || !hasPromptContext}
          >
            {isGenerating ? "Generating" : `${labels.action} suggestion`}
          </Button>

          {suggestion ? (
            <SuggestionCard
              key={`${suggestion.kind}:${suggestion.content}`}
              mode={mode}
              suggestion={suggestion}
              onAccept={onAccept}
              onReject={onReject}
            />
          ) : null}
        </Stack>
      </Paper>
    );
  }
);
