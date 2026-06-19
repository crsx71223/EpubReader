import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import ReaderHeader from "../components/ReaderHeader";
import { Colors, Spacing, Typography } from "../constants/theme";
import { useBookStore } from "../store/bookStore";
import { useSettingsStore } from "../store/settingsStore";

export default function ReaderScreen() {
  const uri = useBookStore((state) => state.currentBookUri);
  const books = useBookStore((state) => state.books);
  const title = books.find((b) => b.uri === uri)?.title || "Reader";

  const { isDarkMode, currentFont } = useSettingsStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [base64Book, setBase64Book] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    async function loadHtml() {
      const [asset] = await Asset.loadAsync(
        require("../../assets/reader.html"),
      );
      const content = await FileSystem.readAsStringAsync(asset.localUri!);
      setHtmlContent(content);
    }
    loadHtml();
  }, []);

  useEffect(() => {
    async function loadBookData() {
      if (!uri) return;
      try {
        // EPUBs must be passed as Base64 because the WebView cannot directly
        // access the native file system paths reliably across both iOS and Android.
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setBase64Book(base64);
      } catch (error) {
        console.error("Failed to load book:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", "Could not load the book file.");
      }
    }
    loadBookData();
  }, [uri]);

  useEffect(() => {
    // This effect ensures that physical state changes (like switching to dark mode)
    // are instantly reflected in the DOM without requiring a full WebView reload.
    if (webViewRef.current) {
      const settingsPayload =
        "SETTINGS:" +
        JSON.stringify({
          isDarkMode,
          currentFont,
          colors: { text: theme.text, background: theme.background },
        });
      webViewRef.current.postMessage(settingsPayload);
    }
  }, [isDarkMode, currentFont, theme]);

  if (!uri) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.fallbackText, { color: theme.textSecondary }]}>
          No book selected.
        </Text>
      </View>
    );
  }

  // We gate the rendering of the WebView until BOTH the engine and the data exist.
  // Rendering the WebView prematurely causes epub.js to crash trying to mount null data.
  const isReady = htmlContent && base64Book;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ReaderHeader title={title} />

      {!isReady ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: htmlContent, baseUrl: "" }}
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          mixedContentMode="always"
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={(event) => {
            const data = event.nativeEvent.data;
            // The HTML DOM takes time to mount. We wait for this explicit READY ping
            // from the injected script to avoid sending the massive Base64 string into a void.
            if (data === "READY" && base64Book) {
              webViewRef.current?.postMessage("BOOK:" + base64Book);
              const initialSettings =
                "SETTINGS:" +
                JSON.stringify({
                  isDarkMode,
                  currentFont,
                  colors: { text: theme.text, background: theme.background },
                });
              webViewRef.current?.postMessage(initialSettings);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  webview: { flex: 1, backgroundColor: "transparent" },
  fallbackText: {
    textAlign: "center",
    marginTop: Spacing.xxxl,
    fontSize: Typography.sizes.md,
  },
});
