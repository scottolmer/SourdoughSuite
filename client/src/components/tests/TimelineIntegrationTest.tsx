import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useTimelines, type BakingTimeline, type TimelineStep } from '@/hooks/use-timelines';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ClockIcon, CalendarIcon, CheckCircle2Icon, CircleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { trackEvent } from '@/lib/analytics';

/**
 * This component allows users to test the baking timeline integration
 * by creating sample timelines and using them to create baking logs.
 */
export default function TimelineIntegrationTest() {
  const [, navigate] = useLocation();
  const { timelines, createTimeline, deleteTimeline, isLoading } = useTimelines();
  const [isCreating, setIsCreating] = useState(false);
  
  // Create a sample timeline
  const handleCreateSampleTimeline = async () => {
    setIsCreating(true);
    
    // Track event for analytics
    trackEvent('create_sample_timeline', 'testing', 'timeline_integration_test');
    
    try {
      // Generate the current time and a time 12 hours in the future
      const now = new Date();
      const finish = new Date(now.getTime() + 12 * 60 * 60 * 1000);
      
      // Create sample timeline steps
      const timelineSteps: TimelineStep[] = [
        {
          stage: 'mixing',
          stageName: 'Mix Ingredients',
          description: 'Combine all ingredients and mix until incorporated',
          startTime: new Date(now.getTime()),
          endTime: new Date(now.getTime() + 30 * 60 * 1000),
        },
        {
          stage: 'autolyse',
          stageName: 'Autolyse Rest',
          description: 'Allow the dough to rest to develop gluten structure',
          startTime: new Date(now.getTime() + 30 * 60 * 1000),
          endTime: new Date(now.getTime() + 90 * 60 * 1000),
        },
        {
          stage: 'bulk_fermentation',
          stageName: 'Bulk Fermentation',
          description: 'Bulk fermentation with folds every 30 minutes',
          startTime: new Date(now.getTime() + 90 * 60 * 1000),
          endTime: new Date(now.getTime() + 6 * 60 * 60 * 1000),
        },
        {
          stage: 'pre_shape',
          stageName: 'Pre-Shape',
          description: 'Gently pre-shape the dough and rest',
          startTime: new Date(now.getTime() + 6 * 60 * 60 * 1000),
          endTime: new Date(now.getTime() + 6.5 * 60 * 60 * 1000),
        },
        {
          stage: 'final_shape',
          stageName: 'Final Shape',
          description: 'Shape the dough and place in proofing basket',
          startTime: new Date(now.getTime() + 6.5 * 60 * 60 * 1000),
          endTime: new Date(now.getTime() + 7 * 60 * 60 * 1000),
        },
        {
          stage: 'proof',
          stageName: 'Final Proof',
          description: 'Allow the dough to proof until ready to bake',
          startTime: new Date(now.getTime() + 7 * 60 * 60 * 1000),
          endTime: new Date(now.getTime() + 9 * 60 * 60 * 1000),
        },
        {
          stage: 'bake',
          stageName: 'Bake',
          description: 'Bake the bread at high temperature with steam',
          startTime: new Date(now.getTime() + 9 * 60 * 60 * 1000),
          endTime: new Date(now.getTime() + 10 * 60 * 60 * 1000),
        },
        {
          stage: 'cool',
          stageName: 'Cool',
          description: 'Allow the bread to cool completely before slicing',
          startTime: new Date(now.getTime() + 10 * 60 * 60 * 1000),
          endTime: new Date(now.getTime() + 12 * 60 * 60 * 1000),
        },
      ];
      
      // Create the timeline
      await createTimeline.mutateAsync({
        userId: 1,
        recipeId: 108, // Using an existing recipe ID
        recipeName: 'Classic Rustic Sourdough Loaf Timeline',
        timelineData: timelineSteps,
        startTime: now,
        desiredFinishTime: finish,
        isCompleted: false,
      });
      
      console.log('Created sample timeline');
    } catch (error) {
      console.error('Error creating sample timeline:', error);
    } finally {
      setIsCreating(false);
    }
  };
  
  // Create a baking log for a timeline
  const handleCreateBakingLog = (timeline: BakingTimeline) => {
    // Track event for analytics
    trackEvent('create_baking_log_from_timeline', 'testing', 'timeline_integration_test', timeline.id);
    
    // Store the necessary data in localStorage
    localStorage.setItem('bakingLogRecipeId', timeline.recipeId.toString());
    localStorage.setItem('bakingLogTimelineId', timeline.id.toString());
    localStorage.setItem('bakingLogRecipeName', timeline.recipeName);
    
    console.log('Creating baking log for timeline:', timeline.id, 'with recipe ID:', timeline.recipeId);
    
    // Navigate to the baking log form
    navigate('/baking-logs/new');
  };
  
  // Delete a timeline
  const handleDeleteTimeline = async (timelineId: number) => {
    // Track event for analytics
    trackEvent('delete_timeline', 'testing', 'timeline_integration_test', timelineId);
    
    try {
      await deleteTimeline.mutateAsync(timelineId);
    } catch (error) {
      console.error('Error deleting timeline:', error);
    }
  };
  
  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Timeline Integration Test</h1>
        <p className="text-muted-foreground">
          This page allows you to test the baking timeline integration by creating sample timelines 
          and using them to create baking logs.
        </p>
        
        <Button 
          onClick={handleCreateSampleTimeline}
          disabled={isCreating}
          className="w-full mt-4"
        >
          {isCreating ? 'Creating...' : 'Create Sample Timeline'}
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Timelines</h2>
        
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : timelines.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted-foreground">No timelines found. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {timelines.map((timeline) => (
              <Card key={timeline.id} className={timeline.isCompleted ? 'border-green-200 bg-green-50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{timeline.recipeName}</CardTitle>
                      <CardDescription>
                        Created {format(new Date(timeline.createdAt), 'PPP')}
                      </CardDescription>
                    </div>
                    {timeline.isCompleted && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2Icon className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center text-sm">
                      <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Start: </span>
                      <span className="ml-1">{format(new Date(timeline.startTime), 'PPp')}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Finish: </span>
                      <span className="ml-1">{format(new Date(timeline.desiredFinishTime), 'PPp')}</span>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-sm font-medium mb-1">Timeline Steps:</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {timeline.timelineData.slice(0, 4).map((step, idx) => (
                          <div key={idx} className="flex items-center">
                            <CircleIcon className="h-2 w-2 mr-1 text-primary" />
                            <span className="text-xs">{step.stageName}</span>
                          </div>
                        ))}
                        {timeline.timelineData.length > 4 && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            +{timeline.timelineData.length - 4} more steps
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTimeline(timeline.id)}
                  >
                    Delete
                  </Button>
                  {!timeline.isCompleted && (
                    <Button 
                      size="sm"
                      onClick={() => handleCreateBakingLog(timeline)}
                    >
                      Create Baking Log
                    </Button>
                  )}
                  {timeline.isCompleted && timeline.bakingLogId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/baking-logs/${timeline.bakingLogId}`)}
                    >
                      View Baking Log
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}