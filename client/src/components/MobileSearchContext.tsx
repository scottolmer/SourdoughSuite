import { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTopic: string | null;
  setSelectedTopic: (topic: string | null) => void;
  chatHistory: Array<{role: 'user' | 'assistant', content: string}>;
  setChatHistory: (history: Array<{role: 'user' | 'assistant', content: string}>) => void;
  clearContext: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function MobileSearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

  const clearContext = () => {
    setSearchQuery("");
    setSelectedTopic(null);
    setChatHistory([]);
  };

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      selectedTopic,
      setSelectedTopic,
      chatHistory,
      setChatHistory,
      clearContext
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useMobileSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useMobileSearch must be used within a MobileSearchProvider');
  }
  return context;
}