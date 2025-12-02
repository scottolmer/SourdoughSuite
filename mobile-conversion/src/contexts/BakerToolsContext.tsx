import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateBakingTimeline, calculateDoughTemperature } from '../api/apiClient';
import { useUser } from './UserContext';

// Define types for baker's tools data
export interface TimelineStep {
  time: string;
  action: string;
  description: string;
  notificationId?: string;
}

export interface BakingTimeline {
  id?: number;
  name: string;
  recipeId?: number;
  targetBakeTime: string;
  startTime: string;
  steps: TimelineStep[];
  recipeName?: string;
  savedAt?: string;
}

export interface DoughTempCalculation {
  id?: number;
  targetDoughTemp: number;
  flourTemp: number;
  roomTemp: number;
  frictionFactor: number;
  waterTemp: number;
  savedAt?: string;
}

export interface SavedHydrationCalculation {
  id?: number;
  name: string;
  totalFlour: number;
  totalLiquid: number;
  hydration: number;
  ingredients: {
    name: string;
    amount: number;
    isLiquid: boolean;
    isFlour: boolean;
  }[];
  starterHydration?: number;
  savedAt?: string;
}

interface BakerToolsContextType {
  savedTimelines: BakingTimeline[];
  savedTempCalculations: DoughTempCalculation[];
  savedHydrationCalculations: SavedHydrationCalculation[];
  isLoading: boolean;
  error: string | null;
  saveTimeline: (timeline: Omit<BakingTimeline, 'id' | 'savedAt'>) => Promise<BakingTimeline>;
  deleteTimeline: (id: number) => Promise<void>;
  saveTempCalculation: (calc: Omit<DoughTempCalculation, 'id' | 'savedAt'>) => Promise<DoughTempCalculation>;
  deleteTempCalculation: (id: number) => Promise<void>;
  saveHydrationCalculation: (calc: Omit<SavedHydrationCalculation, 'id' | 'savedAt'>) => Promise<SavedHydrationCalculation>;
  deleteHydrationCalculation: (id: number) => Promise<void>;
  calculateTimeline: (params: any) => Promise<BakingTimeline>;
  calculateWaterTemp: (params: any) => Promise<number>;
  clearError: () => void;
}

// Create context with default values
const BakerToolsContext = createContext<BakerToolsContextType>({
  savedTimelines: [],
  savedTempCalculations: [],
  savedHydrationCalculations: [],
  isLoading: false,
  error: null,
  saveTimeline: async () => ({ name: '', targetBakeTime: '', startTime: '', steps: [] }),
  deleteTimeline: async () => {},
  saveTempCalculation: async () => ({ targetDoughTemp: 0, flourTemp: 0, roomTemp: 0, frictionFactor: 0, waterTemp: 0 }),
  deleteTempCalculation: async () => {},
  saveHydrationCalculation: async () => ({ name: '', totalFlour: 0, totalLiquid: 0, hydration: 0, ingredients: [] }),
  deleteHydrationCalculation: async () => {},
  calculateTimeline: async () => ({ name: '', targetBakeTime: '', startTime: '', steps: [] }),
  calculateWaterTemp: async () => 0,
  clearError: () => {},
});

