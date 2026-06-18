import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
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
