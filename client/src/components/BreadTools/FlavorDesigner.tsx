import { useState } from "react";
import { CustomSlider } from "@/components/ui/custom-slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, BookOpen, FlaskConical, Info, MessageCircle, Zap } from "lucide-react";
import FlavorRadarChart from "./FlavorRadarChart";
import TextureStructurePanel from "./TextureStructurePanel";
import StructureGrid from "./StructureGrid";
import { TextureSettings } from "./utils/textureMapping";

// Flavor profile type definition matching the detailed specs
interface FlavorProfileType {
  profileId?: string;
  name: string;
  primaryDimensions: {
    sourness: number;
    sweetness: number;
    umami: number;
    yeasty: number;
  };
  flavorNotes: Array<{
    family: string;
    note: string;
    intensity: number;
  }>;
  aromaProfile: {
    intensity: number;
    character: string[];
  };
  texturePreferences: {
    crumb: {
      openness: number;
      irregularity: number;
      chewiness: number;
      moisture: number;
    };
    crust: {
      thickness: number;
      texture: string;
      color: number;
      blistering: number;
      earFormation: boolean;
    };
  };
  constraints: {
    equipment: string[];
    timeAvailable: number;
    activeTimeMax: number;
    skillLevel: number;
    availableIngredients: string[];
    starterType: string;
  };
}

// Default flavor profile with initial values
const DEFAULT_FLAVOR_PROFILE: FlavorProfileType = {
  name: "My Custom Bread",
  primaryDimensions: {
    sourness: 70,
    sweetness: 50,
    umami: 40,
    yeasty: 60
  },
  flavorNotes: [
    { family: "nutty", note: "walnut", intensity: 0.7 }
  ],
  aromaProfile: {
    intensity: 0.6,
    character: ["toasty", "grainy"]
  },
  texturePreferences: {
    crumb: {
      openness: 0.7,
      irregularity: 0.6,
      chewiness: 0.5,
      moisture: 0.5
    },
    crust: {
      thickness: 0.6,
      texture: "crisp",
      color: 0.7,
      blistering: 0.5,
      earFormation: true
    }
  },
  constraints: {
    equipment: ["dutch oven", "banneton"],
    timeAvailable: 24,
    activeTimeMax: 2,
    skillLevel: 0.7,
    availableIngredients: ["bread flour", "whole wheat flour", "rye flour"],
    starterType: "san-francisco"
  }
};

// Available flavor note families and examples
const FLAVOR_FAMILIES = {
  nutty: ["walnut", "almond", "hazelnut", "sesame"],
  malty: ["barley", "wheat", "caramel"],
  fruity: ["apple", "citrus", "berry", "banana"],
  spicy: ["cinnamon", "pepper", "anise", "clove"],
  earthy: ["mushroom", "grass", "mineral", "woody"],
  buttery: ["cream", "butter", "brioche", "shortbread"]
};

// Starter types and their characteristics
const STARTER_TYPES = [
  { id: "san-francisco", name: "Classic San Francisco", profile: "Tangy, complex, reliable" },
  { id: "koji", name: "Koji-Cultured", profile: "Sweet, umami-rich, rapid fermentation" },
  { id: "rye", name: "Rustic Rye", profile: "Deep sourness, earthy character" },
  { id: "kombucha", name: "Kombucha-Enhanced", profile: "Fruity, bright acidity" },
  { id: "whole-wheat", name: "Whole Wheat", profile: "Nutty, medium sourness" }
];

