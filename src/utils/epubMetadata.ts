import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import JSZip from "jszip";

export interface BookMetadata {
  title: string;
  author: string | null;
  coverUri: string | null;
}

const CACHE_VERSION = 4; // bump this whenever extraction logic changes
const CACHE_PREFIX = "epub_meta:";
const COVERS_DIR = `${FileSystem.cacheDirectory}epub-covers/`;

// ─── XML helpers ─────────────────────────────────────────────────────────────

function getOpfPath(containerXml: string): string | null {
  return containerXml.match(/full-path="([^"]+)"/)?.[1] ?? null;
}

function extractDcTag(opfXml: string, tag: string): string | null {
  const raw = opfXml.match(
    new RegExp(`<dc:${tag}[^>]*>([^<]+)<\\/dc:${tag}>`, "i"),
  )?.[1];
  return (
    raw
      ?.trim()
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">") ?? null
  );
}

function getCoverHref(opfXml: string): string | null {
  // EPUB 2: <meta name="cover" content="some-id"/> then find item with that id
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

  // EPUB 2 fallback: item whose id is literally "cover"
  const byId = opfXml.match(
    /<item[^>]+id=["']cover["'][^>]+href=["']([^"']+)["']|<item[^>]+href=["']([^"']+)["'][^>]+id=["']cover["']/i,
  );
  if (byId) return byId[1] ?? byId[2] ?? null;

  // EPUB 3: <item properties="cover-image" href="..."/>
  const epub3 = opfXml.match(
    /<item[^>]+properties=["']cover-image["'][^>]+href=["']([^"']+)["']|<item[^>]+href=["']([^"']+)["'][^>]+properties=["']cover-image["']/i,
  );
  return epub3?.[1] ?? epub3?.[2] ?? null;
}

// ─── Cover image ─────────────────────────────────────────────────────────────

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

  const safeId = bookUri.replace(/[^a-zA-Z0-9]/g, "_").slice(-50);
  const ext = coverPath.split(".").pop()?.split("?")[0] ?? "jpg";
  const destPath = `${COVERS_DIR}${safeId}.${ext}`;

  const base64 = await file.async("base64");
  await FileSystem.writeAsStringAsync(destPath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return destPath;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function extractEpubMetadata(
  uri: string,
  fallbackTitle: string,
): Promise<BookMetadata> {
  const cacheKey = CACHE_PREFIX + uri;

  // Return cached result only if it matches the current cache version
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

  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const zip = await JSZip.loadAsync(base64, { base64: true });

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
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ _v: CACHE_VERSION, ...metadata }),
    );
    return metadata;
  } catch (err) {
    console.warn("[epub] extraction failed for", fallbackTitle, ":", err);
    return { title: fallbackTitle, author: null, coverUri: null };
  }
}

export async function clearMetadataCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const metaKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
  await AsyncStorage.multiRemove(metaKeys);
  await FileSystem.deleteAsync(COVERS_DIR, { idempotent: true });
}
