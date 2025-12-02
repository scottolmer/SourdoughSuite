import { useState } from "react";
import { useParams, Link } from "wouter";
import { MobileLayout } from "@/components/mobile-layout";
import { useStarters } from "@/hooks/use-starters";
import { useStarterFeedingLogs, useDeleteFeedingLog } from "@/hooks/use-feeding-logs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogContent, Dialog } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Calendar, Droplets, Loader2, Plus, Trash2, Wheat } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function StarterFeedingLogPage() {
  const { id } = useParams<{ id: string }>();
  const starterId = id ? parseInt(id) : undefined;
  const [deletingLogId, setDeletingLogId] = useState<number | null>(null);
  
  // Get the starter details and feeding logs
  const { data: starters, isLoading: isLoadingStarter } = useStarters();
  const starter = starters?.find(s => s.id === starterId);
  
  const { 
    data: feedingLogs, 
    isLoading: isLoadingLogs,
    isError,
    error
  } = useStarterFeedingLogs(starterId || 0);
  
  const { mutate: deleteLog, isPending: isDeleting } = useDeleteFeedingLog();
  
  // Handle delete confirmation
  const openDeleteDialog = (logId: number) => {
    setDeletingLogId(logId);
  };
  
  const handleDeleteConfirm = () => {
    if (deletingLogId) {
      deleteLog({ id: deletingLogId, starterId });
      setDeletingLogId(null);
    }
  };
  
  // Handle close delete dialog
  const handleCloseDialog = () => {
    setDeletingLogId(null);
  };
  
  // Loading states
  if (isLoadingStarter) {
    return (
      <MobileLayout title="Feeding Log" showBackButton>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </MobileLayout>
    );
  }
  
  // Handle no starter ID provided - show starter selection
  if (!starterId) {
    return (
      <MobileLayout title="Select Starter" showBackButton>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Choose a Starter</h1>
            <p className="text-muted-foreground">Select which starter's feeding log you'd like to view</p>
          </div>
          
          {isLoadingStarter ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : starters && starters.length > 0 ? (
            <div className="space-y-3">
              {starters.map((starter) => (
                <Card key={starter.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                  <Link to={`/starter/feeding-log/${starter.id}`} className="block">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{starter.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {starter.mainFlour} starter
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30 space-y-3">
              <p className="text-muted-foreground">No starters found.</p>
              <Button asChild variant="secondary" size="sm">
                <Link to="/starter/maintenance">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Starter
                </Link>
              </Button>
            </div>
          )}
        </div>
      </MobileLayout>
    );
  }

  // Error state
  if (!starter) {
    return (
      <MobileLayout title="Feeding Log" showBackButton>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">Starter not found</div>
          <p className="text-muted-foreground">The starter you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/starter/feeding-log">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Choose Different Starter
            </Link>
          </Button>
        </div>
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout title={`${starter.name} Feeding Log`} showBackButton>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{starter.name}</h1>
          <Button asChild variant="default" size="sm">
            <Link to={`/starter/feeding-calculator/${starterId}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Feeding
            </Link>
          </Button>
        </div>
        
        {/* Feeding logs list */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Feeding History</h2>
          
          {isLoadingLogs ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : isError ? (
            <div className="p-4 border border-destructive/30 bg-destructive/10 rounded-md text-center space-y-2">
              <p className="font-semibold text-destructive">Failed to load feeding logs</p>
              <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "An unknown error occurred"}</p>
            </div>
          ) : feedingLogs && feedingLogs.length > 0 ? (
            <div className="space-y-3">
              {feedingLogs.map((log) => (
                <Card key={log.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {format(new Date(log.feedingDate), "PPP 'at' p")}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <div className="flex items-center text-sm">
                          <div className="bg-amber-100 dark:bg-amber-900 rounded-full w-6 h-6 flex items-center justify-center mr-1.5">
                            <span className="text-xs font-medium">{log.starterAmount}g</span>
                          </div>
                          <span>Starter</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <div className="bg-amber-50 dark:bg-amber-950 rounded-full w-6 h-6 flex items-center justify-center mr-1.5">
                            <Wheat className="h-3 w-3" />
                          </div>
                          <span>{log.flourAmount}g Flour</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <div className="bg-blue-50 dark:bg-blue-950 rounded-full w-6 h-6 flex items-center justify-center mr-1.5">
                            <Droplets className="h-3 w-3" />
                          </div>
                          <span>{log.waterAmount}g Water</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => openDeleteDialog(log.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {log.notes && (
                    <div className="text-sm text-muted-foreground border-t pt-2 mt-1">
                      {log.notes}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30 space-y-3">
              <p className="text-muted-foreground">No feeding logs recorded yet.</p>
              <Button asChild variant="secondary" size="sm">
                <Link to={`/starter/feeding-calculator/${starterId}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Feeding
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingLogId} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Feeding Log</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this feeding log? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}

export default StarterFeedingLogPage;