import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { Link, Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Colors, Spacing, Typography } from "../constants/theme";
import { useBookStore } from "../store/bookStore";
import { useSettingsStore } from "../store/settingsStore";

export default function ReaderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[
          styles.customHeader,
          {
            paddingTop: insets.top,
            backgroundColor: theme.background,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>

        <Text
          style={[styles.headerTitle, { color: theme.text }]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <Link href="/settings" asChild>
          <TouchableOpacity
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            style={{ ...styles.headerButton, alignItems: "flex-end" }}
          >
            <Ionicons name="settings-outline" size={40} color={theme.text} />
          </TouchableOpacity>
        </Link>
      </View>

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
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  webview: { flex: 1, backgroundColor: "transparent" },
  fallbackText: {
    textAlign: "center",
    marginTop: Spacing.xxxl,
    fontSize: Typography.sizes.md,
  },
});
