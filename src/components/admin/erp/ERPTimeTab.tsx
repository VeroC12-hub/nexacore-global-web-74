import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Clock,
  Play,
  Pause,
  Square,
  Calendar,
  Timer,
  BarChart3,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface TimeEntry {
  id: string;
  user_id: string;
  user_name: string;
  project_id: string;
  project_title: string;
  task_id?: string;
  task_title?: string;
  description: string;
  start_time: string;
  end_time: string | null;
  hours: number;
  rate: number;
  billable: boolean;
  status: 'active' | 'completed';
  created_at: string;
}

interface ERPTimeTabProps {
  timeEntries: TimeEntry[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  userFilter: string;
  setUserFilter: (user: string) => void;
  onCreateTimeEntry: () => void;
  onEditTimeEntry: (entry: TimeEntry) => void;
  onStartTimer: (projectId: string, taskId?: string) => void;
  onStopTimer: (entryId: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ERPTimeTab({
  timeEntries,
  loading,
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  userFilter,
  setUserFilter,
  onCreateTimeEntry,
  onEditTimeEntry,
  onStartTimer,
  onStopTimer
}: ERPTimeTabProps) {
  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = userFilter === 'all' || entry.user_id === userFilter;
    
    return matchesSearch && matchesUser;
  });

  const timeStats = {
    totalHours: timeEntries.reduce((sum, entry) => sum + entry.hours, 0),
    billableHours: timeEntries.filter(e => e.billable).reduce((sum, entry) => sum + entry.hours, 0),
    totalRevenue: timeEntries.filter(e => e.billable).reduce((sum, entry) => sum + (entry.hours * entry.rate), 0),
    activeTimers: timeEntries.filter(e => e.status === 'active').length
  };

  // Chart data
  const dailyHours = timeEntries.reduce((acc: any, entry) => {
    const date = new Date(entry.start_time).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, billable: 0, nonBillable: 0 };
    }
    if (entry.billable) {
      acc[date].billable += entry.hours;
    } else {
      acc[date].nonBillable += entry.hours;
    }
    return acc;
  }, {});

  const chartData = Object.values(dailyHours).slice(-7); // Last 7 days

  const projectDistribution = timeEntries.reduce((acc: any, entry) => {
    if (!acc[entry.project_title]) {
      acc[entry.project_title] = { name: entry.project_title, hours: 0 };
    }
    acc[entry.project_title].hours += entry.hours;
    return acc;
  }, {});

  const pieChartData = Object.values(projectDistribution).slice(0, 5); // Top 5 projects

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading Time Tracking...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-3xl font-bold">{timeStats.totalHours.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Billable Hours</p>
                <p className="text-3xl font-bold text-green-600">{timeStats.billableHours.toFixed(1)}</p>
              </div>
              <Timer className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${timeStats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Timers</p>
                <p className="text-3xl font-bold text-red-600">{timeStats.activeTimers}</p>
              </div>
              <Play className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Daily Hours (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="billable" fill="#22C55E" name="Billable" />
                <Bar dataKey="nonBillable" fill="#94A3B8" name="Non-billable" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Project Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, hours }) => `${name}: ${(hours as number).toFixed(1)}h`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {(pieChartData as any[]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-500" />
              Time Entries
            </span>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onCreateTimeEntry} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Log Time
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">Log Time Entry</p>
                  <p className="text-xs text-muted-foreground">Record time spent on a task</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search time entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-[200px]"
            />
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {Array.from(new Set(timeEntries.map(e => e.user_name))).map(userName => (
                  <SelectItem key={userName} value={userName}>{userName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Entries Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Project/Task</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="font-medium">{entry.user_name}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{entry.project_title}</p>
                        {entry.task_title && (
                          <p className="text-sm text-muted-foreground">{entry.task_title}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{entry.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {entry.hours.toFixed(2)}h
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>${entry.rate}/hr</span>
                        <Badge variant={entry.billable ? "default" : "secondary"} className="w-fit text-xs">
                          {entry.billable ? 'Billable' : 'Non-billable'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={entry.status === 'active' ? "destructive" : "default"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {entry.status === 'active' ? (
                          <>
                            <Play className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <Square className="h-3 w-3" />
                            Completed
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(entry.start_time).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex items-center gap-2">
                          <UITooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEditTimeEntry(entry)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">Edit Time Entry</p>
                              <p className="text-xs text-muted-foreground">Modify time entry details</p>
                            </TooltipContent>
                          </UITooltip>

                          {entry.status === 'active' ? (
                            <UITooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onStopTimer(entry.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Pause className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">Stop Timer</p>
                                <p className="text-xs text-muted-foreground">End this time tracking session</p>
                              </TooltipContent>
                            </UITooltip>
                          ) : (
                            <UITooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onStartTimer(entry.project_id, entry.task_id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">Start Timer</p>
                                <p className="text-xs text-muted-foreground">Resume time tracking</p>
                              </TooltipContent>
                            </UITooltip>
                          )}
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No time entries found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || userFilter !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "Start tracking time on your projects"}
              </p>
              {(!searchTerm && userFilter === 'all') && (
                <Button onClick={onCreateTimeEntry} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Log Time Entry
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}