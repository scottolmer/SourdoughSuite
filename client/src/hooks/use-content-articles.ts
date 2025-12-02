import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ContentArticle, InsertContentArticle } from '@shared/schema';

export const useContentArticles = () => {
  const queryClient = useQueryClient();

  const getAllArticles = useQuery({
    queryKey: ['/api/content-articles'],
    refetchOnWindowFocus: false,
  });

  const getPublishedArticles = useQuery({
    queryKey: ['/api/content-articles/published'],
    refetchOnWindowFocus: false,
  });

  const getArticleById = (id: number) => {
    return useQuery({
      queryKey: ['/api/content-articles', id],
      queryFn: async () => {
        const response = await fetch(`/api/content-articles/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }
        return response.json();
      },
      enabled: !!id,
    });
  };

  const getArticlesByCategory = (category: string) => {
    return useQuery({
      queryKey: ['/api/content-articles/category', category],
      queryFn: async () => {
        const response = await fetch(`/api/content-articles/category/${category}`);
        if (!response.ok) {
          throw new Error('Failed to fetch articles by category');
        }
        return response.json();
      },
      enabled: !!category,
    });
  };

  const getArticlesByEntityType = (entityType: string) => {
    return useQuery({
      queryKey: ['/api/content-articles/entity-type', entityType],
      queryFn: async () => {
        const response = await fetch(`/api/content-articles/entity-type/${entityType}`);
        if (!response.ok) {
          throw new Error('Failed to fetch articles by entity type');
        }
        return response.json();
      },
      enabled: !!entityType,
    });
  };

  const getArticlesByEntity = (entityType: string, entityId: number) => {
    return useQuery({
      queryKey: ['/api/content-articles/entity', entityType, entityId],
      queryFn: async () => {
        const response = await fetch(`/api/content-articles/entity/${entityType}/${entityId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch articles by entity');
        }
        return response.json();
      },
      enabled: !!entityType && !!entityId,
    });
  };

  const createArticle = useMutation({
    mutationFn: (article: InsertContentArticle) => {
      console.log('Submitting article with data:', article);
      return apiRequest<ContentArticle>('/api/content-articles', {
        method: 'POST',
        body: JSON.stringify(article),
      });
    },
    onSuccess: () => {
      // Invalidate all article queries when a new article is created
      queryClient.invalidateQueries({ queryKey: ['/api/content-articles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/content-articles/published'] });
    },
  });

  const updateArticle = useMutation({
    mutationFn: ({ id, article }: { id: number; article: Partial<InsertContentArticle> }) => {
      console.log('Updating article:', id, article);
      return apiRequest<ContentArticle>(`/api/content-articles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(article),
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate specific article query and all articles query
      queryClient.invalidateQueries({ queryKey: ['/api/content-articles', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/content-articles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/content-articles/published'] });
    },
  });

  const deleteArticle = useMutation({
    mutationFn: (id: number) => {
      return apiRequest<void>(`/api/content-articles/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, id) => {
      // Invalidate specific article query and all articles query
      queryClient.invalidateQueries({ queryKey: ['/api/content-articles', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/content-articles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/content-articles/published'] });
    },
  });

  return {
    getAllArticles,
    getPublishedArticles,
    getArticleById,
    getArticlesByCategory,
    getArticlesByEntityType,
    getArticlesByEntity,
    createArticle,
    updateArticle,
    deleteArticle,
  };
};