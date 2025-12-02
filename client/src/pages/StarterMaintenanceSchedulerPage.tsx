import { useState, useEffect } from "react";
import { MobileLayout, MobileCard } from "@/components/mobile-layout";
import { useStarters } from "@/hooks/use-starters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar,
  Clock,
  Bell,
  Plus,
  CheckCircle,
  AlertTriangle,
  Settings,
  Droplets,
  Thermometer,
  Eye,
  Edit3,
  Trash2,
  X,
  Calculator,
  BookOpen
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { format, addHours, addDays, isAfter, isBefore } from "date-fns";

interface MaintenanceTask {
  id: string;
  starterId: number;
  starterName: string;
  taskType: 'feeding' | 'temperature_check' | 'health_check' | 'discard' | 'refresh';
  scheduledTime: Date;
  isCompleted: boolean;
  notes?: string;
  reminder: boolean;
  frequency: 'once' | 'daily' | 'twice_daily' | 'weekly' | 'bi_weekly';
}

export function StarterMaintenanceSchedulerPage() {
  const { data: starters, isLoading } = useStarters();
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedView, setSelectedView] = useState<'today' | 'week' | 'all'>('today');
  const [quickActionType, setQuickActionType] = useState<string | null>(null);
  
  // Mock tasks - in real app would come from API
  useEffect(() => {
    const mockTasks: MaintenanceTask[] = [
      {
        id: '1',
        starterId: 1,
        starterName: 'Homemade Starter',
        taskType: 'feeding',
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        isCompleted: false,
        reminder: true,
        frequency: 'twice_daily'
      },
      {
        id: '2',
        starterId: 7,
        starterName: 'San Francisco Style Sourdough Starter',
        taskType: 'feeding',
        scheduledTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        isCompleted: false,
        reminder: true,
        frequency: 'twice_daily'
      },
      {
        id: '3',
        starterId: 1,
        starterName: 'Homemade Starter',
        taskType: 'health_check',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        isCompleted: false,
        reminder: true,
        frequency: 'weekly'
      },
      {
        id: '4',
        starterId: 7,
        starterName: 'San Francisco Style Sourdough Starter',
        taskType: 'discard',
        scheduledTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (overdue)
        isCompleted: false,
        reminder: false,
        frequency: 'weekly'
      }
    ];
    setTasks(mockTasks);
  }, []);

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'feeding': return <Droplets className="h-4 w-4" />;
      case 'temperature_check': return <Thermometer className="h-4 w-4" />;
      case 'health_check': return <Eye className="h-4 w-4" />;
      case 'discard': return <Trash2 className="h-4 w-4" />;
      case 'refresh': return <Settings className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTaskColor = (taskType: string) => {
    switch (taskType) {
      case 'feeding': return 'text-blue-600';
      case 'temperature_check': return 'text-orange-600';
      case 'health_check': return 'text-green-600';
      case 'discard': return 'text-red-600';
      case 'refresh': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getTaskStatus = (task: MaintenanceTask) => {
    if (task.isCompleted) return { status: 'completed', color: 'text-green-600' };
    
    const now = new Date();
    const timeDiff = task.scheduledTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 0) return { status: 'overdue', color: 'text-red-600' };
    if (hoursDiff < 1) return { status: 'due_soon', color: 'text-orange-600' };
    return { status: 'scheduled', color: 'text-gray-600' };
  };

  const getFilteredTasks = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const weekEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    switch (selectedView) {
      case 'today':
        return tasks.filter(task => 
          task.scheduledTime >= todayStart && task.scheduledTime < todayEnd
        );
      case 'week':
        return tasks.filter(task => 
          task.scheduledTime >= todayStart && task.scheduledTime < weekEnd
        );
      default:
        return tasks;
    }
  };

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, isCompleted: true } : task
    ));
  };

  const handleQuickAction = (actionType: string) => {
    switch (actionType) {
      case 'feeding':
        // Redirect to feeding calculator
        window.location.href = '/tools/feeding-calculator';
        break;
      case 'health_check':
        // Redirect to health check tool or open modal
        setQuickActionType('health_check');
        break;
      case 'temperature_check':
        setQuickActionType('temperature_check');
        break;
      case 'refresh':
        setQuickActionType('refresh');
        break;
      default:
        setShowAddTask(true);
    }
  };

  const getPendingTasksCount = () => {
    return tasks.filter(task => !task.isCompleted).length;
  };

  const getOverdueTasksCount = () => {
    const now = new Date();
    return tasks.filter(task => !task.isCompleted && task.scheduledTime < now).length;
  };

  if (isLoading) {
    return (
      <MobileLayout title="Maintenance Scheduler" showBackButton>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading scheduler...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Maintenance Scheduler" showBackButton>
      <SEO
        title="Sourdough Starter Maintenance Scheduler | Automated Care Reminders | Bakehouse Breads"
        description="Schedule and track sourdough starter maintenance tasks with automated reminders for feeding, health checks, and care routines."
        keywords={['starter maintenance', 'feeding schedule', 'sourdough care', 'starter reminders', 'maintenance tracking']}
      />
      
      <div className="space-y-6">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-br from-green-50 to-blue-100 dark:from-green-950 dark:to-blue-900 p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Smart Scheduling
            </Badge>
          </div>
          <h1 className="text-2xl font-bold mb-3">
            Maintenance Scheduler
          </h1>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Never miss a feeding or health check with automated scheduling and reminders 
            for all your sourdough starters.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Bell className="h-4 w-4 text-green-600" />
              <span>Smart reminders</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span>Progress tracking</span>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-4">
          <MobileCard className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{getPendingTasksCount()}</div>
            <div className="text-xs text-muted-foreground">Pending Tasks</div>
          </MobileCard>
          
          <MobileCard className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{getOverdueTasksCount()}</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </MobileCard>
          
          <MobileCard className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{starters?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Active Starters</div>
          </MobileCard>
        </section>

        {/* View Filter */}
        <section className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="all">All Tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAddTask(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </section>

        {/* Tasks List */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            {selectedView === 'today' && 'Today\'s Tasks'}
            {selectedView === 'week' && 'This Week\'s Tasks'}
            {selectedView === 'all' && 'All Tasks'}
          </h2>
          
          {getFilteredTasks().length === 0 ? (
            <MobileCard className="p-6 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">No Tasks Scheduled</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedView === 'today' && 'No maintenance tasks scheduled for today.'}
                    {selectedView === 'week' && 'No tasks scheduled for this week.'}
                    {selectedView === 'all' && 'You haven\'t scheduled any maintenance tasks yet.'}
                  </p>
                  <Button onClick={() => setShowAddTask(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule First Task
                  </Button>
                </div>
              </div>
            </MobileCard>
          ) : (
            <div className="space-y-3">
              {getFilteredTasks()
                .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
                .map((task) => {
                  const status = getTaskStatus(task);
                  
                  return (
                    <MobileCard key={task.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`${getTaskColor(task.taskType)} bg-gray-100 dark:bg-gray-800 p-2 rounded-lg`}>
                              {getTaskIcon(task.taskType)}
                            </div>
                            <div>
                              <h3 className="font-semibold capitalize">
                                {task.taskType.replace('_', ' ')}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {task.starterName}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`text-sm font-medium ${status.color}`}>
                              {status.status === 'completed' && 'Completed'}
                              {status.status === 'overdue' && 'Overdue'}
                              {status.status === 'due_soon' && 'Due Soon'}
                              {status.status === 'scheduled' && 'Scheduled'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(task.scheduledTime, 'MMM d, h:mm a')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {task.frequency.replace('_', ' ')}
                            </Badge>
                            {task.reminder && (
                              <div className="flex items-center gap-1">
                                <Bell className="h-3 w-3" />
                                <span className="text-xs">Reminder set</span>
                              </div>
                            )}
                          </div>
                          
                          {!task.isCompleted && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => completeTask(task.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                        
                        {task.notes && (
                          <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {task.notes}
                          </div>
                        )}
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
          
          <div className="grid grid-cols-2 gap-4">
            <Link href="/tools/feeding-calculator">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="text-center space-y-2">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg w-fit mx-auto">
                    <Calculator className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-sm">Feeding Calculator</h3>
                  <p className="text-xs text-muted-foreground">Calculate precise ratios</p>
                </div>
              </MobileCard>
            </Link>
            
            <Link href="/tools/starter-tracker">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="text-center space-y-2">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg w-fit mx-auto">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-sm">Health Tracker</h3>
                  <p className="text-xs text-muted-foreground">Monitor starter health</p>
                </div>
              </MobileCard>
            </Link>
            
            <Link href="/starter-school/temperature-guide">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="text-center space-y-2">
                  <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg w-fit mx-auto">
                    <Thermometer className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-sm">Temperature Guide</h3>
                  <p className="text-xs text-muted-foreground">Environmental tips</p>
                </div>
              </MobileCard>
            </Link>
            
            <Link href="/starter-school">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="text-center space-y-2">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg w-fit mx-auto">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-sm">Starter School</h3>
                  <p className="text-xs text-muted-foreground">Learn care techniques</p>
                </div>
              </MobileCard>
            </Link>
          </div>
        </section>

        {/* Task Creation Modal */}
        <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
          <DialogContent className="w-full max-w-lg mx-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Task</DialogTitle>
              <DialogDescription>
                Create a new maintenance task for your sourdough starters
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="task-type">Task Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feeding">Feeding</SelectItem>
                      <SelectItem value="health_check">Health Check</SelectItem>
                      <SelectItem value="temperature_check">Temperature Check</SelectItem>
                      <SelectItem value="discard">Discard</SelectItem>
                      <SelectItem value="refresh">Refresh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="starter">Starter</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select starter" />
                    </SelectTrigger>
                    <SelectContent>
                      {starters?.map((starter) => (
                        <SelectItem key={starter.id} value={starter.id.toString()}>
                          {starter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                </div>
                
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input type="time" defaultValue="09:00" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">One time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice_daily">Twice daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="reminder" className="rounded" />
                <Label htmlFor="reminder">Send reminder notifications</Label>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea 
                  placeholder="Add any specific notes for this maintenance task..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddTask(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setShowAddTask(false)} className="flex-1">
                  Schedule Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}