"use client";

import { useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { modeLabels } from "@/lib/modeLabels";
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
  const [hasCopied, setHasCopied] = useState(false);
  const canAccept =
    suggestion?.kind === "replacement" || suggestion?.kind === "critique";
  const canReject = suggestion?.kind === "replacement";
  const canEdit = canAccept;
  const acceptLabel =
    mode === "summarize" || suggestion?.kind === "critique"
      ? "Append to document"
      : "Apply to document";
  const statusLabel = isEditing
    ? "Editing"
    : mode === "summarize" || suggestion?.kind === "critique"
      ? "Ready to append"
      : canAccept
        ? "Ready to apply"
        : "Review only";
  const isDraftEmpty = draft.trim().length === 0;
  const hasDraftChanged = draft !== previewDraft;
  const labels = modeLabels[mode];

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
    if (isDraftEmpty || !hasDraftChanged) {
      return;
    }

    setPreviewDraft(draft);
    setIsEditing(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(previewDraft);
    setHasCopied(true);
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
      <Stack spacing={1.5} sx={{ p: 1.75 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography variant="subtitle1">{labels.suggestionTitle}</Typography>
          <Chip
            size="small"
            label={statusLabel}
            color={isEditing ? "primary" : "default"}
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

      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", p: 1.25 }}>
        {isEditing ? (
          <Button startIcon={<UndoIcon />} onClick={handleDiscard}>
            Discard
          </Button>
        ) : canReject ? (
          <Button startIcon={<CloseIcon />} onClick={onReject}>
            Reject
          </Button>
        ) : null}
        {!canAccept ? (
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
          >
            {hasCopied ? "Copied" : "Copy"}
          </Button>
        ) : null}
        {canEdit ? (
          isEditing ? (
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={handleUpdate}
              disabled={isDraftEmpty || !hasDraftChanged}
            >
              Update
            </Button>
          ) : (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit}>
              Edit
            </Button>
          )
        ) : null}
        {canAccept && !isEditing ? (
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() => onAccept(previewDraft)}
          >
            {acceptLabel}
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}
