import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Save, 
  Download,
  CalendarClock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Timeline, TimelineItem } from '../../components/ui/timeline';

// Default recipe types with their timelines
const RECIPE_TYPES = [
  { 
    value: 'basic-sourdough', 
    label: 'Basic Sourdough', 
    timeEstimate: {
      levenBuild: { hours: 8, minutes: 0 },
      autolyse: { hours: 0, minutes: 30 },
      bulk: { hours: 4, minutes: 0 },
      proof: { hours: 12, minutes: 0 },
      bake: { hours: 0, minutes: 45 }
    }
  },
  { 
    value: 'same-day-sourdough', 
    label: 'Same-Day Sourdough', 
    timeEstimate: {
      levenBuild: { hours: 4, minutes: 0 },
      autolyse: { hours: 0, minutes: 20 },
      bulk: { hours: 3, minutes: 0 },
      proof: { hours: 2, minutes: 0 },
      bake: { hours: 0, minutes: 40 }
    }
  },
  { 
    value: 'overnight-sourdough', 
    label: 'Overnight Sourdough', 
    timeEstimate: {
      levenBuild: { hours: 8, minutes: 0 },
      autolyse: { hours: 0, minutes: 30 },
      bulk: { hours: 4, minutes: 0 },
      proof: { hours: 10, minutes: 0, refrigerated: true },
      bake: { hours: 0, minutes: 45 }
    }
  },
  { 
    value: 'yeasted-bread', 
    label: 'Yeasted Bread', 
    timeEstimate: {
      levenBuild: { hours: 0, minutes: 0 },
      autolyse: { hours: 0, minutes: 20 },
      bulk: { hours: 1, minutes: 30 },
      proof: { hours: 1, minutes: 0 },
      bake: { hours: 0, minutes: 35 }
    }
  },
  { 
    value: 'custom', 
    label: 'Custom Recipe', 
    timeEstimate: {
      levenBuild: { hours: 0, minutes: 0 },
      autolyse: { hours: 0, minutes: 0 },
      bulk: { hours: 0, minutes: 0 },
      proof: { hours: 0, minutes: 0 },
      bake: { hours: 0, minutes: 0 }
    }
  }
];

// Time stage definitions
const TIME_STAGES = [
  { 
    id: 'levenBuild', 
    name: 'Levain/Starter Build', 
    description: 'Time needed to build and mature your levain or sourdough starter',
    canSkip: true
  },
  { 
    id: 'autolyse', 
    name: 'Autolyse', 
    description: 'Pre-mixing flour and water before adding salt and starter',
    canSkip: true
  },
  { 
    id: 'bulk', 
    name: 'Bulk Fermentation', 
    description: 'Primary fermentation period including stretches and folds',
    canSkip: false
  },
  { 
    id: 'proof', 
    name: 'Final Proof', 
    description: 'Final proofing period after shaping',
    canSkip: false,
    canRefrigerate: true
  },
  { 
    id: 'bake', 
    name: 'Baking Time', 
    description: 'Time needed in the oven',
    canSkip: false
  }
];

interface TimeEntry {
  hours: number;
  minutes: number;
  refrigerated?: boolean;
}

interface BakingSchedule {
  recipeType: string;
  desiredFinishTime: Date;
  activeTimeBlocks?: string[];
  timeEstimates: {
    [key: string]: TimeEntry;
  };
  calculatedSchedule?: Array<{
    stage: string;
    startTime: Date;
    endTime: Date;
    description: string;
  }>;
}

