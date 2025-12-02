import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RecipeImport() {
  const [jsonContent, setJsonContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success?: number;
    errors?: string[];
    status?: 'success' | 'error';
  }>({});
  const { toast } = useToast();
  
  // Example data for download
  const exampleJson = {
    "sourdough_recipes": [
      {
        "name": "Example Country Bread",
        "author": "Chad Robertson",
        "description": "A classic sourdough country loaf with open crumb structure.",
        "ingredients": [
          {"name": "Bread flour", "amount": 800, "unit": "g"},
          {"name": "Whole wheat flour", "amount": 200, "unit": "g"},
          {"name": "Water", "amount": 750, "unit": "g"},
          {"name": "Salt", "amount": 20, "unit": "g"},
          {"name": "Mature sourdough starter", "amount": 150, "unit": "g"}
        ],
        "hydration": 75,
        "instructions": [
          "Mix flours and water, let rest for 30 minutes.",
          "Add starter and salt, mix thoroughly.",
          "Perform 4-6 sets of stretch and folds over 3-4 hours.",
          "Pre-shape and rest for 20 minutes.",
          "Final shape and place in banneton.",
          "Cold proof overnight (12-16 hours).",
          "Bake in preheated Dutch oven at 450°F."
        ]
      }
    ]
  };
  
  // Function to download example JSON
  const downloadExampleJson = () => {
    try {
      // Create data string
      const jsonString = JSON.stringify(exampleJson, null, 2);
      
      // Create blob
      const blob = new Blob([jsonString], {type: 'application/json'});
      
      // Create URL
      const url = URL.createObjectURL(blob);
      
      // Create temporary link
      const link = document.createElement('a');
      link.href = url;
      link.download = "example-tartine-recipes.json";
      
      // Append, click, and clean up
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Example file downloaded",
        description: "Check your downloads folder for example-tartine-recipes.json"
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "Could not generate example file",
        variant: "destructive"
      });
    }
  };

  const handleImport = async () => {
    if (!jsonContent.trim()) {
      toast({
        title: 'Missing content',
        description: 'Please provide valid JSON recipe data',
        variant: 'destructive'
      });
      return;
    }

    setIsImporting(true);
    setImportResult({});

    try {
      // Parse the JSON content to validate
      const parsedData = JSON.parse(jsonContent);
      
      // Check if the data has sourdough_recipes array
      if (!parsedData.sourdough_recipes || !Array.isArray(parsedData.sourdough_recipes)) {
        throw new Error('Invalid data format. Expected "sourdough_recipes" array.');
      }
      
      // Send recipes to API
      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipes: parsedData.sourdough_recipes }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import recipes');
      }
      
      const result = await response.json();
      
      setImportResult({
        success: result.success,
        errors: result.errors,
        status: 'success'
      });
      
      toast({
        title: 'Import successful',
        description: `Successfully imported ${result.success} recipes`,
      });
    } catch (error) {
      console.error('Error importing recipes:', error);
      setImportResult({
        errors: [error instanceof Error ? error.message : String(error)],
        status: 'error'
      });
      
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import recipes',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Simplified JSON example placeholder
  const placeholderText = `{
  "sourdough_recipes": [
    {
      "name": "Recipe Name",
      "author": "Author",
      "description": "Description",
      "ingredients": [
        {"name": "Flour", "amount": 800, "unit": "g"}
      ],
      "hydration": 75,
      "instructions": ["Mix", "Fold", "Bake"]
    }
  ]
}`;

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-serif">Recipe Import</CardTitle>
        <CardDescription>
          Import sourdough recipes in JSON format. The data should contain a "sourdough_recipes" array.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="overflow-hidden">
        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap justify-between items-end mb-1">
              <label htmlFor="json-content" className="block text-sm font-medium mb-1">
                Paste JSON Recipe Data
              </label>
              <button 
                type="button"
                className="text-sm text-amber-600 hover:text-amber-800 flex items-center gap-1"
                onClick={downloadExampleJson}
              >
                <Download className="h-4 w-4 mr-1" />
                Download Example JSON
              </button>
            </div>
            <div className="border rounded-md overflow-hidden">
              <Textarea
                id="json-content"
                value={jsonContent}
                onChange={(e) => setJsonContent(e.target.value)}
                className="h-64 font-mono text-sm w-full border-none"
                style={{ 
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  maxWidth: '100%',
                  overflowWrap: 'break-word'
                }}
                placeholder={placeholderText}
              />
            </div>
          </div>
          
          {importResult.status === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Import Successful</AlertTitle>
              <AlertDescription className="text-green-700">
                Successfully imported {importResult.success} recipes.
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p>Some recipes had errors:</p>
                    <ul className="list-disc list-inside text-sm">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {importResult.status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Import Failed</AlertTitle>
              <AlertDescription>
                {importResult.errors && importResult.errors.length > 0 ? (
                  <div>
                    <p>The following errors occurred:</p>
                    <ul className="list-disc list-inside text-sm">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  'Failed to import recipes. Please check your JSON data and try again.'
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setJsonContent('')}
          disabled={isImporting || !jsonContent}
        >
          Clear
        </Button>
        <Button 
          onClick={handleImport}
          disabled={isImporting || !jsonContent}
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            'Import Recipes'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}