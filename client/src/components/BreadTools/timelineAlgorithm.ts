import { TimelineData, TimelineStep, BreadProcess, TimelinePeriod } from './types';

/**
 * Environmental factors impact fermentation rates significantly
 */
interface EnvironmentalFactors {
  ambientTemperature: number;
  seasonalAdjustment: string;
  humidity?: number;
  altitude?: number;
}

/**
 * Step with calculated start and end times
 */
interface ScheduledStep {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  isActive: boolean;
  isFlexible: boolean;
  temperature?: number;
  description?: string;
  dependencies?: string[];
}

/**
 * Conflict between a step and an excluded time block
 */
interface TimeConflict {
  step: ScheduledStep;
  excludedPeriod: TimelinePeriod;
  overlapStart: Date;
  overlapEnd: Date;
  overlapDuration: number; // in minutes
}

/**
 * Environmental factors and notes returned by the AI
 */
export interface EnvironmentalNotes {
  temperature?: string;
  humidity?: string;
  starter?: string;
  [key: string]: string | undefined;
}

/**
 * Final calculated timeline result
 */
export interface GeneratedTimeline {
  steps: ScheduledStep[];
  targetCompletionTime: Date;
  totalDuration: number; // in minutes
  feasible: boolean;
  warnings: string[];
  unresolvedConflicts: TimeConflict[];
  // AI-specific additions
  suggestions?: string[];
  totalActiveTime?: number;
  difficultyLevel?: string;
  environmentalNotes?: EnvironmentalNotes;
}

/**
 * Generate a baking timeline working backward from the target completion time
 */
export function generateTimeline(timelineData: TimelineData): GeneratedTimeline {
  // Extract key data
  const targetCompletionTime = getTargetCompletionTime(timelineData);
  const processSteps = getProcessSteps(timelineData);
  const environmentalFactors = {
    ambientTemperature: timelineData.environment.temperature,
    seasonalAdjustment: timelineData.environment.seasonalAdjustment
  };
  const excludedPeriods = convertExcludedPeriods(timelineData.constraints.excludedPeriods);
  
  // Initial setup
  const warnings: string[] = [];
  let scheduledSteps: ScheduledStep[] = [];
  
  // Sort steps in reverse order (final step first)
  const reversedSteps = [...processSteps].reverse();
  
  // Set end point (last step ends at target completion time)
  let currentTime = new Date(targetCompletionTime);
  
  // Generate unique IDs for steps
  let stepCounter = 1;
  
  // Build timeline backwards
  for (const step of reversedSteps) {
    // Calculate duration with environmental adjustments
    const adjustedDuration = calculateAdjustedDuration(
      step, 
      environmentalFactors, 
      timelineData.environment.starter.name
    );
    
    // Calculate start time by subtracting duration from current time
    const stepEndTime = new Date(currentTime);
    const stepStartTime = new Date(currentTime.getTime() - (adjustedDuration * 60 * 1000));
    
    // Add step to timeline
    scheduledSteps.push({
      id: `step-${stepCounter++}`,
      name: step.name,
      startTime: stepStartTime,
      endTime: stepEndTime,
      duration: adjustedDuration,
      isActive: step.isActive,
      isFlexible: step.name !== 'Bake', // Most steps can be adjusted except baking
      description: step.description
    });
    
    // Update current time for next iteration
    currentTime = stepStartTime;
  }
  
  // Sort steps chronologically
  scheduledSteps.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  // Resolve scheduling conflicts
  const resolvedResults = resolveConstraints(scheduledSteps, excludedPeriods);
  
  // Calculate total duration
  const totalDuration = Math.round(
    (targetCompletionTime.getTime() - scheduledSteps[0].startTime.getTime()) / (60 * 1000)
  );
  
  // Add AI-specific data when using local algorithm
  return {
    steps: resolvedResults.steps,
    targetCompletionTime: targetCompletionTime,
    totalDuration: totalDuration,
    feasible: resolvedResults.unresolvedConflicts.length === 0,
    warnings: warnings,
    unresolvedConflicts: resolvedResults.unresolvedConflicts,
    // Default AI-specific additions for local algorithm
    suggestions: [
      "For better flavor development, consider extending the bulk fermentation by 30-60 minutes if possible.",
      "Temperature control is critical for consistent results - aim to keep your dough around 75°F during fermentation.",
      "A longer, colder final proof will develop more complex flavors in your bread."
    ],
    totalActiveTime: resolvedResults.steps.filter(step => step.isActive).reduce((sum, step) => sum + step.duration, 0),
    difficultyLevel: "intermediate",
    environmentalNotes: {
      temperature: "Room temperature will significantly impact fermentation speed. Adjust timing if your kitchen is especially warm or cool.",
      humidity: "If your environment is very dry, consider covering the dough more tightly during fermentation.",
      starter: "A vigorous, active starter is essential for proper fermentation and rise."
    }
  };
}

