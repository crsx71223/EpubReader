import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import JSZip from "jszip";

import { clearMetadataCache, extractEpubMetadata } from "./epubMetadata";

const storage = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn((key: string) => Promise.resolve(storage.get(key) ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    storage.set(key, value);
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve(Array.from(storage.keys()))),
  multiRemove: jest.fn((keys: string[]) => {
    keys.forEach((k) => storage.delete(k));
    return Promise.resolve();
  }),
}));

const files = new Map<string, string>();

jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  EncodingType: { Base64: "base64" },
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn((uri: string) =>
    Promise.resolve(files.get(uri) ?? ""),
  ),
  writeAsStringAsync: jest.fn((uri: string, data: string) => {
    files.set(uri, data);
    return Promise.resolve();
  }),
  deleteAsync: jest.fn(() => Promise.resolve()),
}));

async function buildFakeEpub({
  title = "Test Book",
  author = "Jane Doe",
  includeCover = true,
}: { title?: string; author?: string; includeCover?: boolean } = {}) {
  const zip = new JSZip();
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0"?><container><rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles></container>`,
  );

  const coverItem = includeCover
    ? `<item id="cover-img" href="cover.jpg" properties="cover-image" media-type="image/jpeg"/>`
    : "";

  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0"?>
     <package>
       <metadata>
         <dc:title>${title}</dc:title>
         <dc:creator>${author}</dc:creator>
       </metadata>
       <manifest>${coverItem}</manifest>
     </package>`,
  );

  if (includeCover) {
    zip.file("OEBPS/cover.jpg", "fake-jpeg-bytes");
  }

  return zip.generateAsync({ type: "base64" });
}

describe("extractEpubMetadata", () => {
  beforeEach(() => {
    storage.clear();
    files.clear();
    jest.clearAllMocks();
  });

  it("extracts title, author, and saves the cover image for a valid EPUB", async () => {
    const base64 = await buildFakeEpub();
    files.set("file:///library/book.epub", base64);

    const meta = await extractEpubMetadata(
      "file:///library/book.epub",
      "fallback",
    );

    expect(meta.title).toBe("Test Book");
    expect(meta.author).toBe("Jane Doe");
    expect(meta.coverUri).toMatch(/epub-covers\/.*\.jpg$/);
  });

  it("falls back to the provided title and null fields when the file isn't a valid EPUB", async () => {
    files.set("file:///library/broken.epub", "not-a-real-zip");

    const meta = await extractEpubMetadata(
      "file:///library/broken.epub",
      "My Fallback Title",
    );

    expect(meta).toEqual({
      title: "My Fallback Title",
      author: null,
      coverUri: null,
    });
  });

  it("returns metadata without a cover when the OPF has no cover reference", async () => {
    const base64 = await buildFakeEpub({ includeCover: false });
    files.set("file:///library/nocover.epub", base64);

    const meta = await extractEpubMetadata(
      "file:///library/nocover.epub",
      "fallback",
    );

    expect(meta.title).toBe("Test Book");
    expect(meta.coverUri).toBeNull();
  });

  it("uses the cached result on a second call instead of re-parsing the zip", async () => {
    const base64 = await buildFakeEpub();
    files.set("file:///library/cached.epub", base64);

    await extractEpubMetadata("file:///library/cached.epub", "fallback");
    files.delete("file:///library/cached.epub");

    const second = await extractEpubMetadata(
      "file:///library/cached.epub",
      "fallback",
    );
    expect(second.title).toBe("Test Book");
  });
});

describe("clearMetadataCache", () => {
  it("removes cached metadata entries but leaves unrelated keys alone", async () => {
    storage.set(
      "epub_meta:file:///a.epub",
      JSON.stringify({ _v: 4, title: "A" }),
    );
    storage.set("unrelated_key", "keep-me");

    await clearMetadataCache();

    expect(storage.has("epub_meta:file:///a.epub")).toBe(false);
    expect(storage.has("unrelated_key")).toBe(true);
  });
});
