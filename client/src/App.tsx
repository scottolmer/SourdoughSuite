import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollToTop } from "@/components/ScrollToTop";
import MobileAdminFix from "@/components/MobileAdminFix";

import { HelmetProvider } from "react-helmet-async";
import { useEffect, lazy, Suspense } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { SubdomainRouter } from "@/components/SubdomainRouter";

// Loading component
import { Loader2 } from "lucide-react";

// Core pages - import directly for fast initial load
import { HomePage } from "@/pages/HomePage";
import NotFound from "@/pages/not-found";

// Lazy-loaded pages for better performance
// Recipe pages
const RecipesHubPage = lazy(() => import("@/pages/RecipesHubPage"));
const RecipeGeneratorPage = lazy(() => import("@/pages/RecipeGeneratorPage").then(module => ({ default: module.RecipeGeneratorPage })));
const RecipeGeneratorRedirect = lazy(() => import("@/pages/RecipeGeneratorRedirect").then(module => ({ default: module.RecipeGeneratorRedirect })));
const RecipeDetailPage = lazy(() => import("@/pages/RecipeDetailPage"));
const ManualRecipeEntryPage = lazy(() => import("@/pages/ManualRecipeEntryPage"));
const MyRecipes = lazy(() => import("@/pages/MyRecipes"));
const PerformanceOptimizationPage = lazy(() => import("@/pages/PerformanceOptimizationPage"));
const RecentRecipesPage = lazy(() => import("@/pages/RecentRecipesPage"));
const AllBakingLogsPage = lazy(() => import("@/pages/AllBakingLogsPage"));

// AI pages - these are typically heavier due to AI-related functionality
const AIRecipeGenerator = lazy(() => import("@/pages/AIRecipeGenerator").then(module => ({ default: module.AIRecipeGenerator })));
const AIRecipeGeneratorPage = lazy(() => import("@/pages/AIRecipeGeneratorPage"));
const AIRecipeAnalysisPage = lazy(() => import("@/pages/AIRecipeAnalysisPage"));
const AIRecipeDetail = lazy(() => import("@/pages/AIRecipeDetail"));
const AIRecipeDetailPage = lazy(() => import("@/pages/AIRecipeDetailPage"));
const MyAIRecipesPage = lazy(() => import("@/pages/MyAIRecipesPage"));
const AIChatAssistant = lazy(() => import("@/pages/AIChatAssistant"));
const TestGemini = lazy(() => import("@/pages/TestGemini"));
const AIRecipeDiscovery = lazy(() => import("@/pages/AIRecipeDiscovery"));
const RecipeCardView = lazy(() => import("@/pages/RecipeCardView").then(module => ({ default: module.RecipeCardView })));
const AIStarterTroubleshootingPage = lazy(() => import("@/pages/AIStarterTroubleshootingPage"));
const AIPersonalizedRecipeGeneratorPage = lazy(() => import("@/pages/AIPersonalizedRecipeGeneratorPage"));
const AIDemoPage = lazy(() => import("@/pages/AIDemoPage"));

// Research pages - Evidence-based content system

