import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, Loader2, Save } from "lucide-react";

// Define types for our AI settings
interface AIModel {
  id: string;
  name: string;
  endpoint: string; // API endpoint
  isDefault: boolean;
}

interface AIPromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  usage: string; // recipe-analysis, recipe-generator, content-generator
}

interface SEOOptions {
  makePublic: boolean;
  addSeoTags: boolean;
  addDefaultImage: boolean;
}

interface AISettings {
  models: AIModel[];
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  useCache: boolean;
  autoSaveGeneratedRecipes: boolean;
  seoOptions?: SEOOptions;
  prompts: AIPromptTemplate[];
}

// Default settings if none are saved
const defaultSettings: AISettings = {
  models: [
    {
      id: "gemini-2.0-flash",
      name: "Google Gemini 2.0 Flash",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      isDefault: true
    },
    {
      id: "gemini-2.0-pro",
      name: "Google Gemini 2.0 Pro",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent",
      isDefault: false
    },
    {
      id: "gpt-4o",
      name: "OpenAI GPT-4o",
      endpoint: "https://api.openai.com/v1/chat/completions",
      isDefault: false
    },
    {
      id: "gpt-3.5-turbo-0125",
      name: "OpenAI GPT-3.5-turbo-0125",
      endpoint: "https://api.openai.com/v1/chat/completions",
      isDefault: false
    },
    {
      id: "claude-3-7-sonnet-20250219",
      name: "Claude 3.7 Sonnet",
      endpoint: "https://nano-gpt.com/api/v1/chat/completions",
      isDefault: false
    }
  ],
  defaultModel: "gemini-2.0-flash",
  temperature: 0.7,
  maxTokens: 4000,
  useCache: true,
  autoSaveGeneratedRecipes: true,
  seoOptions: {
    makePublic: true,
    addSeoTags: true,
    addDefaultImage: true
  },
  prompts: [
    {
      id: "recipe-analysis",
      name: "Recipe Analysis",
      description: "Prompt template used for analyzing sourdough bread recipes",
      usage: "recipe-analysis",
      template: "Analyze this sourdough bread recipe in detail. Provide insights on:\n\n1. Hydration level assessment\n2. Fermentation approach\n3. Unique techniques\n4. Flavor profile prediction\n5. Difficulty level\n6. Suggestions for improvement\n\nRecipe details:\n{{recipe}}"
    },
    {
      id: "recipe-generator",
      name: "Recipe Generator",
      description: "Prompt template used for generating recipes based on user preferences",
      usage: "recipe-generator",
      template: "Create a detailed sourdough bread recipe with the following characteristics:\n\n{{preferences}}\n\nInclude sections for ingredients (with exact measurements in grams), step-by-step instructions, and baker's notes with professional tips."
    },

    {
      id: "starter-quiz",
      name: "Starter Quiz Recommendation",
      description: "Prompt template used for recommending sourdough starters based on quiz answers",
      usage: "starter-quiz",
      template: "You are a sourdough starter expert helping customers find their perfect starter culture match.\n\nBased on these user preferences and available starter options, recommend the best matching sourdough starter:\n\n{{quizData}}\n\nAnalyze their preferences for flavor, baking frequency, experience level, and environment to find the best match.\n\nReturn your recommendation in this JSON format:\n{\n  \"primaryMatch\": \"starter-id-from-availableStarters\",\n  \"matchScore\": number from 85-98 representing confidence in the match,\n  \"secondaryMatches\": [\"array-of-2-other-starter-ids-that-are-good-matches\"],\n  \"rationale\": {\n    \"flavor\": number from 70-95 representing flavor match score,\n    \"maintenance\": number from 70-95 representing maintenance match score,\n    \"style\": number from 70-95 representing bread style match score,\n    \"experience\": number from 70-95 representing experience level match score\n  }\n}"
    },
    {
      id: "ingredient-substitution",
      name: "Ingredient Substitution",
      description: "Prompt template used for suggesting ingredient substitutions in sourdough recipes",
      usage: "ingredient-substitution",
      template: "You are an expert sourdough baker specializing in ingredient substitutions and recipe adaptations. Help bakers find suitable alternatives for ingredients they don't have or can't use.\n\nAnalyze this substitution request:\n\n{{substitutionRequest}}\n\nProvide practical, tested substitution suggestions that maintain the integrity of the sourdough recipe. Consider hydration levels, fermentation impact, flavor changes, and texture modifications.\n\nReturn your recommendations in this JSON format:\n{\n  \"primarySubstitutions\": [\n    {\n      \"original\": \"ingredient being replaced\",\n      \"substitute\": \"recommended replacement\",\n      \"ratio\": \"1:1 or specific conversion ratio\",\n      \"adjustments\": \"any other recipe modifications needed\",\n      \"impact\": \"how this affects flavor, texture, or process\"\n    }\n  ],\n  \"alternativeOptions\": [\n    {\n      \"substitute\": \"alternative replacement option\",\n      \"ratio\": \"conversion ratio\",\n      \"notes\": \"when to use this option\"\n    }\n  ],\n  \"warnings\": [\"important considerations or limitations\"],\n  \"tips\": [\"professional tips for best results with substitutions\"]\n}"
    },
    {
      id: "baking-troubleshooter",
      name: "Baking Troubleshooter",
      description: "Prompt template used for diagnosing and solving sourdough baking problems",
      usage: "baking-troubleshooter",
      template: "You are an expert sourdough troubleshooter with decades of professional baking experience. Help diagnose and solve sourdough baking problems with practical, actionable solutions.\n\nAnalyze this baking issue:\n\n{{problemDescription}}\n\nProvide a comprehensive diagnosis and step-by-step solutions. Consider all factors: starter health, fermentation, environmental conditions, technique, timing, and ingredients.\n\nReturn your diagnosis in this JSON format:\n{\n  \"diagnosis\": {\n    \"primaryCause\": \"most likely cause of the problem\",\n    \"contributingFactors\": [\"other factors that may be involved\"],\n    \"severity\": \"minor|moderate|major\"\n  },\n  \"solutions\": {\n    \"immediate\": [\"steps to fix current batch if possible\"],\n    \"nextBake\": [\"adjustments for the next baking session\"],\n    \"longTerm\": [\"process improvements for consistent results\"]\n  },\n  \"prevention\": [\"how to avoid this problem in the future\"],\n  \"commonMistakes\": [\"related mistakes that often cause this issue\"],\n  \"expertTips\": [\"professional techniques to improve results\"],\n  \"additionalQuestions\": [\"questions to ask for more specific diagnosis if needed\"]\n}"
    },
    {
      id: "general-chat",
      name: "General Chat Bot",
      description: "Prompt template used for the general AI bread assistant chat bot",
      usage: "general-chat",
      template: "You are an expert sourdough bread assistant for Bakehouse Breads, a premium artisan bakery specializing in sourdough starters and bread recipes. You have deep knowledge of:\n\n- Sourdough starter cultivation and maintenance\n- Bread baking techniques and troubleshooting\n- Ingredient science and substitutions\n- Fermentation processes and timing\n- Traditional and modern baking methods\n\nProvide helpful, accurate, and encouraging responses to any bread-related questions. Always maintain a friendly, professional tone and offer practical advice based on proven baking science.\n\nUser Question: {{userMessage}}\n\nRespond naturally and conversationally, sharing your expertise to help the user succeed in their bread baking journey."
    }
  ]
};

