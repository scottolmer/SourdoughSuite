import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { BreadRecipe, insertBreadRecipeSchema } from '@shared/schema';
import { z } from 'zod';

// Get all recipes
export function useAllRecipes() {
  return useQuery({
    queryKey: ['/api/recipes'],
    queryFn: async () => {
      const data = await apiRequest<BreadRecipe[]>('/api/recipes');
      return data;
    }
  });
}

// Get public recipes
export function usePublicRecipes() {
  return useQuery({
    queryKey: ['/api/recipes/public'],
    queryFn: async () => {
      try {
        const data = await apiRequest<BreadRecipe[]>('/api/recipes/public');
        return data;
      } catch (error) {
        console.error("Error fetching public recipes:", error);
        // Return empty array if endpoint fails
        return [] as BreadRecipe[];
      }
    }
  });
}

// Get user recipes
export function useUserRecipes(userId: number) {
  return useQuery({
    queryKey: ['/api/user/recipes', userId],
    queryFn: async () => {
      const data = await apiRequest<BreadRecipe[]>(`/api/user/${userId}/recipes`);
      return data;
    },
    enabled: !!userId
  });
}

// Get a single recipe
export function useRecipe(id?: number) {
  return useQuery({
    queryKey: ['/api/recipes', id],
    queryFn: async () => {
      if (!id) return null;
      const data = await apiRequest<BreadRecipe>(`/api/recipes/${id}`);
      return data;
    },
    enabled: !!id
  });
}

// Create a new recipe
export function useCreateRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newRecipe: z.infer<typeof insertBreadRecipeSchema>) => {
      const data = await apiRequest<BreadRecipe>('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRecipe)
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/recipes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recipes/public'] });
    }
  });
}

// Update a recipe
export function useUpdateRecipe(id: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<z.infer<typeof insertBreadRecipeSchema>>) => {
      const data = await apiRequest<BreadRecipe>(`/api/recipes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/recipes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recipes/public'] });
    }
  });
}

// Delete a recipe
export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/recipes/${id}`, {
        method: 'DELETE'
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/recipes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recipes/public'] });
    }
  });
}

// Validate a recipe
export function useValidateRecipe() {
  return useMutation({
    mutationFn: async (recipeData: {
      flourGrams?: number;
      waterGrams?: number;
      saltGrams?: number;
      starterGrams?: number;
      recipeText?: string;
    }) => {
      console.log("Validating recipe with data:", recipeData);
      try {
        const data = await apiRequest('/api/recipes/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(recipeData)
        });
        return data;
      } catch (error) {
        console.error("Recipe validation error:", error);
        throw error;
      }
    }
  });
}