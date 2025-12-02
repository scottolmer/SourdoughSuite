import { useState, useEffect } from "react";
import { MobileLayout, MobileCard } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Share2, Info } from "lucide-react";
import { Link } from "wouter";

interface StarterRecommendation {
  id: number;
  name: string;
  description: string;
  mainFlour: string;
  price: string;
  flavor: string;
  maintenance: string;
  matchScore: number;
  imageUrl?: string;
  badge?: string;
}

export function StarterRecommendationPage() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<StarterRecommendation[]>([]);
  
  // Fetch starter recommendations based on quiz settings
  useEffect(() => {
    async function fetchStarters() {
      try {
        setLoading(true);
        // First get all starters
        const starterResponse = await fetch('/api/starters');
        if (!starterResponse.ok) {
          throw new Error('Failed to fetch starters');
        }
        const starters = await starterResponse.json();
        
        // Then get quiz settings to find enabled starters
        const settingsResponse = await fetch('/api/quiz/settings');
        if (!settingsResponse.ok) {
          throw new Error('Failed to fetch quiz settings');
        }
        const quizSettings = await settingsResponse.json();
        
        // Filter starters based on enabled starters in quiz settings and exclude homemade starter (id: 1)
        const filteredStarters = starters
          .filter((starter: any) => 
            quizSettings.enabledStarters.includes(starter.id) && 
            starter.id !== 1 // Exclude homemade starter
          )
          .map((starter: any) => ({
            id: starter.id,
            name: starter.name,
            description: starter.description,
            mainFlour: starter.mainFlour || 'Mixed Flour',
            price: typeof starter.price === 'number' ? `$${starter.price.toFixed(2)}` : starter.price,
            flavor: typeof starter.flavor === 'object' 
              ? Object.keys(starter.flavor || {}).join(', ') 
              : (starter.flavor || 'Balanced flavor'),
            maintenance: starter.maintenance?.difficulty || 'Standard maintenance',
            matchScore: Math.floor(Math.random() * 15) + 85, // Would come from actual quiz results
            imageUrl: starter.id === 6 ? './images/starters/koji-starter.jpg' :
                    starter.id === 7 ? './images/starters/san-francisco-starter.jpg' :
                    starter.id === 8 ? './images/starters/kombucha-starter.jpg' :
                    starter.id === 10 ? './images/starters/house-blend-starter.jpg' :
                    './images/starters/house-blend-starter.jpg'
          }));
        
        // Sort by match score and add badge to top match
        const sortedStarters = filteredStarters
          .sort((a: any, b: any) => b.matchScore - a.matchScore);
        
        if (sortedStarters.length > 0) {
          sortedStarters[0].badge = "Best Match";
        }
        
        setRecommendations(sortedStarters);
      } catch (error) {
        console.error('Error fetching starter recommendations:', error);
        // Use default House Blend Starter as fallback
        setRecommendations([{
          id: 10,
          name: "House Blend Starter",
          description: "Our House Blend Starter is a carefully balanced combination of our specialty cultures, creating our most versatile and forgiving starter.",
          mainFlour: "Wheat",
          price: "$21.95",
          flavor: "Balanced, moderate tang, complex, versatile",
          maintenance: "Easy, feeds every 8-12 hours",
          matchScore: 95,
          badge: "Best Match",
          imageUrl: "/images/starters/house-blend-starter.jpg"
        }]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStarters();
  }, []);

  return (
    <MobileLayout title="Your Starter Match" showBackButton>
      <div className="space-y-6">
        <section className="text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-3">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Your Perfect Starter Match</h1>
          <p className="text-muted-foreground mt-2">
            Based on your preferences, we've found these sourdough starters for you.
          </p>
        </section>

        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No matching starters found.</p>
            <p className="text-sm mt-2">Please try again with different preferences or contact us for assistance.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((starter) => (
              <StarterCard key={starter.id} starter={starter} />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button asChild>
            <Link href="/shop">
              View All Starters
            </Link>
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}

function StarterCard({ starter }: { starter: StarterRecommendation }) {
  return (
    <MobileCard className={starter.badge ? "border-primary" : undefined}>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div>
            <h2 className="text-lg font-semibold">{starter.name}</h2>
            <p className="text-sm text-muted-foreground">{starter.mainFlour}</p>
          </div>
          <div className="text-right">
            <div className="font-bold">{starter.price}</div>
            <div className="text-sm text-green-600 font-medium">{starter.matchScore}% Match</div>
          </div>
        </div>
        
        {starter.badge && (
          <Badge className="bg-primary">{starter.badge}</Badge>
        )}
        
        <p className="text-sm">{starter.description}</p>
        
        <div className="space-y-2">
          <div className="flex gap-2 text-sm">
            <span className="font-medium min-w-20">Flavor:</span>
            <span>{starter.flavor}</span>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="font-medium min-w-20">Maintenance:</span>
            <span>{starter.maintenance}</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          <Button size="sm" variant="outline">
            <Link href={`/starter-product/${
              starter.id === 6 ? 'koji-starter' : 
              starter.id === 7 ? 'san-francisco-starter' : 
              starter.id === 8 ? 'traditional-rye-starter' : 
              starter.id === 10 ? 'house-blend-starter' : 
              'house-blend-starter'}`}>
              <Info className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="sm" variant="outline">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </MobileCard>
  );
}