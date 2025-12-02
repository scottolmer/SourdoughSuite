import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import { MobileLayout } from '@/components/mobile-layout';

// Define interface for baking log
interface BakingLog {
  id: number;
  recipeId: number;
  recipeName: string;
  starterId: number;
  starterName: string;
  starterImageUrl?: string;
  bakeDate: string;
  overallRating?: number;
  flavor?: string;
  notes?: string;
  // Add other fields as needed
}
import { 
  Calendar, 
  Star, 
  Flame,
  FileSpreadsheet,
  ExternalLink,
  Info
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Rating display component
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

export default function AllBakingLogsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [sortBy, setSortBy] = useState<string>('date-desc');
  
  // Get all baking logs
  const { 
    data: bakingLogs, 
    isLoading, 
    error 
  } = useQuery<BakingLog[]>({
    queryKey: ['/api/baking-logs'],
  });
  
  // Process and sort the logs
  const [sortedLogs, setSortedLogs] = useState<BakingLog[]>([]);
  
  useEffect(() => {
    if (bakingLogs && Array.isArray(bakingLogs)) {
      // Make a copy to sort
      let logs = [...bakingLogs];
      
      // Apply sorting
      switch(sortBy) {
        case 'date-desc':
          logs.sort((a, b) => new Date(b.bakeDate).getTime() - new Date(a.bakeDate).getTime());
          break;
        case 'date-asc':
          logs.sort((a, b) => new Date(a.bakeDate).getTime() - new Date(b.bakeDate).getTime());
          break;
        case 'rating-desc':
          logs.sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0));
          break;
        case 'rating-asc':
          logs.sort((a, b) => (a.overallRating || 0) - (b.overallRating || 0));
          break;
      }
      
      setSortedLogs(logs);
    }
  }, [bakingLogs, sortBy]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Failed to load baking logs",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // Track page view
  useEffect(() => {
    trackEvent('view_all_baking_logs', 'baking_logs', 'all_baking_logs_page');
  }, []);
  
  // View recipe details
  const handleViewRecipe = (recipeId: number) => {
    trackEvent('view_recipe_from_logs', 'baking_logs', 'all_baking_logs_page', recipeId);
    navigate(`/recipes/${recipeId}`);
  };
  
  // View starter details
  const handleViewStarter = (starterId: number) => {
    if (!starterId) return;
    trackEvent('view_starter_from_logs', 'baking_logs', 'all_baking_logs_page', starterId);
    navigate(`/starter/baking-log/${starterId}`);
  };
  
  // Create breadcrumbs for navigation
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/tools' },
    { name: 'Baking Journal', url: '/baking-journal' },
    { name: 'All Baking Logs', url: '/baking-logs' }
  ];
  
  return (
    <MobileLayout 
      title="All Baking Logs"
      showBackButton
      backHref="/baking-journal"
      breadcrumbs={breadcrumbs}
      rightContent={
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="rating-desc">Highest Rating</SelectItem>
            <SelectItem value="rating-asc">Lowest Rating</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ) : sortedLogs.length > 0 ? (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipe & Date</TableHead>
                  <TableHead>Starter</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLogs.map((log) => (
                  <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium" onClick={() => handleViewRecipe(log.recipeId)}>
                        {log.recipeName}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" /> 
                        {new Date(log.bakeDate).toLocaleDateString()}
                        <span className="ml-2 text-xs">
                          {formatDistanceToNow(new Date(log.bakeDate), { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewStarter(log.starterId)}>
                      <div className="flex items-center">
                        {log.starterName}
                        {log.starterImageUrl && (
                          <div className="ml-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="h-5 w-5 rounded-full bg-center bg-cover" 
                                    style={{ backgroundImage: `url(${log.starterImageUrl})` }} />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{log.starterName}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <RatingStars rating={log.overallRating || 0} />
                      {log.flavor && (
                        <div className="flex items-center mt-1">
                          <Flame className="h-3 w-3 mr-1 text-orange-500" />
                          <span className="text-xs">{log.flavor}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.notes ? (
                        <div className="text-xs max-w-[140px] truncate">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>{log.notes}</span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p>{log.notes}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No notes</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Baking Logs Yet</CardTitle>
              <CardDescription>
                Start logging your bakes to track your sourdough journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <p className="text-sm mb-4">
                  Track your baking results by creating baking logs for each recipe you make. 
                  You can record important details like:
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 mr-2 text-amber-500" />
                    <span>Overall Rating</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Flame className="h-4 w-4 mr-2 text-orange-500" />
                    <span>Flavor Profile</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Crumb Structure</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Info className="h-4 w-4 mr-2 text-purple-500" />
                    <span>Detailed Notes</span>
                  </div>
                </div>
                <Button 
                  className="mt-2"
                  variant="outline"
                  onClick={() => navigate('/recipes')}
                >
                  Browse Recipes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}