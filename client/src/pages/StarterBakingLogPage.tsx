import React, { useState } from 'react';
import { useParams } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BakingLog, useBakingLogs } from '../hooks/use-baking-logs';
import { Loader2, CalendarIcon, Star, Plus, AlertCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { BakingLogForm } from '../components/BakingLogForm';
import { MobileLayout } from '@/components/mobile-layout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { generateBreadcrumbSchema } from '@/lib/schema';

const StarterBakingLogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const starterId = parseInt(id);
  const { bakingLogs, isLoading, isError, createBakingLog } = useBakingLogs(starterId);
  const [isNewLogDialogOpen, setIsNewLogDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { toast } = useToast();

  // Create breadcrumb schema
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Tools", url: "/tools" },
    { name: "Baking Journal", url: "/baking-journal" },
    { name: "Starter Baking Log", url: `/starter/baking-log/${id}` }
  ];

  if (isLoading) {
    return (
      <MobileLayout 
        title="Starter Baking Journal" 
        showBackButton 
        backHref="/baking-journal"
        breadcrumbs={breadcrumbItems}
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
        title="Starter Baking Journal" 
        showBackButton 
        backHref="/baking-journal"
        breadcrumbs={breadcrumbItems}
      >
        <div className="p-4 text-red-500">
          Error loading baking logs. Please try again later.
        </div>
      </MobileLayout>
    );
  }

  const handleCreateBakingLog = async (data: any) => {
    try {
      setFormError(null);
      // Ensure date is in ISO format YYYY-MM-DD
      const formattedData = {
        ...data,
        starterId,
        userId: 1, // TODO: Use the actual user ID from auth
        // Format the date properly to avoid validation errors
        bakeDate: data.bakeDate ? new Date(data.bakeDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
      
      await createBakingLog.mutateAsync(formattedData);
      
      // Show success toast
      toast({
        title: "Success!",
        description: "Baking log created successfully",
        variant: "default",
      });
      
      setIsNewLogDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating baking log:", error);
      // Extract error message from the response if available
      let errorMessage = "Failed to create baking log. Please check all required fields.";
      
      if (error.response) {
        try {
          const responseData = error.response.data;
          if (responseData && responseData.message) {
            errorMessage = responseData.message;
            
            // Special handling for date validation errors
            if (errorMessage.includes("Invalid datetime at bakeDate")) {
              errorMessage = "Date format error: Please ensure the date is valid and properly formatted (YYYY-MM-DD).";
              // Could also set a form error specifically on the date field
              setFormError("Please check the date format and try again.");
            }
          }
        } catch (e) {
          // If we can't parse the response, use the error message
          errorMessage = error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show error toast
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      setFormError(errorMessage);
    }
  };

  return (
    <MobileLayout 
      title="Starter Baking Journal" 
      showBackButton 
      backHref="/baking-journal"
      breadcrumbs={breadcrumbItems}
    >
      <SEO
        title="Sourdough Starter Baking Log | Track Performance & Results"
        description="Monitor your sourdough starter's performance with detailed baking logs. Track metrics for oven spring, crumb structure, crust quality, and flavor across different recipes."
        keywords={['sourdough baking log', 'starter performance tracking', 'bread baking results', 'sourdough metrics', 'crumb structure analysis', 'oven spring tracking']}
        canonicalUrl={`/starter/baking-log/${id}`}
        structuredData={generateBreadcrumbSchema(breadcrumbItems)}
      />
      <div className="px-4 space-y-4">
        <div className="flex justify-end mb-2">
          <Dialog open={isNewLogDialogOpen} onOpenChange={setIsNewLogDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add Baking Log
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-w-[95vw] overflow-y-auto max-h-[90vh] p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>New Baking Log</DialogTitle>
                <DialogDescription>
                  Record the results of your bake with this starter
                </DialogDescription>
              </DialogHeader>
              {formError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
                  <p>{formError}</p>
                </div>
              )}
              <BakingLogForm onSubmit={handleCreateBakingLog} isLoading={createBakingLog.isPending} />
            </DialogContent>
          </Dialog>
        </div>

      {bakingLogs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No baking logs found for this starter.</p>
            <Button 
              variant="outline" 
              onClick={() => setIsNewLogDialogOpen(true)}
              className="mx-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Baking Log
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card className="max-w-full overflow-hidden">
            <CardHeader>
              <CardTitle>Baking Performance History</CardTitle>
              <CardDescription>
                Track how this starter performs with different recipes
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0 overflow-x-auto max-w-full">
              {/* Mobile view - Simplified layout that matches the app design in screenshot */}
              <div className="md:hidden w-full overflow-hidden">
                {/* Header row */}
                <div className="flex px-1 py-2 bg-muted/50 text-[10px] font-medium">
                  <div className="w-[40px]">Date</div>
                  <div className="w-[80px]">Recipe</div>
                  <div className="w-[34px] text-center">Overall</div>
                  <div className="w-[34px] text-center">Spring</div>
                  <div className="w-[34px] text-center">Crumb</div>
                  <div className="w-[34px] text-center">Crust</div>
                  <div className="w-[34px] text-center">Flavor</div>
                </div>
                
                {/* Baking log rows */}
                <div className="divide-y divide-border">
                  {bakingLogs.map((log) => (
                    <div key={log.id} className="flex items-center py-3 px-1 hover:bg-muted/30">
                      <div className="w-[40px] text-xs">
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-0.5 text-muted-foreground" />
                          {format(new Date(log.bakeDate), 'M/d')}
                        </div>
                      </div>
                      <div className="w-[80px] text-xs font-medium truncate">
                        {log.recipeName}
                      </div>
                      <div className="w-[34px] flex justify-center">
                        <MobileRatingWithStar rating={log.overallRating} />
                      </div>
                      <div className="w-[34px] flex justify-center">
                        <MobileRatingWithStar rating={log.ovenSpringRating} />
                      </div>
                      <div className="w-[34px] flex justify-center">
                        <MobileRatingWithStar rating={log.crumbStructureRating} />
                      </div>
                      <div className="w-[34px] flex justify-center">
                        <MobileRatingWithStar rating={log.crustQualityRating} />
                      </div>
                      <div className="w-[34px] flex justify-center">
                        <MobileRatingWithStar rating={log.flavorRating} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Desktop view - Full table with all information */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Recipe</TableHead>
                        <TableHead>Overall</TableHead>
                        <TableHead>Spring</TableHead>
                        <TableHead>Crumb</TableHead>
                        <TableHead>Crust</TableHead>
                        <TableHead>Flavor</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bakingLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                              {format(new Date(log.bakeDate), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>{log.recipeName}</TableCell>
                          <TableCell><RatingBadge rating={log.overallRating} /></TableCell>
                          <TableCell><RatingBadge rating={log.ovenSpringRating} /></TableCell>
                          <TableCell><RatingBadge rating={log.crumbStructureRating} /></TableCell>
                          <TableCell><RatingBadge rating={log.crustQualityRating} /></TableCell>
                          <TableCell><RatingBadge rating={log.flavorRating} /></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </MobileLayout>
  );
};

const RatingBadge: React.FC<{ rating?: number }> = ({ rating }) => {
  if (!rating) return <span className="text-muted-foreground">N/A</span>;
  
  let color = "bg-yellow-100 text-yellow-800";
  if (rating >= 8) {
    color = "bg-green-100 text-green-800";
  } else if (rating <= 4) {
    color = "bg-red-100 text-red-800";
  }
  
  return (
    <Badge className={`flex items-center justify-center ${color} font-medium text-xs px-2 py-1`} variant="outline">
      {rating}
      <Star className="h-3 w-3 ml-0.5 fill-current" />
    </Badge>
  );
};

// Simple rating component for mobile view - ultra compact
const MobileRating: React.FC<{ rating?: number }> = ({ rating }) => {
  if (!rating) return <span className="text-muted-foreground text-xs">-</span>;
  
  // Color coding based on rating value
  let textColor = "text-yellow-600";
  if (rating >= 8) {
    textColor = "text-green-600";
  } else if (rating <= 4) {
    textColor = "text-red-600";
  }
  
  return (
    <div className={`text-xs font-semibold flex items-center justify-center ${textColor}`}>
      {rating}
    </div>
  );
};

// Rating with star icon for mobile view
const MobileRatingWithStar: React.FC<{ rating?: number }> = ({ rating }) => {
  if (!rating) return <span className="text-muted-foreground text-xs">-</span>;
  
  // Color coding based on rating value
  let textColor = "text-yellow-600";
  if (rating >= 8) {
    textColor = "text-green-600";
  } else if (rating <= 4) {
    textColor = "text-red-600";
  }
  
  return (
    <div className={`text-[10px] font-medium flex items-center justify-center ${textColor}`}>
      {rating}<Star className="h-2 w-2 ml-0.5 fill-current" />
    </div>
  );
};

export default StarterBakingLogPage;