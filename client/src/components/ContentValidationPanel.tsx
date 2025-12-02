import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertTriangle, BookOpen, TrendingUp, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ValidationResult {
  isValid: boolean;
  confidenceScore: number;
  supportingSources: any[];
  contradictingSources: any[];
  gaps: string[];
  recommendations: string[];
}

interface ContentValidationPanelProps {
  initialContent?: string;
  contentType?: string;
  contentId?: number;
  onValidationComplete?: (result: ValidationResult) => void;
}

export default function ContentValidationPanel({
  initialContent = "",
  contentType = "article",
  contentId,
  onValidationComplete
}: ContentValidationPanelProps) {
  const [content, setContent] = useState(initialContent);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const validateContentMutation = useMutation({
    mutationFn: async (contentData: { content: string; contentType: string; contentId?: number }) => {
      return await apiRequest("/api/research/validate-content", {
        method: "POST",
        body: JSON.stringify(contentData),
      });
    },
    onSuccess: (result) => {
      setValidationResult(result);
      onValidationComplete?.(result);
    },
    onError: (error) => {
      console.error("Validation failed:", error);
    },
  });

  const handleValidate = () => {
    if (!content.trim()) return;
    
    validateContentMutation.mutate({
      content: content.trim(),
      contentType,
      contentId,
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 60) return "Moderate";
    if (score >= 40) return "Low";
    return "Very Low";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Content Validation</span>
          </CardTitle>
          <CardDescription>
            Validate content against peer-reviewed research sources for scientific accuracy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter content to validate against research sources..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="min-h-[200px]"
          />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {content.length} characters
            </div>
            <Button 
              onClick={handleValidate}
              disabled={!content.trim() || validateContentMutation.isPending}
            >
              {validateContentMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validate Content
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Validation Results</span>
              <div className="flex items-center space-x-2">
                {validationResult.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <Badge variant={validationResult.isValid ? "default" : "destructive"}>
                  {validationResult.isValid ? "Valid" : "Issues Found"}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Confidence Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Confidence Score</h4>
                <span className={`font-bold ${getConfidenceColor(validationResult.confidenceScore)}`}>
                  {validationResult.confidenceScore}% - {getConfidenceLabel(validationResult.confidenceScore)}
                </span>
              </div>
              <Progress value={validationResult.confidenceScore} className="h-2" />
            </div>

            <Separator />

            {/* Supporting Sources */}
            {validationResult.supportingSources.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Supporting Evidence ({validationResult.supportingSources.length})</span>
                </h4>
                <div className="space-y-2">
                  {validationResult.supportingSources.map((source, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="font-medium text-green-800">{source.title}</p>
                      <p className="text-sm text-green-600">{source.authors?.join(", ")}</p>
                      {source.doi && (
                        <p className="text-xs text-green-500">DOI: {source.doi}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contradicting Sources */}
            {validationResult.contradictingSources.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>Contradicting Evidence ({validationResult.contradictingSources.length})</span>
                </h4>
                <div className="space-y-2">
                  {validationResult.contradictingSources.map((source, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="font-medium text-red-800">{source.title}</p>
                      <p className="text-sm text-red-600">{source.authors?.join(", ")}</p>
                      {source.doi && (
                        <p className="text-xs text-red-500">DOI: {source.doi}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge Gaps */}
            {validationResult.gaps.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Knowledge Gaps ({validationResult.gaps.length})</span>
                </h4>
                <div className="space-y-2">
                  {validationResult.gaps.map((gap, index) => (
                    <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800">{gap}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {validationResult.recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span>Recommendations ({validationResult.recommendations.length})</span>
                </h4>
                <div className="space-y-2">
                  {validationResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Validation Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Validation Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Content Status:</span>
                  <span className={`ml-2 font-medium ${validationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validationResult.isValid ? 'Scientifically Valid' : 'Requires Review'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Evidence Quality:</span>
                  <span className={`ml-2 font-medium ${getConfidenceColor(validationResult.confidenceScore)}`}>
                    {getConfidenceLabel(validationResult.confidenceScore)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Supporting Sources:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {validationResult.supportingSources.length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Issues Found:</span>
                  <span className="ml-2 font-medium text-red-600">
                    {validationResult.contradictingSources.length + validationResult.gaps.length}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}