// Starter pages
const StarterPage = lazy(() => import("@/pages/StarterPage").then(module => ({ default: module.StarterPage })));
const StarterSchoolPage = lazy(() => import("@/pages/StarterSchoolPage").then(module => ({ default: module.StarterSchoolPage })));
const StarterSchoolHub = lazy(() => import("@/pages/StarterSchoolHub").then(module => ({ default: module.StarterSchoolHub })));
const StarterGettingStartedPage = lazy(() => import("@/pages/StarterGettingStartedPage").then(module => ({ default: module.StarterGettingStartedPage })));
const StarterDailyCare = lazy(() => import("@/pages/StarterDailyCare").then(module => ({ default: module.StarterDailyCare })));
const StarterTemperatureGuide = lazy(() => import("@/pages/StarterTemperatureGuide").then(module => ({ default: module.StarterTemperatureGuide })));
const StarterTroubleshooting = lazy(() => import("@/pages/StarterTroubleshooting").then(module => ({ default: module.StarterTroubleshooting })));
const StarterTrackerPage = lazy(() => import("@/pages/StarterTrackerPage").then(module => ({ default: module.StarterTrackerPage })));
const StarterMaintenanceSchedulerPage = lazy(() => import("@/pages/StarterMaintenanceSchedulerPage").then(module => ({ default: module.StarterMaintenanceSchedulerPage })));
const StarterRecipesPage = lazy(() => import("@/pages/StarterRecipesPage").then(module => ({ default: module.StarterRecipesPage })));
const StarterQuizPage = lazy(() => import("@/pages/StarterQuizPage").then(module => ({ default: module.StarterQuizPage })));
const ToolsStarterQuizPage = lazy(() => import("@/pages/ToolsStarterQuizPage"));
const StarterRecommendationPage = lazy(() => import("@/pages/StarterRecommendationPage").then(module => ({ default: module.StarterRecommendationPage })));
const StarterMaintenancePage = lazy(() => import("@/pages/StarterMaintenancePage").then(module => ({ default: module.StarterMaintenancePage })));
const StarterFeedingCalculatorPage = lazy(() => import("@/pages/StarterFeedingCalculatorPage"));
const StarterFeedingLogPage = lazy(() => import("@/pages/StarterFeedingLogPage"));
const StarterHealthLogPage = lazy(() => import("@/pages/StarterHealthLogPage").then(module => ({ default: module.StarterHealthLogPage })));
const StarterHealthCheckPage = lazy(() => import("@/pages/StarterHealthCheckPage").then(module => ({ default: module.StarterHealthCheckPage })));
const StarterSchedulePage = lazy(() => import("@/pages/StarterSchedulePage").then(module => ({ default: module.StarterSchedulePage })));
const StarterBakingLogPage = lazy(() => import("@/pages/StarterBakingLogPage"));
const BakingJournalPage = lazy(() => import("@/pages/BakingJournalPage").then(module => ({ default: module.BakingJournalPage })));
const BakingLogFormPage = lazy(() => import("@/pages/BakingLogFormPage").then(module => ({ default: module.default || module })));

// Starter School FAQ pages
const HowToFeedSourdoughStarterPage = lazy(() => import("@/pages/starter-school/HowToFeedSourdoughStarterPage").then(module => ({ default: module.HowToFeedSourdoughStarterPage })));
const HowOftenFeedSourdoughStarterPage = lazy(() => import("@/pages/starter-school/HowOftenFeedSourdoughStarterPage").then(module => ({ default: module.HowOftenFeedSourdoughStarterPage })));
const BestFeedingRatio111vs122Page = lazy(() => import("@/pages/starter-school/BestFeedingRatio111vs122Page").then(module => ({ default: module.BestFeedingRatio111vs122Page })));
const WhySourdoughStarterNotRisingPage = lazy(() => import("@/pages/starter-school/WhySourdoughStarterNotRisingPage").then(module => ({ default: module.WhySourdoughStarterNotRisingPage })));
const WhatIsHoochSourdoughStarterPage = lazy(() => import("@/pages/starter-school/WhatIsHoochSourdoughStarterPage").then(module => ({ default: module.WhatIsHoochSourdoughStarterPage })));

// Starter Recipe pages
const ClassicWheatRecipe = lazy(() => import("@/pages/StarterRecipes/ClassicWheatRecipe").then(module => ({ default: module.ClassicWheatRecipe })));
const WholeWheatRecipe = lazy(() => import("@/pages/StarterRecipes/WholeWheatRecipe").then(module => ({ default: module.WholeWheatRecipe })));
const RyeStarterRecipe = lazy(() => import("@/pages/StarterRecipes/RyeStarterRecipe").then(module => ({ default: module.RyeStarterRecipe })));
const GlutenFreeRecipe = lazy(() => import("@/pages/StarterRecipes/GlutenFreeRecipe").then(module => ({ default: module.GlutenFreeRecipe })));
const BakingLogsPage = lazy(() => import("@/pages/BakingLogsPage").then(module => ({ default: module.default || module })));
const TimelineTestPage = lazy(() => import("@/pages/TimelineTestPage"));
const StarterProduct = lazy(() => import("@/pages/StarterProduct"));

// Shop pages
const Shop = lazy(() => import("@/pages/Shop"));
const ProductPage = lazy(() => import("@/pages/ProductPage").then(module => ({ default: module.ProductPage })));

