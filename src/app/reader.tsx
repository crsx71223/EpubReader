import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { useBookStore } from "../store/bookStore";

export default function ReaderScreen() {
  const uri = useBookStore((state) => state.currentBookUri);
  const books = useBookStore((state) => state.books);
  const title = books.find((b) => b.uri === uri)?.title || "Reader";

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

  if (!uri) {
    return (
      <View style={styles.container}>
        <Text style={styles.fallbackText}>No book selected.</Text>
      </View>
    );
  }

  const isReady = htmlContent && base64Book;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title }} />

      {!isReady ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={(event) => {
            if (event.nativeEvent.data === "READY" && base64Book) {
              webViewRef.current?.postMessage(base64Book);
            }
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
  fallbackText: { textAlign: "center", marginTop: 50, color: "gray" },
});
