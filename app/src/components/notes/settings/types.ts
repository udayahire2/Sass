export interface PreferenceItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface ThemeCardProps {
  id: string;
  value: string;
  label: string;
}

export interface ColorPickerProps {
  id: string;
  value: string;
  className: string;
  ring: string;
  isSelected: boolean;
}

export interface EditorSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  showWordCount: boolean;
  spellcheck: boolean;
  pasteImageLink: boolean;
  onPreferenceChange: (key: string, value: boolean) => void;
  editorTheme: string;
  onThemeChange: (theme: string) => void;
  textColor: string;
  onTextColorChange: (color: string) => void;
}
