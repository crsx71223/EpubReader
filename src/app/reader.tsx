import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { Link, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
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
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setBase64Book(base64);
      } catch (error) {
        console.error("Failed to load book:", error);
        Alert.alert("Error", "Could not load the book file.");
      }
    }
    loadBookData();
  }, [uri]);

  useEffect(() => {
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

  const isReady = htmlContent && base64Book;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: title,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerRight: () => (
            <Link href="/settings" asChild>
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="settings-outline"
                  size={40}
                  color={theme.text}
                  style={{ marginRight: Spacing.lg }}
                />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />

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
            } else if (data.startsWith("LOG:")) {
              console.log("[WebView Console] ->", data.substring(4));
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
