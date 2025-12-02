import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { MobileLayout } from "@/components/mobile-layout";
import { useStarters } from "@/hooks/use-starters";
import { useAddHealthLog } from "@/hooks/use-health-logs";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Camera, Flame, Loader2, ThumbsUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form schema for health check
const healthCheckSchema = z.object({
  logDate: z.date().default(new Date()),
  activityRating: z.number().min(1).max(10).optional(),
  riseHeight: z.number().min(0).max(500).optional(),
  smell: z.string().optional(),
  appearance: z.string().optional(),
  temperature: z.number().min(32).max(110).optional(),
  lastFedTimestamp: z.date().optional(),
  photoUrl: z.string().optional(),
  notes: z.string().optional(),
  consistency: z.string().optional(),
});

type HealthCheckFormValues = z.infer<typeof healthCheckSchema>;

export function StarterHealthCheckPage() {
  const { id } = useParams<{ id: string }>();
  const starterId = parseInt(id);
  const [, navigate] = useLocation();
  const [submitting, setSubmitting] = useState(false);

  // Get the starter details
  const { data: starters, isLoading: isLoadingStarter } = useStarters();
  const starter = starters?.find(s => s.id === starterId);
  
  // Setup form with react-hook-form and zod validation
  const form = useForm<HealthCheckFormValues>({
    resolver: zodResolver(healthCheckSchema),
    defaultValues: {
      logDate: new Date(),
      activityRating: 5,
      temperature: 72,
      lastFedTimestamp: new Date(),
    },
  });
  
  // Use the mutation hook
  const { mutate: addHealthLog, isPending } = useAddHealthLog();
  
  // Handle form submission
  const onSubmit = (data: HealthCheckFormValues) => {
    setSubmitting(true);
    
    // Get user ID from localStorage or context
    // This is a placeholder - in a real app you would get it from auth
    const userId = 1; 
    
    addHealthLog({
      ...data,
      starterId,
      userId,
    }, {
      onSuccess: () => {
        setSubmitting(false);
        // Navigate back to health log page after successful submission
        navigate(`/starter/health-log/${starterId}`);
      },
      onError: () => {
        setSubmitting(false);
      }
    });
  };
  
  // Loading states
  if (isLoadingStarter) {
    return (
      <MobileLayout title="Health Check" showBackButton>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </MobileLayout>
    );
  }
  
  // Error state
  if (!starter) {
    return (
      <MobileLayout title="Health Check" showBackButton>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">Starter not found</div>
          <p className="text-muted-foreground">The starter you're looking for doesn't exist.</p>
          <Button asChild>
            <a href="/starter/maintenance">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Maintenance
            </a>
          </Button>
        </div>
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout title={`${starter.name} Health Check`} showBackButton>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{starter.name}</h1>
        <p className="text-muted-foreground">
          Track your starter's health by recording its current condition.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Activity Rating slider */}
            <FormField
              control={form.control}
              name="activityRating"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex justify-between items-center">
                    <FormLabel>Activity Rating (1-10)</FormLabel>
                    <span className="font-medium text-sm">
                      {field.value}/10
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      value={field.value !== undefined ? [field.value] : [5]}
                      onValueChange={(values) => field.onChange(values[0])}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                      <span>Inactive</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>
                      <span>Moderate</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      <span>Very Active</span>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Room Temperature slider */}
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex justify-between items-center">
                    <FormLabel>Room Temperature (°F)</FormLabel>
                    <span className="font-medium text-sm">
                      {field.value}°F
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      value={field.value !== undefined ? [field.value] : [72]}
                      onValueChange={(values) => field.onChange(values[0])}
                      min={60}
                      max={85}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Rise Height */}
            <FormField
              control={form.control}
              name="riseHeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rise Height (mm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      placeholder="0" 
                    />
                  </FormControl>
                  <FormDescription>
                    The height your starter has risen since feeding
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Consistency */}
            <FormField
              control={form.control}
              name="consistency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consistency</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select consistency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="liquid">Liquid</SelectItem>
                      <SelectItem value="thin">Thin</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="thick">Thick</SelectItem>
                      <SelectItem value="stretchy">Stretchy</SelectItem>
                      <SelectItem value="doughy">Doughy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The texture and consistency of your starter
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Smell */}
            <FormField
              control={form.control}
              name="smell"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Smell</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g. fruity, yogurt-like, vinegary..." 
                    />
                  </FormControl>
                  <FormDescription>
                    Common smell descriptors:
                  </FormDescription>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[
                      "Fruity", "Yogurt", "Vinegary", "Sour", "Sweet", 
                      "Alcoholic", "Yeasty", "Nutty", "Tangy", "Acidic"
                    ].map((desc) => (
                      <Button
                        key={desc}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs py-0 h-7"
                        onClick={() => {
                          // If there's already text, add a comma
                          const prefix = field.value && field.value.trim() !== "" ? `${field.value}, ` : "";
                          field.onChange(`${prefix}${desc.toLowerCase()}`);
                        }}
                      >
                        {desc}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Appearance */}
            <FormField
              control={form.control}
              name="appearance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appearance</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g. bubbly, flat, liquid on top..." 
                    />
                  </FormControl>
                  <FormDescription>
                    Common appearance descriptors:
                  </FormDescription>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[
                      "Bubbly", "Frothy", "Flat", "Holey", "Dense", 
                      "Liquid on top", "Collapsed", "Domed", "Airy", "Stringy"
                    ].map((desc) => (
                      <Button
                        key={desc}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs py-0 h-7"
                        onClick={() => {
                          const prefix = field.value && field.value.trim() !== "" ? `${field.value}, ` : "";
                          field.onChange(`${prefix}${desc.toLowerCase()}`);
                        }}
                      >
                        {desc}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Last Fed Timestamp */}
            <FormField
              control={form.control}
              name="lastFedTimestamp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Fed</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        field.onChange(date);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    When did you last feed your starter?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Any other observations..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Photo URL (in a real app, would be a file input) */}
            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo URL (Optional)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://example.com/image.jpg" 
                      />
                    </FormControl>
                    <Button type="button" variant="outline" size="icon">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>
                    Provide a URL to an image of your starter
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting || isPending}
            >
              {submitting || isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Save Health Log
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </MobileLayout>
  );
}