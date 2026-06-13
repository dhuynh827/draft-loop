import { MarkdownPreviewStyle } from "@/lib/constants";
import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ReactMarkdown from "react-markdown";

type DocumentEditorProps = {
  title: string;
  body: string;
  wordCount: number;
  onTitleChange: (title: string) => void;
  onBodyChange: (body: string) => void;
};

export function DocumentEditor({
  title,
  body,
  wordCount,
  onTitleChange,
  onBodyChange
}: DocumentEditorProps) {
  const [activeBodyTab, setActiveBodyTab] = useState<"preview" | "markdown">("preview");

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
    </Stack>
  );
}
