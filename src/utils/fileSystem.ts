import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

const ANDROID_FOLDER_KEY = "android_library_folder";

export async function getLibraryFiles() {
  try {
    let targetDirectory = "";

    // iOS: Read the exposed document directory
    if (Platform.OS === "ios") {
      targetDirectory = FileSystem.documentDirectory || "";
      if (!targetDirectory) return [];
    }

    // Android: Storage Access Framework
    else if (Platform.OS === "android") {
      const savedUri = await AsyncStorage.getItem(ANDROID_FOLDER_KEY);

      if (savedUri) {
        targetDirectory = savedUri;
      } else {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permissions.granted) {
          return [];
        }

        targetDirectory = permissions.directoryUri;
        await AsyncStorage.setItem(ANDROID_FOLDER_KEY, targetDirectory);
      }
    }

    // Read directory and filter EPUBs
    let allFiles: string[] = [];

    if (Platform.OS === "android") {
      allFiles =
        await FileSystem.StorageAccessFramework.readDirectoryAsync(
          targetDirectory,
        );
    } else {
      allFiles = await FileSystem.readDirectoryAsync(targetDirectory);
    }

    const epubs = allFiles
      .filter((fileName) => fileName.endsWith(".epub"))
      .map((fileUri) => {
        const fullUri =
          Platform.OS === "android" ? fileUri : targetDirectory + fileUri;
        const titleMatch =
          fileUri.split("/").pop()?.replace(".epub", "") || "Unknown Title";

        return {
          id: fullUri,
          title: decodeURIComponent(titleMatch),
          uri: fullUri,
        };
      });

    return epubs;
  } catch (error) {
    console.error("Failed to read library directory:", error);
    return [];
  }
}
