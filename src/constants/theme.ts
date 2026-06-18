import { Platform, ViewStyle } from "react-native";

export const Colors = {
  light: {
    // Backgrounds
    background: "#F2F4F7",
    surface: "#FFFFFF",
    surfaceSecondary: "#F8F9FA",

    // Text
    text: "#11181C",
    textSecondary: "#687076",
    textInverse: "#FFFFFF",

    // Borders & Dividers
    border: "#D7DBDF",

    // Semantic & Brand
    primary: "#007AFF",
    primaryMuted: "#E5F0FF",
    success: "#34C759",
    danger: "#FF3B30",
    warning: "#FF9500",
  },
  dark: {
    // Backgrounds
    background: "#000000",
    surface: "#1C1C1E",
    surfaceSecondary: "#2C2C2E",

    // Text
    text: "#F2F2F7",
    textSecondary: "#EBEBF599", // iOS dark mode secondary text standard
    textInverse: "#11181C",

    // Borders & Dividers
    border: "#38383A",

    // Semantic & Brand
    primary: "#0A84FF",
    primaryMuted: "#002E5C",
    success: "#32D74B",
    danger: "#FF453A",
    warning: "#FF9F0A",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 28,
    xxl: 32,
    xxxl: 40,
  },
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
} as const;

export const Shadows = {
  light: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    } as ViewStyle,
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    } as ViewStyle,
  },
  dark: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    } as ViewStyle,
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    } as ViewStyle,
  },
};

export const Layout = {
  BottomTabInset: Platform.select({ ios: 50, android: 80 }) ?? 0,
  MaxContentWidth: 800,
};