/**
 * Extract process steps from the timeline data
 */
function getProcessSteps(timelineData: TimelineData): BreadProcess[] {
  // If recipe has predefined process steps, use those
  if (timelineData.recipe.process.steps && timelineData.recipe.process.steps.length > 0) {
    return timelineData.recipe.process.steps;
  }

  // Otherwise, use default steps based on recipe type
  return getDefaultStepsForRecipe(timelineData.recipe.name);
}

/**
 * Get default process steps for common recipe types
 */
function getDefaultStepsForRecipe(recipeName: string): BreadProcess[] {
  // Map of recipe types to their default process steps
  const recipeSteps: Record<string, BreadProcess[]> = {
    'country-loaf': [
      { name: "Feed Starter", duration: 120, isActive: true, description: "Feed starter to build strength" },
      { name: "Autolyse", duration: 60, isActive: true, description: "Mix flour and water, rest to hydrate" },
      { name: "Mix", duration: 30, isActive: true, description: "Add starter and salt, mix thoroughly" },
      { name: "Bulk Fermentation", duration: 300, isActive: false, description: "Allow dough to ferment with periodic folds" },
      { name: "Shape", duration: 20, isActive: true, description: "Pre-shape, bench rest, then final shaping" },
      { name: "Final Proof", duration: 720, isActive: false, description: "Allow shaped dough to proof" },
      { name: "Bake", duration: 45, isActive: true, description: "Bake in Dutch oven or on stone" },
      { name: "Cool", duration: 60, isActive: false, description: "Allow bread to cool completely" }
    ],
    'sandwich-bread': [
      { name: "Feed Starter", duration: 120, isActive: true, description: "Feed starter to build strength" },
      { name: "Mix Dough", duration: 30, isActive: true, description: "Mix all ingredients including starter" },
      { name: "Bulk Fermentation", duration: 120, isActive: false, description: "Allow dough to rise" },
      { name: "Shape", duration: 15, isActive: true, description: "Shape and place in loaf pan" },
      { name: "Final Proof", duration: 90, isActive: false, description: "Allow shaped dough to rise in pan" },
      { name: "Bake", duration: 35, isActive: true, description: "Bake until golden brown" },
      { name: "Cool", duration: 30, isActive: false, description: "Allow bread to cool before slicing" }
    ],
    'focaccia': [
      { name: "Feed Starter", duration: 120, isActive: true, description: "Feed starter to build strength" },
      { name: "Mix Dough", duration: 20, isActive: true, description: "Mix all ingredients" },
      { name: "Bulk Fermentation", duration: 90, isActive: false, description: "Allow dough to ferment with folds" },
      { name: "Transfer to Pan", duration: 10, isActive: true, description: "Spread in oiled pan" },
      { name: "Pan Proof", duration: 60, isActive: false, description: "Allow dough to rise in pan" },
      { name: "Add Toppings", duration: 10, isActive: true, description: "Dimple and add olive oil and toppings" },
      { name: "Bake", duration: 25, isActive: true, description: "Bake until golden" },
      { name: "Cool", duration: 20, isActive: false, description: "Allow to cool slightly before serving" }
    ],
    'baguettes': [
      { name: "Feed Starter", duration: 120, isActive: true, description: "Feed starter to build strength" },
      { name: "Mix Dough", duration: 30, isActive: true, description: "Mix all ingredients" },
      { name: "Bulk Fermentation", duration: 180, isActive: false, description: "Allow dough to ferment with folds" },
      { name: "Divide & Pre-shape", duration: 20, isActive: true, description: "Divide and pre-shape" },
      { name: "Bench Rest", duration: 30, isActive: false, description: "Allow dough to rest" },
      { name: "Final Shape", duration: 30, isActive: true, description: "Shape into baguettes" },
      { name: "Final Proof", duration: 60, isActive: false, description: "Allow shaped dough to proof" },
      { name: "Score & Bake", duration: 25, isActive: true, description: "Score and bake with steam" },
      { name: "Cool", duration: 30, isActive: false, description: "Allow bread to cool" }
    ],
    'brioche': [
      { name: "Feed Starter", duration: 120, isActive: true, description: "Feed starter to build strength" },
      { name: "Mix Dough", duration: 45, isActive: true, description: "Mix dough and incorporate butter" },
      { name: "Bulk Fermentation", duration: 180, isActive: false, description: "Allow dough to ferment" },
      { name: "Chill Dough", duration: 120, isActive: false, description: "Refrigerate dough to firm butter" },
      { name: "Shape", duration: 30, isActive: true, description: "Shape into desired form" },
      { name: "Final Proof", duration: 240, isActive: false, description: "Allow shaped dough to proof" },
      { name: "Bake", duration: 30, isActive: true, description: "Bake until golden brown" },
      { name: "Cool", duration: 60, isActive: false, description: "Allow bread to cool completely" }
    ],
    'ciabatta': [
      { name: "Feed Starter", duration: 120, isActive: true, description: "Feed starter to build strength" },
      { name: "Mix Dough", duration: 20, isActive: true, description: "Mix very wet dough" },
      { name: "Bulk Fermentation", duration: 240, isActive: false, description: "Allow dough to ferment with folds" },
      { name: "Divide & Shape", duration: 15, isActive: true, description: "Gently shape into rectangles" },
      { name: "Final Proof", duration: 60, isActive: false, description: "Allow shaped dough to proof" },
      { name: "Bake", duration: 25, isActive: true, description: "Bake with steam" },
      { name: "Cool", duration: 30, isActive: false, description: "Allow bread to cool" }
    ]
  };

  // Return steps for the requested recipe, or fallback to country loaf
  return recipeSteps[recipeName] || recipeSteps['country-loaf'];
}

