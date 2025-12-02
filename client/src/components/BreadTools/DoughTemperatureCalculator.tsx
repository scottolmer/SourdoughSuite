import React, { useState, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { 
  Thermometer,
  Save,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Preset temperature profiles
const TEMPERATURE_PRESETS = [
  {
    id: 1,
    name: 'Standard Bread',
    desiredDoughTemp: 78,
    frictionFactor: 5,
    notes: 'Typical white bread dough, mixed with stand mixer'
  },
  {
    id: 2,
    name: 'Cool Fermentation',
    desiredDoughTemp: 74,
    frictionFactor: 3,
    notes: 'For longer, slower fermentation with more flavor development'
  },
  {
    id: 3,
    name: 'Warm Fermentation',
    desiredDoughTemp: 82,
    frictionFactor: 8,
    notes: 'For faster fermentation, higher activity doughs'
  },
  {
    id: 4,
    name: 'Hand Mixed',
    desiredDoughTemp: 76,
    frictionFactor: 2,
    notes: 'Gentle hand mixing with minimal friction'
  },
  {
    id: 5,
    name: 'Intense Machine Mix',
    desiredDoughTemp: 76,
    frictionFactor: 9,
    notes: 'High-speed mixer, significant heat generation'
  },
];

// For educational tooltips
const EDUCATIONAL_TIPS = [
  {
    id: 'desired-dough-temp',
    title: 'Desired Dough Temperature',
    content: 'The target temperature of your finished dough after mixing. This affects fermentation rate and flavor development. Higher temperatures lead to faster fermentation with more yeast activity, while lower temperatures slow fermentation for more bacterial activity and complex flavors.'
  },
  {
    id: 'friction-factor',
    title: 'Friction Factor',
    content: 'Heat generated during mixing. Hand mixing has a lower friction factor (1-3°F) while intensive machine mixing can generate significant heat (8-12°F). Adjust based on your mixing method and intensity.'
  },
  {
    id: 'seasonal-adjustment',
    title: 'Seasonal Adjustments',
    content: 'In summer, use cooler water or refrigerated flour to compensate for higher ambient temperatures. In winter, use warmer water or consider ambient proofing boxes to maintain consistent fermentation.'
  }
];

interface TemperatureData {
  roomTemp: number;
  flourTemp: number;
  starterTemp: number; // Added starter temperature
  useStarter: boolean; // Flag to include starter in calculation
  desiredDoughTemp: number;
  frictionFactor: number;
  useCelsius: boolean;
}

interface TemperatureProfile {
  id?: number;
  name: string;
  desiredDoughTemp: number;
  frictionFactor: number;
  notes?: string;
}

const DEFAULT_DATA: TemperatureData = {
  roomTemp: 72,
  flourTemp: 68,
  starterTemp: 72, // Adding default starter temperature (typically room temp)
  useStarter: true, // Enable starter by default for sourdough bakers
  desiredDoughTemp: 76, // Lowered to a more common target temp
  frictionFactor: 4, // Slightly reduced friction factor
  useCelsius: false
};

export default function DoughTemperatureCalculator() {
  const { toast } = useToast();
  const [tempData, setTempData] = useState<TemperatureData>(DEFAULT_DATA);
  const [waterTemp, setWaterTemp] = useState<number | null>(null);
  const [customProfiles, setCustomProfiles] = useState<TemperatureProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  
  // Calculate water temperature
  const calculateWaterTemp = () => {
    // Determine number of factors based on whether starter is included
    const numberOfFactors = tempData.useStarter ? 4 : 3; 
    
    // Updated formula: Water Temp = (Desired Dough Temp × N) - Room Temp - Flour Temp - Starter Temp (if used) - Friction Factor
    // Where N is the number of factors (3 without starter, 4 with starter)
    let calculatedTemp = (tempData.desiredDoughTemp * numberOfFactors) - 
                         tempData.roomTemp - 
                         tempData.flourTemp - 
                         tempData.frictionFactor;
    
    // Subtract starter temp if applicable                     
    if (tempData.useStarter) {
      calculatedTemp -= tempData.starterTemp;
    }
    
    setWaterTemp(Math.round(calculatedTemp));
    
    toast({
      title: "Calculation Complete",
      description: `Ideal water temperature: ${Math.round(calculatedTemp)}°${tempData.useCelsius ? 'C' : 'F'}`,
    });
  };
  
  // Reset to default values
  const resetCalculator = () => {
    setTempData(DEFAULT_DATA);
    setWaterTemp(null);
    setActiveProfile(null);
    
    toast({
      title: "Calculator Reset",
      description: "All values have been reset to default"
    });
  };
  
  // Load a temperature profile
  const loadProfile = (profileId: string) => {
    setActiveProfile(profileId);
    
    if (profileId === 'custom') return;
    
    let profile;
    
    // Check built-in presets
    if (profileId.startsWith('preset-')) {
      const presetId = parseInt(profileId.replace('preset-', ''));
      profile = TEMPERATURE_PRESETS.find(p => p.id === presetId);
    } 
    // Check custom profiles
    else if (profileId.startsWith('custom-')) {
      const customId = parseInt(profileId.replace('custom-', ''));
      profile = customProfiles.find(p => p.id === customId);
    }
    
    if (profile) {
      setTempData({
        ...tempData,
        desiredDoughTemp: profile.desiredDoughTemp,
        frictionFactor: profile.frictionFactor
      });
      
      toast({
        title: "Profile Loaded",
        description: `Loaded settings for: ${profile.name}`
      });
    }
  };
  
  // Save current settings as a custom profile
  const saveCustomProfile = () => {
    if (!newProfileName.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your profile",
        variant: "destructive"
      });
      return;
    }
    
    const newProfile: TemperatureProfile = {
      id: Date.now(),
      name: newProfileName,
      desiredDoughTemp: tempData.desiredDoughTemp,
      frictionFactor: tempData.frictionFactor,
      notes: "Custom profile"
    };
    
    setCustomProfiles([...customProfiles, newProfile]);
    setNewProfileName('');
    
    toast({
      title: "Profile Saved",
      description: `Saved settings as: ${newProfileName}`
    });
  };
  
  // Convert between Celsius and Fahrenheit
  const toggleTemperatureUnit = () => {
    if (tempData.useCelsius) {
      // Convert from Celsius to Fahrenheit
      setTempData({
        ...tempData,
        roomTemp: Math.round(tempData.roomTemp * 9/5 + 32),
        flourTemp: Math.round(tempData.flourTemp * 9/5 + 32),
        starterTemp: Math.round(tempData.starterTemp * 9/5 + 32), // Convert starter temp too
        desiredDoughTemp: Math.round(tempData.desiredDoughTemp * 9/5 + 32),
        frictionFactor: Math.round(tempData.frictionFactor * 9/5),
        useCelsius: false
      });
      
      if (waterTemp !== null) {
        setWaterTemp(Math.round(waterTemp * 9/5 + 32));
      }
    } else {
      // Convert from Fahrenheit to Celsius
      setTempData({
        ...tempData,
        roomTemp: Math.round((tempData.roomTemp - 32) * 5/9),
        flourTemp: Math.round((tempData.flourTemp - 32) * 5/9),
        starterTemp: Math.round((tempData.starterTemp - 32) * 5/9), // Convert starter temp too
        desiredDoughTemp: Math.round((tempData.desiredDoughTemp - 32) * 5/9),
        frictionFactor: Math.round(tempData.frictionFactor * 5/9),
        useCelsius: true
      });
      
      if (waterTemp !== null) {
        setWaterTemp(Math.round((waterTemp - 32) * 5/9));
      }
    }
    
    toast({
      title: "Units Changed",
      description: `Temperature now in degrees ${tempData.useCelsius ? 'Fahrenheit' : 'Celsius'}`
    });
  };
  
  // Helper function to determine temperature description
  const getTemperatureDescription = (temp: number | null): string => {
    if (temp === null) return '';
    
    // Adjust thresholds based on units
    const cold = tempData.useCelsius ? 15 : 60;
    const cool = tempData.useCelsius ? 23 : 74;
    const warm = tempData.useCelsius ? 32 : 90;
    const hot = tempData.useCelsius ? 43 : 110;
    
    if (temp < cold) return 'Very Cold';
    if (temp < cool) return 'Cool';
    if (temp < warm) return 'Lukewarm';
    if (temp < hot) return 'Warm';
    return 'Hot';
  };
  
  // Get water temperature style classes based on temperature range
  const getWaterTempClasses = (): string => {
    if (waterTemp === null) return '';
    
    // Adjust thresholds based on units
    const cold = tempData.useCelsius ? 15 : 60;
    const cool = tempData.useCelsius ? 23 : 74;
    const warm = tempData.useCelsius ? 32 : 90;
    const hot = tempData.useCelsius ? 43 : 110;
    
    if (waterTemp < cold) return 'text-blue-600';
    if (waterTemp < cool) return 'text-blue-400';
    if (waterTemp < warm) return 'text-green-500';
    if (waterTemp < hot) return 'text-orange-500';
    return 'text-red-600';
  };

  // Handle input changes
  const handleInputChange = (field: keyof TemperatureData, value: number) => {
    setTempData({
      ...tempData,
      [field]: value
    });
    setWaterTemp(null); // Reset calculated water temp when inputs change
  };

  return (
    <div className="space-y-4 w-full max-w-[95vw] mx-auto overflow-hidden">
      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-4 px-4 sm:px-6">
          <CardTitle>Temperature Calculator</CardTitle>
          <CardDescription>
            Calculate ideal water temperature for dough
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-4 sm:px-6 overflow-x-hidden">
          <Tabs defaultValue="calculator">
            <TabsList className="mb-4">
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="profiles">Profiles</TabsTrigger>
              <TabsTrigger value="guide">Guide</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculator" className="space-y-6">
              {/* Temperature Unit Toggle */}
              <div className="flex justify-end">
                <div className="border rounded-md p-1 flex items-center space-x-1">
                  <span className="text-sm px-2">Units:</span>
                  <button 
                    className={`px-3 py-1 rounded-sm text-sm ${!tempData.useCelsius ? 'bg-primary text-white' : 'hover:bg-muted'}`}
                    onClick={() => !tempData.useCelsius || toggleTemperatureUnit()}
                  >
                    °F
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-sm text-sm ${tempData.useCelsius ? 'bg-primary text-white' : 'hover:bg-muted'}`}
                    onClick={() => tempData.useCelsius || toggleTemperatureUnit()}
                  >
                    °C
                  </button>
                </div>
              </div>
              
              {/* Presets Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="preset">Load Preset Profile</Label>
                <Select value={activeProfile || ''} onValueChange={loadProfile}>
                  <SelectTrigger id="preset">
                    <SelectValue placeholder="Select a profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Select a profile</SelectItem>
                    <SelectItem value="custom">Custom Settings</SelectItem>
                    {TEMPERATURE_PRESETS.map(preset => (
                      <SelectItem key={preset.id} value={`preset-${preset.id}`}>
                        {preset.name}
                      </SelectItem>
                    ))}
                    {customProfiles.map(profile => (
                      <SelectItem key={profile.id} value={`custom-${profile.id}`}>
                        {profile.name} (Custom)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Room Temperature */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label htmlFor="room-temp">Room Temperature</Label>
                  <span className="text-muted-foreground">
                    {tempData.roomTemp}°{tempData.useCelsius ? 'C' : 'F'}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <Thermometer className="h-5 w-5 text-muted-foreground" />
                  <Slider
                    id="room-temp"
                    min={tempData.useCelsius ? 15 : 60}
                    max={tempData.useCelsius ? 35 : 95}
                    step={1}
                    value={[tempData.roomTemp]}
                    onValueChange={(values) => handleInputChange('roomTemp', values[0])}
                  />
                  <Input
                    type="number"
                    value={tempData.roomTemp}
                    onChange={(e) => handleInputChange('roomTemp', Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>
              
              {/* Flour Temperature */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label htmlFor="flour-temp">Flour Temperature</Label>
                  <span className="text-muted-foreground">
                    {tempData.flourTemp}°{tempData.useCelsius ? 'C' : 'F'}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <Thermometer className="h-5 w-5 text-muted-foreground" />
                  <Slider
                    id="flour-temp"
                    min={tempData.useCelsius ? 15 : 60}
                    max={tempData.useCelsius ? 30 : 85}
                    step={1}
                    value={[tempData.flourTemp]}
                    onValueChange={(values) => handleInputChange('flourTemp', values[0])}
                  />
                  <Input
                    type="number"
                    value={tempData.flourTemp}
                    onChange={(e) => handleInputChange('flourTemp', Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>
              
              {/* Starter Temperature - Only visible if useStarter is true */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Toggle 
                      aria-label="Toggle starter"
                      pressed={tempData.useStarter}
                      onPressedChange={(pressed) => {
                        setTempData({
                          ...tempData,
                          useStarter: pressed
                        });
                        setWaterTemp(null);
                      }}
                    />
                    <Label htmlFor="starter-temp">Starter Temperature</Label>
                  </div>
                  <span className="text-muted-foreground">
                    {tempData.starterTemp}°{tempData.useCelsius ? 'C' : 'F'}
                  </span>
                </div>
                <div className={`flex items-center space-x-4 ${tempData.useStarter ? '' : 'opacity-50'}`}>
                  <Thermometer className="h-5 w-5 text-muted-foreground" />
                  <Slider
                    id="starter-temp"
                    min={tempData.useCelsius ? 15 : 60}
                    max={tempData.useCelsius ? 30 : 85}
                    step={1}
                    value={[tempData.starterTemp]}
                    onValueChange={(values) => handleInputChange('starterTemp', values[0])}
                    disabled={!tempData.useStarter}
                  />
                  <Input
                    type="number"
                    value={tempData.starterTemp}
                    onChange={(e) => handleInputChange('starterTemp', Number(e.target.value))}
                    className="w-20"
                    disabled={!tempData.useStarter}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {tempData.useStarter ? 
                    "Includes starter temperature in calculation for sourdough bread" : 
                    "Enable to include starter temperature for sourdough bread"}
                </div>
              </div>
              
              {/* Desired Dough Temperature */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label htmlFor="dough-temp">Target Dough Temp</Label>
                  <span className="text-muted-foreground">
                    {tempData.desiredDoughTemp}°{tempData.useCelsius ? 'C' : 'F'}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <Thermometer className="h-5 w-5 text-primary" />
                  <Slider
                    id="dough-temp"
                    min={tempData.useCelsius ? 20 : 68}
                    max={tempData.useCelsius ? 30 : 86}
                    step={1}
                    value={[tempData.desiredDoughTemp]}
                    onValueChange={(values) => handleInputChange('desiredDoughTemp', values[0])}
                  />
                  <Input
                    type="number"
                    value={tempData.desiredDoughTemp}
                    onChange={(e) => handleInputChange('desiredDoughTemp', Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>
              
              {/* Friction Factor */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label htmlFor="friction-factor">Friction Factor</Label>
                  <span className="text-muted-foreground">
                    {tempData.frictionFactor}°{tempData.useCelsius ? 'C' : 'F'}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="friction-factor"
                    min={0}
                    max={tempData.useCelsius ? 8 : 15}
                    step={1}
                    value={[tempData.frictionFactor]}
                    onValueChange={(values) => handleInputChange('frictionFactor', values[0])}
                  />
                  <Input
                    type="number"
                    value={tempData.frictionFactor}
                    onChange={(e) => handleInputChange('frictionFactor', Number(e.target.value))}
                    className="w-20"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <ul className="space-y-1">
                    <li>• Hand mixing: 0-3°{tempData.useCelsius ? 'C' : 'F'}</li>
                    <li>• Stand mixer (low speed): 3-6°{tempData.useCelsius ? 'C' : 'F'}</li>
                    <li>• Stand mixer (high speed): 7-12°{tempData.useCelsius ? 'C' : 'F'}</li>
                    <li>• Commercial mixer: 10-15°{tempData.useCelsius ? 'C' : 'F'}</li>
                  </ul>
                </div>
              </div>
              
              {/* Results Section */}
              {waterTemp !== null && (
                <div className="bg-muted p-6 rounded-lg space-y-4 mt-8">
                  <h3 className="text-lg font-bold">Calculated Result</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ideal Water Temperature</p>
                      <div className={`text-3xl font-bold ${getWaterTempClasses()}`}>
                        {waterTemp}°{tempData.useCelsius ? 'C' : 'F'}
                      </div>
                      <p className="text-sm">{getTemperatureDescription(waterTemp)}</p>
                    </div>
                    <div className={`h-24 w-24 rounded-full flex items-center justify-center border-4 ${getWaterTempClasses()}`}>
                      <Thermometer className={`h-12 w-12 ${getWaterTempClasses()}`} />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Recommendations</h4>
                    
                    {/* Temperature-specific warnings */}
                    {waterTemp > (tempData.useCelsius ? 55 : 130) && (
                      <p className="text-red-600 text-sm">
                        ⚠️ Water temperature is dangerously hot! Consider using cooler flour or reducing desired dough temperature.
                      </p>
                    )}
                    {waterTemp < (tempData.useCelsius ? 5 : 40) && (
                      <p className="text-blue-600 text-sm">
                        ⚠️ Water temperature is too cold! Consider using warmer flour or increasing desired dough temperature.
                      </p>
                    )}
                    {tempData.roomTemp > (tempData.useCelsius ? 27 : 80) && (
                      <p className="text-orange-600 text-sm">
                        • Room is warm - consider refrigerating flour for 30 minutes before mixing.
                      </p>
                    )}
                    {tempData.roomTemp < (tempData.useCelsius ? 18 : 65) && (
                      <p className="text-blue-600 text-sm">
                        • Room is cool - warm mixing bowl with hot water before using.
                      </p>
                    )}
                    
                    {/* Default recommendations that always show */}
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• Use a thermometer to verify water temperature before mixing</p>
                      <p>• Mix ingredients gradually to maintain temperature control</p>
                      <p>• Monitor dough temperature during fermentation for consistent results</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="profiles" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Save Current Settings as Profile</h3>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Profile name"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                  />
                  <Button onClick={saveCustomProfile}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Built-in Profiles</h3>
                <div className="grid gap-4">
                  {TEMPERATURE_PRESETS.map(preset => (
                    <Card key={preset.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{preset.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{preset.notes}</p>
                            <div className="flex space-x-4 mt-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">DDT: </span>
                                <span>{preset.desiredDoughTemp}°{tempData.useCelsius ? 'C' : 'F'}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Friction: </span>
                                <span>{preset.frictionFactor}°{tempData.useCelsius ? 'C' : 'F'}</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => loadProfile(`preset-${preset.id}`)}
                          >
                            Load
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {customProfiles.length > 0 && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Custom Profiles</h3>
                    <div className="grid gap-4">
                      {customProfiles.map(profile => (
                        <Card key={profile.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold">{profile.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{profile.notes}</p>
                                <div className="flex space-x-4 mt-2">
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">DDT: </span>
                                    <span>{profile.desiredDoughTemp}°{tempData.useCelsius ? 'C' : 'F'}</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Friction: </span>
                                    <span>{profile.frictionFactor}°{tempData.useCelsius ? 'C' : 'F'}</span>
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => loadProfile(`custom-${profile.id}`)}
                              >
                                Load
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="guide" className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Understanding Dough Temperature</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Maintaining consistent dough temperature is one of the most important and often overlooked aspects of bread baking. 
                    It determines fermentation rate, flavor development, and final bread texture.
                  </p>
                </div>
                
                <div className="grid gap-4">
                  {EDUCATIONAL_TIPS.map(tip => (
                    <Card key={tip.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-sm break-words">{tip.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed break-words">{tip.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Temperature Table</h3>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th className="px-2 sm:px-4 py-2 text-left text-muted-foreground text-xs sm:text-sm font-medium">Type</th>
                          <th className="px-2 sm:px-4 py-2 text-left text-muted-foreground text-xs sm:text-sm font-medium">°F</th>
                          <th className="px-2 sm:px-4 py-2 text-left text-muted-foreground text-xs sm:text-sm font-medium">°C</th>
                          <th className="px-2 sm:px-4 py-2 text-left text-muted-foreground text-xs sm:text-sm font-medium">Effect</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">Cool</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">70-75</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">21-24</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm break-words">Slow fermentation, more sour flavor</td>
                        </tr>
                        <tr>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">Standard</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">76-80</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">24-27</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm break-words">Balanced fermentation</td>
                        </tr>
                        <tr>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">Warm</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">81-85</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">27-29</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm break-words">Fast fermentation, milder flavor</td>
                        </tr>
                        <tr>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">Very Warm</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">86-90</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">30-32</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm break-words">Rapid fermentation, may weaken structure</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between px-4 sm:px-6">
          <Button variant="outline" onClick={resetCalculator}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={calculateWaterTemp} className="bg-primary hover:bg-primary/90 text-white">
            <Thermometer className="mr-2 h-4 w-4" />
            Calculate Water Temperature
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}