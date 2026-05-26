import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* Library */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Reader */}
      <Stack.Screen name="reader" options={{ title: "Reader" }} />

      {/* Settings */}
      <Stack.Screen name="settings" options={{ title: "Settings" }} />

      {/* Menu */}
      <Stack.Screen
        name="menu"
        options={{ presentation: "modal", title: "Menu" }}
      />
    </Stack>
  );
}
