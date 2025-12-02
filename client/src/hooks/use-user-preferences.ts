import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserPreference } from "@shared/schema";

// Hook for fetching user preferences
export function useUserPreferences(userId: number) {
  return useQuery<UserPreference>({
    queryKey: ['/api/user/preferences', userId],
    enabled: !!userId,
  });
}

// Hook for creating user preferences
export function useCreateUserPreferences() {
  return useMutation({
    mutationFn: (preferences: Omit<UserPreference, 'id' | 'createdAt' | 'updatedAt'>) => 
      apiRequest('POST', '/api/user/preferences', preferences)
        .then(response => response.json()),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user/preferences', data.userId] 
      });
    },
  });
}

// Hook for updating user preferences
export function useUpdateUserPreferences() {
  return useMutation({
    mutationFn: ({ userId, ...updateData }: { userId: number, [key: string]: any }) => 
      apiRequest('PATCH', `/api/user/preferences/${userId}`, updateData)
        .then(response => response.json()),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user/preferences', variables.userId] 
      });
    },
  });
}

// Type for baker preferences
export interface BakerPreferences {
  favoriteFlours: string[];
  preferredHydration: number;
  preferredFermentationTime: number;
  skillLevel: number;
  availableEquipment: string[];
  dietaryRestrictions: string[];
  preferredFlavorProfile: {
    sourness: number;
    sweetness: number;
    complexity: number;
  };
  preferredCrustType: string;
  preferredCrumbTexture: string;
  bakingFrequency: string;
}

// Default baker preferences
export const defaultBakerPreferences: BakerPreferences = {
  favoriteFlours: ['Bread Flour', 'Whole Wheat'],
  preferredHydration: 75,
  preferredFermentationTime: 12,
  skillLevel: 3, // 1-5 scale
  availableEquipment: ['Dutch Oven', 'Banneton', 'Scale'],
  dietaryRestrictions: [],
  preferredFlavorProfile: {
    sourness: 3, // 1-5 scale
    sweetness: 2, // 1-5 scale
    complexity: 4 // 1-5 scale
  },
  preferredCrustType: 'Crispy',
  preferredCrumbTexture: 'Open',
  bakingFrequency: 'Weekly'
};