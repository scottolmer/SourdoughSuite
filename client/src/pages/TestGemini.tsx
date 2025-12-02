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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export default function TestGemini() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Generate a recipe for sourdough bread with rosemary and garlic.');

  // Test the Gemini connection
  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/ai/test-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to Gemini API');
      }
      
      setResult(data);
    } catch (err) {
      console.error('Error testing Gemini connection:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Generate content with Gemini
  const generateContent = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            description: prompt
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content with Gemini');
      }
      
      setResult(data);
    } catch (err) {
      console.error('Error generating content with Gemini:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Google Gemini API Test</h1>

      <div className="grid gap-8">
        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Gemini API Connection</CardTitle>
            <CardDescription>
              Verify that the application can connect to Google's Gemini API using your API key
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={testConnection} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Connection'}
            </Button>
          </CardFooter>
        </Card>

        {/* Content Generation */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Content with Gemini</CardTitle>
            <CardDescription>
              Test the content generation capabilities of Gemini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Enter your prompt:</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want Gemini to generate..."
                className="h-32"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={generateContent} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate Content'}
            </Button>
          </CardFooter>
        </Card>

        {/* Results */}
        {(result || error) && (
          <Card>
            <CardHeader>
              <CardTitle>{error ? 'Error' : 'Result'}</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}