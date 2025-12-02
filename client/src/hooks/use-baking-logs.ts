import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export type BakingLog = {
  id: number;
  userId: number;
  starterId: number;
  recipeId: number;
  recipeName: string;
  bakeDate: string;
  ovenSpringRating?: number;
  crumbStructureRating?: number;
  crustQualityRating?: number;
  flavorRating?: number;
  overallRating?: number;
  starterPerformanceNotes?: string;
  bakeNotes?: string;
  roomTemperature?: number;
  bulkFermentationTime?: number;
  proofingMethod?: string;
  proofingTime?: number;
  bakingTemperature?: number;
  bakingMethod?: string;
  futureAdjustments?: string;
  photoUrl?: string;
  createdAt: string;
};

export type NewBakingLog = Omit<BakingLog, 'id' | 'createdAt'>;
export type UpdateBakingLog = Partial<NewBakingLog>;

export const useBakingLogs = (starterId: number) => {
  const queryClient = useQueryClient();
  
  const getBakingLogs = useQuery({
    queryKey: ['/api/starters', starterId, 'baking-logs'],
    queryFn: async () => {
      const response = await apiRequest<BakingLog[]>(`/api/starters/${starterId}/baking-logs`);
      return response;
    },
    enabled: !!starterId,
  });

  const createBakingLog = useMutation({
    mutationFn: async (newLog: NewBakingLog) => {
      // Format the date explicitly to meet the server requirements
      const formattedLog = { ...newLog };
      
      if (formattedLog.bakeDate) {
        // Convert the date string to a Date object and back to ISO string
        // YYYY-MM-DD to full ISO string with time component
        try {
          const dateObj = new Date(formattedLog.bakeDate);
          if (!isNaN(dateObj.getTime())) {
            formattedLog.bakeDate = dateObj.toISOString();
            console.log("Formatted date to ISO string:", formattedLog.bakeDate);
          } else {
            console.error("Invalid date:", formattedLog.bakeDate);
          }
        } catch (error) {
          console.error("Error formatting date:", error);
        }
      }
      
      // Convert to simple object with date as ISO string
      // This ensures the JSON serialization is explicit about the date format
      const payloadToSend = {
        ...formattedLog,
        // Make absolutely sure the date is sent in ISO format
        bakeDate: formattedLog.bakeDate ? formattedLog.bakeDate : new Date().toISOString()
      };
      
      console.log("Sending baking log payload:", payloadToSend);
      
      const response = await apiRequest<BakingLog>('/api/baking-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payloadToSend),
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch the baking logs for this starter
      queryClient.invalidateQueries({ queryKey: ['/api/starters', starterId, 'baking-logs'] });
    },
  });

  const updateBakingLog = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateBakingLog & { id: number }) => {
      const response = await apiRequest<BakingLog>(`/api/baking-logs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates),
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch the baking logs for this starter
      queryClient.invalidateQueries({ queryKey: ['/api/starters', starterId, 'baking-logs'] });
    },
  });

  const deleteBakingLog = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/baking-logs/${id}`, {
        method: 'DELETE',
      });
      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch the baking logs for this starter
      queryClient.invalidateQueries({ queryKey: ['/api/starters', starterId, 'baking-logs'] });
    },
  });

  return {
    bakingLogs: getBakingLogs.data || [],
    isLoading: getBakingLogs.isLoading,
    isError: getBakingLogs.isError,
    error: getBakingLogs.error,
    createBakingLog,
    updateBakingLog,
    deleteBakingLog,
    refetch: getBakingLogs.refetch,
  };
};

