import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { BorderRadius, Colors, Spacing, Typography } from "../constants/theme";
import { useSettingsStore } from "../store/settingsStore";

const AVAILABLE_FONTS = ["System", "Serif", "Monospace"];

export default function SettingsScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme, currentFont, setFont } = useSettingsStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const handleToggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  const handleSetFont = (font: string) => {
    if (font !== currentFont) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFont(font);
    }
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => router.back()}
      />

      <View style={[styles.sheet, { backgroundColor: theme.background }]}>
        <View style={styles.dragIndicator} />

        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={handleToggleTheme}
            trackColor={{ true: theme.primary }}
          />
        </View>

        <View
          style={[
            styles.card,
            styles.cardVertical,
            { backgroundColor: theme.surface },
          ]}
        >
          <Text
            style={[styles.label, styles.marginBottom, { color: theme.text }]}
          >
            Reader Font
          </Text>
          <View style={styles.fontRow}>
            {AVAILABLE_FONTS.map((font) => (
              <TouchableOpacity
                key={font}
                style={[
                  styles.fontButton,
                  { borderColor: theme.border },
                  currentFont === font && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => handleSetFont(font)}
              >
                <Text
                  style={[
                    styles.fontButtonText,
                    { color: theme.text },
                    currentFont === font && {
                      color: theme.textInverse,
                      fontWeight: Typography.weights.bold,
                    },
                  ]}
                >
                  {font}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#D7DBDF",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xl,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  cardVertical: { flexDirection: "column", alignItems: "flex-start" },
  label: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  marginBottom: { marginBottom: Spacing.lg },
  fontRow: { flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" },
  fontButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  fontButtonText: { fontSize: Typography.sizes.md },
});
