import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useBookStore } from "../store/bookStore";

interface BookCardProps {
  title: string;
  uri: string;
}

export default function BookCard({ title, uri }: BookCardProps) {
  const router = useRouter();
  const setCurrentBook = useBookStore((state) => state.setCurrentBook);

  const handlePress = () => {
    setCurrentBook(uri);
    router.push("/reader");
  };

  return (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.bookTitle}>{title}</Text>
      <Text style={styles.bookPath} numberOfLines={1} ellipsizeMode="middle">
        {uri}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bookCard: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
    borderRadius: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  bookPath: {
    fontSize: 12,
    color: "gray",
    marginTop: 4,
  },
});
