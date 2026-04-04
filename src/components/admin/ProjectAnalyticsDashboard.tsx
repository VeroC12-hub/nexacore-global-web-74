import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target,
  Activity,
  Award,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProjectMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalBudget: number;
  spentBudget: number;
  averageCompletion: number;
  onTimeDelivery: number;
  teamUtilization: number;
  clientSatisfaction: number;
}

interface ProjectTrend {
  month: string;
  started: number;
  completed: number;
  budget: number;
  utilization: number;
}

interface TeamPerformance {
  member: string;
  projectsAssigned: number;
  projectsCompleted: number;
  averageDelay: number;
  efficiency: number;
}

interface BudgetAnalysis {
  category: string;
  allocated: number;
  spent: number;
  variance: number;
}

interface RiskAssessment {
  project: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  probability: number;
  impact: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ProjectAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [trends, setTrends] = useState<ProjectTrend[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('6m');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeFrame]);

  const fetchAnalyticsData = async () => {
    try {
      const monthsBack = timeFrame === '3m' ? 3 : timeFrame === '6m' ? 6 : timeFrame === '1y' ? 12 : 6;
      const since = new Date();
      since.setMonth(since.getMonth() - monthsBack);

      const [projectsRes, tasksRes, erpProjectsRes] = await Promise.all([
        supabase.from('projects').select('id, status, progress, budget, actual_cost, start_date, end_date, created_at'),
        supabase.from('erp_tasks').select('id, status, erp_project_id, due_date, updated_at'),
        supabase.from('erp_projects').select('id, title, status, budget, actual_cost, department, start_date, end_date'),
      ]);

      const projects = projectsRes.data as any[] || [];
      const tasks = tasksRes.data as any[] || [];
      const erpProjects = erpProjectsRes.data as any[] || [];

      const now = new Date();
      const total = projects.length;
      const active = projects.filter(p => p.status === 'in_progress').length;
      const completed = projects.filter(p => p.status === 'completed').length;
      const overdue = projects.filter(p =>
        p.status !== 'completed' && p.status !== 'cancelled' &&
        p.end_date && new Date(p.end_date) < now
      ).length;
      const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);
      const spentBudget = projects.reduce((s, p) => s + (p.actual_cost || 0), 0);
      const avgCompletion = total > 0
        ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / total)
        : 0;
      const completedWithDates = projects.filter(p => p.status === 'completed' && p.end_date);
      const onTime = completedWithDates.length > 0
        ? Math.round((completedWithDates.filter(p => new Date(p.end_date) >= now || p.progress === 100).length / completedWithDates.length) * 100)
        : 0;

      setMetrics({
        totalProjects: total,
        activeProjects: active,
        completedProjects: completed,
        overdueProjects: overdue,
        totalBudget,
        spentBudget,
        averageCompletion: avgCompletion,
        onTimeDelivery: onTime,
        teamUtilization: 0,
        clientSatisfaction: 0,
      });

      // Monthly trends from created_at
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const trendMap: Record<string, { started: number; completed: number; budget: number }> = {};
      for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        trendMap[key] = { started: 0, completed: 0, budget: 0 };
      }
      projects.forEach(p => {
        if (p.created_at) {
          const d = new Date(p.created_at);
          const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
          if (trendMap[key]) {
            trendMap[key].started += 1;
            trendMap[key].budget += p.budget || 0;
          }
        }
        if (p.status === 'completed' && p.end_date) {
          const d = new Date(p.end_date);
          const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
          if (trendMap[key]) trendMap[key].completed += 1;
        }
      });
      setTrends(Object.entries(trendMap).map(([month, v]) => ({
        month: month.split(' ')[0],
        started: v.started,
        completed: v.completed,
        budget: v.budget,
        utilization: 0,
      })));

      // Team performance from erp_tasks (assigned members)
      setTeamPerformance([]);

      // Budget analysis from erp_projects by department
      const deptMap: Record<string, { allocated: number; spent: number }> = {};
      erpProjects.forEach(p => {
        const dept = p.department || 'General';
        if (!deptMap[dept]) deptMap[dept] = { allocated: 0, spent: 0 };
        deptMap[dept].allocated += p.budget || 0;
        deptMap[dept].spent += p.actual_cost || 0;
      });
      setBudgetAnalysis(Object.entries(deptMap).map(([category, v]) => ({
        category,
        allocated: v.allocated,
        spent: v.spent,
        variance: v.spent - v.allocated,
      })));

      // Risk assessment from overdue/high-spend projects
      const riskProjects = projects
        .filter(p => p.status !== 'completed' && p.status !== 'cancelled')
        .map(p => {
          const isOverdue = p.end_date && new Date(p.end_date) < now;
          const budgetRatio = p.budget > 0 ? (p.actual_cost || 0) / p.budget : 0;
          const factors: string[] = [];
          if (isOverdue) factors.push('Past deadline');
          if (budgetRatio > 0.9) factors.push('Near budget limit');
          if (budgetRatio > 1) factors.push('Over budget');
          const riskLevel: RiskAssessment['riskLevel'] =
            (isOverdue && budgetRatio > 1) ? 'critical' :
            (isOverdue || budgetRatio > 1) ? 'high' :
            budgetRatio > 0.75 ? 'medium' : 'low';
          return {
            project: p.title || 'Untitled',
            riskLevel,
            factors: factors.length ? factors : ['On track'],
            probability: isOverdue ? 80 : Math.round(budgetRatio * 60),
            impact: Math.round(((p.budget || 0) / (totalBudget || 1)) * 100),
          };
        })
        .sort((a, b) => {
          const order = { critical: 0, high: 1, medium: 2, low: 3 };
          return order[a.riskLevel] - order[b.riskLevel];
        });
      setRiskAssessment(riskProjects);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading analytics...</div>;
  }

  const statusData = [
    { name: 'Active', value: metrics?.activeProjects || 0, color: '#0088FE' },
    { name: 'Completed', value: metrics?.completedProjects || 0, color: '#00C49F' },
    { name: 'Overdue', value: metrics?.overdueProjects || 0, color: '#FF8042' }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Project Analytics Dashboard</h2>
        <div className="flex items-center gap-4">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>Export Report</Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((metrics?.spentBudget || 0) / (metrics?.totalBudget || 1) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(metrics?.spentBudget || 0)} of {formatCurrency(metrics?.totalBudget || 0)}
            </p>
            <Progress
              value={(metrics?.spentBudget || 0) / (metrics?.totalBudget || 1) * 100}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.onTimeDelivery}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3.2% from last quarter
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.teamUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                -1.4% from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Project Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="started" fill="#0088FE" name="Started" />
                      <Bar dataKey="completed" fill="#00C49F" name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project & Budget Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'budget' ? formatCurrency(value as number) : value,
                        name
                      ]}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="completed" stroke="#00C49F" name="Completed Projects" />
                    <Line yAxisId="left" type="monotone" dataKey="utilization" stroke="#FFBB28" name="Utilization %" />
                    <Line yAxisId="right" type="monotone" dataKey="budget" stroke="#0088FE" name="Budget" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamPerformance.map((member) => (
                  <div key={member.member} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <div className="font-semibold">{member.member}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.projectsCompleted}/{member.projectsAssigned} projects completed
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm font-medium">{member.efficiency}%</div>
                        <div className="text-xs text-muted-foreground">Efficiency</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{member.averageDelay}d</div>
                        <div className="text-xs text-muted-foreground">Avg Delay</div>
                      </div>
                      <div className="w-24">
                        <Progress value={member.efficiency} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Analysis by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetAnalysis.map((category) => (
                  <div key={category.category} className="p-4 border rounded">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{category.category}</h4>
                      <Badge variant={category.variance > 0 ? "destructive" : "secondary"}>
                        {category.variance > 0 ? '+' : ''}{formatCurrency(category.variance)}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Allocated: {formatCurrency(category.allocated)}</span>
                      <span>Spent: {formatCurrency(category.spent)}</span>
                    </div>
                    <Progress
                      value={(category.spent / category.allocated) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskAssessment.map((risk, index) => (
                  <div key={index} className="p-4 border rounded">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">{risk.project}</h4>
                      <Badge className={getRiskColor(risk.riskLevel)}>
                        {risk.riskLevel.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Probability</div>
                        <div className="flex items-center gap-2">
                          <Progress value={risk.probability} className="h-2 flex-1" />
                          <span className="text-sm">{risk.probability}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Impact</div>
                        <div className="flex items-center gap-2">
                          <Progress value={risk.impact} className="h-2 flex-1" />
                          <span className="text-sm">{risk.impact}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Risk Factors:</div>
                      <div className="flex flex-wrap gap-2">
                        {risk.factors.map((factor, idx) => (
                          <Badge key={idx} variant="outline">{factor}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectAnalyticsDashboard;