import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export type TimelineStep = {
  stage: string;
  startTime: Date | string;
  endTime: Date | string;
  stageName: string;
  description: string;
  isCompleted?: boolean;
  notes?: string;
};

export type BakingTimeline = {
  id: number;
  userId: number;
  recipeId: number;
  recipeName: string;
  timelineData: TimelineStep[];
  desiredFinishTime: Date | string;
  startTime: Date | string;
  isCompleted: boolean;
  bakingLogId?: number;
  createdAt: Date | string;
};

export type NewBakingTimeline = Omit<BakingTimeline, 'id' | 'createdAt'>;
export type UpdateBakingTimeline = Partial<NewBakingTimeline>;

export const useTimelines = (userId = 1) => {
  const queryClient = useQueryClient();
  
  const getTimelines = useQuery({
    queryKey: ['/api/timelines'],
    queryFn: async () => {
      const response = await apiRequest<BakingTimeline[]>('/api/timelines');
      return response;
    },
  });

  const createTimeline = useMutation({
    mutationFn: async (timeline: NewBakingTimeline) => {
      const response = await apiRequest<BakingTimeline>('/api/timelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(timeline),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timelines'] });
    },
  });

  const deleteTimeline = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/timelines/${id}`, {
        method: 'DELETE',
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timelines'] });
    },
  });

  return {
    timelines: getTimelines.data || [],
    isLoading: getTimelines.isLoading,
    isError: getTimelines.isError,
    error: getTimelines.error,
    createTimeline,
    deleteTimeline,
    refetch: getTimelines.refetch,
  };
};

export const useRecipeTimelines = (recipeId: number) => {
  const queryClient = useQueryClient();
  
  const getTimelines = useQuery({
    queryKey: ['/api/recipes', recipeId, 'timelines'],
    queryFn: async () => {
      const response = await apiRequest<BakingTimeline[]>(`/api/recipes/${recipeId}/timelines`);
      return response;
    },
    enabled: !!recipeId,
  });

  return {
    timelines: getTimelines.data || [],
    isLoading: getTimelines.isLoading,
    isError: getTimelines.isError,
    error: getTimelines.error,
    refetch: getTimelines.refetch,
  };
};

export const useTimeline = (id: number) => {
  const queryClient = useQueryClient();
  
  const getTimeline = useQuery({
    queryKey: ['/api/timelines', id],
    queryFn: async () => {
      const response = await apiRequest<BakingTimeline>(`/api/timelines/${id}`);
      return response;
    },
    enabled: !!id,
  });

  const updateTimeline = useMutation({
    mutationFn: async (updates: UpdateBakingTimeline) => {
      const response = await apiRequest<BakingTimeline>(`/api/timelines/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates),
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/timelines', id], data);
      queryClient.invalidateQueries({ queryKey: ['/api/timelines'] });
      
      if (data?.recipeId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/recipes', data.recipeId, 'timelines'] 
        });
      }
    },
  });

  const markComplete = useMutation({
    mutationFn: async (bakingLogId: number) => {
      const response = await apiRequest<BakingTimeline>(`/api/timelines/${id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bakingLogId }),
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/timelines', id], data);
      queryClient.invalidateQueries({ queryKey: ['/api/timelines'] });
      
      if (data?.recipeId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/recipes', data.recipeId, 'timelines'] 
        });
      }
    },
  });

  const deleteTimeline = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/timelines/${id}`, {
        method: 'DELETE',
      });
      return id;
    },
    onSuccess: () => {
      const data = queryClient.getQueryData<BakingTimeline>(['/api/timelines', id]);
      
      queryClient.removeQueries({ queryKey: ['/api/timelines', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/timelines'] });
      
      if (data?.recipeId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/recipes', data.recipeId, 'timelines'] 
        });
      }
    },
  });

  return {
    timeline: getTimeline.data,
    isLoading: getTimeline.isLoading,
    isError: getTimeline.isError,
    error: getTimeline.error,
    updateTimeline,
    markComplete,
    deleteTimeline,
    refetch: getTimeline.refetch,
  };
};