export default function TimelineCalculator() {
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<BakingSchedule>({
    recipeType: 'basic-sourdough',
    desiredFinishTime: new Date(new Date().setHours(new Date().getHours() + 24)),
    timeEstimates: RECIPE_TYPES[0].timeEstimate,
  });
  
  const [calculatedSteps, setCalculatedSteps] = useState<Array<{
    stage: string;
    startTime: Date;
    endTime: Date;
    stageName: string;
    description: string;
  }>>([]);

  // Handle recipe type change
  const handleRecipeTypeChange = (type: string) => {
    const selectedRecipe = RECIPE_TYPES.find(recipe => recipe.value === type);
    if (selectedRecipe) {
      setSchedule({
        ...schedule,
        recipeType: type,
        timeEstimates: type === 'custom' ? schedule.timeEstimates : selectedRecipe.timeEstimate
      });
    }
  };

  // Handle time estimate changes
  const handleTimeEstimateChange = (stage: string, field: 'hours' | 'minutes', value: number) => {
    if (value < 0) value = 0;
    
    setSchedule({
      ...schedule,
      timeEstimates: {
        ...schedule.timeEstimates,
        [stage]: {
          ...schedule.timeEstimates[stage],
          [field]: value
        }
      }
    });
  };

  // Handle refrigerated proof toggle
  const handleRefrigeratedChange = (stage: string, checked: boolean) => {
    setSchedule({
      ...schedule,
      timeEstimates: {
        ...schedule.timeEstimates,
        [stage]: {
          ...schedule.timeEstimates[stage],
          refrigerated: checked
        }
      }
    });
  };

  // Calculate total hours for a time entry
  const calculateTotalMinutes = (entry: TimeEntry): number => {
    return (entry.hours * 60) + entry.minutes;
  };

  // Format a date for display
  const formatDateTime = (date: Date): string => {
    return format(date, "EEE, MMM d, h:mm a");
  };

  // Calculate baking timeline
  const calculateTimeline = () => {
    // Start from the desired finish time and work backwards
    let currentTime = new Date(schedule.desiredFinishTime);
    
    const steps: Array<{
      stage: string;
      startTime: Date;
      endTime: Date;
      stageName: string;
      description: string;
    }> = [];
    
    // Process stages in reverse order
    [...TIME_STAGES].reverse().forEach(stage => {
      const timeEntry = schedule.timeEstimates[stage.id];
      const totalMinutes = calculateTotalMinutes(timeEntry);
      
      if (totalMinutes > 0) {
        // This is the end time for this stage
        const endTime = new Date(currentTime);
        
        // Calculate the start time by going back in time
        currentTime = new Date(currentTime.getTime() - totalMinutes * 60 * 1000);
        
        // Record this step
        steps.unshift({
          stage: stage.id,
          startTime: new Date(currentTime),
          endTime: new Date(endTime),
          stageName: stage.name,
          description: timeEntry.refrigerated 
            ? `${stage.description} (Refrigerated)`
            : stage.description
        });
      }
    });
    
    setCalculatedSteps(steps);
    
    toast({
      title: "Timeline Calculated",
      description: `Your baking timeline has been calculated. Start at ${formatDateTime(steps[0]?.startTime)}.`,
    });
  };

  // Generate a calendar file for download
  const generateCalendarFile = () => {
    if (calculatedSteps.length === 0) {
      toast({
        title: "No Timeline Generated",
        description: "Please calculate your timeline first.",
        variant: "destructive",
      });
      return;
    }
    
    // Create iCalendar content
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BakehouseBreads//Baking Timeline//EN"
    ];
    
    calculatedSteps.forEach((step, index) => {
      const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, "");
      };
      
      icsContent.push("BEGIN:VEVENT");
      icsContent.push(`UID:bakehouse-${index}-${Date.now()}`);
      icsContent.push(`DTSTAMP:${formatICSDate(new Date())}`);
      icsContent.push(`DTSTART:${formatICSDate(step.startTime)}`);
      icsContent.push(`DTEND:${formatICSDate(step.endTime)}`);
      icsContent.push(`SUMMARY:${step.stageName}`);
      icsContent.push(`DESCRIPTION:${step.description}`);
      icsContent.push("END:VEVENT");
    });
    
    icsContent.push("END:VCALENDAR");
    
    // Create a download link
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent.join("\r\n")));
    element.setAttribute('download', `baking-timeline-${Date.now()}.ics`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Calendar Downloaded",
      description: "Your baking timeline has been downloaded as a calendar file.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Baking Timeline Calculator</h1>
          <p className="text-gray-600">
            Plan your baking schedule based on when you want your bread to be ready
          </p>
        </div>
        <div>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipe-type">Recipe Type</Label>
                <Select
                  value={schedule.recipeType}
                  onValueChange={handleRecipeTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipe type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECIPE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="finish-time">Desired Finish Time</Label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        id="finish-time"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {schedule.desiredFinishTime ? format(schedule.desiredFinishTime, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={schedule.desiredFinishTime}
                        onSelect={(date) => date && setSchedule({
                          ...schedule,
                          desiredFinishTime: new Date(date.setHours(
                            schedule.desiredFinishTime.getHours(),
                            schedule.desiredFinishTime.getMinutes()
                          ))
                        })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="flex">
                    <Input 
                      type="number" 
                      min="0" 
                      max="23"
                      value={schedule.desiredFinishTime.getHours()}
                      onChange={(e) => {
                        const hours = parseInt(e.target.value, 10) || 0;
                        const newTime = new Date(schedule.desiredFinishTime);
                        newTime.setHours(hours);
                        setSchedule({...schedule, desiredFinishTime: newTime});
                      }}
                      className="w-16 text-center"
                    />
                    <span className="mx-1 flex items-center">:</span>
                    <Input 
                      type="number" 
                      min="0" 
                      max="59"
                      value={schedule.desiredFinishTime.getMinutes()}
                      onChange={(e) => {
                        const minutes = parseInt(e.target.value, 10) || 0;
                        const newTime = new Date(schedule.desiredFinishTime);
                        newTime.setMinutes(minutes);
                        setSchedule({...schedule, desiredFinishTime: newTime});
                      }}
                      className="w-16 text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Time Estimates</h3>
              <p className="text-sm text-muted-foreground">
                Adjust the time needed for each stage of the bread making process.
                {schedule.recipeType === 'custom' ? 
                  " Enter your custom times below." : 
                  " Default times for the selected recipe are shown."}
              </p>

              <div className="space-y-4">
                {TIME_STAGES.map((stage) => (
                  <div key={stage.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b pb-4">
                    <div className="md:col-span-2">
                      <h4 className="font-medium">{stage.name}</h4>
                      <p className="text-sm text-muted-foreground">{stage.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`${stage.id}-hours`}>Hours</Label>
                        <Input
                          id={`${stage.id}-hours`}
                          type="number"
                          min="0"
                          value={schedule.timeEstimates[stage.id]?.hours || 0}
                          onChange={(e) => handleTimeEstimateChange(
                            stage.id, 
                            'hours', 
                            parseInt(e.target.value, 10) || 0
                          )}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${stage.id}-minutes`}>Minutes</Label>
                        <Input
                          id={`${stage.id}-minutes`}
                          type="number"
                          min="0"
                          max="59"
                          value={schedule.timeEstimates[stage.id]?.minutes || 0}
                          onChange={(e) => handleTimeEstimateChange(
                            stage.id, 
                            'minutes', 
                            parseInt(e.target.value, 10) || 0
                          )}
                        />
                      </div>
                    </div>
                    <div>
                      {stage.canRefrigerate && (
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`${stage.id}-refrigerated`}
                            checked={schedule.timeEstimates[stage.id]?.refrigerated || false}
                            onCheckedChange={(checked) => 
                              handleRefrigeratedChange(stage.id, checked as boolean)}
                          />
                          <label
                            htmlFor={`${stage.id}-refrigerated`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Refrigerated
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={generateCalendarFile} disabled={calculatedSteps.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download Calendar
          </Button>
          <Button onClick={calculateTimeline} className="bg-primary hover:bg-primary/90 text-white">
            <CalendarClock className="mr-2 h-4 w-4" />
            Calculate Timeline
          </Button>
        </div>
      </div>

      {calculatedSteps.length > 0 && (
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Baking Timeline</h2>
            <p className="text-gray-600">
              Follow this schedule to have your bread ready by {formatDateTime(schedule.desiredFinishTime)}
            </p>
          </div>
          <div>
            <Timeline>
              {calculatedSteps.map((step, index) => (
                <TimelineItem key={index}>
                  <div className="font-medium">{step.stageName}</div>
                  <div className="text-sm text-muted-foreground">{step.description}</div>
                  <div className="text-sm font-medium mt-2">
                    <time dateTime={step.startTime.toISOString()}>{formatDateTime(step.startTime)}</time>
                    {' to '}
                    <time dateTime={step.endTime.toISOString()}>{formatDateTime(step.endTime)}</time>
                  </div>
                </TimelineItem>
              ))}
            </Timeline>

            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Tips for Success</h3>
              <ul className="text-sm space-y-1">
                <li>• Ambient temperature affects fermentation. Warmer kitchens may require less time.</li>
                <li>• This timeline is an estimate. Watch your dough, not the clock.</li>
                <li>• Refrigeration significantly slows fermentation and develops flavor.</li>
                <li>• Your sourdough starter's strength and activity will impact actual times.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}