export const MarkdownPreviewStyle = {
  flex: 1,
  minHeight: 520,
  overflow: "auto",
  border: 1,
  borderColor: "divider",
  borderRadius: 1,
  p: 2.5,
  "& h1, & h2, & h3": {
    mt: 2.5,
    mb: 1
  },
  "& h1:first-of-type, & h2:first-of-type, & h3:first-of-type": {
    mt: 0
  },
  "& p": {
    my: 1.25
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
  },
  "& pre": {
    overflow: "auto",
    borderRadius: 1,
    bgcolor: "action.hover",
    p: 1.5
  },
  "& blockquote": {
    borderLeft: 3,
    borderColor: "divider",
    color: "text.secondary",
    ml: 0,
    pl: 2
  }
};
