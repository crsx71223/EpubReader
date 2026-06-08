import { StyleSheet, Text, View } from "react-native";

interface BookCardProps {
  title: string;
  uri: string;
}

export default function BookCard({ title, uri }: BookCardProps) {
  return (
    <View style={styles.bookCard}>
      <Text style={styles.bookTitle}>{title}</Text>
      <Text style={styles.bookPath} numberOfLines={1} ellipsizeMode="middle">
        {uri}
      </Text>
    </View>
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
