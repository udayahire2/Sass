import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium leading-none text-foreground/80 uppercase tracking-wider">
        {title}
      </h4>
      {children}
    </div>
  );
}
