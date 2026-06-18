import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSettingsStore } from "../store/settingsStore";

const AVAILABLE_FONTS = ["System", "Serif", "Monospace"];

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme, currentFont, setFont } = useSettingsStore();

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Text style={[styles.title, isDarkMode && styles.textDark]}>
        Settings
      </Text>

      {/* Theme Toggle */}
      <View style={[styles.card, isDarkMode && styles.cardDark]}>
        <Text style={[styles.label, isDarkMode && styles.textDark]}>
          Dark Mode
        </Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>

      {/* Font Selection */}
      <View
        style={[
          styles.card,
          styles.cardVertical,
          isDarkMode && styles.cardDark,
        ]}
      >
        <Text
          style={[
            styles.label,
            styles.marginBottom,
            isDarkMode && styles.textDark,
          ]}
        >
          Reader Font
        </Text>
        <View style={styles.fontRow}>
          {AVAILABLE_FONTS.map((font) => (
            <TouchableOpacity
              key={font}
              style={[
                styles.fontButton,
                currentFont === font && styles.fontButtonActive,
                isDarkMode && currentFont !== font && styles.fontButtonDark,
              ]}
              onPress={() => setFont(font)}
            >
              <Text
                style={[
                  styles.fontButtonText,
                  currentFont === font && styles.fontButtonTextActive,
                  isDarkMode && currentFont !== font && styles.textDark,
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
  container: { flex: 1, padding: 20, backgroundColor: "#F2F2F7" },
  containerDark: { backgroundColor: "#000000" },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 24, color: "#000" },
  textDark: { color: "#FFFFFF" },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  cardVertical: { flexDirection: "column", alignItems: "flex-start" },
  cardDark: { backgroundColor: "#1C1C1E" },
  label: { fontSize: 16, fontWeight: "500", color: "#000" },
  marginBottom: { marginBottom: 16 },
  fontRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  fontButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D1D6",
  },
  fontButtonDark: { borderColor: "#3A3A3C" },
  fontButtonActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  fontButtonText: { color: "#000" },
  fontButtonTextActive: { color: "#FFF", fontWeight: "bold" },
});