export default function FlavorDesigner() {
  const [activeTab, setActiveTab] = useState("flavor");
  const [flavorProfile, setFlavorProfile] = useState<FlavorProfileType>(DEFAULT_FLAVOR_PROFILE);
  const [showGeneratedRecipe, setShowGeneratedRecipe] = useState(false);
  const [generationStage, setGenerationStage] = useState<"analyzing" | "generating" | "complete">("analyzing");

  // Convert 0-100 scale to 0-1 scale for API
  const normalizeValue = (value: number) => value / 100;
  
  // Convert 0-1 scale to 0-100 scale for display
  const denormalizeValue = (value: number) => Math.round(value * 100);

  // Handle slider changes for primary dimensions
  const handleDimensionChange = (name: string, value: number) => {
    setFlavorProfile(prev => ({
      ...prev,
      primaryDimensions: {
        ...prev.primaryDimensions,
        [name]: value
      }
    }));
  };

  // Handle flavor note changes
  const handleFlavorNoteChange = (family: string, checked: boolean) => {
    if (checked) {
      // Add this flavor family if it doesn't exist yet
      if (!flavorProfile.flavorNotes.some(note => note.family === family)) {
        const defaultNote = FLAVOR_FAMILIES[family as keyof typeof FLAVOR_FAMILIES][0];
        setFlavorProfile(prev => ({
          ...prev,
          flavorNotes: [
            ...prev.flavorNotes,
            { family, note: defaultNote, intensity: 0.7 }
          ]
        }));
      }
    } else {
      // Remove this flavor family
      setFlavorProfile(prev => ({
        ...prev,
        flavorNotes: prev.flavorNotes.filter(note => note.family !== family)
      }));
    }
  };

  // Handle flavor note intensity changes
  const handleNoteIntensityChange = (family: string, intensity: number) => {
    setFlavorProfile(prev => ({
      ...prev,
      flavorNotes: prev.flavorNotes.map(note => 
        note.family === family ? { ...note, intensity: normalizeValue(intensity) } : note
      )
    }));
  };

  // Handle specific note selection within a family
  const handleSpecificNoteChange = (family: string, noteName: string) => {
    setFlavorProfile(prev => ({
      ...prev,
      flavorNotes: prev.flavorNotes.map(note => 
        note.family === family ? { ...note, note: noteName } : note
      )
    }));
  };

  // Handle texture preference changes
  const handleTextureChange = (category: "crumb" | "crust", property: string, value: number) => {
    setFlavorProfile(prev => ({
      ...prev,
      texturePreferences: {
        ...prev.texturePreferences,
        [category]: {
          ...prev.texturePreferences[category],
          [property]: normalizeValue(value)
        }
      }
    }));
  };

  // Handle crust texture type selection
  const handleCrustTextureChange = (texture: string) => {
    setFlavorProfile(prev => ({
      ...prev,
      texturePreferences: {
        ...prev.texturePreferences,
        crust: {
          ...prev.texturePreferences.crust,
          texture
        }
      }
    }));
  };

  // Handle ear formation toggle
  const handleEarFormationChange = (value: boolean) => {
    setFlavorProfile(prev => ({
      ...prev,
      texturePreferences: {
        ...prev.texturePreferences,
        crust: {
          ...prev.texturePreferences.crust,
          earFormation: value
        }
      }
    }));
  };

  // Handle starter type selection
  const handleStarterTypeChange = (starterType: string) => {
    setFlavorProfile(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        starterType
      }
    }));
  };

  // Handle skill level change
  const handleSkillLevelChange = (value: number) => {
    setFlavorProfile(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        skillLevel: normalizeValue(value)
      }
    }));
  };

  // Handle time constraints
  const handleTimeAvailableChange = (value: number) => {
    setFlavorProfile(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        timeAvailable: value
      }
    }));
  };

  // Generate natural language description of the flavor profile
  const getFlavorDescription = () => {
    const { primaryDimensions, flavorNotes } = flavorProfile;
    const descriptions = [];
    
    // Describe sourness
    if (primaryDimensions.sourness > 75) descriptions.push("distinctly tangy");
    else if (primaryDimensions.sourness > 60) descriptions.push("pleasantly tangy");
    else if (primaryDimensions.sourness > 40) descriptions.push("balanced");
    else descriptions.push("mild");
    
    // Describe sweetness if notable
    if (primaryDimensions.sweetness > 70) descriptions.push("with pronounced sweetness");
    else if (primaryDimensions.sweetness > 50) descriptions.push("with subtle sweetness");
    
    // Describe umami if notable
    if (primaryDimensions.umami > 70) descriptions.push("umami-rich");
    
    // Describe yeasty character if notable
    if (primaryDimensions.yeasty > 70) descriptions.push("with pronounced yeasty aroma");
    
    // Collect flavor notes
    const notesDescription = flavorNotes.map(note => 
      note.intensity > 0.7 
        ? `prominent ${note.note} notes` 
        : `subtle ${note.note} undertones`
    );
    
    // Assemble description
    let description = `A ${descriptions.join(", ")} bread`;
    
    if (notesDescription.length === 1) {
      description += ` with ${notesDescription[0]}.`;
    } else if (notesDescription.length === 2) {
      description += ` with ${notesDescription[0]} and ${notesDescription[1]}.`;
    } else if (notesDescription.length > 2) {
      const lastNote = notesDescription.pop();
      description += ` featuring ${notesDescription.join(", ")}, and ${lastNote}.`;
    } else {
      description += ".";
    }
    
    return description;
  };

  // Mock generate recipe function
  const generateRecipe = () => {
    setShowGeneratedRecipe(true);
    
    // Simulate analysis phase
    setGenerationStage("analyzing");
    setTimeout(() => {
      // Simulate generation phase
      setGenerationStage("generating");
      setTimeout(() => {
        // Simulate completion
        setGenerationStage("complete");
      }, 1500);
    }, 1200);
  };

  return (
    <div className="bg-white overflow-hidden">
      <div className="p-8 md:p-12">
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <span className="text-xs font-mono text-[#6E6E6E] mr-2">ANALYZER.02</span>
            <div className="h-px bg-gray-300 flex-grow"></div>
          </div>
          <h2 className="text-[#2B2B2B] text-2xl md:text-3xl font-serif tracking-tight mb-4">
            Flavor Profile Designer
          </h2>
          <p className="text-[#6E6E6E] max-w-3xl leading-relaxed">
            Design your perfect bread by specifying flavor and texture characteristics, 
            then generate a precise recipe to match your exacting specifications.
          </p>
        </div>
        
        {!showGeneratedRecipe ? (
          <>
            <Tabs defaultValue="flavor" value={activeTab} onValueChange={setActiveTab} className="mt-8">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="flavor" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Flavor Profile
                </TabsTrigger>
                <TabsTrigger value="texture" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
                  <Zap className="h-4 w-4 mr-2" />
                  Texture & Structure
                </TabsTrigger>
                <TabsTrigger value="constraints" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
                  <Info className="h-4 w-4 mr-2" />
                  Preferences & Constraints
                </TabsTrigger>
              </TabsList>
              
              {/* Flavor Profile Tab */}
              <TabsContent value="flavor" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  {/* Left side - Primary dimensions and flavor notes */}
                  <div className="md:col-span-3 space-y-8">
                    <h3 className="text-lg font-medium text-amber-900">Primary Flavor Dimensions</h3>
                    
                    {/* Primary flavor dimensions */}
                    <div className="space-y-6">
                      {/* Sourness */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Sourness</label>
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {flavorProfile.primaryDimensions.sourness}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-gray-500">Mild</span>
                          <CustomSlider 
                            min={0} 
                            max={100} 
                            value={flavorProfile.primaryDimensions.sourness} 
                            onChange={(e) => handleDimensionChange('sourness', Number(e.target.value))}
                            className="flex-grow" 
                          />
                          <span className="text-xs text-gray-500">Very Tangy</span>
                        </div>
                      </div>
                      
                      {/* Sweetness */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Sweetness</label>
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {flavorProfile.primaryDimensions.sweetness}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-gray-500">Not Sweet</span>
                          <CustomSlider 
                            min={0} 
                            max={100} 
                            value={flavorProfile.primaryDimensions.sweetness} 
                            onChange={(e) => handleDimensionChange('sweetness', Number(e.target.value))}
                            className="flex-grow" 
                          />
                          <span className="text-xs text-gray-500">Sweet</span>
                        </div>
                      </div>
                      
                      {/* Umami */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Umami / Savory</label>
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {flavorProfile.primaryDimensions.umami}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-gray-500">Low</span>
                          <CustomSlider 
                            min={0} 
                            max={100} 
                            value={flavorProfile.primaryDimensions.umami} 
                            onChange={(e) => handleDimensionChange('umami', Number(e.target.value))}
                            className="flex-grow" 
                          />
                          <span className="text-xs text-gray-500">Rich</span>
                        </div>
                      </div>
                      
                      {/* Yeasty */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Yeasty / Fermented</label>
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {flavorProfile.primaryDimensions.yeasty}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-gray-500">Subtle</span>
                          <CustomSlider 
                            min={0} 
                            max={100} 
                            value={flavorProfile.primaryDimensions.yeasty} 
                            onChange={(e) => handleDimensionChange('yeasty', Number(e.target.value))}
                            className="flex-grow" 
                          />
                          <span className="text-xs text-gray-500">Pronounced</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-amber-900 mb-4">Flavor Notes</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Flavor family checkboxes */}
                        {Object.keys(FLAVOR_FAMILIES).map(family => {
                          const isSelected = flavorProfile.flavorNotes.some(note => note.family === family);
                          return (
                            <div key={family} className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id={family} 
                                  checked={isSelected}
                                  onCheckedChange={(checked) => handleFlavorNoteChange(family, checked === true)}
                                />
                                <Label htmlFor={family} className="capitalize">{family}</Label>
                              </div>
                              
                              {isSelected && (
                                <div className="ml-6 space-y-3">
                                  {/* Specific note selection */}
                                  <Select
                                    value={flavorProfile.flavorNotes.find(note => note.family === family)?.note}
                                    onValueChange={(value) => handleSpecificNoteChange(family, value)}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select note" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {FLAVOR_FAMILIES[family as keyof typeof FLAVOR_FAMILIES].map(note => (
                                        <SelectItem key={note} value={note}>{note}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  
                                  {/* Intensity slider */}
                                  <div>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span>Subtle</span>
                                      <span>Intensity</span>
                                      <span>Dominant</span>
                                    </div>
                                    <CustomSlider 
                                      min={0} 
                                      max={100} 
                                      value={denormalizeValue(flavorProfile.flavorNotes.find(note => note.family === family)?.intensity || 0.5)} 
                                      onChange={(e) => handleNoteIntensityChange(family, Number(e.target.value))}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side - Flavor profile visualization and summary */}
                  <div className="md:col-span-2">
                    <div className="bg-amber-50 rounded-md p-6 sticky top-4">
                      <h3 className="text-lg font-medium text-amber-900 mb-4">Flavor Profile</h3>
                      
                      {/* Radar chart visualization */}
                      <div className="mb-6 flex justify-center">
                        <FlavorRadarChart data={{
                          sourness: flavorProfile.primaryDimensions.sourness,
                          sweetness: flavorProfile.primaryDimensions.sweetness,
                          complexity: flavorProfile.flavorNotes.length * 20,
                          strength: flavorProfile.primaryDimensions.umami,
                          richness: flavorProfile.primaryDimensions.yeasty
                        }} />
                      </div>
                      
                      {/* Flavor profile description */}
                      <div className="mb-6">
                        <h4 className="font-medium mb-2">Your Bread Description</h4>
                        <p className="text-sm text-gray-700 bg-white p-3 rounded border border-amber-100">
                          {getFlavorDescription()}
                        </p>
                      </div>
                      
                      {/* Selected flavor notes */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Selected Flavor Notes</h4>
                        <div className="flex flex-wrap gap-2">
                          {flavorProfile.flavorNotes.length > 0 ? flavorProfile.flavorNotes.map(note => (
                            <div 
                              key={note.family}
                              className="px-2 py-1 bg-white rounded-full text-xs border border-amber-200 flex items-center"
                            >
                              <span className="capitalize">{note.note}</span>
                              <span 
                                className={`ml-1.5 w-2 h-2 rounded-full ${
                                  note.intensity > 0.7 ? 'bg-amber-600' : 'bg-amber-300'
                                }`}
                              ></span>
                            </div>
                          )) : (
                            <div className="text-sm text-gray-500 italic">No flavor notes selected</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center p-3 bg-amber-100 rounded-lg mb-6">
                        <MessageCircle className="h-4 w-4 text-amber-800 mr-2" />
                        <p className="text-xs text-amber-800">
                          These flavor dimensions will help determine fermentation timing and ingredient selection.
                        </p>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <Button 
                          onClick={() => setActiveTab("texture")}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          Continue to Texture <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Texture & Structure Tab */}
              <TabsContent value="texture" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  {/* Left side - Advanced Texture controls using TextureStructurePanel */}
                  <div className="md:col-span-3">
                    <TextureStructurePanel 
                      textureSettings={{
                        crumbOpenness: denormalizeValue(flavorProfile.texturePreferences.crumb.openness),
                        elasticity: denormalizeValue(flavorProfile.texturePreferences.crumb.irregularity), 
                        crustThickness: denormalizeValue(flavorProfile.texturePreferences.crust.thickness),
                        crustHardness: denormalizeValue(flavorProfile.texturePreferences.crust.blistering),
                        chewiness: denormalizeValue(flavorProfile.texturePreferences.crumb.chewiness),
                        riseProfile: flavorProfile.texturePreferences.crust.earFormation ? 'Domed' : 'Rustic',
                        hydrationPriority: "crumb"
                      }}
                      onSettingsChange={(newSettings) => {
                        // Update the existing texture preferences with the new settings
                        handleTextureChange('crumb', 'openness', newSettings.crumbOpenness);
                        handleTextureChange('crumb', 'irregularity', newSettings.elasticity);
                        handleTextureChange('crumb', 'chewiness', newSettings.chewiness);
                        handleTextureChange('crust', 'thickness', newSettings.crustThickness);
                        handleTextureChange('crust', 'blistering', newSettings.crustHardness);
                        handleEarFormationChange(newSettings.riseProfile === 'Domed');
                      }}
                    />
                  </div>
                  
                  {/* Right side - Texture Information with StructureGrid */}
                  <div className="md:col-span-2">
                    <div className="bg-amber-50 rounded-lg p-6 h-full flex flex-col">
                      <h3 className="text-lg font-medium text-amber-900 mb-4">Texture Visualization</h3>
                      
                      <div className="space-y-6">
                        {/* Structure visualization with canvas */}
                        <StructureGrid 
                          crumbOpenness={denormalizeValue(flavorProfile.texturePreferences.crumb.openness)}
                          elasticity={denormalizeValue(flavorProfile.texturePreferences.crumb.irregularity)}
                          riseProfile={flavorProfile.texturePreferences.crust.earFormation ? 'Domed' : 'Rustic'}
                          size={250}
                        />
                        
                        <div>
                          <h4 className="font-medium mb-2">What This Means</h4>
                          <p className="text-sm text-gray-600">
                            Based on your selections, your bread will have 
                            {flavorProfile.texturePreferences.crumb.openness > 0.6 ? ' an open, airy' : ' a tighter'} crumb structure 
                            with {flavorProfile.texturePreferences.crumb.moisture > 0.6 ? ' a moist' : ' a dryer'} interior. 
                            The crust will be {flavorProfile.texturePreferences.crust.thickness > 0.6 ? 'thick' : 'thin'} 
                            and {flavorProfile.texturePreferences.crust.texture}
                            {flavorProfile.texturePreferences.crust.earFormation ? ' with distinctive "ears" from scoring.' : '.'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Recipe Implications</h4>
                          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                            <li>
                              {flavorProfile.texturePreferences.crumb.openness > 0.6 
                                ? 'Higher hydration (75-80%)' 
                                : 'Moderate hydration (65-70%)'}
                            </li>
                            <li>
                              {flavorProfile.texturePreferences.crumb.chewiness > 0.6 
                                ? 'Higher protein flour' 
                                : 'All-purpose or moderate protein flour'}
                            </li>
                            <li>
                              {flavorProfile.texturePreferences.crust.thickness > 0.6 
                                ? 'Longer bake time' 
                                : 'Shorter bake time'}
                            </li>
                            <li>
                              {flavorProfile.texturePreferences.crust.texture === 'crisp' 
                                ? 'Steam at beginning of bake'
                                : flavorProfile.texturePreferences.crust.texture === 'soft'
                                  ? 'Cover during part of baking'
                                  : 'Standard baking approach'}
                            </li>
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-center p-3 bg-amber-100 rounded-lg">
                          <BookOpen className="h-4 w-4 text-amber-800 mr-2" />
                          <p className="text-xs text-amber-800">
                            Texture adjustments directly influence hydration, flour blend, and baking methods.
                          </p>
                        </div>
                        
                        <div className="mt-auto text-center">
                          <Button 
                            onClick={() => setActiveTab("constraints")}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            Continue to Preferences <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Preferences & Constraints Tab */}
              <TabsContent value="constraints" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  {/* Left side - Preference controls */}
                  <div className="md:col-span-3 space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-amber-900">Starter Selection</h3>
                      
                      {/* Starter type selection */}
                      <div className="grid grid-cols-1 gap-4">
                        {STARTER_TYPES.map(starter => (
                          <div 
                            key={starter.id}
                            className={`border rounded-lg p-4 cursor-pointer transition ${
                              flavorProfile.constraints.starterType === starter.id 
                                ? 'border-amber-600 bg-amber-50' 
                                : 'border-gray-200 hover:border-amber-300'
                            }`}
                            onClick={() => handleStarterTypeChange(starter.id)}
                          >
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded-full mr-3 ${
                                flavorProfile.constraints.starterType === starter.id
                                  ? 'bg-amber-600' 
                                  : 'bg-gray-200'
                              }`}></div>
                              <div>
                                <h4 className="font-medium text-sm">{starter.name} Starter</h4>
                                <p className="text-xs text-gray-600">{starter.profile}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 space-y-6">
                      <h3 className="text-lg font-medium text-amber-900">Practical Constraints</h3>
                      
                      {/* Skill Level */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Skill Level</label>
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {denormalizeValue(flavorProfile.constraints.skillLevel)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-gray-500">Beginner</span>
                          <CustomSlider 
                            min={0} 
                            max={100} 
                            value={denormalizeValue(flavorProfile.constraints.skillLevel)} 
                            onChange={(e) => handleSkillLevelChange(Number(e.target.value))}
                            className="flex-grow" 
                          />
                          <span className="text-xs text-gray-500">Expert</span>
                        </div>
                      </div>
                      
                      {/* Time Available */}
                      <div>
                        <label className="text-sm font-medium block mb-2">Time Available</label>
                        <Select
                          value={String(flavorProfile.constraints.timeAvailable)}
                          onValueChange={(value) => handleTimeAvailableChange(Number(value))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select available time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8">Quick (6-8 hours)</SelectItem>
                            <SelectItem value="24">Overnight (12-24 hours)</SelectItem>
                            <SelectItem value="48">Extended (24-48 hours)</SelectItem>
                            <SelectItem value="72">Long Ferment (3+ days)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Equipment Available */}
                      <div>
                        <label className="text-sm font-medium block mb-2">Equipment Available</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['dutch oven', 'banneton', 'proofing box', 'baking stone', 'lame'].map(equipment => (
                            <div key={equipment} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`equipment-${equipment}`}
                                checked={flavorProfile.constraints.equipment.includes(equipment)}
                                onCheckedChange={(checked) => {
                                  setFlavorProfile(prev => ({
                                    ...prev,
                                    constraints: {
                                      ...prev.constraints,
                                      equipment: checked 
                                        ? [...prev.constraints.equipment, equipment]
                                        : prev.constraints.equipment.filter(e => e !== equipment)
                                    }
                                  }));
                                }}
                              />
                              <label htmlFor={`equipment-${equipment}`} className="text-sm capitalize">
                                {equipment}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side - Summary and Generate button */}
                  <div className="md:col-span-2">
                    <div className="bg-amber-50 rounded-lg p-6 h-full flex flex-col">
                      <h3 className="text-lg font-medium text-amber-900 mb-4">Recipe Profile Summary</h3>
                      
                      <div className="space-y-6 flex-grow">
                        <div className="bg-white rounded-md p-4 shadow-sm">
                          <h4 className="font-medium text-sm mb-2">Flavor Profile</h4>
                          <p className="text-sm text-gray-600">
                            {getFlavorDescription()}
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-md p-4 shadow-sm">
                          <h4 className="font-medium text-sm mb-2">Texture Characteristics</h4>
                          <p className="text-sm text-gray-600">
                            {flavorProfile.texturePreferences.crumb.openness > 0.6 ? 'Open' : 'Close'} crumb with 
                            {flavorProfile.texturePreferences.crust.texture === 'crisp' ? ' crisp' : ' soft'} crust.
                            {flavorProfile.texturePreferences.crust.earFormation && ' Dramatic scoring bloom.'}
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-md p-4 shadow-sm">
                          <h4 className="font-medium text-sm mb-2">Suggested Approach</h4>
                          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                            <li>Use {flavorProfile.constraints.starterType.replace("-", " ")} starter</li>
                            <li>{flavorProfile.constraints.timeAvailable} hour total process</li>
                            <li>
                              {flavorProfile.constraints.skillLevel < 0.4 
                                ? 'Simple, beginner-friendly method' 
                                : flavorProfile.constraints.skillLevel > 0.7
                                  ? 'Advanced techniques for optimal results'
                                  : 'Balanced approach with some technique'}
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <Button 
                          onClick={generateRecipe}
                          className="w-full py-6 bg-amber-600 hover:bg-amber-700 text-white text-lg"
                        >
                          Generate Custom Recipe
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-serif font-bold text-amber-900 mb-2">Custom Recipe Generation</h2>
              <p className="text-gray-600">Creating your personalized sourdough bread recipe based on your specifications.</p>
            </div>
            
            {generationStage === "analyzing" && (
              <div className="text-center space-y-6">
                <div className="relative h-2 w-full bg-amber-100 rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-amber-600 rounded-full animate-pulse" style={{ width: '30%' }}></div>
                </div>
                <p className="text-amber-800">Analyzing your flavor and texture preferences...</p>
              </div>
            )}
            
            {generationStage === "generating" && (
              <div className="text-center space-y-6">
                <div className="relative h-2 w-full bg-amber-100 rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-amber-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
                <p className="text-amber-800">Generating precise ingredient proportions and instructions...</p>
              </div>
            )}
            
            {generationStage === "complete" && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="inline-block p-3 bg-amber-100 rounded-full mb-4">
                    <div className="w-16 h-16 flex items-center justify-center text-amber-600 text-4xl">
                      🍞
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-amber-900">Your Custom Sourdough Recipe</h3>
                  <p className="text-gray-600 mt-1 mb-6">Perfectly tailored to your preferences</p>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-amber-50 rounded-lg p-6">
                    <h4 className="font-medium text-lg text-amber-900 mb-4">Ingredients</h4>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-amber-200">
                          <td className="py-2 font-medium">Bread Flour</td>
                          <td className="py-2 text-right">400g</td>
                          <td className="py-2 text-right text-gray-500">100%</td>
                        </tr>
                        <tr className="border-b border-amber-200">
                          <td className="py-2 font-medium">Whole Wheat Flour</td>
                          <td className="py-2 text-right">50g</td>
                          <td className="py-2 text-right text-gray-500">12.5%</td>
                        </tr>
                        <tr className="border-b border-amber-200">
                          <td className="py-2 font-medium">Water</td>
                          <td className="py-2 text-right">
                            {flavorProfile.texturePreferences.crumb.openness > 0.6 ? '330g' : '300g'}
                          </td>
                          <td className="py-2 text-right text-gray-500">
                            {flavorProfile.texturePreferences.crumb.openness > 0.6 ? '82.5%' : '75%'}
                          </td>
                        </tr>
                        <tr className="border-b border-amber-200">
                          <td className="py-2 font-medium">Sourdough Starter</td>
                          <td className="py-2 text-right">100g</td>
                          <td className="py-2 text-right text-gray-500">25%</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium">Salt</td>
                          <td className="py-2 text-right">9g</td>
                          <td className="py-2 text-right text-gray-500">2.2%</td>
                        </tr>
                        {flavorProfile.flavorNotes.some(note => note.family === 'nutty') && (
                          <tr className="border-t border-amber-200">
                            <td className="py-2 font-medium">Walnut Pieces</td>
                            <td className="py-2 text-right">80g</td>
                            <td className="py-2 text-right text-gray-500">20%</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-6">
                    <h4 className="font-medium text-lg text-amber-900 mb-4">Method</h4>
                    <ol className="space-y-6 text-sm">
                      <li className="flex">
                        <span className="flex-shrink-0 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center mr-3 mt-0.5 font-medium">1</span>
                        <div>
                          <p className="font-medium">Mix and Autolyse</p>
                          <p className="text-gray-600 mt-1">
                            Mix flour and water (reserve 50g water for later). Let rest for 
                            {flavorProfile.texturePreferences.crumb.openness > 0.7 ? ' 60' : ' 30'} minutes.
                          </p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="flex-shrink-0 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center mr-3 mt-0.5 font-medium">2</span>
                        <div>
                          <p className="font-medium">Add Starter and Salt</p>
                          <p className="text-gray-600 mt-1">
                            Add starter, salt, and reserved water. Mix thoroughly until well incorporated.
                          </p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="flex-shrink-0 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center mr-3 mt-0.5 font-medium">3</span>
                        <div>
                          <p className="font-medium">Bulk Fermentation</p>
                          <p className="text-gray-600 mt-1">
                            Let dough rise at room temperature for 
                            {flavorProfile.primaryDimensions.sourness > 75 ? ' 6-8' : 
                             flavorProfile.primaryDimensions.sourness > 50 ? ' 4-6' : ' 3-4'} hours, 
                            performing stretch and folds every 30 minutes for the first 
                            {flavorProfile.texturePreferences.crumb.irregularity > 0.6 ? ' 2 hours.' : ' 1.5 hours.'}
                          </p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="flex-shrink-0 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center mr-3 mt-0.5 font-medium">4</span>
                        <div>
                          <p className="font-medium">Pre-shape and Rest</p>
                          <p className="text-gray-600 mt-1">
                            Turn out dough, pre-shape lightly, and rest for 20 minutes.
                          </p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="flex-shrink-0 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center mr-3 mt-0.5 font-medium">5</span>
                        <div>
                          <p className="font-medium">Final Shaping</p>
                          <p className="text-gray-600 mt-1">
                            Shape into 
                            {flavorProfile.texturePreferences.crust.earFormation ? 
                              ' a tight boule for dramatic oven spring' : 
                              ' an oblong loaf or boule as preferred'}.
                            Place in 
                            {flavorProfile.constraints.equipment.includes('banneton') ? 
                              ' a floured banneton' : 
                              ' a floured bowl lined with a kitchen towel'}.
                          </p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="flex-shrink-0 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center mr-3 mt-0.5 font-medium">6</span>
                        <div>
                          <p className="font-medium">Final Proof</p>
                          <p className="text-gray-600 mt-1">
                            Refrigerate for 
                            {flavorProfile.constraints.timeAvailable > 24 ? 
                              ' 12-24 hours' : 
                              ' 8-12 hours'} for a slow, cool fermentation.
                          </p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="flex-shrink-0 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center mr-3 mt-0.5 font-medium">7</span>
                        <div>
                          <p className="font-medium">Preheat and Prepare</p>
                          <p className="text-gray-600 mt-1">
                            Preheat oven to 
                            {flavorProfile.texturePreferences.crust.thickness > 0.7 ? 
                              ' 475°F (245°C)' : 
                              ' 450°F (230°C)'} with 
                            {flavorProfile.constraints.equipment.includes('dutch oven') ? 
                              ' a Dutch oven inside.' : 
                              ' a baking stone or heavy baking sheet inside.'}
                          </p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="flex-shrink-0 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center mr-3 mt-0.5 font-medium">8</span>
                        <div>
                          <p className="font-medium">Score and Bake</p>
                          <p className="text-gray-600 mt-1">
                            Turn out dough, score 
                            {flavorProfile.texturePreferences.crust.earFormation ? 
                              ' boldly with a deep slash for ears.' : 
                              ' with a pattern of your choice.'} Bake 
                            {flavorProfile.constraints.equipment.includes('dutch oven') ? 
                              ' in Dutch oven with lid on for 25 minutes, then remove lid and bake for another 15-20 minutes.' : 
                              ' with steam for the first 15 minutes, then remove steam source and continue for 25-30 minutes.'}
                          </p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="flex-shrink-0 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center mr-3 mt-0.5 font-medium">9</span>
                        <div>
                          <p className="font-medium">Cool</p>
                          <p className="text-gray-600 mt-1">
                            Allow bread to cool completely (at least 2 hours) before slicing.
                          </p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-12">
                  <Button 
                    onClick={() => setShowGeneratedRecipe(false)}
                    className="flex-1 bg-white border border-amber-600 text-amber-800 hover:bg-amber-50"
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Save Recipe
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}