// Tools pages
const BakersCalculatorPage = lazy(() => import("@/pages/BakersCalculatorPage"));
const RecipeValidatorPage = lazy(() => import("@/pages/RecipeValidatorPage"));
const TimelineCalculatorPage = lazy(() => import("@/pages/TimelineCalculatorPage"));
const DoughTemperatureCalculatorPage = lazy(() => import("@/pages/DoughTemperatureCalculatorPage"));
const HydrationConverterPage = lazy(() => import("@/pages/HydrationConverterPage"));
const ScalingCalculatorPage = lazy(() => import("@/pages/ScalingCalculatorPage"));
const IngredientSubstitutionPage = lazy(() => import("@/pages/IngredientSubstitutionPage"));
const BakingTroubleshooterPage = lazy(() => import("@/pages/BakingTroubleshooterPage"));
const ToolsPage = lazy(() => import("@/pages/ToolsPage"));
const ConversionTool = lazy(() => import("@/pages/ConversionTool"));

// Blog pages
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogArticlePage = lazy(() => import("@/pages/BlogArticlePage"));
const ContentArticlePage = lazy(() => import("@/pages/ContentArticlePage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));

// Research pages - Manual curation focused
const ResearchHubNew = lazy(() => import("@/pages/ResearchHubNew"));
const ResearchArticlePage = lazy(() => import("@/pages/ResearchArticlePage"));
const NotebookLayout = lazy(() => import("@/pages/NotebookLayout"));
const CalculatorTools = lazy(() => import("@/pages/CalculatorTools"));
const ToolsNav = lazy(() => import("@/pages/ToolsNav"));

// Mobile-first pages
const MobileHome = lazy(() => import("@/pages/MobileHome"));
const MobileTools = lazy(() => import("@/pages/MobileTools"));
const MobileResearchHub = lazy(() => import("@/pages/MobileResearchHub"));

// Video pages
const VideoHomePage = lazy(() => import("@/pages/VideoHomePage"));
const VideosPage = lazy(() => import("@/pages/VideosPage"));

// Admin panel - less frequently used, perfect for lazy loading
const Admin = lazy(() => import("@/pages/Admin"));
const SimpleAdminDashboard = lazy(() => import("@/pages/SimpleAdminDashboard"));
const QualityControlDashboard = lazy(() => import("@/pages/QualityControlDashboard"));
const ProfessionalCommandCenter = lazy(() => import("@/pages/ProfessionalCommandCenter"));
const MobileProductionDashboard = lazy(() => import("@/pages/MobileProductionDashboard"));
const ContentArticlesAdminPage = lazy(() => import("@/pages/admin/ContentArticlesAdminPage"));
const ContentArticleEditorPage = lazy(() => import("@/pages/admin/ContentArticleEditorPage"));
const BlogManagement = lazy(() => import("@/pages/Admin/BlogManagement"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <ScrollArea className="h-screen">
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Switch>
          {/* Mobile-first UI routes - direct import for fast initial load */}
          <Route path="/" component={HomePage} />
          
          {/* Recipe routes */}
          <Route path="/recipes" component={RecipesHubPage} />
          <Route path="/recipes/discover">
            {() => <AIRecipeDiscovery variant="discover" />}
          </Route>
          <Route path="/recipes/ai-generated">
            {() => <AIRecipeDiscovery variant="ai-generated" />}
          </Route>
          <Route path="/recipes/trending">
            {() => <AIRecipeDiscovery variant="trending" />}
          </Route>
          <Route path="/recipes/new" component={RecipeGeneratorRedirect} />
          <Route path="/recipes/generate" component={RecipeGeneratorRedirect} />
          <Route path="/recipes/manual-entry" component={ManualRecipeEntryPage} />
          <Route path="/recipes/generated" component={RecipeDetailPage} />
          <Route path="/recipes/browse" component={MyRecipes} />
          <Route path="/recipes/my-recipes" component={MyRecipes} />
          <Route path="/recipes/community" component={MyRecipes} />
          <Route path="/recipes/recent" component={RecentRecipesPage} />
          <Route path="/baking-logs" component={AllBakingLogsPage} />
          <Route path="/recipes/:id/edit" component={ManualRecipeEntryPage} />
          <Route path="/recipes/:id" component={RecipeDetailPage} />
          
          {/* Legacy User Recipes Route */}
          <Route path="/my-recipes" component={MyRecipes} />
          
          {/* AI Recipe Routes - Redirect to main generator */}
          <Route path="/ai/recipes">{() => { window.location.href = '/ai/recipe-generator'; return null; }}</Route>
          <Route path="/ai/recipes/generate">{() => { window.location.href = '/ai/recipe-generator'; return null; }}</Route>
          <Route path="/ai/recipes/analysis" component={AIRecipeAnalysisPage} />
          <Route path="/ai/recipes/:id" component={AIRecipeDetailPage} />
          <Route path="/ai/chat" component={AIChatAssistant} />
          <Route path="/ai/test-gemini" component={TestGemini} />
          
          {/* Starter routes */}
          <Route path="/starter" component={StarterPage} />
          <Route path="/starter-school" component={StarterSchoolPage} />
          <Route path="/starter-school/hub" component={StarterSchoolHub} />
          <Route path="/starter-school/getting-started" component={StarterGettingStartedPage} />
          <Route path="/starter-school/daily-care" component={StarterDailyCare} />
          <Route path="/starter-school/temperature-guide" component={StarterTemperatureGuide} />
          <Route path="/starter-school/troubleshooting" component={StarterTroubleshooting} />
          <Route path="/starter-school/recipes/classic-wheat" component={ClassicWheatRecipe} />
          <Route path="/starter-school/recipes/whole-wheat" component={WholeWheatRecipe} />
          <Route path="/starter-school/recipes/rye-starter" component={RyeStarterRecipe} />
          <Route path="/starter-school/recipes/gluten-free" component={GlutenFreeRecipe} />
          
          {/* Starter School FAQ routes - high-priority SEO pages */}
          <Route path="/starter-school/how-to-feed-sourdough-starter" component={HowToFeedSourdoughStarterPage} />
          <Route path="/starter-school/how-often-feed-sourdough-starter" component={HowOftenFeedSourdoughStarterPage} />
          <Route path="/starter-school/best-feeding-ratio-1-1-1-vs-1-2-2" component={BestFeedingRatio111vs122Page} />
          <Route path="/starter-school/why-sourdough-starter-not-rising" component={WhySourdoughStarterNotRisingPage} />
          <Route path="/starter-school/what-is-hooch-sourdough-starter" component={WhatIsHoochSourdoughStarterPage} />
          
          <Route path="/ai-troubleshooting" component={AIStarterTroubleshootingPage} />
          <Route path="/ai-recipe-generator" component={AIPersonalizedRecipeGeneratorPage} />
          <Route path="/ai-demo" component={AIDemoPage} />
          <Route path="/starter/quiz" component={ToolsStarterQuizPage} />
          <Route path="/starter-quiz" component={StarterQuizPage} />
          <Route path="/starter/recommendation" component={StarterRecommendationPage} />
          <Route path="/starter/maintenance" component={StarterMaintenancePage} />
          <Route path="/starter/calculator" component={StarterFeedingCalculatorPage} />
          <Route path="/starter/feeding-calculator/:id" component={StarterFeedingCalculatorPage} />
          <Route path="/starter/feeding-log" component={StarterFeedingLogPage} />
          <Route path="/starter/feeding-log/:id" component={StarterFeedingLogPage} />
          <Route path="/starter/health-log/:id" component={StarterHealthLogPage} />
          <Route path="/starter/baking-log/:id" component={StarterBakingLogPage} />
          <Route path="/starter/health-check/:id" component={StarterHealthCheckPage} />
          <Route path="/starter/schedule" component={StarterSchedulePage} />
          <Route path="/starter/baking-journal" component={BakingJournalPage} />
          <Route path="/baking-journal" component={BakingJournalPage} />
          <Route path="/baking-logs/new" component={BakingLogFormPage} />
          <Route path="/recipes/:id/logs" component={BakingLogsPage} />
          <Route path="/starter-product/:id" component={StarterProduct} />
          
          {/* AI Routes */}
          <Route path="/ai/recipe-generator" component={AIRecipeGenerator} />
          <Route path="/ai/my-recipes" component={MyAIRecipesPage} />
          <Route path="/recipe-card/:id" component={RecipeCardView} />
          
          {/* Bread Tools Routes - order matters for wouter routing */}
          <Route path="/tools/starter-quiz" component={ToolsStarterQuizPage} />
          <Route path="/tools/feeding-calculator" component={StarterFeedingCalculatorPage} />
          <Route path="/tools/starter-feeding-calculator" component={StarterFeedingCalculatorPage} />
          <Route path="/tools/starter-tracker" component={StarterTrackerPage} />
          <Route path="/tools/maintenance-scheduler" component={StarterMaintenanceSchedulerPage} />
          <Route path="/starter-recipes" component={StarterRecipesPage} />
          <Route path="/tools/bakers-calculator" component={BakersCalculatorPage} />
          <Route path="/tools/bakers-percentage-calculator" component={BakersCalculatorPage} />
          <Route path="/tools/recipe-validator" component={RecipeValidatorPage} />
          <Route path="/tools/recipe-generator" component={RecipeGeneratorPage} />
          <Route path="/tools/custom-recipe-generator">
            {() => {
              window.location.href = '/ai/recipe-generator';
              return null;
            }}
          </Route>
          <Route path="/tools/chat" component={AIChatAssistant} />
          <Route path="/tools/ingredient-substitution" component={IngredientSubstitutionPage} />
          <Route path="/tools/troubleshooter" component={BakingTroubleshooterPage} />
          <Route path="/tools/timeline-calculator" component={TimelineCalculatorPage} />
          <Route path="/tools/dough-temperature-calculator" component={DoughTemperatureCalculatorPage} />
          <Route path="/tools/hydration-converter" component={HydrationConverterPage} />
          <Route path="/tools/scaling-calculator" component={ScalingCalculatorPage} />
          <Route path="/tools/converter" component={ConversionTool} />
          <Route path="/tools/performance" component={PerformanceOptimizationPage} />
          <Route path="/tools/timeline-test" component={TimelineTestPage} />
          <Route path="/performance" component={PerformanceOptimizationPage} />
          <Route path="/tools" component={ToolsPage} />
          
          {/* Shop routes */}
          <Route path="/shop" component={Shop} />
          <Route path="/products/:slug" component={ProductPage} />
          
          {/* Video routes */}
          <Route path="/video-home" component={VideoHomePage} />
          <Route path="/videos" component={VideosPage} />
          
          {/* Mobile-first routes */}
          <Route path="/mobile" component={MobileHome} />
          <Route path="/mobile-tools" component={MobileTools} />
          <Route path="/mobile-research" component={MobileResearchHub} />
          
          {/* Research routes - Manual curation focused */}
          <Route path="/research-hub" component={NotebookLayout} />
          <Route path="/research" component={ResearchHubNew} />
          <Route path="/research/:slug" component={ResearchArticlePage} />
          <Route path="/tools-nav" component={ToolsNav} />
          
          {/* Blog routes */}
          <Route path="/blog" component={BlogPage} />
          <Route path="/blog/:slug" component={BlogArticlePage} />
          <Route path="/content-articles/:slug" component={ContentArticlePage} />
          <Route path="/faq" component={FAQPage} />
          
          {/* Admin routes */}
          <Route path="/admin" component={Admin} />
          <Route path="/admin/simple" component={SimpleAdminDashboard} />
          <Route path="/admin/quality-control" component={QualityControlDashboard} />
          <Route path="/professional-command-center" component={ProfessionalCommandCenter} />
          <Route path="/mobile-production" component={MobileProductionDashboard} />
          <Route path="/admin/content-articles" component={ContentArticlesAdminPage} />
          <Route path="/admin/content-articles/new" component={ContentArticleEditorPage} />
          <Route path="/admin/content-articles/:id/edit" component={ContentArticleEditorPage} />
          <Route path="/admin/blog-management" component={BlogManagement} />
          
          {/* 404 route */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </ScrollArea>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <MobileAdminFix />
            <SubdomainRouter>
              <Router />
            </SubdomainRouter>
          </TooltipProvider>
        </CartProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
