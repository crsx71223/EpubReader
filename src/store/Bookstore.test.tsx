import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getLibraryFiles } from "../utils/fileSystem";
import { useBookStore } from "./bookStore";

jest.mock("../utils/fileSystem", () => ({
  getLibraryFiles: jest.fn(),
}));

const mockGetLibraryFiles = jest.mocked(getLibraryFiles);
const initialState = useBookStore.getState();

describe("bookStore", () => {
  beforeEach(() => {
    useBookStore.setState(initialState, true);
    mockGetLibraryFiles.mockReset();
  });

  it("loadBooks sets isLoading while fetching and populates books on success", async () => {
    const books = [
      { id: "a.epub", uri: "a.epub", title: "A", author: null, coverUri: null },
    ];
    mockGetLibraryFiles.mockResolvedValue(books);

    const loadPromise = useBookStore.getState().loadBooks();
    expect(useBookStore.getState().isLoading).toBe(true);

    await loadPromise;

    expect(useBookStore.getState().books).toEqual(books);
    expect(useBookStore.getState().isLoading).toBe(false);
  });

  it("loadBooks resets to an empty list and isLoading false when getLibraryFiles throws", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGetLibraryFiles.mockRejectedValue(new Error("disk error"));

    await useBookStore.getState().loadBooks();

    expect(useBookStore.getState().books).toEqual([]);
    expect(useBookStore.getState().isLoading).toBe(false);

    consoleSpy.mockRestore();
  });

  it("setCurrentBook updates currentBookUri", () => {
    useBookStore.getState().setCurrentBook("some/uri.epub");
    expect(useBookStore.getState().currentBookUri).toBe("some/uri.epub");

    useBookStore.getState().setCurrentBook(null);
    expect(useBookStore.getState().currentBookUri).toBeNull();
  });
});
