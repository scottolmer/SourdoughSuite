import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/contexts/UserContext';
import { ShopProvider } from './src/contexts/ShopContext';
import { BakerToolsProvider } from './src/contexts/BakerToolsContext';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

/**
 * Main App component
 * Wraps the entire application with necessary providers
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <ShopProvider>
            <BakerToolsProvider>
              <AppNavigator />
            </BakerToolsProvider>
          </ShopProvider>
        </UserProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}