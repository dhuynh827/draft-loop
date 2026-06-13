import type { ReactNode } from "react";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ChecklistIcon from "@mui/icons-material/Checklist";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SummarizeIcon from "@mui/icons-material/Summarize";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import type { AiMode } from "@/lib/types";

type ModeSelectorProps = {
  value: AiMode;
  onChange: (mode: AiMode) => void;
};

const modes: Array<{
  value: AiMode;
  label: string;
  icon: ReactNode;
}> = [
  { value: "draft", label: "Draft", icon: <EditNoteIcon /> },
  { value: "rewrite", label: "Rewrite", icon: <AutoFixHighIcon /> },
  { value: "critique", label: "Critique", icon: <ChecklistIcon /> },
  { value: "summarize", label: "Summarize", icon: <SummarizeIcon /> }
];

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      fullWidth
      size="small"
      onChange={(_, nextValue: AiMode | null) => {
        if (nextValue) {
          onChange(nextValue);
        }
      }}
    >
      {modes.map((mode) => (
        <Tooltip title={mode.label} enterDelay={200} arrow>
          <ToggleButton key={mode.value} value={mode.value} aria-label={mode.label}>
            <span>{mode.icon}</span>
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
}
