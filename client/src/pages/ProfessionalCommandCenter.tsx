import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Circle,
  Play,
  Pause,
  Calendar,
  DollarSign,
  Target,
  BarChart3,
  Factory,
  Timer,
  User,
  Package,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import type { ProductionBatch, InsertProductionBatch } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface DashboardMetrics {
  totalBatches: number;
  activeBatches: number;
  completedToday: number;
  ovenUtilization: number;
  projectedRevenue: number;
  actualRevenue: number;
  efficiency: number;
}

export function ProfessionalCommandCenter() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch production batches
  const { data: batches = [], isLoading: batchesLoading } = useQuery<ProductionBatch[]>({
    queryKey: ['/api/production/batches', selectedDate],
    enabled: true,
  });

  // Calculate dashboard metrics
  const metrics: DashboardMetrics = {
    totalBatches: batches.length,
    activeBatches: batches.filter(b => b.status === 'active').length,
    completedToday: batches.filter(b => b.status === 'completed').length,
    ovenUtilization: 75, // Calculated from oven usage
    projectedRevenue: batches.reduce((sum, b) => sum + (b.plannedQuantity * (b.sellingPrice || 0)), 0) / 100,
    actualRevenue: batches.filter(b => b.status === 'completed').reduce((sum, b) => sum + ((b.actualQuantity || b.plannedQuantity) * (b.sellingPrice || 0)), 0) / 100,
    efficiency: 85 // Overall production efficiency
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'baking': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'proofing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planned': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600';
      case 2: return 'text-orange-600'; 
      case 3: return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Professional Baker's Command Center</h1>
              <p className="text-gray-600 mt-1">Manage production schedules, track batches, and optimize operations</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto"
              />
              <Button variant="outline" className="w-full sm:w-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Batches</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalBatches}</p>
              </div>
              <Factory className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {metrics.activeBatches} active • {metrics.completedToday} completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Oven Utilization</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.ovenUtilization}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <Progress value={metrics.ovenUtilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Today</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.actualRevenue.toFixed(0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Target: ${metrics.projectedRevenue.toFixed(0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.efficiency}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={metrics.efficiency} className="mt-2" />
          </CardContent>
            </Card>
          </div>

          {/* Production Timeline */}
          <Card>
            <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Production Schedule - {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
            </CardTitle>
            <Button size="sm">
              Add Batch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {batchesLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading production batches...</span>
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Factory className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No production batches scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(batch.status)} flex items-center gap-1`}>
                        {getStatusIcon(batch.status)}
                        {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                      </Badge>
                      <h3 className="font-semibold text-gray-900">{batch.batchName}</h3>
                      <span className={`text-sm font-medium ${getPriorityColor(batch.priority || 3)}`}>
                        Priority {batch.priority || 3}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      {batch.assignedBaker}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">{batch.recipeName}</p>
                      <p className="text-gray-500">{batch.plannedQuantity} loaves planned</p>
                      {batch.currentPhase && (
                        <Badge variant="outline" className="mt-1">
                          {batch.currentPhase.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Timeline</span>
                      </div>
                      <p className="text-gray-600">
                        {format(new Date(batch.plannedStartTime), 'HH:mm')} - {format(new Date(batch.plannedFinishTime), 'HH:mm')}
                      </p>
                      {batch.ovenSlot && (
                        <p className="text-gray-500">Oven #{batch.ovenSlot}</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Economics</span>
                      </div>
                      {batch.sellingPrice && batch.costPerUnit && (
                        <p className="text-gray-600">
                          ${((batch.sellingPrice - batch.costPerUnit) / 100).toFixed(2)} profit/loaf
                        </p>
                      )}
                      <p className="text-gray-500 text-xs">
                        Est. Revenue: ${((batch.plannedQuantity * (batch.sellingPrice || 0)) / 100).toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {batch.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>Notes:</strong> {batch.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center gap-2 h-auto p-4" variant="outline">
              <Package className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Inventory Status</div>
                <div className="text-sm text-gray-500">Check ingredient levels</div>
              </div>
            </Button>
            
            <Button className="flex items-center gap-2 h-auto p-4" variant="outline">
              <BarChart3 className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Daily Report</div>
                <div className="text-sm text-gray-500">Generate production summary</div>
              </div>
            </Button>

            <Button className="flex items-center gap-2 h-auto p-4" variant="outline">
              <Users className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Staff Schedule</div>
                <div className="text-sm text-gray-500">Manage baker assignments</div>
              </div>
            </Button>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalCommandCenter;