import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Info, 
  Star, 
  ThumbsUp, 
  Calendar, 
  Droplet, 
  Timer, 
  Map,
  Thermometer,
  Users,
  Check,
  Settings,
  Globe,
  PanelTop,
  Smile,
  Utensils,
  BarChart,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type QuizScreen = 'welcome' | 'flavor' | 'baking' | 'experience' | 'details' | 'results' | 'followUp';
type StarterType = 'san-francisco' | 'koji' | 'traditional-rye' | 'house-blend';
type BakingFrequency = 'daily' | 'weekly' | 'monthly' | 'sporadic';
type TimeAvailability = 'minimal' | 'moderate' | 'dedicated';
type ClimateType = 'humid-warm' | 'dry-warm' | 'humid-cool' | 'dry-cool' | 'variable';
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Starter Data
const starterTypes = [
  { 
    id: 'san-francisco', 
    name: 'San Francisco',
    description: 'Traditional culture with perfect balance of acetic and lactic acids',
    maintenance: 'Moderate',
    flavor: 'Tangy',
    doughTypes: ['Artisan Loaves', 'Classic Crusty Breads'],
    iconColor: 'bg-amber-200'
  },
  { 
    id: 'koji', 
    name: 'Koji',
    description: 'Japanese-inspired with subtle umami notes and natural sweetness',
    maintenance: 'High',
    flavor: 'Malty Sweet',
    doughTypes: ['Enriched Doughs', 'Asian-Inspired Breads'],
    iconColor: 'bg-amber-100'
  },
  { 
    id: 'traditional-rye', 
    name: 'Traditional Rye',
    description: 'Traditional rye starter with deep, earthy flavors and dense, hearty crumb',
    maintenance: 'Medium',
    flavor: 'Earthy & Complex',
    doughTypes: ['European-Style Breads', 'Dense Hearty Loaves'],
    iconColor: 'bg-amber-100'
  },
  { 
    id: 'house-blend', 
    name: 'House Blend',
    description: 'Signature blend combining elements from all specialty starters',
    maintenance: 'Low',
    flavor: 'Balanced',
    doughTypes: ['All-Purpose', 'Any Bread Style'],
    iconColor: 'bg-stone-300'
  }
];

