import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { StarterHealthLog } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export type HealthLogFormData = {
  starterId: number;
  userId: number;
  logDate: Date | string; // Accept both Date objects and ISO strings
  activityRating?: number; // 1-10 scale
  riseHeight?: number; // in mm or % container
  smell?: string; 
  appearance?: string;
  temperature?: number; // ambient temperature
  lastFedTimestamp?: Date | string; // when it was last fed
  consistency?: string; // e.g., "liquid", "thick", "stretchy"
  photoUrl?: string;
  notes?: string;
};

export function useStarterHealthLogs(starterId: number) {
  return useQuery({
    queryKey: ['/api/starters', starterId, 'health-logs'],
    queryFn: async () => {
      const response = await fetch(`/api/starters/${starterId}/health-logs`);
      if (!response.ok) {
        throw new Error('Failed to fetch health logs');
      }
      return response.json() as Promise<StarterHealthLog[]>;
    },
    enabled: !!starterId
  });
}

export function useLatestHealthLog(starterId: number) {
  return useQuery({
    queryKey: ['/api/starters', starterId, 'health-logs', 'latest'],
    queryFn: async () => {
      const response = await fetch(`/api/starters/${starterId}/health-logs/latest`);
      if (!response.ok) {
        if (response.status === 404) {
          // No logs yet, which is not an error
          return null;
        }
        throw new Error('Failed to fetch latest health log');
      }
      return response.json() as Promise<StarterHealthLog>;
    },
    enabled: !!starterId
  });
}

export function useAddHealthLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: HealthLogFormData) => {
      return apiRequest('POST', '/api/health-logs', data);
    },
    onSuccess: (data, variables) => {
      // Invalidate the query to refetch the health logs
      queryClient.invalidateQueries({ 
        queryKey: ['/api/starters', variables.starterId, 'health-logs'] 
      });
      // Also invalidate the latest log query
      queryClient.invalidateQueries({ 
        queryKey: ['/api/starters', variables.starterId, 'health-logs', 'latest'] 
      });
      toast({
        title: "Success",
        description: "Health log added successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add health log.",
      });
    },
  });
}

export function useDeleteHealthLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, starterId }: { id: number, starterId: number }) => {
      return apiRequest('DELETE', `/api/health-logs/${id}`);
    },
    onSuccess: (_, variables) => {
      // Invalidate the query to refetch the health logs
      queryClient.invalidateQueries({ 
        queryKey: ['/api/starters', variables.starterId, 'health-logs'] 
      });
      // Also invalidate the latest log query
      queryClient.invalidateQueries({ 
        queryKey: ['/api/starters', variables.starterId, 'health-logs', 'latest'] 
      });
      toast({
        title: "Success",
        description: "Health log deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete health log.",
      });
    },
  });
}

export function useUpdateHealthLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<HealthLogFormData> }) => {
      return apiRequest('PATCH', `/api/health-logs/${id}`, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate the query to refetch the health logs
      if (variables.data.starterId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/starters', variables.data.starterId, 'health-logs'] 
        });
        // Also invalidate the latest log query
        queryClient.invalidateQueries({ 
          queryKey: ['/api/starters', variables.data.starterId, 'health-logs', 'latest'] 
        });
      }
      toast({
        title: "Success",
        description: "Health log updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update health log.",
      });
    },
  });
}