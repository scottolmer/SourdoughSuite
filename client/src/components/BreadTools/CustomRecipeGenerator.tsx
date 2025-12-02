import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

/**
 * Redirect component that consolidates recipe generation functionality
 * All recipe generation now uses the enhanced version at /tools/recipe-generator
 */
export default function CustomRecipeGenerator() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect to the enhanced recipe generator with comprehensive AI prompts
    navigate("/tools/recipe-generator");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            Recipe Generator <ArrowRight className="h-5 w-5" />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Redirecting to the enhanced recipe generator with AI-powered variation and comprehensive prompt templates...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}