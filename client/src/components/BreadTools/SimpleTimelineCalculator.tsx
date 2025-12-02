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
import { 
  CalendarClock,
  Clock,
  AlertTriangle,
  Moon,
  Thermometer,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

// Basic time stage definitions with special properties
const TIME_STAGES = [
  { 
    id: 'levenBuild', 
    name: 'Levain/Starter Build', 
    timeHours: 8, 
    timeMinutes: 0,
    hasWaterTemp: true, // This stage needs water temperature recommendation
  },
  { id: 'autolyse', name: 'Autolyse', timeHours: 0, timeMinutes: 30 },
  { id: 'bulk', name: 'Bulk Fermentation', timeHours: 4, timeMinutes: 0 },
  { id: 'preShape', name: 'Pre-shape', timeHours: 0, timeMinutes: 20 },
  { id: 'finalShape', name: 'Final Shape', timeHours: 0, timeMinutes: 20 },
  { id: 'proof', name: 'Final Proof', timeHours: 12, timeMinutes: 0 },
  { id: 'bake', name: 'Baking Time', timeHours: 0, timeMinutes: 45 }
];

// Format date for datetime-local input (YYYY-MM-DDThh:mm)
const formatDateTimeForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface TimelineCalculatorProps {
  recipeId?: string;
  recipeName?: string;
  prefilledTimes?: Array<{
    id: string;
    hours: number;
    minutes: number;
    hasWaterTemp?: boolean;
  }>;
}

export default function SimpleTimelineCalculator({ 
  recipeId, 
  recipeName,
  prefilledTimes 
}: TimelineCalculatorProps = {}) {
  const { toast } = useToast();
  const [finishDate, setFinishDate] = useState<Date>(new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours from now
  // Initialize time entries, using prefilled times if provided
  const [timeEntries, setTimeEntries] = useState(() => {
    // Start with default times
    const entries = TIME_STAGES.map(stage => ({
      id: stage.id,
      name: stage.name,
      hours: stage.timeHours,
      minutes: stage.timeMinutes,
      hasWaterTemp: stage.hasWaterTemp || false
    }));
    
    // If we have prefilled times, override the defaults
    if (prefilledTimes && prefilledTimes.length > 0) {
      return entries.map(entry => {
        // Find matching prefilled time if any
        const prefilled = prefilledTimes.find(pt => pt.id === entry.id);
        if (prefilled) {
          return {
            ...entry,
            hours: prefilled.hours,
            minutes: prefilled.minutes,
            hasWaterTemp: prefilled.hasWaterTemp !== undefined ? prefilled.hasWaterTemp : entry.hasWaterTemp
          };
        }
        return entry;
      });
    }
    
    return entries;
  });
  
  const [calculatedSteps, setCalculatedSteps] = useState<Array<{
    name: string;
    startTime: Date;
    endTime: Date;
    hasConflict?: boolean;
    waterTempNote?: string;
    waterTemp?: number;
  }>>([]);
  
  // Sleep time avoidance settings
  const [avoidSleepTime, setAvoidSleepTime] = useState(true);
  const [sleepStartHour, setSleepStartHour] = useState(22); // 10 PM
  const [sleepEndHour, setSleepEndHour] = useState(7);     // 7 AM
  
  // Temperature adjustment settings
  const [roomTemperature, setRoomTemperature] = useState(75); // Default 75°F
  const [useTemperatureAdjustment, setUseTemperatureAdjustment] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [temperatureImpact, setTemperatureImpact] = useState<string | null>(null);
  const [fermentationFactor, setFermentationFactor] = useState<number | null>(null);
  const [proofingOption, setProofingOption] = useState<'room' | 'cold'>('room'); // Default to room temperature

  // Handle time entry changes
  const handleTimeChange = (id: string, field: 'hours' | 'minutes', value: number) => {
    setTimeEntries(entries =>
      entries.map(entry =>
        entry.id === id
          ? { ...entry, [field]: Math.max(0, value) }
          : entry
      )
    );
  };

  // Simple date formatter for display
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Check if a time falls within sleep hours
  const isSleepTime = (time: Date): boolean => {
    if (!avoidSleepTime) return false;
    
    const hour = time.getHours();
    
    if (sleepStartHour < sleepEndHour) {
      // Sleep time is within the same day (e.g., 2:00 to 7:00)
      return hour >= sleepStartHour && hour < sleepEndHour;
    } else {
      // Sleep time spans midnight (e.g., 22:00 to 07:00 next day)
      return hour >= sleepStartHour || hour < sleepEndHour;
    }
  };
  
  // Adjust fermentation times based on temperature
  const adjustTimeForTemperature = async () => {
    // No adjustment needed for standard temperature at room temperature
    if (!useTemperatureAdjustment || (proofingOption === 'room' && roomTemperature === 75)) {
      setIsAdjusting(false);
      setTemperatureImpact(null);
      setFermentationFactor(null);
      return timeEntries;
    }
    
    setIsAdjusting(true);
    
    try {
      // Create the stages object for the API
      const stages = timeEntries.reduce((acc, entry) => {
        acc[entry.id] = {
          hours: entry.hours,
          minutes: entry.minutes,
          // Cold proofing affects the proof stage
          refrigerated: proofingOption === 'cold' && entry.id === 'proof'
        };
        return acc;
      }, {} as Record<string, { hours: number, minutes: number, refrigerated: boolean }>);
      
      // Call the API
      const response = await axios.post('/api/ai/adjust-fermentation-times', {
        stages,
        roomTemperature: proofingOption === 'cold' ? 38 : roomTemperature, // Use 38°F for cold proofing
        proofingType: proofingOption
      });
      
      const data = response.data;
      
      if (data && data.adjustedStages) {
        // Store temperature impact info
        setTemperatureImpact(data.temperatureImpact || null);
        setFermentationFactor(data.fermentationFactor || null);
        
        // Update timeEntries with adjusted values
        const adjusted = timeEntries.map(entry => {
          const adjustedStage = data.adjustedStages[entry.id];
          if (adjustedStage) {
            return {
              ...entry,
              hours: adjustedStage.hours || 0,
              minutes: adjustedStage.minutes || 0
            };
          }
          return entry;
        });
        
        toast({
          title: "Temperature Adjustment Applied",
          description: proofingOption === 'cold' 
            ? "Timeline adjusted for cold proofing (38°F)." 
            : `Timeline adjusted for ${roomTemperature}°F room temperature.`,
        });
        
        setIsAdjusting(false);
        return adjusted;
      } else {
        throw new Error("Invalid response format from temperature adjustment API");
      }
    } catch (error) {
      console.error("Failed to adjust for temperature:", error);
      toast({
        title: "Temperature Adjustment Failed",
        description: "Using standard times. Please try again later.",
        variant: "destructive"
      });
      setIsAdjusting(false);
      return timeEntries;
    }
  };

  // Get the recommended water temperature for starter/levain
  const getWaterTemperature = (targetTemp: number = 75) => {
    // Base case with standard room temperature
    if (targetTemp === 75) {
      return {
        temp: 75,
        note: "Use 75°F (24°C) water for your levain build to maintain optimal fermentation activity."
      };
    }
    
    // If room is warmer than ideal
    if (targetTemp > 75) {
      const adjustment = Math.min(15, targetTemp - 75);
      const waterTemp = Math.max(45, 75 - adjustment);
      return {
        temp: waterTemp,
        note: `Use cooler water at ${waterTemp}°F (${Math.round((waterTemp-32)*5/9)}°C) to offset the warmer room temperature.`
      };
    }
    
    // If room is cooler than ideal
    if (targetTemp < 75) {
      const adjustment = Math.min(20, 75 - targetTemp);
      const waterTemp = Math.min(95, 75 + adjustment);
      return {
        temp: waterTemp,
        note: `Use warmer water at ${waterTemp}°F (${Math.round((waterTemp-32)*5/9)}°C) to boost initial fermentation activity in cooler conditions.`
      };
    }
    
    // Default fallback
    return {
      temp: 75,
      note: "Use 75°F (24°C) water for standard fermentation conditions."
    };
  };

  // Calculate baking timeline
  const calculateTimeline = async () => {
    // First adjust times based on temperature if needed
    let entries = [...timeEntries];
    
    if (useTemperatureAdjustment && (proofingOption === 'cold' || roomTemperature !== 75)) {
      entries = await adjustTimeForTemperature();
    } else {
      setTemperatureImpact(null);
      setFermentationFactor(null);
    }
    
    // Start from the desired finish time and work backwards
    let currentTime = new Date(finishDate);
    const steps: Array<{
      name: string;
      startTime: Date;
      endTime: Date;
      hasConflict?: boolean;
      waterTempNote?: string;  // Added for water temperature recommendations
      waterTemp?: number;      // Added for water temperature value
    }> = [];
    
    // Process stages in reverse order
    [...entries].reverse().forEach(stage => {
      const totalMinutes = (stage.hours * 60) + stage.minutes;
      
      if (totalMinutes > 0) {
        // This is the end time for this stage
        const endTime = new Date(currentTime);
        
        // Calculate the start time by going back in time
        currentTime = new Date(currentTime.getTime() - totalMinutes * 60 * 1000);
        
        // Check if this step falls in sleep time
        const hasStartTimeConflict = isSleepTime(currentTime);
        const hasEndTimeConflict = isSleepTime(endTime);
        
        // Any step that conflicts with sleep time should be flagged
        const hasConflict = hasStartTimeConflict || hasEndTimeConflict;
        
        // Record this step with water temperature recommendation for levain if applicable
        const step: any = {
          name: stage.name,
          startTime: new Date(currentTime),
          endTime: new Date(endTime),
          hasConflict
        };
        
        // Add water temperature recommendation for levain building
        if (stage.id === 'levenBuild') {
          // Check if this stage has water temp and either we're using adjustment or the stage explicitly requires it
          if (useTemperatureAdjustment || stage.hasWaterTemp) {
            const waterTempRec = getWaterTemperature(proofingOption === 'room' ? roomTemperature : 75);
            step.waterTempNote = waterTempRec.note;
            step.waterTemp = waterTempRec.temp;
          }
        }
        
        steps.unshift(step);
      }
    });
    
    setCalculatedSteps(steps);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Baking Timeline Calculator</CardTitle>
          <CardDescription>
            {recipeName ? (
              <div className="flex items-center gap-2 mt-1">
                <div className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 px-2 py-1 rounded text-xs font-medium">
                  Pre-filled from recipe: {recipeName}
                </div>
              </div>
            ) : (
              "Plan your baking schedule based on when you want your bread to be ready"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Finish Time */}
            <div className="space-y-2">
              <Label htmlFor="finishDate">Desired Finish Date/Time</Label>
              <Input
                id="finishDate"
                type="datetime-local"
                value={formatDateTimeForInput(finishDate)}
                min={formatDateTimeForInput(new Date())}
                onChange={(e) => {
                  if (e.target.value) {
                    // Create date preserving the exact time selected by user
                    const [datePart, timePart] = e.target.value.split('T');
                    const [year, month, day] = datePart.split('-').map(Number);
                    const [hours, minutes] = timePart.split(':').map(Number);
                    
                    // Create date with local timezone
                    const newDate = new Date();
                    newDate.setFullYear(year);
                    newDate.setMonth(month - 1); // JS months are 0-indexed
                    newDate.setDate(day);
                    newDate.setHours(hours);
                    newDate.setMinutes(minutes);
                    newDate.setSeconds(0);
                    newDate.setMilliseconds(0);
                    
                    setFinishDate(newDate);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is when your bread will be ready to eat
              </p>
            </div>
            
            {/* Sleep Time Avoidance */}
            <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Moon className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-base font-medium">Avoid Sleeping Hours</h3>
                </div>
                <Switch
                  checked={avoidSleepTime}
                  onCheckedChange={setAvoidSleepTime}
                  aria-label="Toggle sleep time avoidance"
                />
              </div>
              
              {avoidSleepTime && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label htmlFor="sleepStartHour">Sleep Start Time</Label>
                    <div className="flex items-center">
                      <Input
                        id="sleepStartHour"
                        type="number"
                        min="0"
                        max="23"
                        value={sleepStartHour}
                        onChange={(e) => setSleepStartHour(parseInt(e.target.value) || 0)}
                        className="w-16"
                      />
                      <span className="px-2">:00</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({sleepStartHour < 12 ? `${sleepStartHour} AM` : sleepStartHour === 12 ? '12 PM' : `${sleepStartHour - 12} PM`})
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="sleepEndHour">Sleep End Time</Label>
                    <div className="flex items-center">
                      <Input
                        id="sleepEndHour"
                        type="number"
                        min="0"
                        max="23"
                        value={sleepEndHour}
                        onChange={(e) => setSleepEndHour(parseInt(e.target.value) || 0)}
                        className="w-16"
                      />
                      <span className="px-2">:00</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({sleepEndHour < 12 ? `${sleepEndHour} AM` : sleepEndHour === 12 ? '12 PM' : `${sleepEndHour - 12} PM`})
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-1">
                The calculator will adjust your schedule to avoid active steps during these hours when possible
              </p>
            </div>
            
            {/* Temperature Adjustment */}
            <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  <h3 className="text-base font-medium">Temperature Adjustment</h3>
                </div>
                <Switch
                  checked={useTemperatureAdjustment}
                  onCheckedChange={setUseTemperatureAdjustment}
                  aria-label="Toggle temperature adjustment"
                />
              </div>
              
              {useTemperatureAdjustment && (
                <div className="space-y-4 pt-2">
                  {/* Proofing Type Selection */}
                  <div className="space-y-2">
                    <Label>Proofing Type</Label>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroup
                          value={proofingOption}
                          onValueChange={(value) => setProofingOption(value as 'room' | 'cold')}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="room" id="room-temp" />
                            <Label htmlFor="room-temp" className="cursor-pointer">Room Temperature</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cold" id="cold-temp" />
                            <Label htmlFor="cold-temp" className="cursor-pointer">Cold Proof (38°F)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                  
                  {/* Room Temperature Input - only show if room temperature proofing is selected */}
                  {proofingOption === 'room' && (
                    <div className="space-y-2">
                      <Label htmlFor="roomTemperature">Room Temperature (°F)</Label>
                      <div className="flex items-center">
                        <Input
                          id="roomTemperature"
                          type="number"
                          min="32"
                          max="100"
                          value={roomTemperature}
                          onChange={(e) => setRoomTemperature(parseInt(e.target.value) || 75)}
                          className="w-16"
                          aria-label="Room temperature in Fahrenheit"
                        />
                        <span className="px-2">°F</span>
                        {roomTemperature !== 75 && (
                          <span className={`text-sm ml-2 ${roomTemperature > 75 ? 'text-orange-500' : 'text-blue-500'}`}>
                            {roomTemperature > 75 ? 'Warmer than standard (faster fermentation)' : 'Cooler than standard (slower fermentation)'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Cold Proofing Info */}
                  {proofingOption === 'cold' && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded text-sm text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      <p>Cold proofing (retardation) at 38°F (3°C) significantly slows fermentation, allowing for:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Enhanced flavor development</li>
                        <li>More flexible baking schedule</li>
                        <li>Improved dough handling</li>
                      </ul>
                    </div>
                  )}
                  
                  {temperatureImpact && (
                    <div className={`mt-2 p-2 rounded text-sm ${proofingOption === 'cold' ? 'bg-blue-50 text-blue-800' : roomTemperature > 75 ? 'bg-orange-50 text-orange-800' : 'bg-blue-50 text-blue-800'}`}>
                      {temperatureImpact}
                      {fermentationFactor && (
                        <div className="font-medium mt-1">
                          Fermentation factor: {fermentationFactor.toFixed(2)}x {proofingOption === 'cold' ? 'slower' : roomTemperature > 75 ? 'faster' : 'slower'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-1">
                Standard fermentation times are calibrated for 75°F (24°C). Enable this to adjust for your current room temperature.
              </p>
            </div>
            
            {/* Time Entries */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Time Estimates</h3>
              
              {timeEntries.map((entry) => (
                <div key={entry.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b pb-4">
                  <div className="font-medium">{entry.name}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`${entry.id}-hours`}>Hours</Label>
                      <Input
                        id={`${entry.id}-hours`}
                        type="number"
                        min="0"
                        value={entry.hours}
                        onChange={(e) => handleTimeChange(
                          entry.id,
                          'hours',
                          parseInt(e.target.value, 10) || 0
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${entry.id}-minutes`}>Minutes</Label>
                      <Input
                        id={`${entry.id}-minutes`}
                        type="number"
                        min="0"
                        max="59"
                        value={entry.minutes}
                        onChange={(e) => handleTimeChange(
                          entry.id,
                          'minutes',
                          parseInt(e.target.value, 10) || 0
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button 
            onClick={() => calculateTimeline()} 
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={isAdjusting}
          >
            {isAdjusting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adjusting for Temperature...
              </>
            ) : useTemperatureAdjustment ? (
              <>
                <Thermometer className="mr-2 h-4 w-4" />
                Calculate with Temperature
              </>
            ) : (
              <>
                <CalendarClock className="mr-2 h-4 w-4" />
                Calculate Timeline
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {calculatedSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Baking Timeline</CardTitle>
            <CardDescription>
              Follow this schedule to have your bread ready by {formatDate(finishDate)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {calculatedSteps.map((step, index) => (
                <div 
                  key={index} 
                  className={`border-l-2 ${step.hasConflict ? 'border-amber-400' : 'border-primary'} pl-4 py-2`}
                >
                  <div className="font-medium">{step.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(step.startTime)} to {formatDate(step.endTime)}
                  </div>
                  
                  {/* Water temperature recommendation for levain building */}
                  {step.waterTempNote && step.waterTemp && (
                    <div className="mt-2 flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-900">
                      <Thermometer className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-medium text-blue-800 dark:text-blue-300">
                          Water Temperature: {step.waterTemp}°F ({(((step.waterTemp as number)-32)*5/9).toFixed(1)}°C)
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                          {step.waterTempNote}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {step.hasConflict && (
                    <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950 rounded border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-800 dark:text-amber-300">
                        This step overlaps with your sleep time. Consider adjusting your finish time 
                        or sleeping schedule if this step requires your attention.
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {avoidSleepTime && calculatedSteps.some(step => step.hasConflict) && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-900">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-medium">Tip:</span> Your schedule has steps that overlap with your sleep hours. 
                    Try adjusting your finish time by a few hours earlier or later to find a better schedule.
                  </p>
                </div>
              )}
              
              {useTemperatureAdjustment && temperatureImpact && (
                <div className={`mt-4 p-3 ${proofingOption === 'cold' ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300' : roomTemperature > 75 ? 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-900 text-orange-800 dark:text-orange-300' : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300'} rounded border`}>
                  <div className="flex items-start gap-2">
                    <Thermometer className={`h-5 w-5 ${proofingOption === 'cold' ? 'text-blue-500' : roomTemperature > 75 ? 'text-orange-500' : 'text-blue-500'} flex-shrink-0 mt-0.5`} />
                    <div>
                      <div className="font-medium">
                        {proofingOption === 'cold' ? 'Cold Proofing Adjusted Timeline' : 'Temperature Adjusted Timeline'}
                      </div>
                      <p className="text-sm mt-1">{temperatureImpact}</p>
                      {fermentationFactor && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Fermentation factor:</span> {fermentationFactor.toFixed(2)}x {proofingOption === 'cold' ? 'slower' : roomTemperature > 75 ? 'faster' : 'slower'} than standard
                          {proofingOption === 'room' && ' (75°F)'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}