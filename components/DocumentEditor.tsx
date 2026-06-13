import { MarkdownPreviewStyle } from "@/lib/constants";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
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
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ minHeight: 520 }}
          >
            <Box
              component="textarea"
              aria-label="Document body markdown editor"
              value={body}
              onChange={(event) => onBodyChange(event.target.value)}
              placeholder="Start writing in Markdown, paste a draft, or ask the assistant to help create a first pass."
              sx={{
                flex: 1,
                minHeight: 520,
                resize: "vertical",
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                color: "text.primary",
                bgcolor: "background.paper",
                font: "inherit",
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                lineHeight: 1.6,
                p: 2,
                "&:focus": {
                  borderColor: "primary.main",
                  outline: "2px solid",
                  outlineColor: "primary.light"
                }
              }}
            />
            <Box
              aria-label="Document body markdown preview"
              sx={MarkdownPreviewStyle}
            >
              {body.trim() ? (
                <ReactMarkdown>{body}</ReactMarkdown>
              ) : (
                <Typography color="text.secondary">
                  Markdown preview will appear here.
                </Typography>
              )}
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
