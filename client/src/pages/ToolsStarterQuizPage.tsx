import React from 'react';
import { MobileLayout } from "@/components/mobile-layout";
import StarterQuiz from "@/components/BreadTools/StarterQuiz";

/**
 * ToolsStarterQuizPage - Wrapper page for the comprehensive starter quiz
 */
export function ToolsStarterQuizPage() {
  // Create breadcrumbs for this page
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/tools' },
    { name: 'Starter Quiz', url: '/tools/starter-quiz' }
  ];

  return (
    <MobileLayout 
      title="Starter Quiz" 
      showBackButton 
      backHref="/tools"
      breadcrumbs={breadcrumbs}
    >
      <StarterQuiz />
    </MobileLayout>
  );
}

export default ToolsStarterQuizPage;