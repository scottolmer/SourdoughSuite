import React from 'react';
import { Link } from 'wouter';
import { MobileLayout } from '@/components/mobile-layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wheat, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { SEO } from '@/components/SEO';
import { generateFAQSchema } from '@/lib/schema';

type Starter = {
  id: number;
  name: string;
  imageUrl?: string;
  description?: string;
};

export function BakingJournalPage() {
  // Fetch starters to display in the journal
  const { data: starters, isLoading, isError } = useQuery<Starter[]>({
    queryKey: ['/api/starters'],
    queryFn: async () => {
      const response = await apiRequest<Starter[]>('/api/starters');
      return response;
    },
  });

  // Create breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Tools', href: '/tools' },
    { label: 'Baking Journal' } // Current page should not have href
  ];

  if (isLoading) {
    return (
      <MobileLayout 
        title="Baking Journal" 
        showBackButton
        backHref="/tools"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (isError) {
    return (
      <MobileLayout 
        title="Baking Journal" 
        showBackButton
        backHref="/tools"
        breadcrumbs={breadcrumbs}
      >
        <div className="p-4 text-red-500">
          Error loading starters. Please try again later.
        </div>
      </MobileLayout>
    );
  }

  // Create FAQ schema for the baking journal
  const bakingJournalFaqs = [
    {
      question: "What is a Sourdough Baking Journal?",
      answer: "A Sourdough Baking Journal is a tool to track how different sourdough starters perform with various recipes. It helps you record and analyze important metrics like oven spring, crumb structure, crust quality, and flavor profile for each bake."
    },
    {
      question: "Why should I keep a Baking Journal?",
      answer: "Keeping a baking journal helps you identify patterns in your sourdough baking, understand how different variables affect your results, and improve your bread over time by learning what works best with each specific starter."
    },
    {
      question: "What information can I track in the Baking Journal?",
      answer: "You can track details about the recipe used, fermentation conditions, proofing method, baking temperature and time, and final results including ratings for oven spring, crumb structure, crust quality, and overall flavor."
    }
  ];

  return (
    <MobileLayout 
      title="Baking Journal" 
      showBackButton
      backHref="/tools"
      breadcrumbs={breadcrumbs}
    >
      <SEO
        title="Sourdough Baking Journal | Track Your Bread Baking Results"
        description="Track and analyze your sourdough bread baking results with our interactive Baking Journal. Record starter performance, baking conditions, and results to improve your artisan bread."
        keywords={['sourdough baking journal', 'bread baking log', 'sourdough tracker', 'starter performance tracking', 'bread baking app', 'crumb structure analysis', 'oven spring tracking']}
        canonicalUrl="/baking-journal"
        structuredData={generateFAQSchema(bakingJournalFaqs)}
      />
      <div className="space-y-6">
        <section className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 p-6">
          <h1 className="text-2xl font-bold mb-2">My Baking Journal</h1>
          <p className="text-muted-foreground">
            Track how your sourdough starters perform with different recipes
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xl font-semibold">Select a Starter</h2>
              <p className="text-muted-foreground text-sm">
                Choose a starter to view or add baking logs
              </p>
            </div>
            <Link href="/baking-logs">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ChevronRight className="h-4 w-4" />
                View All Logs
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {starters?.map((starter) => (
              <Card key={starter.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Wheat className="h-5 w-5 mr-2 text-amber-500" />
                    {starter.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      View baking performance and add new logs
                    </p>
                    <Link to={`/starter/baking-log/${starter.id}`}>
                      <Button variant="outline" size="sm" className="flex items-center">
                        View Logs
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {starters?.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">You don't have any starters yet.</p>
                  <Link href="/starter/maintenance">
                    <Button variant="default">
                      Add Your First Starter
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
        
        <section className="mt-4 space-y-4">
          <h2 className="text-lg font-medium">About Baking Journals</h2>
          <div className="prose dark:prose-invert prose-sm">
            <p>
              Keeping a baking journal helps you track how different starters perform with various recipes.
              Record details about fermentation, proofing, and baking results to improve your bread over time.
            </p>
            <p>
              Each entry captures important metrics like oven spring, crumb structure, crust quality, and flavor,
              giving you insights into what works best with each sourdough starter.
            </p>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}

export default BakingJournalPage;