import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { BorderRadius, Colors, Spacing, Typography } from "../constants/theme";
import { useSettingsStore } from "../store/settingsStore";

const AVAILABLE_FONTS = ["System", "Serif", "Monospace"];

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme, currentFont, setFont } = useSettingsStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      {/* Theme Toggle */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ true: theme.primary }}
        />
      </View>

      {/* Font Selection */}
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
              onPress={() => setFont(font)}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.xl },
  title: {
    fontSize: Typography.sizes.xxxl,
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
