import { Colors, Spacing } from "@/constants/theme";
import { Image } from "expo-image";
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export interface BookCardProps {
  id: string;
  title: string;
  author: string;
  cover: string;
  onPress: () => void;
}

export function BookCard({ title, author, cover, onPress }: BookCardProps) {
  const theme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      {/* Left: Cover Image */}
      <View style={styles.imageShadow}>
        <Image
          source={{ uri: cover }}
          style={[styles.coverImage, { backgroundColor: colors.border }]}
          contentFit="cover"
          transition={200}
        />
      </View>

      {/* Right: Content Container */}
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text
            style={[styles.bookTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text
            style={[styles.bookAuthor, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {author}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    width: "100%",
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  imageShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  coverImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  contentContainer: {
    flex: 1,
    marginLeft: Spacing.four,
    justifyContent: "center",
  },
  header: {
    gap: 4,
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  bookAuthor: {
    fontSize: 14,
  },
});
