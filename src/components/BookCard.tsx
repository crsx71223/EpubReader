import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { Book, useBookStore } from "../store/bookStore";
import { useSettingsStore } from "../store/settingsStore";

type BookCardProps = Pick<Book, "title" | "author" | "coverUri" | "uri">;

export default function BookCard({
  title,
  author,
  coverUri,
  uri,
}: BookCardProps) {
  const router = useRouter();
  const setCurrentBook = useBookStore((state) => state.setCurrentBook);
  const { isDarkMode } = useSettingsStore();

  const theme = isDarkMode ? Colors.dark : Colors.light;
  const shadow = isDarkMode ? Shadows.dark.sm : Shadows.light.sm;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentBook(uri);
    router.push("/reader");
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface }, shadow]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {coverUri ? (
        <Image
          source={{ uri: coverUri }}
          style={[styles.cover, { backgroundColor: theme.border }]}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.coverPlaceholder,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <Text style={styles.placeholderIcon}>📖</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={3}>
          {title}
        </Text>
        {author && (
          <Text
            style={[styles.author, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
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
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  cover: { width: 60, height: 88, borderRadius: BorderRadius.sm },
  coverPlaceholder: {
    width: 60,
    height: 88,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: { fontSize: Typography.sizes.xxl },
  info: { flex: 1, gap: Spacing.xs },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.lineHeights.md,
  },
  author: { fontSize: Typography.sizes.sm },
});
