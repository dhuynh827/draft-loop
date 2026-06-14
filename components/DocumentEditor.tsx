import { MarkdownPreviewStyle } from "@/lib/constants";
import type { MouseEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import ChecklistIcon from "@mui/icons-material/Checklist";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SummarizeIcon from "@mui/icons-material/Summarize";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { modeLabels } from "@/lib/modeLabels";
import type { AiMode, SelectedContext } from "@/lib/types";
import ReactMarkdown from "react-markdown";

type DocumentEditorProps = {
  title: string;
  body: string;
  wordCount: number;
  onTitleChange: (title: string) => void;
  onBodyChange: (body: string) => void;
  selectedContext: SelectedContext | null;
  onSelectionMode: (mode: AiMode, selectedContext: SelectedContext) => void;
};

export function DocumentEditor({
  title,
  body,
  wordCount,
  onTitleChange,
  onBodyChange,
  selectedContext,
  onSelectionMode
}: DocumentEditorProps) {
  const [activeBodyTab, setActiveBodyTab] = useState<"preview" | "markdown">("preview");
  const [selectionMenu, setSelectionMenu] = useState<{
    mouseX: number;
    mouseY: number;
    context: SelectedContext;
  } | null>(null);
  const [previewSelectionError, setPreviewSelectionError] = useState<string | null>(
    null
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingTextareaSelectionRef = useRef<SelectedContext | null>(null);

  useEffect(() => {
    const pendingSelection = pendingTextareaSelectionRef.current;

    if (!pendingSelection || activeBodyTab !== "markdown") {
      return;
    }

    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.focus();
    textarea.setSelectionRange(pendingSelection.start, pendingSelection.end);
    pendingTextareaSelectionRef.current = null;
  }, [activeBodyTab]);

  useEffect(() => {
    if (selectedContext) {
      return;
    }

    pendingTextareaSelectionRef.current = null;
    setSelectionMenu(null);
    setPreviewSelectionError(null);
    setActiveBodyTab("preview");
  }, [selectedContext]);

  function openSelectionMenu(context: SelectedContext, mouseX: number, mouseY: number) {
    if (!context.text.trim()) {
      return;
    }

    setSelectionMenu({ mouseX, mouseY, context });
  }

  function handlePreviewSelection(event: MouseEvent<HTMLElement>) {
    if (selectedContext) {
      return;
    }

    const selectedText = window.getSelection()?.toString().trim() ?? "";

    if (!selectedText) {
      return;
    }

    const start = body.indexOf(selectedText);
    const lastMatch = body.lastIndexOf(selectedText);

    if (start === -1) {
      setPreviewSelectionError(
        "That preview selection could not be found in the raw Markdown. Select from the Markdown tab instead."
      );
      return;
    }

    if (start !== lastMatch) {
      setPreviewSelectionError(
        "That preview selection appears more than once in the raw Markdown. Select the exact text from the Markdown tab instead."
      );
      return;
    }

    const context = {
      text: selectedText,
      start,
      end: start + selectedText.length
    };

    setPreviewSelectionError(null);
    openSelectionMenu(context, event.clientX, event.clientY);
  }

  function handleMarkdownSelection(event: MouseEvent<HTMLTextAreaElement>) {
    if (selectedContext) {
      return;
    }

    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const selectedText = target.value.slice(start, end);

    setPreviewSelectionError(null);
    openSelectionMenu(
      {
        text: selectedText,
        start,
        end
      },
      event.clientX,
      event.clientY
    );
  }

  function handleSelectionMode(mode: AiMode) {
    if (!selectionMenu) {
      return;
    }

    pendingTextareaSelectionRef.current = selectionMenu.context;
    setActiveBodyTab("markdown");
    onSelectionMode(mode, selectionMenu.context);
    setSelectionMenu(null);
  }

  const contextModes: Array<{
    mode: AiMode;
    icon: ReactNode;
  }> = [
    { mode: "draft", icon: <EditNoteIcon fontSize="small" /> },
    { mode: "rewrite", icon: <AutoFixHighIcon fontSize="small" /> },
    { mode: "critique", icon: <ChecklistIcon fontSize="small" /> },
    { mode: "summarize", icon: <SummarizeIcon fontSize="small" /> }
  ];

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <TextField
            label="Title"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            fullWidth
            disabled={Boolean(selectedContext)}
          />
          {selectedContext ? (
            <Box
              sx={{
                border: 1,
                borderColor: "warning.main",
                borderRadius: 1,
                bgcolor: "warning.light",
                color: "warning.contrastText",
                p: 1.25
              }}
            >
              <Typography variant="body2">
                Document editing is locked while selected Markdown context is active.
                Clear the selected context to edit the document.
              </Typography>
            </Box>
          ) : null}
          {previewSelectionError ? (
            <Alert severity="warning" onClose={() => setPreviewSelectionError(null)}>
              {previewSelectionError}
            </Alert>
          ) : null}
          <Box
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              overflow: "auto"
            }}
          >
            <Tabs
              value={activeBodyTab}
              onChange={(_, value: "preview" | "markdown") => setActiveBodyTab(value)}
              aria-label="Document body view"
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                minHeight: 44,
                "& .MuiTab-root": {
                  minHeight: 44
                }
              }}
            >
              <Tab label="Preview" value="preview" />
              <Tab label="Markdown" value="markdown" />
            </Tabs>

            {activeBodyTab === "preview" ? (
              <Box
                aria-label="Document body markdown preview"
                onMouseUp={handlePreviewSelection}
                sx={{
                  ...MarkdownPreviewStyle,
                  border: 0,
                  borderRadius: 0
                }}
              >
                {body.trim() ? (
                  <ReactMarkdown>{body}</ReactMarkdown>
                ) : (
                  <Typography color="text.secondary">
                    Markdown preview will appear here.
                  </Typography>
                )}
              </Box>
            ) : (
              <Box
                ref={textareaRef}
                component="textarea"
                aria-label="Document body markdown editor"
                value={body}
                onChange={(event) => onBodyChange(event.target.value)}
                onMouseUp={handleMarkdownSelection}
                readOnly={Boolean(selectedContext)}
                placeholder="Start writing in Markdown, paste a draft, or ask the assistant to help create a first pass."
                sx={{
                  display: "block",
                  width: "100%",
                  minHeight: 520,
                  resize: "vertical",
                  border: 0,
                  color: selectedContext ? "text.secondary" : "text.primary",
                  bgcolor: selectedContext ? "action.hover" : "background.paper",
                  font: "inherit",
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                  lineHeight: 1.6,
                  p: 2,
                  "&:focus": {
                    outline: "2px solid",
                    outlineColor: "primary.light",
                    outlineOffset: -2
                  }
                }}
              />
            )}
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{
              justifyContent: "flex-end",
              alignItems: "center"
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                {wordCount} words
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>
      <Menu
        open={Boolean(selectionMenu)}
        onClose={() => setSelectionMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          selectionMenu
            ? { top: selectionMenu.mouseY + 8, left: selectionMenu.mouseX }
            : undefined
        }
      >
        {contextModes.map(({ mode, icon }) => (
          <MenuItem key={mode} onClick={() => handleSelectionMode(mode)}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{modeLabels[mode].action} selected text</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
}
