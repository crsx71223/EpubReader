import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Link, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Spacing } from "../constants/theme";
import { useSettingsStore } from "../store/settingsStore";

interface ReaderHeaderProps {
  title: string;
}

export default function ReaderHeader({ title }: ReaderHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useSettingsStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View
      style={[
        styles.customHeader,
        { paddingTop: insets.top, backgroundColor: theme.background },
      ]}
    >
      <TouchableOpacity
        onPress={handleBackPress}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        style={styles.headerButton}
      >
        <Ionicons name="chevron-back" size={28} color={theme.text} />
      </TouchableOpacity>

      <Text
        style={[styles.headerTitle, { color: theme.text }]}
        numberOfLines={1}
      >
        {title}
      </Text>

      <Link href="/settings" asChild>
        <TouchableOpacity
          onPress={handleSettingsPress}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          style={{ ...styles.headerButton, alignItems: "flex-end" }}
        >
          <Ionicons name="settings-outline" size={40} color={theme.text} />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
});
