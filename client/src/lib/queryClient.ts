import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  console.log(`Making API request: ${url}`, options);
  try {
    // Make sure the Content-Type header is set for JSON
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Serialize body as JSON if it's an object
    const body = options.body ? JSON.stringify(options.body) : undefined;

    const res = await fetch(url, {
      ...options,
      headers,
      body,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    
    // For DELETE requests or 204 status, return an empty success response
    if (options.method === 'DELETE' || res.status === 204) {
      return { success: true } as unknown as T;
    }
    
    const jsonData = await res.json();
    console.log(`API response received for ${url}:`, jsonData);
    return jsonData;
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    console.log(`Making query request: ${url}`);
    try {
      const res = await fetch(url, {
        credentials: "include",
      });
  
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }
  
      await throwIfResNotOk(res);
      const data = await res.json();
      console.log(`Query response received for ${url}:`, data);
      return data;
    } catch (error) {
      console.error(`Query request failed: ${url}`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
