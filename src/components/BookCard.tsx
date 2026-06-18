import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Spacing } from "../constants/theme";
import { Book, useBookStore } from "../store/bookStore";

type BookCardProps = Pick<Book, "title" | "author" | "coverUri" | "uri">;

export default function BookCard({
  title,
  author,
  coverUri,
  uri,
}: BookCardProps) {
  const router = useRouter();
  const setCurrentBook = useBookStore((state) => state.setCurrentBook);

  const handlePress = () => {
    setCurrentBook(uri);
    router.push("/reader");
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {coverUri ? (
        <Image
          source={{ uri: coverUri }}
          style={styles.cover}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text style={styles.placeholderIcon}>📖</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={3}>
          {title}
        </Text>
        {author && (
          <Text style={styles.author} numberOfLines={1}>
            {author}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    marginBottom: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.three,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cover: {
    width: 60,
    height: 88,
    borderRadius: 4,
    backgroundColor: Colors.light.border,
  },
  coverPlaceholder: {
    width: 60,
    height: 88,
    borderRadius: 4,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.light.text,
    lineHeight: 20,
  },
  author: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
});
