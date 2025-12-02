import React from 'react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

/**
 * Example component showing how to use Google Analytics event tracking
 */
export const AnalyticsExample: React.FC = () => {
  // Example handler for a button click
  const handleInteraction = (action: string) => {
    // Track the event with Google Analytics
    trackEvent(action, 'user_interaction', 'example_component');
    
    // Your regular event handler logic here
    console.log(`User performed action: ${action}`);
  };
  
  return (
    <div className="p-4 border rounded-md bg-muted/20">
      <h3 className="text-lg font-medium mb-2">Analytics Example</h3>
      <p className="text-sm text-muted-foreground mb-4">
        These buttons demonstrate how to track user interactions with Google Analytics.
        Click them to fire events that will be recorded in your GA dashboard.
      </p>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleInteraction('recipe_shared')}
        >
          Share Recipe
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleInteraction('recipe_saved')}
        >
          Save Recipe
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleInteraction('recipe_printed')}
        >
          Print Recipe
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleInteraction('baking_log_created')}
        >
          Create Baking Log
        </Button>
      </div>
    </div>
  );
};