export default function StarterQuiz() {
  // Main state
  const [activeScreen, setActiveScreen] = useState<QuizScreen>('welcome');
  const [progress, setProgress] = useState(0);
  
  // User answers
  const [answers, setAnswers] = useState({
    // Flavor preferences
    sourness: 50,
    flavors: [] as string[],
    breadStyles: [] as string[],
    crustPreference: 'medium',
    
    // Baking behavior
    bakingFrequency: 'weekly' as BakingFrequency,
    timeAvailability: 'moderate' as TimeAvailability,
    bakingDays: [] as string[],
    temperatureControl: 'good',
    
    // Experience & equipment
    skillLevel: 'intermediate' as SkillLevel,
    equipment: [] as string[],
    previousExperience: 'had-before',
    breadVarietyInterest: 'occasional',
    
    // Special considerations
    dietaryPreferences: [] as string[],
    climate: 'variable' as ClimateType,
    householdSize: 'couple',
    nonBreadApplications: [] as string[]
  });
  
  // Results state
  const [results, setResults] = useState({
    primaryMatch: null as StarterType | null,
    matchScore: 0,
    secondaryMatches: [] as StarterType[],
    rationale: {
      flavor: 0,
      maintenance: 0,
      style: 0,
      experience: 0
    }
  });

  // Navigation functions
  const goToScreen = (screen: QuizScreen) => {
    // Scroll to the top when changing screens - targeting ScrollArea component
    // First try window scroll
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Also target the ScrollArea viewport which is used in MobileLayout
    const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.scrollTop = 0;
    }
    
    // Fallback methods
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Try to find any scrollable container and scroll it to top
    const scrollableContainers = document.querySelectorAll('.overflow-y-auto, .overflow-auto, .scroll-area');
    scrollableContainers.forEach(container => {
      container.scrollTop = 0;
    });
    
    // Log for debugging
    console.log('Scrolled to top on navigation to:', screen);
    
    setActiveScreen(screen);
    
    // Update progress based on screen
    const progressMap: Record<QuizScreen, number> = {
      welcome: 0,
      flavor: 25,
      baking: 50,
      experience: 75,
      details: 100,
      results: 100,
      followUp: 100
    };
    
    setProgress(progressMap[screen]);
  };
  
  const handleStartQuiz = () => {
    goToScreen('flavor');
  };
  
  // Helper function to create a structured prompt for the LLM
  const createLLMPrompt = () => {
    return {
      userPreferences: {
        // Flavor preferences
        sourness: answers.sourness,
        flavors: answers.flavors,
        breadStyles: answers.breadStyles,
        crustPreference: answers.crustPreference,
        
        // Baking behavior
        bakingFrequency: answers.bakingFrequency,
        timeAvailability: answers.timeAvailability,
        bakingDays: answers.bakingDays,
        temperatureControl: answers.temperatureControl,
        
        // Experience & equipment
        skillLevel: answers.skillLevel,
        equipment: answers.equipment,
        previousExperience: answers.previousExperience,
        breadVarietyInterest: answers.breadVarietyInterest,
        
        // Special considerations
        dietaryPreferences: answers.dietaryPreferences,
        climate: answers.climate,
        householdSize: answers.householdSize,
        nonBreadApplications: answers.nonBreadApplications
      },
      availableStarters: starterTypes.map(starter => ({
        id: starter.id,
        name: starter.name,
        description: starter.description,
        maintenance: starter.maintenance,
        flavor: starter.flavor,
        doughTypes: starter.doughTypes
      }))
    };
  };

  // Function to get starter recommendation from LLM
  const getStarterRecommendation = async () => {
    try {
      // First fetch quiz settings to get enabled starters
      const settingsResponse = await fetch('/api/quiz/settings');
      if (!settingsResponse.ok) {
        throw new Error('Failed to fetch quiz settings');
      }
      const quizSettings = await settingsResponse.json();
      
      // Fetch all starters
      const startersResponse = await fetch('/api/starters');
      if (!startersResponse.ok) {
        throw new Error('Failed to fetch starters');
      }
      const allStarters = await startersResponse.json();
      
      // Filter to only enabled starters in quiz settings and exclude homemade starter (id: 1)
      const enabledStarters = allStarters.filter((starter: any) => 
        quizSettings.enabledStarters.includes(starter.id) &&
        starter.id !== 1 // Exclude homemade starter
      );
      
      if (enabledStarters.length === 0) {
        throw new Error('No enabled starters found in quiz settings');
      }
      
      // Create the AI prompt with only enabled starters
      const prompt = {
        userPreferences: {
          sourness: answers.sourness,
          flavors: answers.flavors,
          breadStyles: answers.breadStyles,
          crustPreference: answers.crustPreference,
          bakingFrequency: answers.bakingFrequency,
          timeAvailability: answers.timeAvailability,
          bakingDays: answers.bakingDays,
          temperatureControl: answers.temperatureControl,
          skillLevel: answers.skillLevel,
          equipment: answers.equipment,
          previousExperience: answers.previousExperience,
          breadVarietyInterest: answers.breadVarietyInterest,
          dietaryPreferences: answers.dietaryPreferences,
          climate: answers.climate,
          householdSize: answers.householdSize,
          nonBreadApplications: answers.nonBreadApplications
        },
        availableStarters: enabledStarters.map((starter: any) => ({
          id: starter.id,
          name: starter.name,
          description: starter.description,
          maintenance: typeof starter.maintenance === 'object' ? starter.maintenance.difficulty : 'standard',
          flavor: typeof starter.flavor === 'object' ? Object.keys(starter.flavor || {}).join(', ') : 'balanced'
        }))
      };
      
      // Call AI API with the sanitized prompt
      const response = await fetch('/api/ai/recommend-starter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prompt)
      });
      
      if (!response.ok) {
        throw new Error('Failed to get starter recommendation');
      }
      
      const data = await response.json();
      
      // Update results with AI recommendation
      setResults({
        primaryMatch: data.primaryMatch,
        matchScore: data.matchScore || 95,
        secondaryMatches: data.secondaryMatches || [],
        rationale: data.rationale || {
          flavor: 90,
          maintenance: 85,
          style: 95,
          experience: 90
        }
      });
      
      goToScreen('results');
    } catch (error) {
      console.error('Error getting starter recommendation:', error);
      // Fallback to basic recommendation logic if API fails
      try {
        const recommendation = await determineRecommendation();
        setResults({
          ...recommendation,
          primaryMatch: recommendation.primaryMatch
        });
        goToScreen('results');
      } catch (fallbackError) {
        console.error('Error in fallback recommendation:', fallbackError);
        // Ultimate fallback with hardcoded data
        setResults({
          primaryMatch: 'house-blend' as StarterType,
          matchScore: 85,
          secondaryMatches: [] as StarterType[],
          rationale: {
            flavor: 85,
            maintenance: 80,
            style: 85,
            experience: 85
          }
        });
        goToScreen('results');
      }
    }
  };
  
  // Basic fallback recommendation logic if the API call fails
  const determineRecommendation = async () => {
    try {
      // First fetch quiz settings to get the default starter
      const settingsResponse = await fetch('/api/quiz/settings');
      if (!settingsResponse.ok) {
        throw new Error('Failed to fetch quiz settings');
      }
      const quizSettings = await settingsResponse.json();
      
      // Fetch all starters
      const startersResponse = await fetch('/api/starters');
      if (!startersResponse.ok) {
        throw new Error('Failed to fetch starters');
      }
      const allStarters = await startersResponse.json();
      
      // Get the default starter if it's set (excluding homemade starter)
      let defaultStarter = allStarters.find((starter: any) => 
        starter.id === quizSettings.defaultStarter && starter.id !== 1
      );
      
      // If no default is set or default not found, use any enabled starter (excluding homemade)
      if (!defaultStarter && quizSettings.enabledStarters.length > 0) {
        defaultStarter = allStarters.find((starter: any) => 
          quizSettings.enabledStarters.includes(starter.id) && starter.id !== 1
        );
      }
      
      // If still no starter, just use House Blend as absolute fallback
      if (!defaultStarter) {
        return {
          primaryMatch: 'house-blend' as StarterType,
          matchScore: 85,
          secondaryMatches: [] as StarterType[],
          rationale: {
            flavor: 85,
            maintenance: 80,
            style: 85,
            experience: 85
          }
        };
      }
      
      return {
        // Convert to string ID for internal type compatibility
        primaryMatch: String(defaultStarter.id) as unknown as StarterType,
        matchScore: 90,
        secondaryMatches: [] as StarterType[],
        rationale: {
          flavor: 90,
          maintenance: 85,
          style: 90,
          experience: 85
        }
      };
    } catch (error) {
      console.error('Error in fallback recommendation logic:', error);
      // Ultimate fallback if everything else fails
      return {
        primaryMatch: 'house-blend' as StarterType,
        matchScore: 85,
        secondaryMatches: [] as StarterType[],
        rationale: {
          flavor: 85,
          maintenance: 80,
          style: 85,
          experience: 85
        }
      };
    }
  };

  // Default answers for skip to results
  const defaultAnswers = {
    sourness: 50,
    flavors: ['traditional', 'complex'],
    breadStyles: ['rustic', 'sandwich'],
    crustPreference: 'medium',
    bakingFrequency: 'weekly' as BakingFrequency,
    timeAvailability: 'moderate' as TimeAvailability,
    bakingDays: ['weekend'],
    temperatureControl: 'some',
    skillLevel: 'intermediate' as SkillLevel,
    equipment: ['dutch_oven', 'scale'],
    previousExperience: 'some',
    breadVarietyInterest: 'moderate',
    dietaryPreferences: [],
    climate: 'humid-warm' as ClimateType,
    householdSize: 'medium',
    nonBreadApplications: ['pizza']
  };

  const handleSkipToResults = async () => {
    // Use simple deterministic matching logic for skipping
    try {
      setAnswers(defaultAnswers); // Set default answers for consistent results
      const recommendation = await determineRecommendation();
      setResults({
        ...recommendation,
        primaryMatch: recommendation.primaryMatch
      });
      goToScreen('results');
    } catch (error) {
      console.error('Error in skip to results:', error);
      // Ultimate fallback with hardcoded data
      setResults({
        primaryMatch: 'house-blend' as StarterType,
        matchScore: 85,
        secondaryMatches: [] as StarterType[],
        rationale: {
          flavor: 85,
          maintenance: 80,
          style: 85,
          experience: 85
        }
      });
      goToScreen('results');
    }
  };
  
  // Update answer functions
  const updateAnswer = <K extends keyof typeof answers>(
    key: K, 
    value: typeof answers[K]
  ) => {
    setAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const toggleArrayItem = <K extends keyof typeof answers>(
    key: K,
    item: string
  ) => {
    const currentArray = answers[key] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    
    updateAnswer(key, newArray as typeof answers[K]);
  };
  
  // Render the Welcome Screen
  if (activeScreen === 'welcome') {
    return (
      <div className="space-y-8">
        <div className="w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sourdough Starter Selection Quiz</h1>
            <p className="text-gray-600">
              Find the perfect starter culture for your baking style, flavor preferences, and environmental conditions 
              through our scientific matching system.
            </p>
          </div>
          
          {/* Starter Collection Overview */}
          <div className="mb-12">
            <h2 className="text-xl font-serif font-semibold text-center mb-6">Our Specialty Starters</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {starterTypes.map(starter => (
                <div key={starter.id} className="text-center">
                  <div className="bg-[#F5F5DC] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3 transition-transform hover:scale-105">
                    <div className={`w-16 h-16 ${starter.iconColor} rounded-full flex items-center justify-center`}>
                      <span className="font-serif font-bold text-[#4A2A1A]">
                        {starter.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-medium text-sm mb-1">{starter.name}</h3>
                  <p className="text-xs text-gray-500">{starter.flavor}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center">
              <ThumbsUp className="h-4 w-4 text-[#D97706] mr-2" />
              <span className="text-sm text-gray-600">2,500+ bakers matched this month</span>
            </div>
          </div>
          
          {/* Start Button */}
          <div className="flex flex-col items-center mb-12">
            <Button 
              onClick={handleStartQuiz}
              className="px-8 py-6 text-lg bg-[#D97706] hover:bg-[#B45309] text-white transition-all"
            >
              Begin Quiz (2 min)
            </Button>
            <button 
              onClick={handleSkipToResults}
              className="mt-3 text-sm text-gray-500 hover:text-[#D97706] underline"
            >
              Skip to Results
            </button>
          </div>
          
          {/* Quiz Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: <Smile className="h-6 w-6" />, text: "Personalized to your taste preferences" },
              { icon: <Utensils className="h-6 w-6" />, text: "Matched to your baking style" },
              { icon: <BarChart className="h-6 w-6" />, text: "Considers your experience level" },
              { icon: <Clock className="h-6 w-6" />, text: "Accounts for your available time" }
            ].map((prop, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="bg-[#F8F6F1] w-12 h-12 rounded-full flex items-center justify-center mb-3 text-[#D97706]">
                  {prop.icon}
                </div>
                <p className="text-sm text-gray-600">{prop.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Render the Flavor Preferences Screen
  if (activeScreen === 'flavor') {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-serif font-bold text-[#4A2A1A]">Step 1 of 4: Flavor Preferences</h1>
              <button 
                onClick={() => goToScreen('welcome')}
                className="text-sm text-gray-500 flex items-center"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Exit Quiz
              </button>
            </div>
            <p className="text-gray-600">Let's discover the flavors you're looking for in your bread</p>
            <Progress value={progress} className="mt-4 h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {/* Sourness Preference Slider */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">How tangy do you like your sourdough?</h2>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm text-gray-600">Mild & Subtle</span>
                  <span className="text-sm text-gray-600">Very Tangy</span>
                </div>
                <Slider 
                  value={[answers.sourness]} 
                  onValueChange={([value]) => updateAnswer('sourness', value)}
                  max={100}
                  step={1}
                  className="mb-6"
                />
                <div className="bg-[#F8F6F1] p-4 rounded-lg text-sm text-gray-600">
                  <Info className="h-4 w-4 text-[#D97706] inline mr-2" />
                  This affects which starter will give you bread with your preferred level of tanginess
                </div>
              </div>
              
              {/* Flavor Profile Selection */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">What flavor notes do you prefer?</h2>
                <p className="text-sm text-gray-600 mb-4">Select all that interest you</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'traditional', label: 'Traditional Sourdough', desc: 'Classic tang' },
                    { id: 'complex', label: 'Complex/Umami', desc: 'Deeper, savory notes' },
                    { id: 'sweet', label: 'Subtly Sweet', desc: 'Natural sweetness' },
                    { id: 'fruity', label: 'Bright/Fruity', desc: 'Lighter, lively flavors' }
                  ].map(flavor => {
                    const isSelected = answers.flavors.includes(flavor.id);
                    return (
                      <div 
                        key={flavor.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                          isSelected ? 'border-[#D97706] bg-amber-50' : 'border-gray-200 hover:border-amber-200'
                        }`}
                        onClick={() => toggleArrayItem('flavors', flavor.id)}
                      >
                        <div className="flex items-start">
                          <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                            isSelected ? 'border-[#D97706] bg-[#D97706]' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div className="ml-2">
                            <label className="font-medium text-sm cursor-pointer">{flavor.label}</label>
                            <p className="text-xs text-gray-500">{flavor.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div>
              {/* Bread Style Preference */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">What types of bread do you want to make?</h2>
                <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'rustic', label: 'Rustic Country Loaf' },
                    { id: 'sandwich', label: 'Sandwich Bread' },
                    { id: 'enriched', label: 'Enriched Doughs' },
                    { id: 'flatbread', label: 'Flatbreads & Pizza' },
                    { id: 'specialty', label: 'Specialty Breads' }
                  ].map(style => {
                    const isSelected = answers.breadStyles.includes(style.id);
                    return (
                      <div 
                        key={style.id}
                        className={`border-2 rounded-lg p-3 cursor-pointer text-center ${
                          isSelected ? 'border-[#D97706] bg-amber-50' : 'border-gray-200 hover:border-amber-200'
                        }`}
                        onClick={() => toggleArrayItem('breadStyles', style.id)}
                      >
                        <div className="mb-2 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                          <PanelTop className="h-6 w-6 text-gray-400" />
                        </div>
                        <label className="text-xs font-medium cursor-pointer">{style.label}</label>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Crust Preference */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">What type of crust do you prefer?</h2>
                
                <div className="flex flex-wrap justify-between gap-2">
                  {[
                    { id: 'thin', label: 'Thin & Crispy' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'thick', label: 'Thick & Chewy' }
                  ].map(crust => (
                    <Button
                      key={crust.id}
                      variant={answers.crustPreference === crust.id ? 'default' : 'outline'}
                      className={`flex-1 ${
                        answers.crustPreference === crust.id 
                          ? 'bg-[#D97706] hover:bg-[#B45309]' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => updateAnswer('crustPreference', crust.id)}
                    >
                      {crust.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
            <Button
              onClick={() => goToScreen('welcome')}
              variant="ghost"
              className="text-gray-600"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={() => goToScreen('baking')}
              className="bg-[#D97706] hover:bg-[#B45309]"
            >
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the Baking Behavior Screen
  if (activeScreen === 'baking') {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-serif font-bold text-[#4A2A1A]">Step 2 of 4: Your Baking Routine</h1>
              <button 
                onClick={() => goToScreen('welcome')}
                className="text-sm text-gray-500 flex items-center"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Exit Quiz
              </button>
            </div>
            <p className="text-gray-600">Let's find a starter that fits your schedule</p>
            <Progress value={progress} className="mt-4 h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {/* Baking Frequency Selector */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">How often do you plan to bake?</h2>
                <RadioGroup 
                  value={answers.bakingFrequency} 
                  onValueChange={(value) => updateAnswer('bakingFrequency', value as BakingFrequency)}
                  className="space-y-3"
                >
                  {[
                    { 
                      value: 'daily', 
                      label: 'Daily', 
                      description: 'Avid baker with time each day',
                      icon: <Calendar className="h-5 w-5 text-[#D97706]" />
                    },
                    { 
                      value: 'weekly', 
                      label: 'Weekly', 
                      description: 'Regular weekend baker',
                      icon: <Calendar className="h-5 w-5 text-[#D97706]" />
                    },
                    { 
                      value: 'monthly', 
                      label: 'Monthly', 
                      description: 'Occasional baker',
                      icon: <Calendar className="h-5 w-5 text-[#D97706]" />
                    },
                    { 
                      value: 'sporadic', 
                      label: 'Sporadically', 
                      description: 'When time allows',
                      icon: <Calendar className="h-5 w-5 text-[#D97706]" />
                    }
                  ].map(option => (
                    <div 
                      key={option.value}
                      className={`flex items-start space-x-3 border-2 rounded-lg p-4 cursor-pointer ${
                        answers.bakingFrequency === option.value 
                          ? 'border-[#D97706] bg-amber-50' 
                          : 'border-gray-200 hover:border-amber-200'
                      }`}
                    >
                      <RadioGroupItem 
                        value={option.value} 
                        id={`frequency-${option.value}`} 
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          {option.icon}
                          <Label 
                            htmlFor={`frequency-${option.value}`} 
                            className="ml-2 text-base font-medium cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {/* Time Availability Assessment */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">How much time can you dedicate to starter maintenance?</h2>
                <div className="mb-1 flex justify-between text-sm text-gray-600">
                  <span>Minimal Time</span>
                  <span>Dedicated Enthusiast</span>
                </div>
                <div className="mb-4">
                  <Slider 
                    value={[['minimal', 'moderate', 'dedicated'].indexOf(answers.timeAvailability) * 50]} 
                    onValueChange={([value]) => {
                      const availabilityMap = ['minimal', 'moderate', 'dedicated'];
                      const index = Math.round(value / 50);
                      updateAnswer('timeAvailability', availabilityMap[index] as TimeAvailability);
                    }}
                    max={100}
                    step={50}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { 
                      value: 'minimal',
                      label: 'Minimal Time',
                      desc: '1-2 minutes, once or twice a week'
                    },
                    { 
                      value: 'moderate',
                      label: 'Moderate Time',
                      desc: '5 minutes, 2-3 times a week'  
                    },
                    { 
                      value: 'dedicated',
                      label: 'Dedicated',
                      desc: '10+ minutes, almost daily'
                    }
                  ].map((option, i) => (
                    <div 
                      key={option.value} 
                      className={`text-center p-3 rounded-lg border ${
                        answers.timeAvailability === option.value
                          ? 'border-[#D97706] bg-amber-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              {/* Weekend vs. Weekday Preference */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">When do you typically do most of your baking?</h2>
                
                <div className="grid grid-cols-7 gap-1 mb-6">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                    const dayValue = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][i];
                    const isSelected = answers.bakingDays.includes(dayValue);
                    
                    return (
                      <div key={dayValue} className="text-center">
                        <Button
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          className={`w-full py-6 ${
                            isSelected 
                              ? 'bg-[#D97706] hover:bg-[#B45309]' 
                              : 'bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => toggleArrayItem('bakingDays', dayValue)}
                        >
                          {day}
                        </Button>
                        <div className={`mt-1 h-1 rounded-full ${
                          isSelected ? 'bg-[#D97706]' : 'bg-transparent'
                        }`} />
                      </div>
                    );
                  })}
                </div>
                
                <div className="bg-[#F8F6F1] p-4 rounded-lg">
                  <div className="flex">
                    <Info className="h-5 w-5 text-[#D97706] mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Tip:</span> Your baking schedule helps us recommend a starter that requires attention 
                        on days when you're already in the kitchen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Temperature Control Capability */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">How would you describe your temperature control capabilities?</h2>
                
                <RadioGroup 
                  value={answers.temperatureControl} 
                  onValueChange={(value) => updateAnswer('temperatureControl', value)}
                  className="space-y-3"
                >
                  {[
                    { 
                      value: 'precise', 
                      label: 'Precise', 
                      description: 'I have dedicated equipment for temperature control'
                    },
                    { 
                      value: 'good', 
                      label: 'Good', 
                      description: 'My home environment is relatively consistent'
                    },
                    { 
                      value: 'limited', 
                      label: 'Limited', 
                      description: 'Temperature varies considerably in my kitchen'
                    }
                  ].map(option => (
                    <div 
                      key={option.value}
                      className={`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer ${
                        answers.temperatureControl === option.value 
                          ? 'border-[#D97706] bg-amber-50' 
                          : 'border-gray-200 hover:border-amber-200'
                      }`}
                    >
                      <RadioGroupItem 
                        value={option.value} 
                        id={`temp-${option.value}`} 
                        className="mt-1"
                      />
                      <div>
                        <Label 
                          htmlFor={`temp-${option.value}`} 
                          className="font-medium cursor-pointer"
                        >
                          {option.label}
                        </Label>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
            <Button
              onClick={() => goToScreen('flavor')}
              variant="ghost"
              className="text-gray-600"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={() => goToScreen('experience')}
              className="bg-[#D97706] hover:bg-[#B45309]"
            >
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the Experience & Equipment Screen
  if (activeScreen === 'experience') {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-serif font-bold text-[#4A2A1A]">Step 3 of 4: Experience & Equipment</h1>
              <button 
                onClick={() => goToScreen('welcome')}
                className="text-sm text-gray-500 flex items-center"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Exit Quiz
              </button>
            </div>
            <p className="text-gray-600">Let's find a starter that matches your experience level and equipment</p>
            <Progress value={progress} className="mt-4 h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {/* Skill Level Assessment */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">What's your baking experience level?</h2>
                
                <RadioGroup 
                  value={answers.skillLevel} 
                  onValueChange={(value) => updateAnswer('skillLevel', value as SkillLevel)}
                  className="space-y-3"
                >
                  {[
                    { 
                      value: 'beginner', 
                      label: 'Beginner', 
                      description: 'New to sourdough baking',
                      icon: <Users className="h-5 w-5 text-[#D97706]" />
                    },
                    { 
                      value: 'intermediate', 
                      label: 'Intermediate', 
                      description: 'Comfortable with basic recipes',
                      icon: <Users className="h-5 w-5 text-[#D97706]" />
                    },
                    { 
                      value: 'advanced', 
                      label: 'Advanced', 
                      description: 'Experienced with various techniques',
                      icon: <Users className="h-5 w-5 text-[#D97706]" />
                    },
                    { 
                      value: 'expert', 
                      label: 'Expert', 
                      description: 'Highly skilled, deep understanding',
                      icon: <Users className="h-5 w-5 text-[#D97706]" />
                    }
                  ].map(option => (
                    <div 
                      key={option.value}
                      className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer ${
                        answers.skillLevel === option.value 
                          ? 'border-[#D97706] bg-amber-50' 
                          : 'border-gray-200 hover:border-amber-200'
                      }`}
                    >
                      <RadioGroupItem 
                        value={option.value} 
                        id={`skill-${option.value}`} 
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          {option.icon}
                          <Label 
                            htmlFor={`skill-${option.value}`} 
                            className="ml-2 text-base font-medium cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {/* Equipment Selection */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">What equipment do you have access to?</h2>
                <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'scale', label: 'Digital Scale', desc: 'For precise measurements' },
                    { id: 'thermometer', label: 'Thermometer', desc: 'For monitoring temperatures' },
                    { id: 'proofing-box', label: 'Proofing Box', desc: 'For controlled environments' },
                    { id: 'dutch-oven', label: 'Dutch Oven', desc: 'For baking loaves' },
                    { id: 'banneton', label: 'Banneton', desc: 'For shaping and rising' },
                    { id: 'lame', label: 'Bread Lame', desc: 'For scoring dough' }
                  ].map(item => {
                    const isSelected = answers.equipment.includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          isSelected ? 'border-[#D97706] bg-amber-50' : 'border-gray-200 hover:border-amber-200'
                        }`}
                        onClick={() => toggleArrayItem('equipment', item.id)}
                      >
                        <div className="flex items-start">
                          <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                            isSelected ? 'border-[#D97706] bg-[#D97706]' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div className="ml-2">
                            <label className="font-medium text-sm cursor-pointer">{item.label}</label>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div>
              {/* Previous Experience */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">Have you maintained a sourdough starter before?</h2>
                
                <RadioGroup 
                  value={answers.previousExperience} 
                  onValueChange={(value) => updateAnswer('previousExperience', value)}
                  className="space-y-3"
                >
                  {[
                    { 
                      value: 'current-user', 
                      label: 'Yes, currently maintaining one', 
                      description: 'I have an active starter now'
                    },
                    { 
                      value: 'had-before', 
                      label: 'Yes, but not currently', 
                      description: 'I\'ve had experience in the past'
                    },
                    { 
                      value: 'never', 
                      label: 'No, this will be my first', 
                      description: 'I\'m new to sourdough starters'
                    }
                  ].map(option => (
                    <div 
                      key={option.value}
                      className={`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer ${
                        answers.previousExperience === option.value 
                          ? 'border-[#D97706] bg-amber-50' 
                          : 'border-gray-200 hover:border-amber-200'
                      }`}
                    >
                      <RadioGroupItem 
                        value={option.value} 
                        id={`exp-${option.value}`} 
                        className="mt-1"
                      />
                      <div>
                        <Label 
                          htmlFor={`exp-${option.value}`} 
                          className="font-medium cursor-pointer"
                        >
                          {option.label}
                        </Label>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {/* Bread Variety Interest */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">How often do you want to try different bread varieties?</h2>
                
                <RadioGroup 
                  value={answers.breadVarietyInterest} 
                  onValueChange={(value) => updateAnswer('breadVarietyInterest', value)}
                  className="space-y-3"
                >
                  {[
                    { 
                      value: 'frequently', 
                      label: 'Frequently', 
                      description: 'I want to experiment with many types'
                    },
                    { 
                      value: 'occasional', 
                      label: 'Occasionally', 
                      description: 'I like to mix it up sometimes'
                    },
                    { 
                      value: 'rarely', 
                      label: 'Rarely', 
                      description: 'I prefer to perfect one or two styles'
                    }
                  ].map(option => (
                    <div 
                      key={option.value}
                      className={`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer ${
                        answers.breadVarietyInterest === option.value 
                          ? 'border-[#D97706] bg-amber-50' 
                          : 'border-gray-200 hover:border-amber-200'
                      }`}
                    >
                      <RadioGroupItem 
                        value={option.value} 
                        id={`variety-${option.value}`} 
                        className="mt-1"
                      />
                      <div>
                        <Label 
                          htmlFor={`variety-${option.value}`} 
                          className="font-medium cursor-pointer"
                        >
                          {option.label}
                        </Label>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
            <Button
              onClick={() => goToScreen('baking')}
              variant="ghost"
              className="text-gray-600"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={() => goToScreen('details')}
              className="bg-[#D97706] hover:bg-[#B45309]"
            >
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the Special Considerations Screen
  if (activeScreen === 'details') {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-serif font-bold text-[#4A2A1A]">Step 4 of 4: Special Considerations</h1>
              <button 
                onClick={() => goToScreen('welcome')}
                className="text-sm text-gray-500 flex items-center"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Exit Quiz
              </button>
            </div>
            <p className="text-gray-600">Just a few more questions to perfect your match</p>
            <Progress value={progress} className="mt-4 h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {/* Dietary Preferences */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">Do you have any dietary preferences?</h2>
                <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'gluten-free', label: 'Gluten-Free', desc: 'Alternatives to wheat' },
                    { id: 'whole-grain', label: 'Whole Grain Focus', desc: 'Less processed flours' },
                    { id: 'low-sugar', label: 'Low Sugar', desc: 'Minimal added sweeteners' },
                    { id: 'vegan', label: 'Vegan', desc: 'No animal products' }
                  ].map(item => {
                    const isSelected = answers.dietaryPreferences.includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          isSelected ? 'border-[#D97706] bg-amber-50' : 'border-gray-200 hover:border-amber-200'
                        }`}
                        onClick={() => toggleArrayItem('dietaryPreferences', item.id)}
                      >
                        <div className="flex items-start">
                          <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                            isSelected ? 'border-[#D97706] bg-[#D97706]' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div className="ml-2">
                            <label className="font-medium text-sm cursor-pointer">{item.label}</label>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Climate Type */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">What's your local climate like?</h2>
                
                <RadioGroup 
                  value={answers.climate} 
                  onValueChange={(value) => updateAnswer('climate', value as ClimateType)}
                  className="space-y-3"
                >
                  {[
                    { 
                      value: 'humid-warm', 
                      label: 'Humid & Warm', 
                      description: 'Like tropical or subtropical regions'
                    },
                    { 
                      value: 'dry-warm', 
                      label: 'Dry & Warm', 
                      description: 'Like desert or Mediterranean climates'
                    },
                    { 
                      value: 'humid-cool', 
                      label: 'Humid & Cool', 
                      description: 'Like Pacific Northwest or Northern Europe'
                    },
                    { 
                      value: 'dry-cool', 
                      label: 'Dry & Cool', 
                      description: 'Like high desert or mountain regions'
                    },
                    { 
                      value: 'variable', 
                      label: 'Variable/Seasonal', 
                      description: 'Significant changes throughout the year'
                    }
                  ].map(option => (
                    <div 
                      key={option.value}
                      className={`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer ${
                        answers.climate === option.value 
                          ? 'border-[#D97706] bg-amber-50' 
                          : 'border-gray-200 hover:border-amber-200'
                      }`}
                    >
                      <RadioGroupItem 
                        value={option.value} 
                        id={`climate-${option.value}`} 
                        className="mt-1"
                      />
                      <div>
                        <Label 
                          htmlFor={`climate-${option.value}`} 
                          className="font-medium cursor-pointer"
                        >
                          {option.label}
                        </Label>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
            
            <div>
              {/* Household Size */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">How many people are you typically baking for?</h2>
                
                <RadioGroup 
                  value={answers.householdSize} 
                  onValueChange={(value) => updateAnswer('householdSize', value)}
                  className="space-y-3"
                >
                  {[
                    { 
                      value: 'individual', 
                      label: 'Just Me', 
                      description: 'Individual portions'
                    },
                    { 
                      value: 'couple', 
                      label: 'Couple', 
                      description: '2 people'
                    },
                    { 
                      value: 'small-family', 
                      label: 'Small Family', 
                      description: '3-4 people'
                    },
                    { 
                      value: 'large-family', 
                      label: 'Large Family', 
                      description: '5+ people'
                    }
                  ].map(option => (
                    <div 
                      key={option.value}
                      className={`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer ${
                        answers.householdSize === option.value 
                          ? 'border-[#D97706] bg-amber-50' 
                          : 'border-gray-200 hover:border-amber-200'
                      }`}
                    >
                      <RadioGroupItem 
                        value={option.value} 
                        id={`household-${option.value}`} 
                        className="mt-1"
                      />
                      <div>
                        <Label 
                          htmlFor={`household-${option.value}`} 
                          className="font-medium cursor-pointer"
                        >
                          {option.label}
                        </Label>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {/* Non-Bread Applications */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">Do you plan to use your starter for anything besides bread?</h2>
                <p className="text-sm text-gray-600 mb-4">Select all that interest you</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'pancakes', label: 'Pancakes & Waffles', desc: 'Breakfast treats' },
                    { id: 'pizza', label: 'Pizza Dough', desc: 'Flavorful crusts' },
                    { id: 'pastries', label: 'Pastries', desc: 'Sweet baked goods' },
                    { id: 'crackers', label: 'Crackers', desc: 'Crispy snacks' }
                  ].map(item => {
                    const isSelected = answers.nonBreadApplications.includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          isSelected ? 'border-[#D97706] bg-amber-50' : 'border-gray-200 hover:border-amber-200'
                        }`}
                        onClick={() => toggleArrayItem('nonBreadApplications', item.id)}
                      >
                        <div className="flex items-start">
                          <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                            isSelected ? 'border-[#D97706] bg-[#D97706]' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div className="ml-2">
                            <label className="font-medium text-sm cursor-pointer">{item.label}</label>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
            <Button
              onClick={() => goToScreen('experience')}
              variant="ghost"
              className="text-gray-600"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={getStarterRecommendation}
              className="bg-[#D97706] hover:bg-[#B45309]"
            >
              See My Results <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the Results Screen
  if (activeScreen === 'results') {
    // Get matched starter type
    const matchedStarter = results.primaryMatch ? 
      starterTypes.find(s => s.id === results.primaryMatch) : 
      starterTypes[0]; // Default to first starter if none matched
    
    // Get secondary matches
    const secondaryMatchStarters = results.secondaryMatches
      .map(id => starterTypes.find(s => s.id === id))
      .filter(Boolean);
      
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-[#4A2A1A]">Your Perfect Starter Match</h1>
            <p className="mt-2 text-gray-600">Based on your preferences, we've found your ideal sourdough companion</p>
          </div>
          
          {/* Primary Match */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-[#F5F5DC] rounded-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Starter Icon */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center border-4 border-[#D97706]">
                    <div className={`w-16 h-16 ${matchedStarter?.iconColor || 'bg-amber-200'} rounded-full flex items-center justify-center`}>
                      <span className="font-serif font-bold text-2xl text-[#4A2A1A]">
                        {matchedStarter?.name.charAt(0) || 'S'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-center">
                    <div className="font-bold text-[#D97706] text-lg">{results.matchScore || 95}% Match</div>
                    <div className="flex justify-center mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className="h-4 w-4 text-[#D97706] fill-[#D97706]" 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Starter Details */}
                <div className="flex-1">
                  <h2 className="text-2xl font-serif font-bold text-[#4A2A1A] mb-2">
                    {matchedStarter?.name || 'San Francisco'} Sourdough Starter
                  </h2>
                  <p className="text-gray-700 mb-4">
                    {matchedStarter?.description || 'A classic sourdough starter with perfect balance of flavor and reliability.'}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-sm font-medium">Flavor Profile</div>
                      <div className="text-sm text-gray-600">{matchedStarter?.flavor || 'Tangy'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-sm font-medium">Maintenance</div>
                      <div className="text-sm text-gray-600">{matchedStarter?.maintenance || 'Moderate'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-sm font-medium">Ideal For</div>
                      <div className="text-sm text-gray-600">{matchedStarter?.doughTypes?.[0] || 'Artisan Loaves'}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Link href="/shop">
                      <Button className="bg-[#D97706] hover:bg-[#B45309]">
                        Get This Starter
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="border-[#D97706] text-[#D97706]"
                      onClick={() => goToScreen('followUp')}
                    >
                      Care Instructions
                    </Button>
                    <Button variant="ghost" className="text-gray-600">
                      Share Results
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Match Explanation */}
          <div className="mb-12">
            <h2 className="text-xl font-serif font-semibold mb-4">Why This Starter Is Perfect For You</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#F8F6F1] p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <ThumbsUp className="h-4 w-4 text-[#D97706] mr-2" />
                  Matches Your Flavor Preferences
                </h3>
                <p className="text-sm text-gray-700">
                  {matchedStarter?.name || 'San Francisco'} starters develop the {matchedStarter?.flavor?.toLowerCase() || 'tangy'} flavor profile you're looking for, with a perfect balance for your preferred level of sourness.
                </p>
              </div>
              
              <div className="bg-[#F8F6F1] p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <Calendar className="h-4 w-4 text-[#D97706] mr-2" />
                  Fits Your Baking Schedule
                </h3>
                <p className="text-sm text-gray-700">
                  The {answers.bakingFrequency} baking frequency you indicated works perfectly with this starter's {matchedStarter?.maintenance?.toLowerCase() || 'moderate'} maintenance needs.
                </p>
              </div>
              
              <div className="bg-[#F8F6F1] p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <Settings className="h-4 w-4 text-[#D97706] mr-2" />
                  Aligned With Your Experience
                </h3>
                <p className="text-sm text-gray-700">
                  As a {answers.skillLevel} baker, you'll find this starter {answers.skillLevel === 'beginner' ? 'approachable yet rewarding' : 'provides the complexity and character you can appreciate'}.
                </p>
              </div>
              
              <div className="bg-[#F8F6F1] p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <Globe className="h-4 w-4 text-[#D97706] mr-2" />
                  Adapts To Your Environment
                </h3>
                <p className="text-sm text-gray-700">
                  This starter thrives in {answers.climate.replace('-', ' ')} conditions like yours, requiring minimal adjustments to maintain optimal activity.
                </p>
              </div>
            </div>
          </div>
          
          {/* Secondary Matches */}
          {secondaryMatchStarters.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-serif font-semibold mb-4">Other Great Matches For You</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {secondaryMatchStarters.map(starter => (
                  <div key={starter?.id} className="border border-gray-200 rounded-lg p-4 flex items-center space-x-4">
                    <div className={`w-12 h-12 ${starter?.iconColor || 'bg-amber-100'} rounded-full flex-shrink-0 flex items-center justify-center`}>
                      <span className="font-serif font-bold text-[#4A2A1A]">
                        {starter?.name.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{starter?.name} Starter</h3>
                      <p className="text-sm text-gray-600">{starter?.flavor} flavor, {starter?.maintenance} maintenance</p>
                    </div>
                    <div className="ml-auto">
                      <Button variant="outline" size="sm" className="text-xs">
                        Learn More
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Next Steps */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-serif font-semibold mb-4">Your Next Steps</h2>
            
            <div className="bg-[#F8F6F1] rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-[#D97706] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">Order Your Starter</h3>
                    <p className="text-sm text-gray-600">Get your perfectly matched {matchedStarter?.name || 'San Francisco'} starter delivered to your door.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-[#D97706] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">Review Starter Care Guide</h3>
                    <p className="text-sm text-gray-600">Learn how to feed and maintain your new starter for optimal results.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-[#D97706] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">Explore Bread Recipes</h3>
                    <p className="text-sm text-gray-600">Discover recipes perfectly suited to your new {matchedStarter?.name || 'San Francisco'} starter.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/shop">
                  <Button className="bg-[#D97706] hover:bg-[#B45309]">
                    Get Started Now
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => goToScreen('welcome')}>
                  Take Quiz Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Placeholder for other screens
  return (
    <div className="space-y-8">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sourdough Starter Quiz</h1>
          <p className="text-gray-600">
            Find the perfect starter culture for your baking style, flavor preferences, and environmental conditions 
            through our scientific matching system.
          </p>
        </div>
        <Button 
          onClick={() => goToScreen('welcome')}
          className="bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white rounded-none transition-colors"
        >
          Start Quiz
        </Button>
      </div>
    </div>
  );
}