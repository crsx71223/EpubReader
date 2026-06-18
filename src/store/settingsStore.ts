import { create } from "zustand";

interface SettingsState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentFont: string;
  setFont: (font: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isDarkMode: false,
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  currentFont: "System",
  setFont: (font) => set({ currentFont: font }),
}));