// Sample data for previewing templates
const sampleData = {
  'recipe-analysis': {
    recipe: `Ingredients:
- 500g bread flour
- 350g water
- 100g active sourdough starter
- 10g salt

Instructions:
1. Mix flour and water, let rest for 30 minutes (autolyse)
2. Add starter and salt, mix thoroughly
3. Perform 3-4 stretch and folds over 2 hours
4. Bulk fermentation at room temperature for 4-6 hours
5. Shape and place in banneton
6. Cold proof in refrigerator for 12-14 hours
7. Bake at 500°F in a Dutch oven for 20 minutes with lid on, 20 minutes with lid off`
  },
  'recipe-generator': {
    preferences: `Flavor Profile: 
- Mild sourness
- Light nuttiness
- Hint of sweetness

Texture Goals:
- Open, irregular crumb
- Crispy crust
- Medium hydration (70-75%)

Experience Level: Intermediate
Timeframe: Willing to do a 24-hour process
Special Requirements: Include whole wheat and seeds`
  },
  'content-generator': {
    topic: 'The science behind sourdough fermentation and how temperature affects flavor development'
  },
  'starter-quiz': {
    quizData: `User Preferences:
- Flavor: Prefers tangier, more sour flavors
- Baking Frequency: 1-2 times per week
- Experience Level: Intermediate
- Climate: Warm, humid environment (Florida)
- Schedule: Busy professional, limited time for maintenance
- Bread Style: Desires open crumb, artisan-style loaves

Available Starters:
[
  {
    "id": "sf-sourdough",
    "name": "San Francisco Sourdough",
    "flavor": "Very tangy, classic sour flavor",
    "maintenance": "Medium, feeds once daily at room temp, weekly if refrigerated",
    "bestFor": "Traditional sourdough loaves, requires some experience"
  },
  {
    "id": "italian-starter",
    "name": "Ischia Italian",
    "flavor": "Mild, sweet with fruity notes",
    "maintenance": "Low, very forgiving, feeds every 1-2 days or weekly if refrigerated",
    "bestFor": "Focaccia, pizza, enriched doughs, good for beginners"
  },
  {
    "id": "rye-starter",
    "name": "Russian Rye Starter",
    "flavor": "Intensely sour, earthy, complex",
    "maintenance": "High, needs consistent care and feeding schedule",
    "bestFor": "Dense rye breads, experienced bakers, traditional European dark breads"
  }
]`
  },
  'general-chat': {
    userMessage: 'My sourdough starter smells like vinegar - is this normal? What should I do?'
  }
};

