import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ErrorBoundary from "../components/ErrorBoundary";
import { Colors } from "../constants/theme";
import { useSettingsStore } from "../store/settingsStore";

export default function RootLayout() {
  const { isDarkMode } = useSettingsStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="index"
            options={{ headerShown: false, animation: "none" }}
          />

          <Stack.Screen
            name="reader"
            options={{ title: "Reader", animation: "none" }}
          />

          <Stack.Screen
            name="settings"
            options={{
              presentation: "transparentModal",
              animation: "fade",
              headerShown: false,
            }}
          />
        </Stack>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
