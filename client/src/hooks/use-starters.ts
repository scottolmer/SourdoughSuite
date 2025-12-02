import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SourdoughStarter } from "../../../shared/schema";

// Extended type with match score
type StarterWithMatchScore = SourdoughStarter & {
  matchScore?: number;
};

export function useStarters() {
  const queryResult = useQuery<SourdoughStarter[]>({ 
    queryKey: ['/api/starters'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Add explicit logging outside the query options
  const { data, error, isLoading } = queryResult;
  
  if (isLoading) {
    console.log('useStarters hook is loading data...');
  } else if (error) {
    console.error('useStarters hook error:', error);
  } else if (data) {
    console.log('useStarters hook data received:', data);
  }
  
  return queryResult;
}

export function useRecommendStarter(flavor: string[] = [], mainFlour?: string) {
  return useQuery<SourdoughStarter[], unknown, StarterWithMatchScore[]>({ 
    queryKey: ['/api/starters'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (starters) => {
      // If no parameters were provided, return all starters
      if (!flavor.length && !mainFlour) {
        return starters;
      }
      
      // Filter and rank starters based on matching criteria
      return starters
        .map((starter) => {
          let score = 0;
          
          // Score for matching main flour
          if (mainFlour && starter.mainFlour.toLowerCase().includes(mainFlour.toLowerCase())) {
            score += 5;
          }
          
          // Score for matching flavor profiles
          if (flavor.length > 0 && starter.flavor) {
            const starterFlavor = typeof starter.flavor === 'string' 
              ? JSON.parse(starter.flavor) 
              : starter.flavor;
              
            flavor.forEach(f => {
              // Check if this flavor profile is in the starter's flavor profile
              if (typeof starterFlavor === 'object') {
                // Get all flavor keys from the starter
                const flavorKeys = Object.keys(starterFlavor);
                
                // Direct match - the exact flavor is present
                if (flavorKeys.includes(f)) {
                  // Add the intensity value (1-5) to the score
                  score += starterFlavor[f] || 3;
                }
                
                // Partial match handling for related flavors
                if (f === 'tangy' && flavorKeys.includes('acidic')) {
                  score += Math.floor((starterFlavor['acidic'] || 0) * 0.8);
                }
                
                if (f === 'bold' && flavorKeys.includes('rustic')) {
                  score += Math.floor((starterFlavor['rustic'] || 0) * 0.7);
                }
                
                if (f === 'complex' && flavorKeys.includes('sweet')) {
                  score += Math.floor((starterFlavor['sweet'] || 0) * 0.6);
                }
                
                if (f === 'mild' && flavorKeys.includes('fruity')) {
                  score += Math.floor((starterFlavor['fruity'] || 0) * 0.6);
                }
              }
            });
          }
          
          // Special scoring for our four specific starters
          // This ensures our recommendations align with the starter analysis function
          if (flavor.includes('tangy') && flavor.includes('acidic') && flavor.includes('classic')) {
            // Boost San Francisco Style Starter for classic sourdough
            if (starter.name.includes('San Francisco')) {
              score += 10;
            }
          }
          
          if (flavor.includes('balanced') && flavor.includes('versatile') && flavor.includes('moderate tang')) {
            // Boost House Blend Starter for balanced starter percentage recipes
            if (starter.name.includes('House Blend')) {
              score += 10;
            }
          }
          
          if (flavor.includes('mild') && flavor.includes('fruity')) {
            // Boost Traditional Rye Starter for low starter percentage recipes
            if (starter.name.includes('Rye')) {
              score += 10;
            }
          }
          
          if (flavor.includes('sweet') && flavor.includes('complex') && flavor.includes('umami')) {
            // Boost Koji Starter for moderate starter percentage recipes
            if (starter.name.includes('Koji')) {
              score += 10;
            }
          }
          
          // Return starter with its score
          return {
            ...starter,
            matchScore: score
          };
        })
        // Sort by match score (highest first)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        // Take the top 3 recommendations
        .slice(0, 3);
    }
  });
}