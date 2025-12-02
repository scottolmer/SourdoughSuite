import { queryClient } from '@/lib/queryClient';

/**
 * Performance optimization utilities for better application performance
 */

/**
 * Prefetch data for a given route to improve perceived performance
 * Call this function when you expect a user might navigate to a route soon
 * E.g. when hovering over a navigation link or viewing a list of items
 * 
 * @param queryKey The query key to prefetch (e.g., '/api/recipes')
 * @param routeParams Optional parameters to append to the query
 */
export const prefetchRouteData = async (
  queryKey: string | string[],
  routeParams?: Record<string, string>
): Promise<void> => {
  const actualQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];
  let url = actualQueryKey[0];
  
  // Add route params if provided
  if (routeParams && Object.keys(routeParams).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(routeParams).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
    url = `${url}?${searchParams.toString()}`;
  }
  
  try {
    // Use the staleTime option to control how long the data stays fresh
    await queryClient.prefetchQuery({
      queryKey: [...actualQueryKey, routeParams],
      staleTime: 30 * 1000, // 30 seconds
    });
  } catch (error) {
    console.error('Error prefetching data:', error);
  }
};

/**
 * Optimistic update utility to make UI feel more responsive
 * Updates the UI immediately before the server response is received
 * 
 * @param queryKey The query key to update
 * @param updateFn Function that updates the current data
 * @param rollbackFn Optional function to run if the mutation fails
 */
export const optimisticUpdate = <T>(
  queryKey: string | string[],
  updateFn: (oldData: T) => T,
  rollbackFn?: () => void
) => {
  const actualQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];
  
  // Get the previous data for potential rollback
  const previousData = queryClient.getQueryData<T>(actualQueryKey);
  
  // Optimistically update the cache
  queryClient.setQueryData<T>(actualQueryKey, (oldData) => {
    if (!oldData) return oldData;
    return updateFn(oldData as T);
  });
  
  // Return an object with functions to handle success or error
  return {
    onSuccess: () => {
      // Invalidate the query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: actualQueryKey });
    },
    onError: () => {
      // Roll back to previous data
      if (previousData) {
        queryClient.setQueryData(actualQueryKey, previousData);
      }
      
      // Run custom rollback function if provided
      if (rollbackFn) {
        rollbackFn();
      }
    },
  };
};

/**
 * Debounce function to limit how often a function can be called
 * Useful for search inputs and other high-frequency events
 * 
 * @param callback Function to debounce
 * @param wait Time in milliseconds to wait before invoking the function
 */
export const debounce = <T extends (...args: any[]) => any>(
  callback: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      callback(...args);
    }, wait);
  };
};

/**
 * Throttle function to limit how often a function can be called
 * Useful for scroll events and other continuous events
 * 
 * @param callback Function to throttle
 * @param limit Time in milliseconds between function calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let waiting = false;
  let lastArgs: Parameters<T> | null = null;
  
  return (...args: Parameters<T>) => {
    if (waiting) {
      lastArgs = args;
      return;
    }
    
    callback(...args);
    waiting = true;
    
    setTimeout(() => {
      waiting = false;
      if (lastArgs) {
        callback(...lastArgs);
        lastArgs = null;
      }
    }, limit);
  };
};