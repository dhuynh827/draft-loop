import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

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
          <TextField
            label="Body"
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
            placeholder="Start writing, paste a draft, or ask the assistant to help create a first pass."
            fullWidth
            multiline
            minRows={22}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
