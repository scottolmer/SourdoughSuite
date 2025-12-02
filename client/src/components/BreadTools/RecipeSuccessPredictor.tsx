import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, User, Droplets, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, XCircle, FileText, LinkIcon, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function RecipeSuccessPredictor() {
  const [activeScreen, setActiveScreen] = useState<string>('entry');
  const [predictionResults, setPredictionResults] = useState<any>(null);
  const [recipeText, setRecipeText] = useState('');
  const [recipeUrl, setRecipeUrl] = useState('');
  const [skillLevel, setSkillLevel] = useState<string>('');
  const [bakingFrequency, setBakingFrequency] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('');
  const { toast } = useToast();

  // Recipe success prediction mutation
  const predictSuccessMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/predict-recipe-success', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  });

  const handleFreeTextSubmit = () => {
    if (!recipeText) {
      toast({
        title: "Recipe text required",
        description: "Please enter your recipe text.",
        variant: "destructive"
      });
      return;
    }

    if (!skillLevel) {
      toast({
        title: "Skill level required",
        description: "Please select your skill level for accurate prediction.",
        variant: "destructive"
      });
      return;
    }

    predictSuccessMutation.mutate({
      recipeText,
      skillLevel,
      bakingFrequency: bakingFrequency || 'weekly',
      environment: environment || 'home'
    }, {
      onSuccess: (data) => {
        setPredictionResults(data);
        setActiveScreen('results');
      },
      onError: () => {
        toast({
          title: "Prediction failed",
          description: "There was an error analyzing your recipe. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const handleUrlSubmit = () => {
    if (!recipeUrl) {
      toast({
        title: "URL required",
        description: "Please enter a URL to import the recipe from.",
        variant: "destructive"
      });
      return;
    }

    if (!skillLevel) {
      toast({
        title: "Skill level required",
        description: "Please select your skill level for accurate prediction.",
        variant: "destructive"
      });
      return;
    }

    // First scrape the recipe from the URL
    predictSuccessMutation.mutate({
      url: recipeUrl,
      skillLevel,
      bakingFrequency: bakingFrequency || 'weekly',
      environment: environment || 'home'
    }, {
      onSuccess: (data) => {
        setPredictionResults(data);
        setActiveScreen('results');
      },
      onError: () => {
        toast({
          title: "URL Import Failed",
          description: "Unable to extract recipe from this URL. Please try entering the recipe text manually.",
          variant: "destructive"
        });
      }
    });
  };

  const handleImageSubmit = () => {
    toast({
      title: "Feature in development", 
      description: "Image upload functionality is coming soon!",
    });
  };

  const getSuccessColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-50";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getSuccessIcon = (percentage: number) => {
    if (percentage >= 80) return CheckCircle;
    if (percentage >= 60) return AlertTriangle;
    return XCircle;
  };

  const renderEntryScreen = () => (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Recipe Success Predictor</h1>
        </div>
        <p className="text-gray-600">
          Get a realistic assessment of recipe difficulty based on hydration levels and your skill level. 
          Know what you're getting into before you start baking.
        </p>
      </div>

      {/* Skill Level Selection - Required for all methods */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-blue-600" />
            Your Baking Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="skill-level" className="text-sm font-medium mb-2 block">
              Skill Level (Required)
            </Label>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select your skill level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner - New to sourdough, basic techniques</SelectItem>
                <SelectItem value="intermediate">Intermediate - Some experience, comfortable with timing</SelectItem>
                <SelectItem value="advanced">Advanced - Experienced, handle complex recipes</SelectItem>
                <SelectItem value="expert">Expert - Professional level, master all techniques</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="baking-frequency" className="text-sm font-medium mb-2 block">
                How often do you bake? (Optional)
              </Label>
              <Select value={bakingFrequency} onValueChange={setBakingFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="occasionally">Occasionally</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="environment" className="text-sm font-medium mb-2 block">
                Baking Environment (Optional)
              </Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home Kitchen</SelectItem>
                  <SelectItem value="professional">Professional Kitchen</SelectItem>
                  <SelectItem value="teaching">Teaching/Demo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">What We Analyze</h3>
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="border border-gray-200 p-4 rounded flex items-start gap-3">
              <Droplets className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium mb-2">Hydration Complexity</h4>
                <p className="text-sm text-gray-600">
                  High hydration doughs (75%+) are challenging and require advanced handling skills.
                </p>
              </div>
            </div>
            <div className="border border-gray-200 p-4 rounded flex items-start gap-3">
              <User className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-medium mb-2">Your Skill Level</h4>
                <p className="text-sm text-gray-600">
                  Matches recipe complexity to your experience for realistic success prediction.
                </p>
              </div>
            </div>
            <div className="border border-gray-200 p-4 rounded flex items-start gap-3">
              <Target className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <h4 className="font-medium mb-2">Success Probability</h4>
                <p className="text-sm text-gray-600">
                  Get a realistic percentage chance of success before you start.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-6 border border-gray-100">
          <h3 className="text-lg font-medium mb-4">Input Methods</h3>
          <div className="space-y-4">
            <Button
              className="w-full justify-start text-left bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-normal py-3"
              onClick={() => setActiveScreen('free-text')}
              disabled={!skillLevel}
            >
              <FileText className="mr-3 h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Free-Text Recipe Entry</div>
                <div className="text-sm text-gray-500">Paste your complete recipe</div>
              </div>
            </Button>
            <Button
              className="w-full justify-start text-left bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-normal py-3"
              onClick={() => setActiveScreen('url')}
              disabled={!skillLevel}
            >
              <LinkIcon className="mr-3 h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Import from URL</div>
                <div className="text-sm text-gray-500">Automatically extract recipe from website</div>
              </div>
            </Button>
            <Button
              className="w-full justify-start text-left bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-normal py-3"
              onClick={() => setActiveScreen('image')}
              disabled={!skillLevel}
            >
              <Upload className="mr-3 h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Upload Recipe Image</div>
                <div className="text-sm text-gray-500">Coming soon</div>
              </div>
            </Button>
          </div>
          {!skillLevel && (
            <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded text-sm text-blue-700">
              Please select your skill level above to enable recipe analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFreeTextForm = () => (
    <div>
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center text-gray-600"
        onClick={() => setActiveScreen('entry')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to input methods
      </Button>
      
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Target className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold">Recipe Success Prediction</h2>
        </div>

        <Card className="mb-4 bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="text-sm text-blue-700">
              <strong>Your Profile:</strong> {skillLevel?.charAt(0).toUpperCase() + skillLevel?.slice(1)} baker
              {bakingFrequency && ` • Bakes ${bakingFrequency}`}
              {environment && ` • ${environment.charAt(0).toUpperCase() + environment.slice(1)} kitchen`}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="recipe-text">Recipe Text</Label>
            <Textarea 
              id="recipe-text"
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
              placeholder="Paste your complete recipe here (ingredients and instructions)..."
              rows={12}
            />
          </div>
          
          <Button 
            onClick={handleFreeTextSubmit}
            disabled={predictSuccessMutation.isPending}
            className="w-full"
          >
            {predictSuccessMutation.isPending ? 'Analyzing Recipe...' : 'Predict Success'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderUrlForm = () => (
    <div>
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center text-gray-600"
        onClick={() => setActiveScreen('entry')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to input methods
      </Button>
      
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <LinkIcon className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold">Import Recipe from URL</h2>
        </div>

        <Card className="mb-4 bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="text-sm text-blue-700">
              <strong>Your Profile:</strong> {skillLevel?.charAt(0).toUpperCase() + skillLevel?.slice(1)} baker
              {bakingFrequency && ` • Bakes ${bakingFrequency}`}
              {environment && ` • ${environment.charAt(0).toUpperCase() + environment.slice(1)} kitchen`}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="recipe-url">Recipe URL</Label>
            <Input 
              id="recipe-url"
              value={recipeUrl}
              onChange={(e) => setRecipeUrl(e.target.value)}
              placeholder="https://www.kingarthurbaking.com/recipes/classic-sourdough..."
            />
            <p className="text-sm text-gray-500 mt-2">
              Enter any recipe URL - we'll automatically extract ingredients and instructions
            </p>
          </div>
          
          <Button 
            onClick={handleUrlSubmit}
            disabled={predictSuccessMutation.isPending}
            className="w-full"
          >
            {predictSuccessMutation.isPending ? 'Extracting Recipe...' : 'Import & Predict Success'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderImageUpload = () => (
    <div>
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center text-gray-600"
        onClick={() => setActiveScreen('entry')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to input methods
      </Button>
      
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold mb-6">Upload Recipe Image</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Coming soon: Upload an image of your recipe</p>
          <Button onClick={handleImageSubmit}>
            Choose File
          </Button>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!predictionResults) return null;

    const successPercentage = predictionResults.successProbability || 75;
    const SuccessIcon = getSuccessIcon(successPercentage);
    const colorClass = getSuccessColor(successPercentage);

    return (
      <div>
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center text-gray-600"
          onClick={() => setActiveScreen('entry')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Analyze another recipe
        </Button>
        
        <div className="max-w-2xl space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Target className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold">Success Prediction</h2>
            </div>
          </div>

          {/* Success Probability Card */}
          <Card className={`border-2 ${successPercentage >= 80 ? 'border-green-200 bg-green-50' : successPercentage >= 60 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <SuccessIcon className={`h-12 w-12 ${successPercentage >= 80 ? 'text-green-600' : successPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`} />
                <div>
                  <div className={`text-4xl font-bold ${successPercentage >= 80 ? 'text-green-700' : successPercentage >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>
                    {successPercentage}%
                  </div>
                  <div className="text-sm text-gray-600">Success Probability</div>
                </div>
              </div>
              
              <Progress value={successPercentage} className="mb-4" />
              
              <div className="text-sm text-gray-700">
                Based on hydration level and your {skillLevel} baking experience
              </div>
            </CardContent>
          </Card>

          {/* Analysis Details */}
          <Card>
            <CardHeader>
              <CardTitle>Recipe Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictionResults && predictionResults.analysis && typeof predictionResults.analysis === 'object' ? (
                  <div className="space-y-4">
                    {predictionResults.analysis.hydration ? (
                      <div className="border-b border-gray-100 pb-3">
                        <h4 className="font-semibold text-base text-gray-900 mb-2">🌊 Hydration Assessment</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{predictionResults.analysis.hydration}</p>
                      </div>
                    ) : null}
                    
                    {predictionResults.analysis.fermentationApproach ? (
                      <div className="border-b border-gray-100 pb-3">
                        <h4 className="font-semibold text-base text-gray-900 mb-2">🦠 Fermentation Approach</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{predictionResults.analysis.fermentationApproach}</p>
                      </div>
                    ) : null}
                    
                    {predictionResults.analysis.technique ? (
                      <div className="border-b border-gray-100 pb-3">
                        <h4 className="font-semibold text-base text-gray-900 mb-2">👋 Technique Analysis</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{predictionResults.analysis.technique}</p>
                      </div>
                    ) : null}
                    
                    {predictionResults.analysis.overallAssessment ? (
                      <div>
                        <h4 className="font-semibold text-base text-gray-900 mb-2">📊 Overall Assessment</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{predictionResults.analysis.overallAssessment}</p>
                      </div>
                    ) : null}
                  </div>
                ) : predictionResults ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">Analysis data received but in unexpected format. Check console for details.</p>
                    <pre className="text-xs mt-2 text-yellow-700 overflow-hidden">{JSON.stringify(predictionResults.analysis, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Complete a recipe prediction to see detailed analysis</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors */}
          {predictionResults.riskFactors && predictionResults.riskFactors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Challenge Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {predictionResults.riskFactors.map((risk: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold mt-1">•</span>
                      <span className="text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Success Tips */}
          {predictionResults.tips && predictionResults.tips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Success Tips for Your Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {predictionResults.tips.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">•</span>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recipe Details */}
          {predictionResults.extractedRecipe && (
            <Card>
              <CardHeader>
                <CardTitle>Extracted Recipe Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {predictionResults.extractedRecipe.ingredients && predictionResults.extractedRecipe.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Ingredients ({predictionResults.extractedRecipe.ingredients.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {predictionResults.extractedRecipe.ingredients.map((ingredient: any, index: number) => (
                        <div key={index} className="flex justify-between bg-gray-50 p-2 rounded">
                          <span className="font-medium">{ingredient.name}</span>
                          <span className="text-gray-600">{ingredient.amount} {ingredient.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {predictionResults.extractedRecipe.instructions && predictionResults.extractedRecipe.instructions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Instructions</h4>
                    <ol className="space-y-2 text-sm">
                      {predictionResults.extractedRecipe.instructions.map((instruction: string, index: number) => (
                        <li key={index} className="flex gap-3">
                          <span className="font-medium text-blue-600 min-w-[20px]">{index + 1}.</span>
                          <span className="text-gray-700">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Scraped Recipe Details (for URL imports) */}
          {predictionResults.scrapedRecipe && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-blue-600" />
                  Imported Recipe: {predictionResults.scrapedRecipe.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {predictionResults.scrapedRecipe.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Ingredients</h4>
                    <ul className="space-y-1 text-sm">
                      {predictionResults.scrapedRecipe.ingredients.slice(0, 5).map((ingredient: string, index: number) => (
                        <li key={index} className="text-gray-700">• {ingredient}</li>
                      ))}
                      {predictionResults.scrapedRecipe.ingredients.length > 5 && (
                        <li className="text-gray-500">... and {predictionResults.scrapedRecipe.ingredients.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Source: {predictionResults.scrapedRecipe.source}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {activeScreen === 'entry' && renderEntryScreen()}
      {activeScreen === 'free-text' && renderFreeTextForm()}
      {activeScreen === 'url' && renderUrlForm()}
      {activeScreen === 'image' && renderImageUpload()}
      {activeScreen === 'results' && renderResults()}
    </div>
  );
}