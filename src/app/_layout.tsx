import { Stack } from "expo-router";
import { Colors } from "../constants/theme";
import { useSettingsStore } from "../store/settingsStore";

export default function RootLayout() {
  const { isDarkMode } = useSettingsStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      {/* Library */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false, animation: "none" }}
      />

      {/* Reader */}
      <Stack.Screen
        name="reader"
        options={{ title: "Reader", animation: "none" }}
      />

      {/* Settings */}
      <Stack.Screen
        name="settings"
        options={{ title: "Settings", animation: "none" }}
      />
    </Stack>
  );
}
