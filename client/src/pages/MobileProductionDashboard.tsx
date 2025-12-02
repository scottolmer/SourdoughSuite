import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Timer, 
  CheckCircle, 
  Play, 
  Clock, 
  Circle, 
  AlertTriangle,
  Plus,
  Bell,
  Thermometer,
  Users,
  Zap,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ProductionBatch } from "@shared/schema";

export default function MobileProductionDashboard() {
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    currentPhase: '',
    notes: '',
    actualQuantity: ''
  });
  const [createForm, setCreateForm] = useState({
    batchName: '',
    recipeName: '',
    plannedQuantity: '',
    assignedBaker: '',
    ovenSlot: '',
    priority: '2',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: batches = [], isLoading, refetch } = useQuery<ProductionBatch[]>({
    queryKey: ['/api/production/batches'],
    refetchInterval: 30000 // Refresh every 30 seconds for real-time updates
  });

  const updateBatchMutation = useMutation({
    mutationFn: (data: { id: number; updates: any }) => 
      apiRequest(`/api/production/batches/${data.id}`, {
        method: 'PUT',
        body: data.updates
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/production/batches'] });
      setShowUpdateModal(false);
      setSelectedBatch(null);
    }
  });

  const createBatchMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('/api/production/batches', {
        method: 'POST',
        body: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/production/batches'] });
      setShowCreateModal(false);
      setCreateForm({
        batchName: '',
        recipeName: '',
        plannedQuantity: '',
        assignedBaker: '',
        ovenSlot: '',
        priority: '2',
        notes: ''
      });
    }
  });

  // Filter active batches for mobile focus
  const activeBatches = batches.filter((batch) => 
    ['active', 'baking', 'proofing'].includes(batch.status)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'baking': return 'bg-orange-500';
      case 'proofing': return 'bg-yellow-500';
      case 'planned': return 'bg-gray-400';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'active': return <Play className="h-4 w-4" />;
      case 'baking': return <Timer className="h-4 w-4" />;
      case 'proofing': return <Clock className="h-4 w-4" />;
      case 'planned': return <Circle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const handleQuickUpdate = (batch: ProductionBatch) => {
    setSelectedBatch(batch);
    setUpdateForm({
      status: batch.status,
      currentPhase: batch.currentPhase || '',
      notes: batch.notes || '',
      actualQuantity: batch.actualQuantity?.toString() || ''
    });
    setShowUpdateModal(true);
  };

  const handleStatusChange = (newStatus: string) => {
    if (!selectedBatch) return;
    
    const updates: any = { 
      status: newStatus,
      currentPhase: updateForm.currentPhase,
      notes: updateForm.notes
    };
    
    if (updateForm.actualQuantity) {
      updates.actualQuantity = parseInt(updateForm.actualQuantity);
    }
    
    if (newStatus === 'completed') {
      updates.actualFinishTime = new Date();
    } else if (newStatus === 'active' && selectedBatch.status === 'planned') {
      updates.actualStartTime = new Date();
    }

    updateBatchMutation.mutate({
      id: selectedBatch.id,
      updates
    });
  };

  const handleCreateBatch = () => {
    const now = new Date();
    const plannedStart = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
    const plannedFinish = new Date(plannedStart.getTime() + 10 * 60 * 60 * 1000); // 10 hours later
    
    const newBatch = {
      userId: 1, // Default user ID
      batchName: createForm.batchName,
      recipeName: createForm.recipeName,
      plannedQuantity: parseInt(createForm.plannedQuantity),
      plannedStartTime: plannedStart.toISOString(),
      plannedFinishTime: plannedFinish.toISOString(),
      status: 'planned',
      currentPhase: 'mixing',
      ovenSlot: createForm.ovenSlot ? parseInt(createForm.ovenSlot) : null,
      assignedBaker: createForm.assignedBaker,
      priority: parseInt(createForm.priority),
      costPerUnit: 450, // Default cost
      sellingPrice: 1100, // Default price
      estimatedProfit: 650, // Default profit
      notes: createForm.notes
    };

    createBatchMutation.mutate(newBatch);
  };

  const formatTime = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeRemaining = (finishTime: string | Date) => {
    const now = new Date().getTime();
    const finish = typeof finishTime === 'string' ? new Date(finishTime).getTime() : finishTime.getTime();
    const remaining = finish - now;
    
    if (remaining <= 0) return 'Overdue';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Key metrics for mobile view
  const metrics = {
    activeCount: activeBatches.length,
    completedToday: batches.filter((b) => b.status === 'completed').length,
    urgentCount: activeBatches.filter((b) => b.priority === 1).length,
    ovenUtilization: Math.round((activeBatches.filter((b) => b.status === 'baking').length / 4) * 100)
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Production Dashboard</h1>
            <p className="text-sm text-gray-600">{activeBatches.length} active batches</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              size="sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Batch
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Quick Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-lg font-bold">{metrics.activeCount}</div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-lg font-bold">{metrics.completedToday}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-lg font-bold">{metrics.urgentCount}</div>
                <div className="text-xs text-gray-600">Urgent</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-lg font-bold">{metrics.ovenUtilization}%</div>
                <div className="text-xs text-gray-600">Oven Use</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Batches */}
        <div className="space-y-3">
          <h2 className="text-md font-semibold text-gray-900 flex items-center gap-2">
            <Play className="h-4 w-4" />
            Active Batches
          </h2>
          
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading batches...</div>
          ) : activeBatches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No active batches</div>
          ) : (
            activeBatches.map((batch) => (
              <Card key={batch.id} className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {batch.batchName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {batch.recipeName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          className={`${getStatusColor(batch.status)} text-white text-xs px-2 py-0.5`}
                        >
                          {getStatusIcon(batch.status)}
                          <span className="ml-1 capitalize">{batch.status}</span>
                        </Badge>
                        {batch.priority === 1 && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600 ml-2">
                      <div>{batch.plannedQuantity} units</div>
                      <div className="text-xs">
                        {formatTime(batch.plannedFinishTime)}
                      </div>
                    </div>
                  </div>

                  {/* Progress & Details */}
                  <div className="space-y-2">
                    {batch.currentPhase && (
                      <div className="text-sm">
                        <span className="text-gray-600">Phase: </span>
                        <span className="font-medium capitalize">
                          {batch.currentPhase.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {batch.assignedBaker}
                      </span>
                      <span className="text-gray-600">
                        Oven {batch.ovenSlot}
                      </span>
                    </div>

                    {batch.status !== 'completed' && (
                      <div className="text-xs text-gray-600">
                        Time remaining: {getTimeRemaining(batch.plannedFinishTime)}
                      </div>
                    )}

                    {batch.notes && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {batch.notes}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleQuickUpdate(batch)}
                    >
                      Update Status
                    </Button>
                    {batch.status === 'active' && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedBatch(batch);
                          handleStatusChange('baking');
                        }}
                      >
                        Start Baking
                      </Button>
                    )}
                    {batch.status === 'baking' && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedBatch(batch);
                          handleStatusChange('completed');
                        }}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create New Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
          <div className="w-full bg-white rounded-t-lg p-4 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Add New Batch</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Batch Name</label>
                <Input
                  value={createForm.batchName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, batchName: e.target.value }))}
                  placeholder="Morning Sourdough - Batch A"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Recipe Name</label>
                <Input
                  value={createForm.recipeName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, recipeName: e.target.value }))}
                  placeholder="Classic Country Sourdough"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    value={createForm.plannedQuantity}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, plannedQuantity: e.target.value }))}
                    placeholder="12"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Oven Slot</label>
                  <Input
                    type="number"
                    value={createForm.ovenSlot}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, ovenSlot: e.target.value }))}
                    placeholder="1"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Assigned Baker</label>
                <Input
                  value={createForm.assignedBaker}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, assignedBaker: e.target.value }))}
                  placeholder="Sarah M."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Priority</label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3].map(priority => (
                    <Button
                      key={priority}
                      size="sm"
                      variant={createForm.priority === priority.toString() ? "default" : "outline"}
                      onClick={() => setCreateForm(prev => ({ ...prev, priority: priority.toString() }))}
                    >
                      {priority === 1 ? 'High' : priority === 2 ? 'Medium' : 'Low'}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this batch..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <Button 
              className="w-full"
              onClick={handleCreateBatch}
              disabled={createBatchMutation.isPending || !createForm.batchName || !createForm.recipeName || !createForm.plannedQuantity}
            >
              {createBatchMutation.isPending ? 'Creating...' : 'Create Batch'}
            </Button>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedBatch && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
          <div className="w-full bg-white rounded-t-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Update Batch</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {['planned', 'active', 'baking', 'proofing', 'completed', 'cancelled'].map(status => (
                    <Button
                      key={status}
                      size="sm"
                      variant={updateForm.status === status ? "default" : "outline"}
                      onClick={() => setUpdateForm(prev => ({ ...prev, status }))}
                      className="capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Current Phase</label>
                <Input
                  value={updateForm.currentPhase}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, currentPhase: e.target.value }))}
                  placeholder="e.g., bulk_fermentation, shaping"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Actual Quantity</label>
                <Input
                  type="number"
                  value={updateForm.actualQuantity}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, actualQuantity: e.target.value }))}
                  placeholder="Final quantity produced"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about this batch..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <Button 
              className="w-full"
              onClick={() => handleStatusChange(updateForm.status)}
              disabled={updateBatchMutation.isPending}
            >
              {updateBatchMutation.isPending ? 'Updating...' : 'Update Batch'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}