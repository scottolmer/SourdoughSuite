import { MobileLayout } from "@/components/mobile-layout";
import { SEO } from "@/components/SEO";
import AIBakingTroubleshooter from "@/components/BreadTools/AIBakingTroubleshooter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wrench } from "lucide-react";
import { Link } from "wouter";

export default function BakingTroubleshooterPage() {
  return (
    <MobileLayout title="AI Baking Troubleshooter">
      <SEO
        title="AI Baking Troubleshooter | Diagnose and Fix Baking Issues"
        description="Get expert AI analysis for your baking problems with actionable solutions, prevention tips, and troubleshooting advice for perfect bread every time."
        keywords={['baking troubleshooter', 'bread problems', 'sourdough issues', 'baking diagnosis', 'AI baking help', 'bread troubleshooting']}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/tools">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-red-600" />
            <h1 className="text-2xl font-bold">AI Baking Troubleshooter</h1>
          </div>
        </div>
        
        {/* Description */}
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Describe your baking issue and get expert AI analysis with actionable solutions, 
            prevention tips, and troubleshooting advice powered by machine learning.
          </p>
        </div>
        
        {/* Main Component */}
        <AIBakingTroubleshooter />
      </div>
    </MobileLayout>
  );
}