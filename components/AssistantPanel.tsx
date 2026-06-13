import SendIcon from "@mui/icons-material/Send";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ModeSelector } from "@/components/ModeSelector";
import { SuggestionCard } from "@/components/SuggestionCard";
import type { AiMode, SuggestionResponse } from "@/lib/types";

type AssistantPanelProps = {
  mode: AiMode;
  instruction: string;
  suggestion: SuggestionResponse | null;
  isGenerating: boolean;
  error: string | null;
  onModeChange: (mode: AiMode) => void;
  onInstructionChange: (instruction: string) => void;
  onGenerate: () => void;
  onAccept: (content: string) => void;
  onReject: () => void;
};

export function AssistantPanel({
  mode,
  instruction,
  suggestion,
  isGenerating,
  error,
  onModeChange,
  onInstructionChange,
  onGenerate,
  onAccept,
  onReject
}: AssistantPanelProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, position: "sticky", top: 24 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Assistant
          </Typography>
          <Typography variant="h6">Ask for a draft or review</Typography>
        </Box>

        <ModeSelector value={mode} onChange={onModeChange} />

        <TextField
          label="Instruction"
          value={instruction}
          onChange={(event) => onInstructionChange(event.target.value)}
          placeholder="Example: tighten the intro and call out unclear claims"
          fullWidth
          multiline
          minRows={4}
        />

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Button
          variant="contained"
          startIcon={isGenerating ? <CircularProgress size={18} /> : <SendIcon />}
          onClick={onGenerate}
          disabled={isGenerating || !instruction.trim()}
        >
          {isGenerating ? "Generating" : "Generate suggestion"}
        </Button>

        {suggestion ? (
          <SuggestionCard
            key={`${suggestion.kind}:${suggestion.content}`}
            suggestion={suggestion}
            onAccept={onAccept}
            onReject={onReject}
          />
        ) : null}
      </Stack>
    </Paper>
  );
}