export const useRecipeBakingLogs = (starterId: number, recipeId: number) => {
  const queryClient = useQueryClient();
  
  const getBakingLogs = useQuery({
    queryKey: ['/api/starters', starterId, 'recipes', recipeId, 'baking-logs'],
    queryFn: async () => {
      const response = await apiRequest<BakingLog[]>(`/api/starters/${starterId}/recipes/${recipeId}/baking-logs`);
      return response;
    },
    enabled: !!starterId && !!recipeId,
  });

  const createBakingLog = useMutation({
    mutationFn: async (newLog: NewBakingLog) => {
      // Format the date explicitly to meet the server requirements
      const formattedLog = { ...newLog };
      
      if (formattedLog.bakeDate) {
        // Convert the date string to a Date object and back to ISO string
        try {
          const dateObj = new Date(formattedLog.bakeDate);
          if (!isNaN(dateObj.getTime())) {
            formattedLog.bakeDate = dateObj.toISOString();
            console.log("Formatted date to ISO string:", formattedLog.bakeDate);
          } else {
            console.error("Invalid date:", formattedLog.bakeDate);
          }
        } catch (error) {
          console.error("Error formatting date:", error);
        }
      }
      
      // Convert to simple object with date as ISO string
      const payloadToSend = {
        ...formattedLog,
        starterId,
        recipeId,
        // Make absolutely sure the date is sent in ISO format
        bakeDate: formattedLog.bakeDate ? formattedLog.bakeDate : new Date().toISOString()
      };
      
      console.log("Sending baking log payload:", payloadToSend);
      
      const response = await apiRequest<BakingLog>('/api/baking-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payloadToSend),
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch the baking logs for this starter and recipe
      queryClient.invalidateQueries({ 
        queryKey: ['/api/starters', starterId, 'recipes', recipeId, 'baking-logs'] 
      });
      // Also invalidate the general starter baking logs
      queryClient.invalidateQueries({ 
        queryKey: ['/api/starters', starterId, 'baking-logs'] 
      });
    },
  });

  return {
    bakingLogs: getBakingLogs.data || [],
    isLoading: getBakingLogs.isLoading,
    isError: getBakingLogs.isError,
    error: getBakingLogs.error,
    createBakingLog,
    refetch: getBakingLogs.refetch,
  };
};

export const useBakingLog = (id: number) => {
  const queryClient = useQueryClient();
  
  const getBakingLog = useQuery({
    queryKey: ['/api/baking-logs', id],
    queryFn: async () => {
      const response = await apiRequest<BakingLog>(`/api/baking-logs/${id}`);
      return response;
    },
    enabled: !!id,
  });

  const updateBakingLog = useMutation({
    mutationFn: async (updates: UpdateBakingLog) => {
      const response = await apiRequest<BakingLog>(`/api/baking-logs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates),
      });
      return response;
    },
    onSuccess: (data) => {
      // Update the baking log in the cache
      queryClient.setQueryData(['/api/baking-logs', id], data);
      
      // Invalidate related queries
      if (data?.starterId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/starters', data.starterId, 'baking-logs'] 
        });
        
        if (data?.recipeId) {
          queryClient.invalidateQueries({ 
            queryKey: ['/api/starters', data.starterId, 'recipes', data.recipeId, 'baking-logs'] 
          });
        }
      }
    },
  });

  const deleteBakingLog = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/baking-logs/${id}`, {
        method: 'DELETE',
      });
      return id;
    },
    onSuccess: () => {
      // Get the data before removing it from cache
      const data = queryClient.getQueryData<BakingLog>(['/api/baking-logs', id]);
      
      // Remove the baking log from the cache
      queryClient.removeQueries({ queryKey: ['/api/baking-logs', id] });
      
      // Invalidate related queries
      if (data?.starterId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/starters', data.starterId, 'baking-logs'] 
        });
        
        if (data?.recipeId) {
          queryClient.invalidateQueries({ 
            queryKey: ['/api/starters', data.starterId, 'recipes', data.recipeId, 'baking-logs'] 
          });
        }
      }
    },
  });

  return {
    bakingLog: getBakingLog.data,
    isLoading: getBakingLog.isLoading,
    isError: getBakingLog.isError,
    error: getBakingLog.error,
    updateBakingLog,
    deleteBakingLog,
    refetch: getBakingLog.refetch,
  };
};