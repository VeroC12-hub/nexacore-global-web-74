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
      // Mock data for demonstration
      setMetrics({
        totalProjects: 45,
        activeProjects: 12,
        completedProjects: 28,
        overdueProjects: 3,
        totalBudget: 2500000,
        spentBudget: 1850000,
        averageCompletion: 76.5,
        onTimeDelivery: 85.2,
        teamUtilization: 89.4,
        clientSatisfaction: 92.1
      });

      setTrends([
        { month: 'Jan', started: 8, completed: 6, budget: 420000, utilization: 85 },
        { month: 'Feb', started: 6, completed: 8, budget: 380000, utilization: 87 },
        { month: 'Mar', started: 10, completed: 7, budget: 460000, utilization: 92 },
        { month: 'Apr', started: 7, completed: 9, budget: 440000, utilization: 88 },
        { month: 'May', started: 9, completed: 8, budget: 520000, utilization: 94 },
        { month: 'Jun', started: 5, completed: 11, budget: 410000, utilization: 89 }
      ]);

      setTeamPerformance([
        { member: 'Alice Smith', projectsAssigned: 8, projectsCompleted: 7, averageDelay: 2.3, efficiency: 94.2 },
        { member: 'Bob Johnson', projectsAssigned: 6, projectsCompleted: 5, averageDelay: 5.1, efficiency: 87.8 },
        { member: 'Carol White', projectsAssigned: 10, projectsCompleted: 9, averageDelay: 1.8, efficiency: 96.5 },
        { member: 'David Brown', projectsAssigned: 7, projectsCompleted: 6, averageDelay: 3.7, efficiency: 91.2 },
        { member: 'Eva Green', projectsAssigned: 5, projectsCompleted: 4, averageDelay: 4.2, efficiency: 89.1 }
      ]);

      setBudgetAnalysis([
        { category: 'Development', allocated: 800000, spent: 720000, variance: -80000 },
        { category: 'Design', allocated: 300000, spent: 285000, variance: -15000 },
        { category: 'Testing', allocated: 200000, spent: 180000, variance: -20000 },
        { category: 'Infrastructure', allocated: 400000, spent: 420000, variance: 20000 },
        { category: 'Marketing', allocated: 250000, spent: 245000, variance: -5000 }
      ]);

      setRiskAssessment([
        {
          project: 'E-commerce Platform',
          riskLevel: 'medium',
          factors: ['Resource constraints', 'Technical complexity'],
          probability: 60,
          impact: 75
        },
        {
          project: 'Mobile App',
          riskLevel: 'high',
          factors: ['Tight deadline', 'New technology stack', 'Client changes'],
          probability: 80,
          impact: 85
        },
        {
          project: 'API Integration',
          riskLevel: 'low',
          factors: ['Well-defined scope'],
          probability: 25,
          impact: 40
        }
      ]);

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