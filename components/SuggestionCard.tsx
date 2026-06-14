"use client";

import { useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { AiMode, SuggestionResponse } from "@/lib/types";
import ReactMarkdown from "react-markdown";

type SuggestionCardProps = {
  mode?: AiMode;
  suggestion?: SuggestionResponse;
  onAccept: (content: string) => void;
  onReject: () => void;
};

export function SuggestionCard({
  mode = "draft",
  suggestion,
  onAccept,
  onReject
}: SuggestionCardProps) {
  const [previewDraft, setPreviewDraft] = useState(suggestion?.content ?? "");
  const [draft, setDraft] = useState(suggestion?.content ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const canApply = suggestion?.kind === "replacement";
  const canEdit = mode !== "critique";
  const isDraftEmpty = draft.trim().length === 0;

  if (!suggestion) {
    return;
  }

  function handleEdit() {
    setDraft(previewDraft);
    setIsEditing(true);
  }

  function handleDiscard() {
    setDraft(previewDraft);
    setIsEditing(false);
  }

  function handleUpdate() {
    if (isDraftEmpty) {
      return;
    }

    setPreviewDraft(draft);
    setIsEditing(false);
  }

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

        {isEditing ? (
          <Stack spacing={0.75}>
            <Box
              component="textarea"
              aria-label="Edit suggestion markdown"
              aria-invalid={isDraftEmpty}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              sx={{
                display: "block",
                width: "100%",
                minHeight: 240,
                resize: "vertical",
                border: 1,
                borderColor: isDraftEmpty ? "error.main" : "divider",
                borderRadius: 1,
                color: "text.primary",
                bgcolor: "background.paper",
                font: "inherit",
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                lineHeight: 1.6,
                p: 1.5,
                "&:focus": {
                  borderColor: isDraftEmpty ? "error.main" : "primary.main",
                  outline: "2px solid",
                  outlineColor: isDraftEmpty ? "error.light" : "primary.light"
                }
              }}
            />
            {isDraftEmpty ? (
              <Typography variant="caption" color="error">
                Suggestion cannot be empty.
              </Typography>
            ) : null}
          </Stack>
        ) : (
          <Box
            sx={{
              "& h1, & h2, & h3": {
                mt: 2,
                mb: 1
              },
              "& h1:first-of-type, & h2:first-of-type, & h3:first-of-type": {
                mt: 0
              },
              "& p": {
                my: 1
              },
              "& ul, & ol": {
                pl: 3
              },
              "& code": {
                borderRadius: 0.75,
                bgcolor: "action.hover",
                px: 0.5,
                py: 0.25,
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'
              }
            }}
          >
            <ReactMarkdown>{previewDraft}</ReactMarkdown>
          </Box>
        )}
      </Stack>

      <Divider />

      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", p: 1.5 }}>
        {isEditing ? (
          <Button startIcon={<UndoIcon />} onClick={handleDiscard}>
            Discard
          </Button>
        ) : (
          <Button startIcon={<CloseIcon />} onClick={onReject}>
            Reject
          </Button>
        )}
        {canEdit ? (
          isEditing ? (
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={handleUpdate}
              disabled={isDraftEmpty}
            >
              Update
            </Button>
          ) : (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit}>
              Edit
            </Button>
          )
        ) : null}
        {canApply && !isEditing ? (
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() => onAccept(previewDraft)}
          >
            Accept
          </Button>
        ) : null}
        {!canApply ? (
          <Button variant="outlined" startIcon={<EditIcon />} disabled>
            Review only
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}
