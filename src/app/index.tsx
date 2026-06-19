import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BookCard from "../components/BookCard";
import { Colors, Spacing, Typography } from "../constants/theme";
import { Book, useBookStore } from "../store/bookStore";
import { useSettingsStore } from "../store/settingsStore";

// Hardcoding the height prevents the FlatList from constantly recalculating layout
// metrics during rapid scrolling, which is a common cause of frame drops on older Androids.
const ITEM_HEIGHT = 128;

export default function LibraryScreen() {
  const { books, isLoading, loadBooks } = useBookStore();
  const { isDarkMode } = useSettingsStore();
  const insets = useSafeAreaInsets();

  const theme = isDarkMode ? Colors.dark : Colors.light;

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Wrapped in useCallback so the FlatList does not destroy and recreate
  // the render function reference on every single frame during scroll events.
  const renderItem = useCallback(
    ({ item }: { item: Book }) => (
      <BookCard
        title={item.title}
        author={item.author}
        coverUri={item.coverUri}
        uri={item.uri}
      />
    ),
    [],
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<Book> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        // Math.max guarantees the UI never clips under the notch on modern devices.
        {
          backgroundColor: theme.background,
          paddingTop: Math.max(insets.top, Spacing.lg),
        },
      ]}
    >
      <Text style={[styles.header, { color: theme.text }]}>My Library</Text>

      <Button
        title="Refresh Library"
        onPress={loadBooks}
        color={theme.primary}
      />

      {books.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          No books found. Add .epub files to the app folder.
        </Text>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          // Limits the initial memory footprint before the user starts interacting
          initialNumToRender={8}
          // Batches render cycles to prevent the JS thread from locking up
          maxToRenderPerBatch={8}
          // Keeps only 5 viewports worth of items in memory at a time
          windowSize={5}
          // Aggressively unmounts off-screen components to save RAM on heavy libraries
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    textAlign: "center",
    marginTop: Spacing.xxxl,
    fontSize: Typography.sizes.md,
  },
  listContent: { paddingBottom: Spacing.xxl, paddingTop: Spacing.md },
});
