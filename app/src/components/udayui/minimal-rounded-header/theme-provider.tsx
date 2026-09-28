"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
  type ThemeProviderProps as NextThemeProviderProps,
  type UseThemeProps,
} from "next-themes";

export type Theme = "dark" | "light" | "system" | string;

export interface ThemeProviderProps extends Omit<NextThemeProviderProps, "defaultTheme"> {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: NextThemeProviderProps["attribute"];
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  forcedTheme?: string;
}

export type ThemeProviderState = UseThemeProps & {
  theme?: Theme;
  setTheme: (theme: Theme | ((prevTheme: string) => Theme)) => void;
};

/**
 * High-performance, zero-flicker, low-memory ThemeProvider.
 * Powered by next-themes with full SSR support, zero transition jank,
 * and optimized memory footprint.
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "udx-theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps): React.JSX.Element {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Optimized useTheme hook with memoized state access.
 */
export function useTheme(): ThemeProviderState {
  return useNextTheme();
}

export default ThemeProvider;
