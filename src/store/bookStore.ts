import * as FileSystem from "expo-file-system/legacy";
import { create } from "zustand";
import { getLibraryFiles } from "../utils/fileSystem";

export interface Book {
  id: string;
  uri: string;
  title: string;
  author: string | null;
  coverUri: string | null;
}

interface BookStore {
  books: Book[];
  isLoading: boolean;
  currentBookUri: string | null;
  loadBooks: () => Promise<void>;
  setCurrentBook: (uri: string | null) => void;
  deleteBook: (uri: string) => Promise<void>;
}

export const useBookStore = create<BookStore>((set) => ({
  books: [],
  isLoading: false,
  currentBookUri: null,

  loadBooks: async () => {
    set({ isLoading: true });
    try {
      const files = await getLibraryFiles();
      set({ books: files, isLoading: false });
    } catch (error) {
      console.error("Failed to load books into store:", error);
      set({ books: [], isLoading: false });
    }
  },

  setCurrentBook: (uri) => set({ currentBookUri: uri }),

  deleteBook: async (uri) => {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });

      set((state) => ({
        books: state.books.filter((book) => book.uri !== uri),
        currentBookUri:
          state.currentBookUri === uri ? null : state.currentBookUri,
      }));
    } catch (error) {
      console.error("Failed to delete book:", error);
    }
  },
}));
