import React from 'react';
import ScalingCalculator from '@/components/BreadTools/ScalingCalculator';
import { MobileLayout } from "@/components/mobile-layout";
import ToolsMenu from '@/components/tools/ToolsMenu';

export default function ScalingCalculatorPage() {
  return (
    <MobileLayout title="Scaling Calculator">
      <div className="space-y-4 max-w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Recipe Scaling Calculator</h1>
          <p className="text-muted-foreground mb-4">
            Scale bread recipes by weight or pan size while maintaining proper ratios.
          </p>
        </div>
        
        <ToolsMenu activeToolPath="/tools/scaling-calculator" showAllTools={false} />

        <ScalingCalculator />
      </div>
    </MobileLayout>
  );
}