import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { extractEpubMetadata } from "./epubMetadata";

const ANDROID_FOLDER_KEY = "android_library_folder";

export async function getLibraryFiles() {
  try {
    let targetDirectory = "";

    if (Platform.OS === "ios") {
      targetDirectory = FileSystem.documentDirectory ?? "";
      if (!targetDirectory) return [];
    } else if (Platform.OS === "android") {
      const savedUri = await AsyncStorage.getItem(ANDROID_FOLDER_KEY);

      if (savedUri) {
        targetDirectory = savedUri;
      } else {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permissions.granted) return [];

        targetDirectory = permissions.directoryUri;
        await AsyncStorage.setItem(ANDROID_FOLDER_KEY, targetDirectory);
      }
    }

    const allFiles =
      Platform.OS === "android"
        ? await FileSystem.StorageAccessFramework.readDirectoryAsync(
            targetDirectory,
          )
        : await FileSystem.readDirectoryAsync(targetDirectory);

    const epubUris = allFiles
      .filter((f) => f.toLowerCase().endsWith(".epub"))
      .map((fileUri) =>
        Platform.OS === "android" ? fileUri : targetDirectory + fileUri,
      );

    const books = await Promise.all(
      epubUris.map(async (uri) => {
        const fallbackTitle = decodeURIComponent(
          uri
            .split("/")
            .pop()
            ?.replace(/\.epub$/i, "") ?? "Unknown",
        );
        const metadata = await extractEpubMetadata(uri, fallbackTitle);
        return { id: uri, uri, ...metadata };
      }),
    );

    return books;
  } catch (error) {
    console.error("Failed to read library directory:", error);
    return [];
  }
}
