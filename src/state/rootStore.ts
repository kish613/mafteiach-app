import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Search types
export interface SearchResult {
  id: string;
  source: string;
  text: string;
  hebrewText?: string;
  reference: string;
  category: string;
  relevance?: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
  results?: SearchResult[];
}

// Chabura types
export interface ChaburaSession {
  id: string;
  title: string;
  topic: string;
  sources: string[];
  notes: string;
  participants?: string[];
  scheduledDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'scheduled' | 'completed';
}

// Settings types
export interface UserSettings {
  fontSize: 'small' | 'medium' | 'large';
  hebrewFontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'auto';
  preferredAIModel: 'gpt-4o' | 'claude-3-5-sonnet' | 'grok-2';
  showHebrewText: boolean;
  showTransliteration: boolean;
  autoSaveChat: boolean;
  notificationsEnabled: boolean;
}

interface AppState {
  // Chat state
  currentChatSession: ChatSession | null;
  chatSessions: ChatSession[];
  isTyping: boolean;
  
  // Search state
  searchQuery: string;
  searchResults: SearchResult[];
  searchHistory: SearchHistory[];
  isSearching: boolean;
  selectedSources: string[];
  
  // Chabura state
  chaburaSessions: ChaburaSession[];
  currentChabura: ChaburaSession | null;
  
  // Settings
  settings: UserSettings;
  
  // UI state
  activeTab: 'home' | 'search' | 'chat' | 'chabura' | 'history';
  isLoading: boolean;
  error: string | null;
  
  // Actions - Chat
  createChatSession: (title?: string) => ChatSession;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  deleteChatSession: (id: string) => void;
  setCurrentChatSession: (session: ChatSession | null) => void;
  setIsTyping: (typing: boolean) => void;
  
  // Actions - Search
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  addSearchHistory: (history: Omit<SearchHistory, 'id' | 'timestamp'>) => void;
  clearSearchHistory: () => void;
  setIsSearching: (searching: boolean) => void;
  toggleSource: (source: string) => void;
  
  // Actions - Chabura
  createChabura: (chabura: Omit<ChaburaSession, 'id' | 'createdAt' | 'updatedAt'>) => ChaburaSession;
  updateChabura: (id: string, updates: Partial<ChaburaSession>) => void;
  deleteChabura: (id: string) => void;
  setCurrentChabura: (chabura: ChaburaSession | null) => void;
  
  // Actions - Settings
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Actions - UI
  setActiveTab: (tab: AppState['activeTab']) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const defaultSettings: UserSettings = {
  fontSize: 'medium',
  hebrewFontSize: 'medium',
  theme: 'light',
  preferredAIModel: 'gpt-4o',
  showHebrewText: true,
  showTransliteration: false,
  autoSaveChat: true,
  notificationsEnabled: true,
};

const defaultSources = [
  'Talmud Bavli',
  'Tanach',
  'Mishnah',
  'Rashi',
  'Tosafot',
  'Rambam',
  'Shulchan Aruch',
  'Mishnah Berurah',
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentChatSession: null,
      chatSessions: [],
      isTyping: false,
      searchQuery: '',
      searchResults: [],
      searchHistory: [],
      isSearching: false,
      selectedSources: defaultSources,
      chaburaSessions: [],
      currentChabura: null,
      settings: defaultSettings,
      activeTab: 'home',
      isLoading: false,
      error: null,
      
      // Chat actions
      createChatSession: (title) => {
        const session: ChatSession = {
          id: Date.now().toString(),
          title: title || `Chat ${new Date().toLocaleDateString()}`,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          chatSessions: [session, ...state.chatSessions],
          currentChatSession: session,
        }));
        return session;
      },
      
      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        };
        set((state) => {
          if (!state.currentChatSession) return state;
          
          const updatedSession = {
            ...state.currentChatSession,
            messages: [...state.currentChatSession.messages, newMessage],
            updatedAt: new Date(),
          };
          
          return {
            currentChatSession: updatedSession,
            chatSessions: state.chatSessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },
      
      deleteChatSession: (id) => {
        set((state) => ({
          chatSessions: state.chatSessions.filter((s) => s.id !== id),
          currentChatSession:
            state.currentChatSession?.id === id ? null : state.currentChatSession,
        }));
      },
      
      setCurrentChatSession: (session) => set({ currentChatSession: session }),
      setIsTyping: (typing) => set({ isTyping: typing }),
      
      // Search actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchResults: (results) => set({ searchResults: results }),
      addSearchHistory: (history) => {
        const newHistory: SearchHistory = {
          ...history,
          id: Date.now().toString(),
          timestamp: new Date(),
        };
        set((state) => ({
          searchHistory: [newHistory, ...state.searchHistory.slice(0, 49)],
        }));
      },
      clearSearchHistory: () => set({ searchHistory: [] }),
      setIsSearching: (searching) => set({ isSearching: searching }),
      toggleSource: (source) => {
        set((state) => ({
          selectedSources: state.selectedSources.includes(source)
            ? state.selectedSources.filter((s) => s !== source)
            : [...state.selectedSources, source],
        }));
      },
      
      // Chabura actions
      createChabura: (chabura) => {
        const newChabura: ChaburaSession = {
          ...chabura,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          chaburaSessions: [newChabura, ...state.chaburaSessions],
          currentChabura: newChabura,
        }));
        return newChabura;
      },
      
      updateChabura: (id, updates) => {
        set((state) => ({
          chaburaSessions: state.chaburaSessions.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
          ),
          currentChabura:
            state.currentChabura?.id === id
              ? { ...state.currentChabura, ...updates, updatedAt: new Date() }
              : state.currentChabura,
        }));
      },
      
      deleteChabura: (id) => {
        set((state) => ({
          chaburaSessions: state.chaburaSessions.filter((c) => c.id !== id),
          currentChabura:
            state.currentChabura?.id === id ? null : state.currentChabura,
        }));
      },
      
      setCurrentChabura: (chabura) => set({ currentChabura: chabura }),
      
      // Settings actions
      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },
      
      // UI actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'mafteiach-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        chatSessions: state.chatSessions,
        searchHistory: state.searchHistory,
        chaburaSessions: state.chaburaSessions,
        settings: state.settings,
        selectedSources: state.selectedSources,
      }),
    }
  )
);