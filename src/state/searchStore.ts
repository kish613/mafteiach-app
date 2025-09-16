import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface TorahSource {
  id: string;
  title: string;
  location: string;
  text: string;
  category: "torah" | "gemara" | "mishnah" | "halacha" | "other";
  language: "hebrew" | "english";
  timestamp: number;
}

export interface SearchResult {
  id: string;
  query: string;
  sources: TorahSource[];
  timestamp: number;
  language: "hebrew" | "english" | "both";
}

export interface Folder { id: string; name: string }

interface SearchState {
  currentQuery: string;
  currentResults: TorahSource[];
  searchHistory: SearchResult[];
  favorites: TorahSource[];
  folders: Folder[];
  sourceFolders: Record<string, string | undefined>; // sourceId -> folderId
  isLoading: boolean;
  error: string | null;
  
  setCurrentQuery: (query: string) => void;
  setCurrentResults: (results: TorahSource[]) => void;
  addToHistory: (result: SearchResult) => void;
  addToFavorites: (source: TorahSource) => void;
  removeFromFavorites: (sourceId: string) => void;
  createFolder: (name: string) => string;
  assignToFolder: (sourceId: string, folderId: string) => void;
  removeFromFolder: (sourceId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearHistory: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      currentQuery: "",
      currentResults: [],
      searchHistory: [],
      favorites: [],
      folders: [],
      sourceFolders: {},
      isLoading: false,
      error: null,
      
      setCurrentQuery: (query) => set({ currentQuery: query }),
      setCurrentResults: (results) => set({ currentResults: results }),
      
      addToHistory: (result) => {
        const history = get().searchHistory;
        const updatedHistory = [result, ...history.slice(0, 49)];
        set({ searchHistory: updatedHistory });
      },
      
      addToFavorites: (source) => {
        const favorites = get().favorites;
        if (!favorites.find(fav => fav.id === source.id)) {
          set({ favorites: [source, ...favorites] });
        }
      },
      
      removeFromFavorites: (sourceId) => {
        const favorites = get().favorites.filter(fav => fav.id !== sourceId);
        set({ favorites });
      },

      createFolder: (name) => {
        const id = `fld-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        set({ folders: [...get().folders, { id, name }] });
        return id;
      },
      assignToFolder: (sourceId, folderId) => {
        const map = { ...get().sourceFolders, [sourceId]: folderId };
        set({ sourceFolders: map });
      },
      removeFromFolder: (sourceId) => {
        const map = { ...get().sourceFolders };
        delete map[sourceId];
        set({ sourceFolders: map });
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: "search-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        favorites: state.favorites,
        folders: state.folders,
        sourceFolders: state.sourceFolders,
      }),
    },
  ),
);