import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";

// Define the permanent storage location
const BOOKS_DIR = new Directory(Paths.document, "epubs");

export function ensureDirExists() {
  // Folder existence checks and creation are now synchronous
  if (!BOOKS_DIR.exists) {
    BOOKS_DIR.create({ intermediates: true });
  }
}

export async function pickAndSaveEpub() {
  try {
    // Open the device file picker looking for EPUBs
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/epub+zip", "application/epub"],
      copyToCacheDirectory: true,
    });

    // Handle cancellation
    if (result.canceled) return null;

    const fileAsset = result.assets[0];

    // Prepare the permanent storage directory
    ensureDirExists();

    // Construct the permanent file reference
    const filename = fileAsset.name || `book_${Date.now()}.epub`;
    const destFile = new File(BOOKS_DIR, filename);

    // Copy the file from the temporary cache to permanent storage
    const sourceFile = new File(fileAsset.uri);
    await sourceFile.copy(destFile);

    // Return a structured object representing the new book
    return {
      id: destFile.uri, // Using the unique path as the ID
      title: fileAsset.name.replace(".epub", ""),
      author: "Unknown Author", // Will be parsed from the EPUB metadata later
      cover: "https://picsum.photos/200/300", // Placeholder cover
      uri: destFile.uri,
    };
  } catch (error) {
    console.error("Failed to pick or save EPUB:", error);
    return null;
  }
}
