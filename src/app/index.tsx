import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BookCard } from "@/components/BookCard";
import { Colors, Spacing } from "@/constants/theme";
import { pickAndSaveEpub } from "@/utils/fileSystem";

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  uri?: string; // Optional for now, but will be used for actual file paths later
}

const DUMMY_BOOKS: Book[] = [
  {
    id: "1",
    title: "Leviathan Wakes",
    author: "James S.A. Corey",
    cover: "https://picsum.photos/seed/leviathan/200/300",
  },
  {
    id: "2",
    title: "Calibans War",
    author: "James S.A. Corey",
    cover: "https://picsum.photos/seed/caliban/200/300",
  },
  {
    id: "3",
    title: "Abaddon's Gate",
    author: "James S.A. Corey",
    cover: "https://picsum.photos/seed/abaddon/200/300",
  },
  {
    id: "4",
    title: "Cibola Burn",
    author: "James S.A. Corey",
    cover: "https://picsum.photos/seed/cibola/200/300",
  },
  {
    id: "5",
    title: "Nemesis Games",
    author: "James S.A. Corey",
    cover: "https://picsum.photos/seed/nemesis/200/300",
  },
  {
    id: "6",
    title: "Babylon's Ashes",
    author: "James S.A. Corey",
    cover: "https://picsum.photos/seed/babylon/200/300",
  },
  {
    id: "7",
    title: "Persepolis Rising",
    author: "James S.A. Corey",
    cover: "https://picsum.photos/seed/persepolis/200/300",
  },
  {
    id: "8",
    title: "Tiamat's Wrath",
    author: "James S.A. Corey",
    cover: "https://picsum.photos/seed/tiamat/200/300",
  },
  {
    id: "9",
    title: "Leviathan Falls",
    author: "James S.A. Corey",
    cover: "https://picsum.photos/seed/leviathan/200/300",
  },
];

export default function LibraryScreen() {
  const router = useRouter();
  const theme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  // Initialize state with dummy books so the screen isn't empty
  const [books, setBooks] = useState<Book[]>(DUMMY_BOOKS);

  const handleAddBook = async () => {
    const newBook = await pickAndSaveEpub();
    if (newBook) {
      // Prepend the new book to the array so it shows up at the top
      setBooks((prevBooks) => [newBook, ...prevBooks]);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Search Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push("/menu")}
          style={styles.menuButton}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </Pressable>

        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search books..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Add Book Button */}
        <Pressable onPress={handleAddBook} style={styles.menuButton}>
          <Ionicons name="add" size={28} color={colors.text} />
        </Pressable>
      </View>

      {/* Book List */}
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <BookCard
            id={item.id}
            title={item.title}
            author={item.author}
            cover={item.cover}
            onPress={() => router.push(`/reader?id=${item.id}`)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  menuButton: {
    padding: Spacing.two,
    marginLeft: -Spacing.two,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
});
