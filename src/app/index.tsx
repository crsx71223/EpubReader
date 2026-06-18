import { useEffect } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BookCard from "../components/BookCard";
import { Colors, Spacing, Typography } from "../constants/theme";
import { useBookStore } from "../store/bookStore";
import { useSettingsStore } from "../store/settingsStore";

export default function LibraryScreen() {
  const { books, isLoading, loadBooks } = useBookStore();
  const { isDarkMode } = useSettingsStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
          renderItem={({ item }) => (
            <BookCard
              title={item.title}
              author={item.author}
              coverUri={item.coverUri}
              uri={item.uri}
            />
          )}
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