/**
 * Calculate the target completion time from timeline data
 */
function getTargetCompletionTime(timelineData: TimelineData): Date {
  if (!timelineData.target.date) {
    // If no date is provided, use tomorrow at the specified time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return setTimeOfDay(tomorrow, timelineData.target.time);
  }
  
  return setTimeOfDay(new Date(timelineData.target.date), timelineData.target.time);
}

/**
 * Set the time portion of a date object
 */
function setTimeOfDay(date: Date, timeString: string): Date {
  const result = new Date(date);
  const [hours, minutes] = timeString.split(':').map(Number);
  
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Calculate adjusted duration based on environmental factors
 */
function calculateAdjustedDuration(
  step: BreadProcess, 
  environmentalFactors: EnvironmentalFactors,
  starterType: string
): number {
  const baseDuration = step.duration;
  let adjustmentMultiplier = 1.0;
  
  // Skip adjustment for non-fermentation steps
  if (!isFermentationStep(step.name)) {
    return baseDuration;
  }
  
  // Temperature adjustment (fermentation slows in cooler temperatures)
  const idealTemp = getIdealTemperature(step.name, starterType);
  const actualTemp = environmentalFactors.ambientTemperature;
  
  if (actualTemp < idealTemp) {
    // Each degree below ideal slows fermentation by ~5%
    const tempDifference = idealTemp - actualTemp;
    adjustmentMultiplier += tempDifference * 0.05;
  } else if (actualTemp > idealTemp) {
    // Each degree above ideal speeds fermentation by ~7%
    const tempDifference = actualTemp - idealTemp;
    adjustmentMultiplier -= tempDifference * 0.07;
    
    // Fermentation can only go so fast
    adjustmentMultiplier = Math.max(adjustmentMultiplier, 0.5);
  }
  
  // Starter type adjustment
  const starterMultiplier = getStarterTypeMultiplier(starterType);
  adjustmentMultiplier *= starterMultiplier;
  
  // Seasonal adjustment
  if (environmentalFactors.seasonalAdjustment === 'warmer') {
    adjustmentMultiplier *= 0.9; // 10% faster
  } else if (environmentalFactors.seasonalAdjustment === 'cooler') {
    adjustmentMultiplier *= 1.1; // 10% slower
  }
  
  // Apply adjustment and round to nearest 5 minutes
  return Math.round(baseDuration * adjustmentMultiplier / 5) * 5;
}

/**
 * Check if a step is a fermentation step (affected by temperature)
 */
function isFermentationStep(stepName: string): boolean {
  const fermentationTerms = [
    'ferment', 'proof', 'rest', 'rise', 'proofing', 'autolyse', 'starter'
  ];
  
  return fermentationTerms.some(term => 
    stepName.toLowerCase().includes(term)
  );
}

/**
 * Get ideal temperature for a fermentation step
 */
function getIdealTemperature(stepName: string, starterType: string): number {
  // Base temperatures (in Fahrenheit)
  if (stepName.toLowerCase().includes('proof') && 
      stepName.toLowerCase().includes('cold')) {
    return 38; // Cold proof
  }
  
  if (stepName.toLowerCase().includes('bulk')) {
    return 78; // Bulk fermentation
  }
  
  if (stepName.toLowerCase().includes('final proof')) {
    return 80; // Final proof
  }
  
  if (stepName.toLowerCase().includes('starter')) {
    return 75; // Starter feeding
  }
  
  // Default fermentation temperature
  return 75;
}

/**
 * Get multiplier based on starter type
 */
function getStarterTypeMultiplier(starterType: string): number {
  switch (starterType.toLowerCase()) {
    case 'koji':
      return 0.8; // 20% faster
    case 'rye':
      return 0.9; // 10% faster
    case 'whole-wheat':
      return 0.95; // 5% faster
    case 'san-francisco':
      return 1.0; // baseline
    default:
      return 1.0;
  }
}

/**
 * Convert excluded periods from timeline data to Date objects
 */
function convertExcludedPeriods(periods: TimelinePeriod[]): Array<{
  start: Date;
  end: Date;
  day: string;
}> {
  const today = new Date();
  
  return periods.map(period => {
    const dayOffset = getDayOffset(period.day, today);
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    
    const [startHours, startMinutes] = period.start.split(':').map(Number);
    const [endHours, endMinutes] = period.end.split(':').map(Number);
    
    const startDate = new Date(date);
    startDate.setHours(startHours, startMinutes, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(endHours, endMinutes, 0, 0);
    
    // Handle overnight periods
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    return {
      start: startDate,
      end: endDate,
      day: period.day
    };
  });
}

/**
 * Get day offset based on day string
 */
function getDayOffset(dayString: string, today: Date): number {
  if (dayString.toLowerCase().includes('today')) {
    return 0;
  }
  
  if (dayString.toLowerCase().includes('tomorrow')) {
    return 1;
  }
  
  if (dayString.toLowerCase().includes('daily') || 
      dayString.toLowerCase().includes('every day')) {
    return 0; // Start from today for recurring
  }
  
  // Try to extract day name (e.g., "Monday, Apr 15")
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  for (let i = 0; i < dayNames.length; i++) {
    if (dayString.toLowerCase().includes(dayNames[i])) {
      const targetDay = i;
      const currentDay = today.getDay();
      let offset = targetDay - currentDay;
      
      // If the day has already passed this week, target next week
      if (offset < 0) {
        offset += 7;
      }
      
      return offset;
    }
  }
  
  return 0; // Default to today if no match
}

/**
 * Resolve scheduling conflicts with excluded time periods
 */
function resolveConstraints(
  steps: ScheduledStep[], 
  excludedPeriods: Array<{ start: Date; end: Date; day: string; }>
): { 
  steps: ScheduledStep[]; 
  unresolvedConflicts: TimeConflict[];
} {
  let hasConflicts = true;
  let iterationCount = 0;
  const maxIterations = 3; // Prevent infinite loops
  let currentSteps = [...steps];
  
  while (hasConflicts && iterationCount < maxIterations) {
    // Find conflicts with excluded time blocks
    const conflicts = findTimeBlockConflicts(currentSteps, excludedPeriods);
    
    if (conflicts.length === 0) {
      hasConflicts = false;
      continue;
    }
    
    // Handle each conflict
    for (const conflict of conflicts) {
      const resolved = resolveTimeBlockConflict(currentSteps, conflict);
      // If we couldn't resolve the conflict, continue to the next one
      if (!resolved) continue;
    }
    
    iterationCount++;
  }
  
  // Check if we still have unresolvable conflicts
  const remainingConflicts = findTimeBlockConflicts(currentSteps, excludedPeriods);
  
  return {
    steps: currentSteps,
    unresolvedConflicts: remainingConflicts
  };
}

/**
 * Find conflicts between steps and excluded time blocks
 */
function findTimeBlockConflicts(
  steps: ScheduledStep[], 
  excludedPeriods: Array<{ start: Date; end: Date; day: string; }>
): TimeConflict[] {
  const conflicts: TimeConflict[] = [];
  
  for (const step of steps) {
    if (!step.isActive) continue; // Only active steps can conflict
    
    const stepStart = step.startTime;
    const stepEnd = step.endTime;
    
    for (const excludedBlock of excludedPeriods) {
      // Check for overlap
      if (datesOverlap(stepStart, stepEnd, excludedBlock.start, excludedBlock.end)) {
        conflicts.push({
          step,
          excludedPeriod: {
            day: excludedBlock.day,
            start: formatTime(excludedBlock.start),
            end: formatTime(excludedBlock.end)
          },
          overlapStart: maxDate(stepStart, excludedBlock.start),
          overlapEnd: minDate(stepEnd, excludedBlock.end),
          overlapDuration: calculateOverlapMinutes(
            stepStart, stepEnd, excludedBlock.start, excludedBlock.end
          )
        });
      }
    }
  }
  
  return conflicts;
}

/**
 * Check if two date ranges overlap
 */
function datesOverlap(
  start1: Date, 
  end1: Date, 
  start2: Date, 
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Get the later of two dates
 */
function maxDate(date1: Date, date2: Date): Date {
  return date1 > date2 ? date1 : date2;
}

/**
 * Get the earlier of two dates
 */
function minDate(date1: Date, date2: Date): Date {
  return date1 < date2 ? date1 : date2;
}

/**
 * Calculate overlap in minutes between two date ranges
 */
function calculateOverlapMinutes(
  start1: Date, 
  end1: Date, 
  start2: Date, 
  end2: Date
): number {
  const overlapStart = maxDate(start1, start2);
  const overlapEnd = minDate(end1, end2);
  
  return Math.max(0, (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60));
}

/**
 * Format time as HH:MM
 */
function formatTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Resolve a conflict by adjusting the schedule
 */
function resolveTimeBlockConflict(
  steps: ScheduledStep[], 
  conflict: TimeConflict
): boolean {
  const { step, excludedPeriod, overlapDuration } = conflict;
  
  // If the step isn't flexible, we can't resolve
  if (!step.isFlexible) {
    return false;
  }
  
  // Strategy 1: Try moving the step earlier (before excluded block)
  const stepIndex = steps.findIndex(s => s.id === step.id);
  const previousStepEnd = stepIndex > 0 ? steps[stepIndex - 1].endTime : null;
  
  // Convert excluded period start/end back to Date objects for comparison
  const excludedStart = parseTimeString(excludedPeriod.start, step.startTime);
  
  // Check if we can move the step earlier
  if (previousStepEnd && excludedStart) {
    const bufferMinutes = 10; // Add buffer time between steps
    const earliestPossibleStart = new Date(previousStepEnd.getTime() + bufferMinutes * 60 * 1000);
    
    // If there's enough space before the excluded block
    if (earliestPossibleStart < excludedStart) {
      const newEndTime = new Date(excludedStart.getTime() - bufferMinutes * 60 * 1000);
      const newStartTime = new Date(newEndTime.getTime() - step.duration * 60 * 1000);
      
      // If this would preserve the step duration, apply the change
      if (newStartTime >= earliestPossibleStart) {
        steps[stepIndex].startTime = newStartTime;
        steps[stepIndex].endTime = newEndTime;
        
        // Update later steps too
        shiftLaterSteps(steps, stepIndex + 1, steps[stepIndex].endTime);
        
        return true;
      }
    }
  }
  
  // Strategy 2: Try moving the step later (after excluded block)
  const excludedEnd = parseTimeString(excludedPeriod.end, step.endTime);
  const nextStepStart = stepIndex < steps.length - 1 ? steps[stepIndex + 1].startTime : null;
  
  if (excludedEnd && (!nextStepStart || excludedEnd < nextStepStart)) {
    const bufferMinutes = 10; // Add buffer time between steps
    const newStartTime = new Date(excludedEnd.getTime() + bufferMinutes * 60 * 1000);
    const newEndTime = new Date(newStartTime.getTime() + step.duration * 60 * 1000);
    
    // If there's space after the excluded block before the next step
    if (!nextStepStart || newEndTime < nextStepStart) {
      steps[stepIndex].startTime = newStartTime;
      steps[stepIndex].endTime = newEndTime;
      
      // Update later steps too
      shiftLaterSteps(steps, stepIndex + 1, steps[stepIndex].endTime);
      
      return true;
    }
  }
  
  // Could not resolve the conflict
  return false;
}

/**
 * Update the start times of steps following a changed step
 */
function shiftLaterSteps(steps: ScheduledStep[], startIndex: number, newStartTime: Date): void {
  for (let i = startIndex; i < steps.length; i++) {
    // Calculate time gap between this step and previous step
    const prevStepEndTime = i > 0 ? steps[i-1].endTime : null;
    
    if (prevStepEndTime) {
      // Maintain consistent spacing between steps
      const bufferMinutes = 10; // Buffer time between steps
      const newStepStartTime = new Date(prevStepEndTime.getTime() + bufferMinutes * 60 * 1000);
      const newStepEndTime = new Date(newStepStartTime.getTime() + steps[i].duration * 60 * 1000);
      
      steps[i].startTime = newStepStartTime;
      steps[i].endTime = newStepEndTime;
    }
  }
}

/**
 * Parse a time string (HH:MM) into a Date object, using reference date for day
 */
function parseTimeString(timeString: string, referenceDate: Date): Date | null {
  const [hours, minutes] = timeString.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) {
    return null;
  }
  
  const result = new Date(referenceDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}