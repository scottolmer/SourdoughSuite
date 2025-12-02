import { useState } from "react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { MobileLayout } from "@/components/mobile-layout";
import { useStarters } from "@/hooks/use-starters";
import { useStarterHealthLogs, useDeleteHealthLog } from "@/hooks/use-health-logs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Calendar, 
  ChartLine, 
  Flame, 
  Loader2, 
  Microscope,
  Plus, 
  Thermometer, 
  ThumbsUp,
  Trash2
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function StarterHealthLogPage() {
  const { id } = useParams<{ id: string }>();
  const starterId = parseInt(id);
  const [deletingLogId, setDeletingLogId] = useState<number | null>(null);
  
  // Get the starter details and health logs
  const { data: starters, isLoading: isLoadingStarter } = useStarters();
  const starter = starters?.find(s => s.id === starterId);
  
  const { 
    data: healthLogs, 
    isLoading: isLoadingLogs,
    isError,
    error
  } = useStarterHealthLogs(starterId);
  
  const { mutate: deleteLog, isPending: isDeleting } = useDeleteHealthLog();
  
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
  
  // Helper to get activity rating color
  const getActivityColor = (rating: number) => {
    if (rating <= 3) return "text-red-500 bg-red-100 dark:bg-red-950";
    if (rating <= 6) return "text-amber-500 bg-amber-100 dark:bg-amber-950";
    return "text-green-500 bg-green-100 dark:bg-green-950";
  };
  
  // Loading states
  if (isLoadingStarter) {
    return (
      <MobileLayout title="Health Log" showBackButton>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </MobileLayout>
    );
  }
  
  // Error state
  if (!starter) {
    return (
      <MobileLayout title="Health Log" showBackButton>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">Starter not found</div>
          <p className="text-muted-foreground">The starter you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/starter/maintenance">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Maintenance
            </Link>
          </Button>
        </div>
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout title={`${starter.name} Health Log`} showBackButton>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{starter.name}</h1>
          <Button asChild variant="default" size="sm">
            <Link to={`/starter/health-check/${starterId}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Health Log
            </Link>
          </Button>
        </div>
        
        {/* Summary Card - only show if there are logs */}
        {healthLogs && healthLogs.length > 0 && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h3 className="font-medium text-sm mb-3 flex items-center">
              <ThumbsUp className="h-4 w-4 mr-2 text-primary" />
              Current Status
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Latest activity rating */}
              {healthLogs[0].activityRating !== null && healthLogs[0].activityRating !== undefined && (
                <div className="bg-white dark:bg-gray-800 rounded-md p-2 shadow-sm">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center">
                    <Flame className="h-3 w-3 mr-1" />
                    Activity
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className={`text-lg font-semibold ${
                      healthLogs[0].activityRating <= 3 ? 'text-red-500' : 
                      healthLogs[0].activityRating <= 6 ? 'text-amber-500' : 
                      'text-green-500'
                    }`}>
                      {healthLogs[0].activityRating}/10
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {healthLogs[0].activityRating <= 3 ? 'Needs attention' : 
                       healthLogs[0].activityRating <= 6 ? 'Adequate' : 
                       'Excellent'}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Latest temperature */}
              {healthLogs[0].temperature !== null && healthLogs[0].temperature !== undefined && (
                <div className="bg-white dark:bg-gray-800 rounded-md p-2 shadow-sm">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center">
                    <Thermometer className="h-3 w-3 mr-1" />
                    Environment
                  </div>
                  <div className="text-lg font-semibold">{healthLogs[0].temperature}°F</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(healthLogs[0].logDate), "MMM d")}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
        
        {/* Health logs list */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Health History</h2>
          
          {isLoadingLogs ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : isError ? (
            <div className="p-4 border border-destructive/30 bg-destructive/10 rounded-md text-center space-y-2">
              <p className="font-semibold text-destructive">Failed to load health logs</p>
              <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "An unknown error occurred"}</p>
            </div>
          ) : healthLogs && healthLogs.length > 0 ? (
            <div className="space-y-3">
              {healthLogs.map((log) => (
                <Card key={log.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {format(new Date(log.logDate), "PPP 'at' p")}
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
                  
                  {/* Health metrics */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-2">
                    {log.activityRating !== null && log.activityRating !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Flame className="h-3 w-3 mr-1" />
                          Activity Rating
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Badge 
                            variant="outline" 
                            className={`${getActivityColor(log.activityRating)} font-mono`}
                          >
                            {log.activityRating}/10
                          </Badge>
                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full ${log.activityRating <= 3 ? 'bg-red-500' : log.activityRating <= 6 ? 'bg-amber-500' : 'bg-green-500'}`} 
                              style={{ width: `${log.activityRating * 10}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {log.temperature !== null && log.temperature !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Thermometer className="h-3 w-3 mr-1" />
                          Temperature
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded-md text-sm font-medium ${
                            log.temperature < 65 ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 
                            log.temperature > 80 ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                            'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                          }`}>
                            {log.temperature}°F
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {log.temperature < 65 ? 'Cold' : 
                             log.temperature > 80 ? 'Warm' : 
                             'Ideal'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {log.riseHeight !== null && log.riseHeight !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <ChartLine className="h-3 w-3 mr-1" />
                          Rise Height
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="font-medium">{log.riseHeight}mm</div>
                          {log.riseHeight > 0 && (
                            <div className="relative h-6 ml-2">
                              <div className="absolute bottom-0 left-0 w-6 bg-gradient-to-t from-amber-200 to-amber-100 dark:from-amber-700 dark:to-amber-900 rounded-sm"
                                style={{ height: `${Math.min(Math.max(log.riseHeight / 3, 6), 24)}px` }}>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {log.consistency && (
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Microscope className="h-3 w-3 mr-1" />
                          Consistency
                        </div>
                        <div className="font-medium capitalize">{log.consistency}</div>
                      </div>
                    )}
                    
                    {log.lastFedTimestamp && (
                      <div className="col-span-2 space-y-1 border-t pt-2 mt-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          Last Fed
                        </div>
                        <div className="text-sm">
                          {format(new Date(log.lastFedTimestamp), "PPP 'at' p")}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Smell and appearance */}
                  {(log.smell || log.appearance) && (
                    <div className="border-t pt-2 mt-1 grid grid-cols-1 gap-2">
                      {log.smell && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Smell</div>
                          <div className="text-sm">{log.smell}</div>
                        </div>
                      )}
                      
                      {log.appearance && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Appearance</div>
                          <div className="text-sm">{log.appearance}</div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Photo if available */}
                  {log.photoUrl && (
                    <div className="mt-2">
                      <img 
                        src={log.photoUrl} 
                        alt={`Starter on ${format(new Date(log.logDate), "PPP")}`}
                        className="rounded-md w-full h-auto object-cover max-h-48"
                      />
                    </div>
                  )}
                  
                  {/* Notes */}
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
              <p className="text-muted-foreground">No health logs recorded yet.</p>
              <Button asChild variant="secondary" size="sm">
                <Link to={`/starter/health-check/${starterId}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Health Log
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
            <DialogTitle>Delete Health Log</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this health log? This action cannot be undone.
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