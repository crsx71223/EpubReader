import { beforeEach, describe, expect, it } from "@jest/globals";
import { useSettingsStore } from "./settingsStore";

const initialState = useSettingsStore.getState();

describe("settingsStore", () => {
  beforeEach(() => {
    useSettingsStore.setState(initialState, true);
  });

  it("starts with the default theme and font", () => {
    const state = useSettingsStore.getState();
    expect(state.isDarkMode).toBe(false);
    expect(state.currentFont).toBe("System");
  });

  it("toggleTheme flips isDarkMode on each call", () => {
    useSettingsStore.getState().toggleTheme();
    expect(useSettingsStore.getState().isDarkMode).toBe(true);

    useSettingsStore.getState().toggleTheme();
    expect(useSettingsStore.getState().isDarkMode).toBe(false);
  });

  it("setFont updates currentFont without changing isDarkMode", () => {
    const darkModeBefore = useSettingsStore.getState().isDarkMode;
    useSettingsStore.getState().setFont("Serif");

    expect(useSettingsStore.getState().currentFont).toBe("Serif");
    expect(useSettingsStore.getState().isDarkMode).toBe(darkModeBefore);
  });
});
