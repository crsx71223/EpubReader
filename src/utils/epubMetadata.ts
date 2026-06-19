import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import JSZip from "jszip";

export interface BookMetadata {
  title: string;
  author: string | null;
  coverUri: string | null;
}

// CACHE_VERSION is crucial for cache invalidation. If the extraction logic
// is updated in a future app version (e.g., to support a new EPUB standard),
// bumping this number forces the app to re-parse the EPUBs rather than crashing
// on outdated cache schemas.
const CACHE_VERSION = 4;
const CACHE_PREFIX = "epub_meta:";
const COVERS_DIR = `${FileSystem.cacheDirectory}epub-covers/`;

// We use manual regex extraction instead of a heavy DOM parser because React Native
// lacks a built-in DOM environment. Importing a full XML parsing library (like xmldom)
// would unnecessarily bloat the app bundle and slow down parsing just to read a few string tags.
function getOpfPath(containerXml: string): string | null {
  return containerXml.match(/full-path="([^"]+)"/)?.[1] ?? null;
}

function extractDcTag(opfXml: string, tag: string): string | null {
  const raw = opfXml.match(
    new RegExp(`<dc:${tag}[^>]*>([^<]+)<\\/dc:${tag}>`, "i"),
  )?.[1];

  // Basic entity decoding prevents titles like "Pride &amp; Prejudice" from
  // displaying raw HTML entities in the user interface.
  return (
    raw
      ?.trim()
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">") ?? null
  );
}

function getCoverHref(opfXml: string): string | null {
  // EPUB 2 standard: relies on a <meta> tag pointing to an <item> ID.
  const metaMatch = opfXml.match(
    /<meta\s+name=["']cover["']\s+content=["']([^"']+)["']|<meta\s+content=["']([^"']+)["']\s+name=["']cover["']/i,
  );
  const coverId = metaMatch?.[1] ?? metaMatch?.[2];
  if (coverId) {
    const itemMatch = opfXml.match(
      new RegExp(
        `<item[^>]+id=["']${coverId}["'][^>]+href=["']([^"']+)["']` +
          `|<item[^>]+href=["']([^"']+)["'][^>]+id=["']${coverId}["']`,
        "i",
      ),
    );
    const href = itemMatch?.[1] ?? itemMatch?.[2];
    if (href) return href;
  }

  // EPUB 2 fallback: sometimes the ID is literally just "cover" without a meta tag declaration.
  const byId = opfXml.match(
    /<item[^>]+id=["']cover["'][^>]+href=["']([^"']+)["']|<item[^>]+href=["']([^"']+)["'][^>]+id=["']cover["']/i,
  );
  if (byId) return byId[1] ?? byId[2] ?? null;

  // EPUB 3 standard: uses properties="cover-image" directly on the manifest item.
  const epub3 = opfXml.match(
    /<item[^>]+properties=["']cover-image["'][^>]+href=["']([^"']+)["']|<item[^>]+href=["']([^"']+)["'][^>]+properties=["']cover-image["']/i,
  );
  return epub3?.[1] ?? epub3?.[2] ?? null;
}

async function ensureCoversDir() {
  const info = await FileSystem.getInfoAsync(COVERS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(COVERS_DIR, { intermediates: true });
  }
}

async function saveCover(
  zip: JSZip,
  coverPath: string,
  bookUri: string,
): Promise<string | null> {
  // Locates the image file inside the extracted zip memory map.
  const file = zip.file(coverPath) ?? zip.file(coverPath.replace(/^\//, ""));
  if (!file) {
    console.log("[epub] cover file not found in zip at path:", coverPath);
    console.log(
      "[epub] available zip entries:",
      Object.keys(zip.files).join(", "),
    );
    return null;
  }

  await ensureCoversDir();

  // We generate a filesystem-safe filename using the original book URI
  // to ensure stable caching across app restarts.
  const safeId = bookUri.replace(/[^a-zA-Z0-9]/g, "_").slice(-50);
  const ext = coverPath.split(".").pop()?.split("?")[0] ?? "jpg";
  const destPath = `${COVERS_DIR}${safeId}.${ext}`;

  // Extracts image bytes directly to Base64, then writes to the physical device cache
  // so the UI can render it natively via the expo-image component without needing to re-parse the EPUB.
  const base64 = await file.async("base64");
  await FileSystem.writeAsStringAsync(destPath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return destPath;
}

export async function extractEpubMetadata(
  uri: string,
  fallbackTitle: string,
): Promise<BookMetadata> {
  const cacheKey = CACHE_PREFIX + uri;

  // 1. FAST PATH: Check AsyncStorage cache first.
  // Skipping the heavy JSZip extraction process entirely if we've seen this file before
  // is critical for keeping the library screen load time under a few hundred milliseconds.
  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed._v === CACHE_VERSION) {
        return {
          title: parsed.title,
          author: parsed.author,
          coverUri: parsed.coverUri,
        };
      }
    }
  } catch {}

  console.log("[epub] extracting:", fallbackTitle);

  // 2. SLOW PATH: First time seeing this file, execute full unzipping and parsing.
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Load the EPUB (which is fundamentally a zipped archive) into memory.
    const zip = await JSZip.loadAsync(base64, { base64: true });

    // Per EPUB specifications, container.xml is the only strictly required file path.
    // It acts as the manifest pointer to wherever the actual OPF data lives.
    const containerFile = zip.file("META-INF/container.xml");
    if (!containerFile) throw new Error("Missing container.xml");

    const opfPath = getOpfPath(await containerFile.async("string"));
    console.log("[epub] opfPath:", opfPath);
    if (!opfPath) throw new Error("OPF path not found");

    const opfFile = zip.file(opfPath);
    if (!opfFile) throw new Error(`OPF not found at ${opfPath}`);

    const opfXml = await opfFile.async("string");
    const title = extractDcTag(opfXml, "title") ?? fallbackTitle;
    const author = extractDcTag(opfXml, "creator");
    const coverHref = getCoverHref(opfXml);

    console.log(
      "[epub] title:",
      title,
      "| author:",
      author,
      "| coverHref:",
      coverHref,
    );

    // We must resolve relative OPF paths because EPUB cover images are rarely stored
    // in the exact same root directory as the manifest.
    const opfDir = opfPath.includes("/")
      ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1)
      : "";
    const coverPath = coverHref
      ? coverHref.startsWith("/")
        ? coverHref.slice(1)
        : opfDir + coverHref
      : null;

    console.log("[epub] resolved coverPath:", coverPath);

    const coverUri = coverPath ? await saveCover(zip, coverPath, uri) : null;
    console.log("[epub] coverUri:", coverUri);

    const metadata: BookMetadata = { title, author, coverUri };

    // Cache the result to bypass the JSZip unzipping process on future launches.
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ _v: CACHE_VERSION, ...metadata }),
    );
    return metadata;
  } catch (err) {
    console.warn("[epub] extraction failed for", fallbackTitle, ":", err);
    // Graceful fallback prevents the entire FlatList from crashing if a single EPUB is corrupted or unreadable.
    return { title: fallbackTitle, author: null, coverUri: null };
  }
}

export async function clearMetadataCache(): Promise<void> {
  // Isolates cache clearing specifically to epub metadata, preserving user settings or other AsyncStorage data.
  const keys = await AsyncStorage.getAllKeys();
  const metaKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
  await AsyncStorage.multiRemove(metaKeys);

  // idempotent: true ensures this doesn't throw an error if the directory was already deleted.
  await FileSystem.deleteAsync(COVERS_DIR, { idempotent: true });
}
