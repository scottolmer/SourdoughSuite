import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useStarters } from "@/hooks/use-starters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock, AlertTriangle, Loader2, Check } from "lucide-react";
import { format } from "date-fns";
import { useAddFeedingLog, useStarterFeedingLogsByDate, useStarterFeedingLogDates } from "@/hooks/use-feeding-logs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";

export function StarterSchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedStarterId, setSelectedStarterId] = useState<string | undefined>();
  const [location, setLocation] = useLocation();
  const { data: starters, isLoading: isLoadingStarters } = useStarters();
  const { toast } = useToast();
  const { mutate: addFeedingLog, isPending } = useAddFeedingLog();
  
  // Track which feeding is being logged
  const [loggingFeedingId, setLoggingFeedingId] = useState<string | null>(null);
  
  // Check URL for starter ID query parameter
  useEffect(() => {
    if (location) {
      const searchParams = new URLSearchParams(location.split('?')[1]);
      const starterId = searchParams.get('id');
      if (starterId) {
        setSelectedStarterId(starterId);
      }
    }
  }, [location]);
  
  // Get feedings for the selected date
  const { data: loggedFeedings, isLoading: isLoadingFeedings } = 
    useStarterFeedingLogsByDate(selectedStarterId ? parseInt(selectedStarterId) : 0, date);
  
  // Get all dates with feedings for calendar highlighting
  const { data: feedingDates, isLoading: isLoadingDates } = 
    useStarterFeedingLogDates(selectedStarterId ? parseInt(selectedStarterId) : 0);
  
  // Track logged feedings by ID
  const [loggedFeedingIds, setLoggedFeedingIds] = useState<Set<string>>(new Set());
  
  // Process logged feedings to track which feeding times have been logged
  useEffect(() => {
    if (loggedFeedings && loggedFeedings.length > 0) {
      // Initialize a new set to track which feeding times have been logged
      const loggedIds = new Set<string>();
      
      // Morning is before noon, evening is after noon
      const morningCutoff = new Date(date || new Date());
      morningCutoff.setHours(12, 0, 0, 0);
      
      loggedFeedings.forEach(log => {
        const logDate = new Date(log.feedingDate);
        // Check if it's morning or evening based on the time
        if (logDate.getHours() < 12) {
          loggedIds.add("morning");
        } else {
          loggedIds.add("evening");
        }
      });
      
      setLoggedFeedingIds(loggedIds);
    } else {
      setLoggedFeedingIds(new Set());
    }
  }, [loggedFeedings, date]);
  
  // Convert feeding dates to calendar highlight dates
  const highlightedDates = feedingDates ? feedingDates.map(d => new Date(d)) : [];

  // Sample schedule data - in a real app, this would come from a database or user settings
  const feedingTimes = [
    { id: "morning", time: "08:00 AM", label: "Morning Feeding" },
    { id: "evening", time: "06:00 PM", label: "Evening Feeding" },
  ];
  
  // Handle feeding log
  const handleLogFeeding = (feedingId: string) => {
    if (!selectedStarterId) {
      toast({
        variant: "destructive",
        title: "No starter selected",
        description: "Please select a starter first to log a feeding."
      });
      return;
    }
    
    const starterIdNum = parseInt(selectedStarterId);
    
    // Set the logging state to show spinner
    setLoggingFeedingId(feedingId);
    
    // Create a date object with the selected date and the time from the feeding
    const feedingDate = new Date(date || new Date());
    
    // Set time based on feeding ID (morning or evening)
    if (feedingId === "morning") {
      feedingDate.setHours(8, 0, 0, 0); // 8:00 AM
    } else if (feedingId === "evening") {
      feedingDate.setHours(18, 0, 0, 0); // 6:00 PM
    }
    
    // Add default feeding data
    const feedingData = {
      starterId: starterIdNum,
      userId: 1, // Using a default user ID for demo
      flourAmount: 50, // Default to a 1:1:1 ratio
      waterAmount: 50,
      starterAmount: 50,
      flourType: "all-purpose", // Default flour type
      ratio: "1:1:1", // Default ratio
      feedingDate: feedingDate.toISOString(),
      notes: `Quick logged via feeding schedule (${feedingId})` // Add a note about how it was created
    };
    
    addFeedingLog(feedingData, {
      onSuccess: () => {
        toast({
          title: "Feeding logged",
          description: `Successfully logged ${feedingId} feeding for your starter.`
        });
        setLoggingFeedingId(null);
        
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ 
          queryKey: ['/api/starters', starterIdNum, 'feeding-logs', date?.toISOString().split('T')[0]] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['/api/starters', starterIdNum, 'feeding-log-dates'] 
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Failed to log feeding",
          description: error instanceof Error ? error.message : "An unknown error occurred"
        });
        setLoggingFeedingId(null);
      }
    });
  };

  return (
    <MobileLayout title="Feeding Schedule" showBackButton>
      <div className="space-y-6">
        <section className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 p-6">
          <h1 className="text-2xl font-bold mb-2">Starter Feeding Schedule</h1>
          <p className="text-muted-foreground">
            Plan and track your sourdough starter feedings
          </p>
        </section>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Your Starter <span className="text-red-500">*</span></Label>
            <Select 
              value={selectedStarterId} 
              onValueChange={setSelectedStarterId}
            >
              <SelectTrigger className={!selectedStarterId ? "border-amber-300 dark:border-amber-500" : ""}>
                <SelectValue placeholder="Choose a starter (required)" />
              </SelectTrigger>
              <SelectContent>
                {starters?.some(s => s.id === 1) ? null : (
                  <SelectItem key="homemade" value="1">
                    Homemade Starter
                  </SelectItem>
                )}
                {starters?.map((starter) => (
                  <SelectItem key={starter.id} value={starter.id.toString()}>
                    {starter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedStarterId && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Please select a starter to log feedings
              </p>
            )}
          </div>

          <div className="flex flex-col items-center py-2">
            <div className="mb-2 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                {highlightedDates.length > 0 ? (
                  <>
                    <Badge variant="outline" className="mr-2 bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                      Days with recorded feedings
                    </Badge>
                  </>
                ) : (
                  selectedStarterId ? 'No feedings recorded yet' : 'Select a starter to see feeding history'
                )}
              </p>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="border rounded-md"
              modifiers={{
                highlighted: highlightedDates
              }}
              modifiersClassNames={{
                highlighted: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium"
              }}
            />
          </div>

          <div className="pt-4">
            <h2 className="text-lg font-medium mb-3">Scheduled Feedings for {date ? format(date, "MMMM d, yyyy") : "Today"}</h2>
            
            {feedingTimes.map((feeding) => (
              <Card key={feeding.id} className="p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-full">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{feeding.label}</h3>
                      <p className="text-sm text-muted-foreground">{feeding.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {loggedFeedingIds.has(feeding.id) && (
                      <Badge variant="outline" className="bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800 flex items-center">
                        <Check className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
                        Logged
                      </Badge>
                    )}
                    <Button 
                      variant={loggedFeedingIds.has(feeding.id) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleLogFeeding(feeding.id)}
                      disabled={isPending || loggingFeedingId === feeding.id || !selectedStarterId}
                    >
                      {loggingFeedingId === feeding.id ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Logging...
                        </>
                      ) : loggedFeedingIds.has(feeding.id) ? (
                        "Log Again"
                      ) : (
                        "Log Feeding"
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mt-6">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Coming Soon</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Custom feeding schedules and reminders are still in development. 
                    For now, you can use the feeding calculator to log your feedings.
                  </p>
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300 dark:hover:bg-yellow-800"
                      onClick={() => {
                        if (selectedStarterId) {
                          setLocation(`/starter/feeding-calculator/${selectedStarterId}`);
                        } else {
                          setLocation("/starter/feeding-calculator");
                        }
                      }}
                    >
                      Go to Feeding Calculator
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}