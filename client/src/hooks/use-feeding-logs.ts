import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { StarterFeedingLog } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export type FeedingLogFormData = {
  starterId: number;
  userId: number;
  flourAmount: number;
  waterAmount: number;
  starterAmount: number;
  flourType: string;
  ratio: string;
  feedingDate: Date | string; // Accept both Date objects and ISO strings
  notes?: string;
};

export function useStarterFeedingLogs(starterId: number) {
  return useQuery({
    queryKey: ['/api/starters', starterId, 'feeding-logs'],
    queryFn: async () => {
      const response = await fetch(`/api/starters/${starterId}/feeding-logs`);
      if (!response.ok) {
        throw new Error('Failed to fetch feeding logs');
      }
      return response.json() as Promise<StarterFeedingLog[]>;
    },
    enabled: !!starterId
  });
}

// Get feeding logs for a specific date
export function useStarterFeedingLogsByDate(starterId: number, date?: Date) {
  const formattedDate = date ? new Date(date.setHours(0, 0, 0, 0)).toISOString() : undefined;
  
  return useQuery({
    queryKey: ['/api/starters', starterId, 'feeding-logs', formattedDate],
    queryFn: async () => {
      const dateParam = formattedDate ? `?date=${encodeURIComponent(formattedDate)}` : '';
      const response = await fetch(`/api/starters/${starterId}/feeding-logs${dateParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch feeding logs for the selected date');
      }
      return response.json() as Promise<StarterFeedingLog[]>;
    },
    enabled: !!starterId && !!date
  });
}

// Get all feeding log dates for a starter
export function useStarterFeedingLogDates(starterId: number) {
  return useQuery({
    queryKey: ['/api/starters', starterId, 'feeding-log-dates'],
    queryFn: async () => {
      const response = await fetch(`/api/starters/${starterId}/feeding-log-dates`);
      if (!response.ok) {
        throw new Error('Failed to fetch feeding log dates');
      }
      const data = await response.json() as {dates: string[]};
      return data.dates;
    },
    enabled: !!starterId
  });
}

export function useAddFeedingLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: FeedingLogFormData) => {
      return apiRequest<any>('/api/feeding-logs', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate the query to refetch the feeding logs
      queryClient.invalidateQueries({ 
        queryKey: ['/api/starters', variables.starterId, 'feeding-logs'] 
      });
      toast({
        title: "Success",
        description: "Feeding log added successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add feeding log.",
      });
    },
  });
}

export function useDeleteFeedingLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, starterId }: { id: number, starterId: number }) => {
      return apiRequest<any>(`/api/feeding-logs/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate the query to refetch the feeding logs
      queryClient.invalidateQueries({ 
        queryKey: ['/api/starters', variables.starterId, 'feeding-logs'] 
      });
      toast({
        title: "Success",
        description: "Feeding log deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete feeding log.",
      });
    },
  });
}