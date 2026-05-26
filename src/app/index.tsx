import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function LibraryScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Library Screen</Text>

      <Button title="Open Reader" onPress={() => router.push("/reader")} />
      <Button title="Open Settings" onPress={() => router.push("/settings")} />
      <Button title="Open Menu" onPress={() => router.push("/menu")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3E5D8",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
