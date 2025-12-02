import { MobileLayout } from "@/components/mobile-layout";
import AIIngredientSubstitution from "@/components/BreadTools/AIIngredientSubstitution";
import { SEO } from "@/components/SEO";

export default function IngredientSubstitutionPage() {
  return (
    <>
      <SEO 
        title="AI Ingredient Substitution - Sourdough Suite"
        description="Get intelligent ingredient substitution suggestions for your sourdough recipes with AI-powered recommendations."
        keywords={["ingredient substitution", "baking substitutes", "sourdough ingredients", "AI baking assistant"]}
      />
      <MobileLayout
        title="AI Ingredient Substitution"
        showBackButton={true}
        backHref="/tools"
      >
        <AIIngredientSubstitution />
      </MobileLayout>
    </>
  );
}