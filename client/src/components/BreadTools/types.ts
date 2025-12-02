// Common types for the Timeline Calculator

/**
 * Timeline step identification
 */
export type TimelineStep = 'goal' | 'recipe' | 'environment' | 'constraints' | 'result';

/**
 * Target scheduling types
 */
export type TargetType = 'specific' | 'preferred' | 'flexible';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'other';
export type RecipeSource = 'library' | 'validator' | 'quick' | 'custom';
export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Step in a bread-making process
 */
export interface BreadProcess {
  name: string;
  duration: number; // in minutes
  isActive: boolean;
  description?: string;
  temperature?: number;
}

/**
 * Period of time with start and end
 */
export interface TimelinePeriod {
  day: string;
  start: string; // HH:MM format
  end: string; // HH:MM format
}

/**
 * Complete timeline data structure
 */
export interface TimelineData {
  name: string;
  target: {
    type: TargetType;
    date: Date | null;
    time: string;
    meal: MealType;
    flexible: {
      startDate: Date | null;
      endDate: Date | null;
      preferredPeriod: TimePeriod;
      preferredDay?: string;
    };
  };
  recipe: {
    source: RecipeSource;
    name: string;
    process: {
      steps: BreadProcess[];
    };
  };
  environment: {
    temperature: number;
    seasonalAdjustment: string;
    equipment: string[];
    starter: {
      name: string;
      condition: string;
    };
  };
  constraints: {
    excludedPeriods: TimelinePeriod[];
    preferredActiveTimes: string[];
    maxActiveTime: number;
  };
}