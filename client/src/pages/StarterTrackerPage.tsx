import { useState } from "react";
import { useStarters } from "@/hooks/use-starters";
import { MobileLayout, MobileCard } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  ArrowRight, 
  Activity, 
  Calendar, 
  Thermometer, 
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Eye,
  BarChart3,
  Droplets
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { format, formatDistanceToNow } from "date-fns";

export function StarterTrackerPage() {
  const { data: starters, isLoading } = useStarters();
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  // Mock health data - in real app would come from API
  const healthData = {
    1: {
      lastFed: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      activityLevel: 8,
      riseTime: "6 hours",
      temperature: 72,
      consistency: "good",
      needsAttention: false
    },
    7: {
      lastFed: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      activityLevel: 9,
      riseTime: "4 hours",
      temperature: 75,
      consistency: "excellent",
      needsAttention: false
    },
    6: {
      lastFed: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
      activityLevel: 6,
      riseTime: "8 hours",
      temperature: 68,
      consistency: "sluggish",
      needsAttention: true
    }
  };

  const getHealthStatus = (starterId: number) => {
    const health = healthData[starterId as keyof typeof healthData];
    if (!health) return { status: "unknown", color: "text-gray-500" };
    
    const hoursSinceLastFed = (Date.now() - health.lastFed.getTime()) / (1000 * 60 * 60);
    
    if (health.needsAttention || hoursSinceLastFed > 24) {
      return { status: "needs attention", color: "text-orange-600" };
    } else if (health.activityLevel >= 8 && hoursSinceLastFed <= 12) {
      return { status: "excellent", color: "text-green-600" };
    } else if (health.activityLevel >= 6) {
      return { status: "good", color: "text-blue-600" };
    } else {
      return { status: "fair", color: "text-yellow-600" };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "good": return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "fair": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "needs attention": return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <MobileLayout title="Starter Tracker" showBackButton>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your starters...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Starter Tracker" showBackButton>
      <SEO
        title="Sourdough Starter Health Tracker | Monitor Activity & Feeding | Bakehouse Breads"
        description="Track your sourdough starter health with comprehensive monitoring tools. Monitor activity levels, feeding schedules, and environmental conditions."
        keywords={['sourdough starter tracker', 'starter health monitoring', 'starter activity tracking', 'feeding schedule tracker', 'starter dashboard']}
      />
      
      <div className="space-y-6">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-950 dark:to-indigo-900 p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Health Dashboard
            </Badge>
          </div>
          <h1 className="text-2xl font-bold mb-3">
            Starter Health Tracker
          </h1>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Monitor the health and activity of all your sourdough starters in one place. 
            Track feeding schedules, activity levels, and environmental conditions.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4 text-purple-600" />
              <span>Real-time monitoring</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Health insights</span>
            </div>
          </div>
        </section>

        {/* Overview Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MobileCard className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{starters?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Active Starters</div>
          </MobileCard>
          
          <MobileCard className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {starters?.filter(s => getHealthStatus(s.id).status === "excellent").length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Excellent Health</div>
          </MobileCard>
          
          <MobileCard className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {starters?.filter(s => getHealthStatus(s.id).status === "needs attention").length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Need Attention</div>
          </MobileCard>
          
          <MobileCard className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">72°F</div>
            <div className="text-xs text-muted-foreground">Avg Temperature</div>
          </MobileCard>
        </section>

        {/* Starter List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Starters</h2>
            <Link href="/shop">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Starter
              </Button>
            </Link>
          </div>
          
          {starters?.length === 0 ? (
            <MobileCard className="p-6 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">No Starters Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start your sourdough journey by getting your first starter from our collection.
                  </p>
                  <Link href="/shop">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Browse Starters
                    </Button>
                  </Link>
                </div>
              </div>
            </MobileCard>
          ) : (
            <div className="space-y-4">
              {starters?.map((starter) => {
                const health = healthData[starter.id as keyof typeof healthData];
                const status = getHealthStatus(starter.id);
                
                return (
                  <MobileCard key={starter.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center">
                            <Droplets className="h-6 w-6 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{starter.name}</h3>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(status.status)}
                              <span className={`text-sm capitalize ${status.color}`}>
                                {status.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {starter.mainFlour}
                        </Badge>
                      </div>
                      
                      {health && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Last Fed</div>
                            <div className="font-medium">
                              {formatDistanceToNow(health.lastFed, { addSuffix: true })}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Activity Level</div>
                            <div className="flex items-center gap-1">
                              <div className="font-medium">{health.activityLevel}/10</div>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i < health.activityLevel / 2 
                                        ? 'bg-green-500' 
                                        : 'bg-muted'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Rise Time</div>
                            <div className="font-medium">{health.riseTime}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Temperature</div>
                            <div className="font-medium">{health.temperature}°F</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Link href={`/starter/health-check/${starter.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            Health Check
                          </Button>
                        </Link>
                        <Link href={`/tools/feeding-calculator`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Activity className="h-4 w-4 mr-2" />
                            Feed Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </MobileCard>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/tools/feeding-calculator">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-sm">Feeding Calculator</h3>
                      <p className="text-xs text-muted-foreground">Calculate precise ratios</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </MobileCard>
            </Link>
            
            <Link href="/starter-school">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-sm">Starter School</h3>
                      <p className="text-xs text-muted-foreground">Learn care techniques</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </MobileCard>
            </Link>
            
            <Link href="/starter-school/troubleshooting">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-sm">Troubleshooting</h3>
                      <p className="text-xs text-muted-foreground">Solve common problems</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </MobileCard>
            </Link>
            
            <Link href="/shop">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Plus className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-sm">Browse Starters</h3>
                      <p className="text-xs text-muted-foreground">Add new starters</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </MobileCard>
            </Link>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}