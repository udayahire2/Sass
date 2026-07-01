import {
  Dialog,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup } from "@/components/ui/radio-group";

import { SettingsSection } from "./SettingsSection";
import { PreferenceItem } from "./PreferenceItem";
import { ThemeCard } from "./ThemeCard";
import { ColorPicker } from "./ColorPicker";

import {
  PREFERENCES,
  THEMES,
  TEXT_COLORS,
} from "./constants";

import type { EditorSettingsDialogProps } from "./types";

export function EditorSettingsDialog({
  isOpen,
  onOpenChange,
  showWordCount,
  spellcheck,
  pasteImageLink,
  onPreferenceChange,
  editorTheme,
  onThemeChange,
  textColor,
  onTextColorChange,
}: EditorSettingsDialogProps) {

  const preferences: Record<string, boolean> = {
    showWordCount,
    spellcheck,
    pasteImageLink,
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogPopup className="max-w-lg">

        <DialogHeader>
          <DialogTitle>
            Editor Settings
          </DialogTitle>
        </DialogHeader>

        <DialogPanel className="space-y-8">

          <SettingsSection title="Preferences">
            <div className="space-y-2">
              {PREFERENCES.map((item) => (
                <PreferenceItem
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  checked={preferences[item.key]}
                  onChange={(value) =>
                    onPreferenceChange(item.key, value)
                  }
                />
              ))}
            </div>
          </SettingsSection>

          <SettingsSection title="Theme">
            <RadioGroup
              value={editorTheme}
              onValueChange={onThemeChange}
              className="grid grid-cols-2 gap-3"
            >
              {THEMES.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  {...theme}
                />
              ))}
            </RadioGroup>
          </SettingsSection>

          <SettingsSection title="Text Color">
            <RadioGroup
              value={textColor}
              onValueChange={onTextColorChange}
              className="flex gap-4"
            >
              {TEXT_COLORS.map((color) => (
                <ColorPicker
                  key={color.id}
                  id={color.id}
                  value={color.value}
                  className={color.className}
                  ring={color.ring}
                  isSelected={textColor === color.value}
                />
              ))}
            </RadioGroup>
          </SettingsSection>

        </DialogPanel>

      </DialogPopup>
    </Dialog>
  );
}