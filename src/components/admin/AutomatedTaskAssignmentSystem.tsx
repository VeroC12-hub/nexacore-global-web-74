import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bot, 
  Users, 
  Clock, 
  Target, 
  Zap,
  Settings,
  Plus,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  UserCheck,
  Calendar,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
  currentWorkload: number;
  maxCapacity: number;
  availability: 'available' | 'busy' | 'unavailable';
  timezone: string;
}

interface AssignmentRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  conditions: {
    projectType?: string;
    skillRequired?: string[];
    urgencyLevel?: string;
    workload?: 'low' | 'medium' | 'high';
    timezone?: string;
  };
  assignmentLogic: {
    strategy: 'round_robin' | 'skill_match' | 'workload_balance' | 'expertise_level';
    fallbackAssignee?: string;
    autoEscalation: boolean;
    escalationDelayHours: number;
  };
}

interface AutoAssignmentMetrics {
  totalAssignments: number;
  successRate: number;
  avgAssignmentTime: number;
  teamUtilization: number;
  escalations: number;
}

export const AutomatedTaskAssignmentSystem: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule[]>([]);
  const [metrics, setMetrics] = useState<AutoAssignmentMetrics>({
    totalAssignments: 0,
    successRate: 0,
    avgAssignmentTime: 0,
    teamUtilization: 0,
    escalations: 0
  });
  
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<AssignmentRule | null>(null);
  const [loading, setLoading] = useState(true);

  const [newRule, setNewRule] = useState<AssignmentRule>({
    id: '',
    name: '',
    description: '',
    isActive: true,
    priority: 1,
    conditions: {},
    assignmentLogic: {
      strategy: 'workload_balance',
      autoEscalation: false,
      escalationDelayHours: 24
    }
  });

  useEffect(() => {
    loadAssignmentData();
  }, []);

  const loadAssignmentData = async () => {
    setLoading(true);
    try {
      // Simulate loading team members and rules
      const mockTeamMembers: TeamMember[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah@nexacore.com',
          role: 'Senior Developer',
          skills: ['React', 'TypeScript', 'Node.js'],
          currentWorkload: 75,
          maxCapacity: 100,
          availability: 'available',
          timezone: 'EST'
        },
        {
          id: '2',
          name: 'Mike Chen',
          email: 'mike@nexacore.com',
          role: 'Designer',
          skills: ['UI/UX', 'Figma', 'Prototyping'],
          currentWorkload: 60,
          maxCapacity: 100,
          availability: 'available',
          timezone: 'PST'
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          email: 'emily@nexacore.com',
          role: 'Project Manager',
          skills: ['Project Management', 'Scrum', 'Client Relations'],
          currentWorkload: 90,
          maxCapacity: 100,
          availability: 'busy',
          timezone: 'CST'
        }
      ];

      const mockRules: AssignmentRule[] = [
        {
          id: '1',
          name: 'High Priority Development Tasks',
          description: 'Assign urgent development tasks to senior developers',
          isActive: true,
          priority: 1,
          conditions: {
            projectType: 'development',
            urgencyLevel: 'high',
            skillRequired: ['React', 'TypeScript']
          },
          assignmentLogic: {
            strategy: 'skill_match',
            autoEscalation: true,
            escalationDelayHours: 4
          }
        },
        {
          id: '2',
          name: 'Design Tasks Distribution',
          description: 'Distribute design tasks based on workload',
          isActive: true,
          priority: 2,
          conditions: {
            projectType: 'design',
            workload: 'medium'
          },
          assignmentLogic: {
            strategy: 'workload_balance',
            autoEscalation: false,
            escalationDelayHours: 24
          }
        }
      ];

      const mockMetrics: AutoAssignmentMetrics = {
        totalAssignments: 247,
        successRate: 94.5,
        avgAssignmentTime: 12.3,
        teamUtilization: 78.2,
        escalations: 8
      };

      setTeamMembers(mockTeamMembers);
      setAssignmentRules(mockRules);
      setMetrics(mockMetrics);
    } catch (error) {
      toast.error('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  };

  const saveRule = async () => {
    if (!newRule.name.trim()) {
      toast.error('Rule name is required');
      return;
    }

    try {
      const ruleToSave = {
        ...newRule,
        id: editingRule?.id || `rule-${Date.now()}`
      };

      if (editingRule) {
        setAssignmentRules(prev => 
          prev.map(rule => rule.id === editingRule.id ? ruleToSave : rule)
        );
        toast.success('Assignment rule updated');
      } else {
        setAssignmentRules(prev => [...prev, ruleToSave]);
        toast.success('Assignment rule created');
      }

      resetRuleBuilder();
    } catch (error) {
      toast.error('Failed to save assignment rule');
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      setAssignmentRules(prev => prev.filter(rule => rule.id !== ruleId));
      toast.success('Assignment rule deleted');
    } catch (error) {
      toast.error('Failed to delete assignment rule');
    }
  };

  const toggleRuleStatus = async (ruleId: string) => {
    try {
      setAssignmentRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
        )
      );
      toast.success('Rule status updated');
    } catch (error) {
      toast.error('Failed to update rule status');
    }
  };

  const resetRuleBuilder = () => {
    setNewRule({
      id: '',
      name: '',
      description: '',
      isActive: true,
      priority: 1,
      conditions: {},
      assignmentLogic: {
        strategy: 'workload_balance',
        autoEscalation: false,
        escalationDelayHours: 24
      }
    });
    setEditingRule(null);
    setShowRuleBuilder(false);
  };

  const editRule = (rule: AssignmentRule) => {
    setNewRule(rule);
    setEditingRule(rule);
    setShowRuleBuilder(true);
  };

  const testAssignmentSystem = async () => {
    toast.info('Running assignment simulation...');
    // Simulate testing the assignment system
    setTimeout(() => {
      toast.success('Assignment test completed successfully');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading automation system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <span>Automated Task Assignment</span>
          </h2>
          <p className="text-gray-600 mt-2">
            Enterprise-grade intelligent task distribution system
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={testAssignmentSystem}>
            <Zap className="w-4 h-4 mr-2" />
            Test System
          </Button>
          <Button 
            onClick={() => setShowRuleBuilder(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold">{metrics.totalAssignments}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{metrics.successRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Assignment Time</p>
                <p className="text-2xl font-bold">{metrics.avgAssignmentTime}min</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team Utilization</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.teamUtilization}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Escalations</p>
                <p className="text-2xl font-bold text-red-600">{metrics.escalations}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Team Capacity Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                    <div className="flex space-x-2 mt-1">
                      {member.skills.slice(0, 3).map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge 
                    variant={member.availability === 'available' ? 'default' : 
                            member.availability === 'busy' ? 'secondary' : 'destructive'}
                  >
                    {member.availability}
                  </Badge>
                  <div className="w-32">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Workload</span>
                      <span>{member.currentWorkload}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          member.currentWorkload < 60 ? 'bg-green-500' :
                          member.currentWorkload < 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${member.currentWorkload}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Assignment Rules ({assignmentRules.length})</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignmentRules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => toggleRuleStatus(rule.id)}
                    />
                    <Badge variant="outline">Priority {rule.priority}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold">{rule.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                      <span>Strategy: {rule.assignmentLogic.strategy.replace('_', ' ')}</span>
                      {rule.assignmentLogic.autoEscalation && (
                        <span>Auto-escalation: {rule.assignmentLogic.escalationDelayHours}h</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => editRule(rule)}>
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteRule(rule.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {assignmentRules.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No assignment rules configured yet.</p>
                <p className="text-sm">Create your first rule to enable automated task assignment.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rule Builder Modal */}
      {showRuleBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {editingRule ? 'Edit Assignment Rule' : 'Create Assignment Rule'}
                </h3>
                <Button variant="ghost" onClick={resetRuleBuilder}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    value={newRule.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter rule name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="rule-description">Description</Label>
                  <Textarea
                    id="rule-description"
                    value={newRule.description}
                    onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe when this rule should apply"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rule-priority">Priority</Label>
                    <Input
                      id="rule-priority"
                      type="number"
                      min="1"
                      max="10"
                      value={newRule.priority}
                      onChange={(e) => setNewRule(prev => ({ 
                        ...prev, 
                        priority: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={newRule.isActive}
                      onCheckedChange={(checked) => setNewRule(prev => ({ 
                        ...prev, 
                        isActive: checked 
                      }))}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assignment Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Project Type</Label>
                      <Select
                        value={newRule.conditions.projectType || ''}
                        onValueChange={(value) => setNewRule(prev => ({
                          ...prev,
                          conditions: { ...prev.conditions, projectType: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="testing">Testing</SelectItem>
                          <SelectItem value="management">Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Urgency Level</Label>
                      <Select
                        value={newRule.conditions.urgencyLevel || ''}
                        onValueChange={(value) => setNewRule(prev => ({
                          ...prev,
                          conditions: { ...prev.conditions, urgencyLevel: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assignment Logic */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assignment Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Assignment Strategy</Label>
                    <Select
                      value={newRule.assignmentLogic.strategy}
                      onValueChange={(value: any) => setNewRule(prev => ({
                        ...prev,
                        assignmentLogic: { ...prev.assignmentLogic, strategy: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round_robin">Round Robin</SelectItem>
                        <SelectItem value="skill_match">Skill Matching</SelectItem>
                        <SelectItem value="workload_balance">Workload Balance</SelectItem>
                        <SelectItem value="expertise_level">Expertise Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newRule.assignmentLogic.autoEscalation}
                        onCheckedChange={(checked) => setNewRule(prev => ({
                          ...prev,
                          assignmentLogic: { 
                            ...prev.assignmentLogic, 
                            autoEscalation: checked 
                          }
                        }))}
                      />
                      <Label>Auto-escalation</Label>
                    </div>
                    {newRule.assignmentLogic.autoEscalation && (
                      <div>
                        <Label>Escalation Delay (hours)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={newRule.assignmentLogic.escalationDelayHours}
                          onChange={(e) => setNewRule(prev => ({
                            ...prev,
                            assignmentLogic: {
                              ...prev.assignmentLogic,
                              escalationDelayHours: parseInt(e.target.value) || 24
                            }
                          }))}
                          className="w-20"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={resetRuleBuilder}>
                  Cancel
                </Button>
                <Button 
                  onClick={saveRule}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};