export default function AISettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string>("recipe-analysis");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState({
    template: '',
    variables: '',
    preview: ''
  });

  // Load settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiRequest('/api/ai/settings');
        if (response) {
          setSettings(response);
        }
      } catch (error) {
        console.error("Failed to load AI settings:", error);
        toast({
          title: "Failed to load settings",
          description: "Using default AI settings instead",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  // Handle updating a prompt template
  const handlePromptChange = (promptId: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      prompts: prev.prompts.map(prompt => 
        prompt.id === promptId ? { ...prompt, template: value } : prompt
      )
    }));
  };

  // Handle temperature changes
  const handleTemperatureChange = (value: number[]) => {
    setSettings(prev => ({
      ...prev,
      temperature: value[0]
    }));
  };
  
  // Handle max tokens changes
  const handleMaxTokensChange = (value: number[]) => {
    setSettings(prev => ({
      ...prev,
      maxTokens: value[0]
    }));
  };

  // Handle cache toggle
  const handleCacheToggle = (checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      useCache: checked
    }));
  };

  // Handle auto-save toggle
  const handleAutoSaveToggle = (checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      autoSaveGeneratedRecipes: checked
    }));
  };

  // Handle SEO options changes
  const handleSeoOptionChange = (option: keyof SEOOptions, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      seoOptions: {
        ...(prev.seoOptions || {
          makePublic: true,
          addSeoTags: true,
          addDefaultImage: true
        }),
        [option]: checked
      }
    }));
  };

  // Handle default model change
  const handleDefaultModelChange = (modelId: string) => {
    setSettings(prev => ({
      ...prev,
      defaultModel: modelId,
      models: prev.models.map(model => ({
        ...model,
        isDefault: model.id === modelId
      }))
    }));
  };
  
  // Function to open preview modal
  const handlePreviewPrompt = (promptId: string) => {
    const promptTemplate = settings.prompts.find(p => p.id === promptId);
    if (!promptTemplate) return;
    
    // Get the sample data for this prompt type
    const sampleVariables = sampleData[promptId as keyof typeof sampleData];
    if (!sampleVariables) return;
    
    // Create a formatted representation of the sample variables
    const variablesString = Object.entries(sampleVariables)
      .map(([key, value]) => `{{${key}}}:\n${value}`)
      .join('\n\n');
    
    // Create the preview by replacing variables
    let previewText = promptTemplate.template;
    Object.entries(sampleVariables).forEach(([key, value]) => {
      previewText = previewText.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
    });
    
    setPreviewContent({
      template: promptTemplate.template,
      variables: variablesString,
      preview: previewText
    });
    
    setPreviewOpen(true);
  };

  // Save settings
  const saveSettings = async () => {
    setSaving(true);
    try {
      await apiRequest('/api/ai/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
      
      toast({
        title: "Settings saved",
        description: "Your AI settings have been updated",
      });
    } catch (error) {
      console.error("Failed to save AI settings:", error);
      toast({
        title: "Failed to save settings",
        description: "An error occurred while saving your settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading AI settings...</span>
      </div>
    );
  }

  const activePromptTemplate = settings.prompts.find(p => p.id === activePrompt);

  return (
    <div className="space-y-6 max-w-5xl mx-auto admin-content overflow-hidden">
      <Card>
        <CardHeader>
          <CardTitle>AI Model Settings</CardTitle>
          <CardDescription>
            Configure the AI models and parameters used throughout the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Default Model</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.models.map((model) => (
                <div 
                  key={model.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    model.id === settings.defaultModel 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleDefaultModelChange(model.id)}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{model.name}</h4>
                    {model.id === settings.defaultModel && (
                      <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Default</div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Model ID: {model.id}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Temperature Control */}
          <div className="space-y-4">
            <div>
              <Label className="text-base">Temperature: {settings.temperature.toFixed(2)}</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Controls creativity and randomness. Lower values produce more consistent, deterministic responses.
              </p>
              <Slider 
                value={[settings.temperature]} 
                min={0} 
                max={1} 
                step={0.01}
                onValueChange={handleTemperatureChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Precise (0.0)</span>
                <span>Balanced (0.5)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-4">
            <div>
              <Label className="text-base">Max Tokens: {settings.maxTokens}</Label>
              <p className="text-sm text-muted-foreground mb-2">
                The maximum length of the response to generate. Higher values may be needed for longer outputs.
              </p>
              <Slider 
                value={[settings.maxTokens]} 
                min={500} 
                max={8000} 
                step={100}
                onValueChange={handleMaxTokensChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>500</span>
                <span>4000</span>
                <span>8000</span>
              </div>
            </div>
          </div>

          {/* Response Caching */}
          <div className="flex items-center space-x-2">
            <Switch 
              id="cache-toggle" 
              checked={settings.useCache}
              onCheckedChange={handleCacheToggle}
            />
            <div>
              <Label htmlFor="cache-toggle" className="text-base">Enable Response Caching</Label>
              <p className="text-sm text-muted-foreground">
                Cache AI responses to improve performance and reduce API costs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* SEO and Auto-Save Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Recipe Database Settings</CardTitle>
          <CardDescription>
            Configure how AI-generated recipes are stored and indexed for SEO
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-save toggle */}
          <div className="flex items-center space-x-2">
            <Switch 
              id="auto-save-toggle" 
              checked={settings.autoSaveGeneratedRecipes}
              onCheckedChange={handleAutoSaveToggle}
            />
            <div>
              <Label htmlFor="auto-save-toggle" className="text-base">Automatically Save AI Recipes</Label>
              <p className="text-sm text-muted-foreground">
                Save all AI-generated recipes to the database for SEO and content building
              </p>
            </div>
          </div>
          
          {/* SEO Options */}
          <div className="space-y-3 pl-6 mt-2">
            <h3 className="text-sm font-medium text-muted-foreground">SEO Options</h3>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="make-public-toggle" 
                checked={settings.seoOptions?.makePublic}
                onCheckedChange={(checked) => handleSeoOptionChange('makePublic', checked)}
                disabled={!settings.autoSaveGeneratedRecipes}
              />
              <div>
                <Label htmlFor="make-public-toggle" className={!settings.autoSaveGeneratedRecipes ? "text-muted-foreground" : ""}>Make Recipes Public</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically publish AI-generated recipes to grow your recipe database
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="add-tags-toggle" 
                checked={settings.seoOptions?.addSeoTags}
                onCheckedChange={(checked) => handleSeoOptionChange('addSeoTags', checked)}
                disabled={!settings.autoSaveGeneratedRecipes}
              />
              <div>
                <Label htmlFor="add-tags-toggle" className={!settings.autoSaveGeneratedRecipes ? "text-muted-foreground" : ""}>Add SEO Tags</Label>
                <p className="text-xs text-muted-foreground">
                  Add optimized tags to recipes for better search engine visibility
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="add-image-toggle" 
                checked={settings.seoOptions?.addDefaultImage}
                onCheckedChange={(checked) => handleSeoOptionChange('addDefaultImage', checked)}
                disabled={!settings.autoSaveGeneratedRecipes}
              />
              <div>
                <Label htmlFor="add-image-toggle" className={!settings.autoSaveGeneratedRecipes ? "text-muted-foreground" : ""}>Add Default Images</Label>
                <p className="text-xs text-muted-foreground">
                  Add default recipe images to improve recipe display in search results
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Templates */}
      <Card>
        <CardHeader>
          <CardTitle>AI Prompt Templates</CardTitle>
          <CardDescription>
            Configure the prompts used for different AI-powered features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recipe-analysis" onValueChange={setActivePrompt}>
            <div className="w-full pb-2">
              <TabsList className="mb-4 grid grid-cols-3 md:grid-cols-5 gap-1 w-full h-auto">
                {settings.prompts.map(prompt => (
                  <TabsTrigger 
                    key={prompt.id} 
                    value={prompt.id} 
                    className="px-2 py-1 text-xs"
                  >
                    {prompt.id === 'recipe-generator' ? 'Recipe Gen' :
                     prompt.id === 'recipe-analysis' ? 'Analysis' :
                     prompt.id === 'starter-quiz' ? 'Quiz' :
                     prompt.id === 'ingredient-substitution' ? 'Substitution' :
                     prompt.id === 'baking-troubleshooter' ? 'Troubleshoot' : prompt.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {settings.prompts.map(prompt => (
              <TabsContent key={prompt.id} value={prompt.id}>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Label className="text-base">{prompt.name}</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        {prompt.description}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePreviewPrompt(prompt.id)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                  <div>
                    <Label htmlFor={`prompt-template-${prompt.id}`}>Prompt Template</Label>
                    <Textarea
                      id={`prompt-template-${prompt.id}`}
                      value={prompt.template}
                      onChange={(e) => handlePromptChange(prompt.id, e.target.value)}
                      className="font-mono text-sm"
                      rows={10}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Variables like {'{'}{'{'}'recipe'{'}'}{'}'}, {'{'}{'{'}'preferences'{'}'}{'}'}, or {'{'}{'{'}'topic'{'}'}{'}'}  will be replaced with actual content
                    </p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
      
      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Prompt Template Preview</DialogTitle>
            <DialogDescription>
              Preview how your template will look with sample data
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-2">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">Template with Variables</h3>
                <div className="mt-1 p-2 rounded-md bg-muted overflow-auto max-h-[150px]">
                  <pre className="text-[11px] whitespace-pre-wrap font-mono break-words">{previewContent.template}</pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Sample Variables</h3>
                <div className="mt-1 p-2 rounded-md bg-muted overflow-auto max-h-[150px]">
                  <pre className="text-[11px] whitespace-pre-wrap font-mono break-words">{previewContent.variables}</pre>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Preview Result</h3>
              <div className="mt-1 p-2 rounded-md border border-border overflow-auto max-h-[250px]">
                <pre className="text-[11px] whitespace-pre-wrap font-mono break-words">{previewContent.preview}</pre>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}