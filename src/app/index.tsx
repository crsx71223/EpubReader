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
import { useBookStore } from "../store/bookStore";

export default function LibraryScreen() {
  const { books, isLoading, loadBooks } = useBookStore();

  useEffect(() => {
    loadBooks();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Library</Text>

      <Button title="Refresh Library" onPress={loadBooks} />

      {books.length === 0 ? (
        <Text style={styles.emptyText}>
          No books found. Add .epub files to the app folder.
        </Text>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookCard title={item.title} uri={item.uri} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  emptyText: { textAlign: "center", marginTop: 50, color: "gray" },
});
