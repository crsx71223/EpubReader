import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Component, ErrorInfo, ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BorderRadius, Colors, Spacing, Typography } from "../constants/theme";
import { useSettingsStore } from "../store/settingsStore";

interface Props {
  children: ReactNode;
  theme: typeof Colors.light | typeof Colors.dark;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught rendering error:", error, errorInfo);
  }

  private handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      const { theme } = this.props;

      return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={theme.danger}
            style={styles.icon}
          />
          <Text style={[styles.title, { color: theme.text }]}>
            Oops! Something went wrong.
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {this.state.error?.message ||
              "An unexpected error occurred while rendering the screen."}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={this.handleReset}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: theme.textInverse }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function ErrorBoundary({ children }: { children: ReactNode }) {
  const { isDarkMode } = useSettingsStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return <ErrorBoundaryInner theme={theme}>{children}</ErrorBoundaryInner>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  icon: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    textAlign: "center",
    marginBottom: Spacing.xxl,
    lineHeight: Typography.lineHeights.md,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  buttonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
});