// Baker tools provider component
export const BakerToolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedTimelines, setSavedTimelines] = useState<BakingTimeline[]>([]);
  const [savedTempCalculations, setSavedTempCalculations] = useState<DoughTempCalculation[]>([]);
  const [savedHydrationCalculations, setSavedHydrationCalculations] = useState<SavedHydrationCalculation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, user } = useUser();

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        setIsLoading(true);
        
        // Load saved timelines
        const storedTimelines = await AsyncStorage.getItem('savedTimelines');
        if (storedTimelines) {
          setSavedTimelines(JSON.parse(storedTimelines));
        }
        
        // Load saved temp calculations
        const storedTempCalcs = await AsyncStorage.getItem('savedTempCalculations');
        if (storedTempCalcs) {
          setSavedTempCalculations(JSON.parse(storedTempCalcs));
        }
        
        // Load saved hydration calculations
        const storedHydrationCalcs = await AsyncStorage.getItem('savedHydrationCalculations');
        if (storedHydrationCalcs) {
          setSavedHydrationCalculations(JSON.parse(storedHydrationCalcs));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load saved baker tools data');
        console.error('Failed to load saved baker tools data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedData();
  }, []);

  // Save timeline
  const saveTimeline = async (timeline: Omit<BakingTimeline, 'id' | 'savedAt'>): Promise<BakingTimeline> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newTimeline: BakingTimeline = {
        ...timeline,
        id: Date.now(),
        savedAt: new Date().toISOString(),
      };
      
      const updatedTimelines = [...savedTimelines, newTimeline];
      setSavedTimelines(updatedTimelines);
      await AsyncStorage.setItem('savedTimelines', JSON.stringify(updatedTimelines));
      
      return newTimeline;
    } catch (err: any) {
      setError(err.message || 'Failed to save timeline');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete timeline
  const deleteTimeline = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedTimelines = savedTimelines.filter(timeline => timeline.id !== id);
      setSavedTimelines(updatedTimelines);
      await AsyncStorage.setItem('savedTimelines', JSON.stringify(updatedTimelines));
    } catch (err: any) {
      setError(err.message || 'Failed to delete timeline');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Save temperature calculation
  const saveTempCalculation = async (
    calc: Omit<DoughTempCalculation, 'id' | 'savedAt'>
  ): Promise<DoughTempCalculation> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newCalc: DoughTempCalculation = {
        ...calc,
        id: Date.now(),
        savedAt: new Date().toISOString(),
      };
      
      const updatedCalcs = [...savedTempCalculations, newCalc];
      setSavedTempCalculations(updatedCalcs);
      await AsyncStorage.setItem('savedTempCalculations', JSON.stringify(updatedCalcs));
      
      return newCalc;
    } catch (err: any) {
      setError(err.message || 'Failed to save temperature calculation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete temperature calculation
  const deleteTempCalculation = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedCalcs = savedTempCalculations.filter(calc => calc.id !== id);
      setSavedTempCalculations(updatedCalcs);
      await AsyncStorage.setItem('savedTempCalculations', JSON.stringify(updatedCalcs));
    } catch (err: any) {
      setError(err.message || 'Failed to delete temperature calculation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Save hydration calculation
  const saveHydrationCalculation = async (
    calc: Omit<SavedHydrationCalculation, 'id' | 'savedAt'>
  ): Promise<SavedHydrationCalculation> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newCalc: SavedHydrationCalculation = {
        ...calc,
        id: Date.now(),
        savedAt: new Date().toISOString(),
      };
      
      const updatedCalcs = [...savedHydrationCalculations, newCalc];
      setSavedHydrationCalculations(updatedCalcs);
      await AsyncStorage.setItem('savedHydrationCalculations', JSON.stringify(updatedCalcs));
      
      return newCalc;
    } catch (err: any) {
      setError(err.message || 'Failed to save hydration calculation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete hydration calculation
  const deleteHydrationCalculation = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedCalcs = savedHydrationCalculations.filter(calc => calc.id !== id);
      setSavedHydrationCalculations(updatedCalcs);
      await AsyncStorage.setItem('savedHydrationCalculations', JSON.stringify(updatedCalcs));
    } catch (err: any) {
      setError(err.message || 'Failed to delete hydration calculation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate baking timeline using API
  const calculateTimeline = async (params: any): Promise<BakingTimeline> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await calculateBakingTimeline(params);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to calculate timeline');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate water temperature using API
  const calculateWaterTemp = async (params: any): Promise<number> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await calculateDoughTemperature(params);
      return result.waterTemp;
    } catch (err: any) {
      setError(err.message || 'Failed to calculate water temperature');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Create the value object with all the context data and functions
  const value = {
    savedTimelines,
    savedTempCalculations,
    savedHydrationCalculations,
    isLoading,
    error,
    saveTimeline,
    deleteTimeline,
    saveTempCalculation,
    deleteTempCalculation,
    saveHydrationCalculation,
    deleteHydrationCalculation,
    calculateTimeline,
    calculateWaterTemp,
    clearError,
  };

  return <BakerToolsContext.Provider value={value}>{children}</BakerToolsContext.Provider>;
};

// Custom hook for using baker tools context
export const useBakerTools = () => {
  const context = useContext(BakerToolsContext);
  if (context === undefined) {
    throw new Error('useBakerTools must be used within a BakerToolsProvider');
  }
  return context;
};

export default BakerToolsContext;