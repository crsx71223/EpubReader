import { create } from "zustand";
import { getLibraryFiles } from "../utils/fileSystem";

interface Book {
  id: string;
  title: string;
  uri: string;
}

interface BookStore {
  books: Book[];
  isLoading: boolean;
  loadBooks: () => Promise<void>;
}

export const useBookStore = create<BookStore>((set) => ({
  books: [],
  isLoading: false,

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
}));
