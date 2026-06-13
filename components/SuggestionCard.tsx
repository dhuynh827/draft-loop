"use client";

import { useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { SuggestionResponse } from "@/lib/types";

type SuggestionCardProps = {
  suggestion: SuggestionResponse;
  onAccept: (content: string) => void;
  onReject: () => void;
};

export function SuggestionCard({
  suggestion,
  onAccept,
  onReject
}: SuggestionCardProps) {
  const [draft, setDraft] = useState(suggestion.content);
  const canApply = suggestion.kind === "replacement";

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden"
      }}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography variant="subtitle1">Suggestion</Typography>
          <Chip
            size="small"
            label={suggestion.kind === "replacement" ? "Can apply" : "Feedback"}
          />
        </Stack>

        {suggestion.rationale ? (
          <Typography variant="body2" color="text.secondary">
            {suggestion.rationale}
          </Typography>
        ) : null}

        <TextField
          label={canApply ? "Editable output" : "Critique"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          fullWidth
          multiline
          minRows={8}
          slotProps={{
            input: {
              readOnly: !canApply
            }
          }}
        />
      </Stack>

      <Divider />

      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: "flex-end", p: 1.5 }}
      >
        <Button startIcon={<CloseIcon />} onClick={onReject}>
          Reject
        </Button>
        {canApply ? (
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() => onAccept(draft)}
          >
            Accept
          </Button>
        ) : (
          <Button variant="outlined" startIcon={<EditIcon />} disabled>
            Review only
          </Button>
        )}
      </Stack>
    </Box>
  );
}
