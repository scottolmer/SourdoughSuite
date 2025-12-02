import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TroubleshootingResult {
  issue: string;
  diagnosis: string;
  severity: 'low' | 'medium' | 'high';
  possibleCauses: string[];
  solutions: Array<{
    solution: string;
    difficulty: 'easy' | 'medium' | 'advanced';
    timeframe: string;
    effectiveness: number;
  }>;
  preventionTips: string[];
  relatedIssues: string[];
}

export default function AIBakingTroubleshooter() {
  const [issueDescription, setIssueDescription] = useState('');
  const [result, setResult] = useState<TroubleshootingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your baking issue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/troubleshoot-baking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueDescription: issueDescription.trim()
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('API response received for /api/ai/troubleshoot-baking:', responseData);
        
        // Handle both response formats from server
        const data = responseData.success ? responseData.data : responseData;
        setResult(data);
        toast({
          title: "Analysis Complete",
          description: "AI has analyzed your baking issue and provided solutions.",
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to analyze baking issue' }));
        throw new Error(errorData.error || 'Failed to analyze baking issue');
      }
    } catch (error) {
      console.error('Error analyzing baking issue:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze your baking issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIssueDescription('');
    setResult(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'easy': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Common baking issues for quick selection
  const commonIssues = [
    "Bread didn't rise properly",
    "Crust is too thick/hard",
    "Crumb is too dense", 
    "Bread is gummy inside",
    "Sourdough not sour enough",
    "Dough is too sticky to handle",
    "Loaf collapsed during baking"
  ];

  return (
    <div className="space-y-8">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Baking Troubleshooter</h1>
          <p className="text-gray-600">
            Describe your baking issue and get expert AI analysis with solutions
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe your baking issue</label>
            <Textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe what went wrong with your bread..."
              rows={4}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Common Issues (click to select)</label>
            <div className="flex flex-wrap gap-2">
              {commonIssues.map((issue, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setIssueDescription(issue)}
                >
                  {issue}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !issueDescription.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Issue'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </div>

        {result && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Troubleshooting Analysis
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Severity:</span>
                  <Badge className={getSeverityColor(result.severity)}>
                    {result.severity.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Diagnosis</h3>
                  <p className="text-gray-700">{result.diagnosis}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Possible Causes</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {result.possibleCauses.map((cause, index) => (
                      <li key={index}>{cause}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Solutions</h3>
                  <div className="space-y-4">
                    {result.solutions.map((solution, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{solution.solution}</h4>
                          <div className="flex gap-2">
                            <Badge className={getDifficultyColor(solution.difficulty)}>
                              {solution.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {solution.effectiveness}% effective
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Timeframe:</span> {solution.timeframe}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Prevention Tips</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {result.preventionTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
                
                {result.relatedIssues.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Related Issues to Watch For</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.relatedIssues.map((issue, index) => (
                        <Badge key={index} variant="secondary">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}