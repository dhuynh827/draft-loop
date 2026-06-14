import { MarkdownPreviewStyle } from "@/lib/constants";
import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
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
import type { AiMode } from "@/lib/types";
import ReactMarkdown from "react-markdown";

type DocumentEditorProps = {
  title: string;
  body: string;
  wordCount: number;
  onTitleChange: (title: string) => void;
  onBodyChange: (body: string) => void;
  onSelectionMode: (mode: AiMode, selectedText: string) => void;
};

export function DocumentEditor({
  title,
  body,
  wordCount,
  onTitleChange,
  onBodyChange,
  onSelectionMode
}: DocumentEditorProps) {
  const [activeBodyTab, setActiveBodyTab] = useState<"preview" | "markdown">("preview");
  const [selectionMenu, setSelectionMenu] = useState<{
    mouseX: number;
    mouseY: number;
    text: string;
  } | null>(null);

  function openSelectionMenu(text: string, mouseX: number, mouseY: number) {
    const selectedText = text.trim();

    if (!selectedText) {
      return;
    }

    setSelectionMenu({
      mouseX,
      mouseY,
      text: selectedText
    });
  }

  function handlePreviewSelection(event: MouseEvent<HTMLElement>) {
    const selectedText = window.getSelection()?.toString() ?? "";
    openSelectionMenu(selectedText, event.clientX, event.clientY);
  }

  function handleMarkdownSelection(event: MouseEvent<HTMLTextAreaElement>) {
    const target = event.currentTarget;
    const selectedText = target.value.slice(target.selectionStart, target.selectionEnd);
    openSelectionMenu(selectedText, event.clientX, event.clientY);
  }

  function handleSelectionMode(mode: AiMode) {
    if (!selectionMenu) {
      return;
    }

    onSelectionMode(mode, selectionMenu.text);
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ justifyContent: "space-between" }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary">
            Document
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {wordCount} words
          </Typography>
        </Box>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <TextField
            label="Title"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            fullWidth
          />
          <Box
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              overflow: "hidden"
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
                component="textarea"
                aria-label="Document body markdown editor"
                value={body}
                onChange={(event) => onBodyChange(event.target.value)}
                onMouseUp={handleMarkdownSelection}
                placeholder="Start writing in Markdown, paste a draft, or ask the assistant to help create a first pass."
                sx={{
                  display: "block",
                  width: "100%",
                  minHeight: 520,
                  resize: "vertical",
                  border: 0,
                  color: "text.primary",
                  bgcolor: "background.paper",
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
