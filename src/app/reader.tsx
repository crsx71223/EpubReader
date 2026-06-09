import * as FileSystem from "expo-file-system/legacy";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { EPUB_HTML_TEMPLATE } from "../constants/epubTemplate";

export default function ReaderScreen() {
  const { uri, title } = useLocalSearchParams<{ uri: string; title: string }>();
  const [base64Book, setBase64Book] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    async function loadBookData() {
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

    if (uri) {
      loadBookData();
    }
  }, [uri]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: title || "Reader" }} />

      {!base64Book ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: EPUB_HTML_TEMPLATE }}
          style={styles.webview}
          onLoadEnd={() => {
            webViewRef.current?.postMessage(base64Book);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  webview: { flex: 1 },
});
