import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function TestAIComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600" />
          Test AI Component
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a test component to verify the AI tools are loading correctly.</p>
      </CardContent>
    </Card>
  );
}