import { afterAll, beforeAll, describe, expect, it, jest } from "@jest/globals";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Text } from "react-native";
import ErrorBoundary from "./ErrorBoundary";

// Resolve the "process.env.EXPO_OS is not defined" warning
process.env.EXPO_OS = "ios";

// Mock the native haptics module to prevent crashes in the test environment
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
}));

// Mock the Zustand store to provide a predictable theme state
jest.mock("../store/settingsStore", () => ({
  useSettingsStore: () => ({ isDarkMode: false }),
}));

// @ts-ignore - Bypassing strict type checking to prevent Babel parsing crash
const ProblemChild = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error("Simulated rendering failure");
  }
  return <Text>Normal Content</Text>;
};

describe("ErrorBoundary", () => {
  // Prevent React's intentional error boundaries from cluttering the test console output
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("renders children correctly when no error is thrown", async () => {
    await render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Normal Content")).toBeTruthy();
    expect(screen.queryByText("Oops! Something went wrong.")).toBeNull();
  });

  it("catches rendering errors and displays the fallback UI", async () => {
    await render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Oops! Something went wrong.")).toBeTruthy();
    expect(screen.getByText("Simulated rendering failure")).toBeTruthy();
    expect(screen.queryByText("Normal Content")).toBeNull();
  });

  it("resets the error state and attempts to render children when 'Try Again' is pressed", async () => {
    const { rerender } = await render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Verify the fallback is currently displayed
    expect(screen.getByText("Oops! Something went wrong.")).toBeTruthy();

    // Rerender the tree with the repaired component that will no longer throw
    await rerender(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>,
    );

    // Press the recovery button
    const retryButton = screen.getByText("Try Again");
    fireEvent.press(retryButton);

    // Wait for React to process the state update and re-render the DOM
    await waitFor(() => {
      expect(screen.queryByText("Oops! Something went wrong.")).toBeNull();
      expect(screen.getByText("Normal Content")).toBeTruthy();
    });
  });
});
