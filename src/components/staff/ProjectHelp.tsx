import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PlayCircle, 
  BookOpen, 
  HelpCircle, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  X,
  Lightbulb,
  Star,
  FolderOpen,
  Plus,
  Send,
  Eye,
  Clock,
  Users,
  MessageSquare,
  Zap,
  Target,
  Award,
  FileText,
  Video,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  Edit,
  Filter
} from 'lucide-react';

interface ProjectHelpProps {
  onClose: () => void;
  className?: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  steps: TutorialStep[];
  videoUrl?: string;
  category: 'getting-started' | 'management' | 'advanced' | 'tips';
}

interface TutorialStep {
  id: number;
  title: string;
  content: string;
  image?: string;
  tip?: string;
  actionRequired?: boolean;
}

const TUTORIALS: Tutorial[] = [
  {
    id: 'first-project',
    title: 'Creating Your First Project',
    description: 'Learn how to set up your first project from scratch',
    duration: '6 min',
    difficulty: 'Easy',
    category: 'getting-started',
    steps: [
      {
        id: 1,
        title: 'Access Project Management',
        content: 'Go to your Staff Dashboard and click on the "Project Management" tab. This is your command center for all project activities.',
        tip: 'The dashboard shows real-time project stats and progress!'
      },
      {
        id: 2,
        title: 'Click "Create Project"',
        content: 'Look for the blue "Create Project" button in the top-right corner. This opens the project creation form.',
        tip: 'You can also use the "Create First Project" button from the welcome banner!'
      },
      {
        id: 3,
        title: 'Fill Project Details',
        content: 'Enter the project title, description, and select the appropriate status. Choose a clear, descriptive title that explains what you\'re building.',
        tip: 'Good titles are specific: "Customer Portal Redesign" instead of just "Website Update"'
      },
      {
        id: 4,
        title: 'Set Timeline and Budget',
        content: 'Add a realistic deadline and budget estimate. These help with planning and resource allocation.',
        tip: 'It\'s better to overestimate time and underestimate complexity than the other way around!'
      },
      {
        id: 5,
        title: 'Assign Team Members',
        content: 'Select team members who will work on this project. You can assign different roles and responsibilities.',
        tip: 'Start with a small core team and expand as needed'
      }
    ]
  },
  {
    id: 'project-tracking',
    title: 'Tracking Project Progress',
    description: 'Master the art of project monitoring and updates',
    duration: '8 min',
    difficulty: 'Easy',
    category: 'management',
    steps: [
      {
        id: 1,
        title: 'Understanding Project Status',
        content: 'Projects move through statuses: Planning → In Progress → Review → Completed. Each status has specific meanings and workflows.',
        tip: 'Keep status updated regularly so stakeholders know the real situation'
      },
      {
        id: 2,
        title: 'Setting Progress Percentages',
        content: 'Use the progress bar to show completion percentage. Be realistic - 50% means you\'re truly halfway done.',
        tip: 'Break large projects into milestones to track progress more accurately'
      },
      {
        id: 3,
        title: 'Managing Deadlines',
        content: 'Update deadlines when scope changes or delays occur. Communication about timeline changes is crucial.',
        tip: 'Give stakeholders as much notice as possible about deadline changes'
      },
      {
        id: 4,
        title: 'Team Communication',
        content: 'Use project updates and comments to keep team members informed about progress, blockers, and next steps.',
        tip: 'Regular check-ins prevent small issues from becoming big problems'
      }
    ]
  },
  {
    id: 'client-management',
    title: 'Managing Client Projects',
    description: 'Best practices for client communication and delivery',
    duration: '10 min',
    difficulty: 'Medium',
    category: 'management',
    steps: [
      {
        id: 1,
        title: 'Setting Client Expectations',
        content: 'Clearly define project scope, deliverables, and timelines upfront. Document everything to avoid misunderstandings.',
        tip: 'A detailed project brief saves countless hours of back-and-forth later'
      },
      {
        id: 2,
        title: 'Regular Client Updates',
        content: 'Keep clients informed with weekly status updates, milestone achievements, and any issues that arise.',
        tip: 'No news is NOT good news in client relationships - communicate regularly'
      },
      {
        id: 3,
        title: 'Managing Scope Changes',
        content: 'When clients request changes, document the impact on timeline and budget before agreeing to modifications.',
        tip: 'Scope creep kills projects - be firm but fair about change requests'
      },
      {
        id: 4,
        title: 'Delivering Quality Work',
        content: 'Build in time for testing, review, and refinement. Quality delivery builds long-term client relationships.',
        tip: 'It\'s better to deliver late with high quality than on time with issues'
      }
    ]
  },
  {
    id: 'team-collaboration',
    title: 'Effective Team Collaboration',
    description: 'Building productive project teams and workflows',
    duration: '7 min',
    difficulty: 'Medium',
    category: 'management',
    steps: [
      {
        id: 1,
        title: 'Role Definition',
        content: 'Clearly define what each team member is responsible for. Avoid overlap and gaps in responsibilities.',
        tip: 'Use a RACI matrix: Responsible, Accountable, Consulted, Informed'
      },
      {
        id: 2,
        title: 'Communication Channels',
        content: 'Establish how the team will communicate: daily standups, weekly reviews, project chat channels, etc.',
        tip: 'Over-communication beats under-communication every time'
      },
      {
        id: 3,
        title: 'Task Management',
        content: 'Break projects into specific, actionable tasks. Assign owners and due dates for accountability.',
        tip: 'If a task takes more than a week, break it down further'
      },
      {
        id: 4,
        title: 'Handling Conflicts',
        content: 'Address team conflicts quickly and fairly. Focus on the work, not personalities, and seek win-win solutions.',
        tip: 'Most conflicts stem from unclear expectations or poor communication'
      }
    ]
  },
  {
    id: 'advanced-features',
    title: 'Advanced Project Management',
    description: 'Budget tracking, reporting, and optimization techniques',
    duration: '12 min',
    difficulty: 'Advanced',
    category: 'advanced',
    steps: [
      {
        id: 1,
        title: 'Budget Management',
        content: 'Track actual costs against budgets. Include time costs, external expenses, and overhead allocations.',
        tip: 'Review budget vs. actual monthly to catch overruns early'
      },
      {
        id: 2,
        title: 'Resource Planning',
        content: 'Plan team capacity and availability. Avoid overloading team members and account for vacation/sick time.',
        tip: 'People are 70-80% productive when you account for meetings, email, and breaks'
      },
      {
        id: 3,
        title: 'Risk Management',
        content: 'Identify potential risks early and create mitigation plans. Technical risks, timeline risks, and resource risks.',
        tip: 'Ask "What could go wrong?" at every project phase'
      },
      {
        id: 4,
        title: 'Performance Metrics',
        content: 'Track key metrics: on-time delivery, budget performance, client satisfaction, and team productivity.',
        tip: 'What gets measured gets managed - choose metrics that drive the right behaviors'
      }
    ]
  }
];

const FAQ_ITEMS = [
  {
    question: 'How do I know which status to use?',
    answer: 'Planning: Still defining requirements. In Progress: Actively working. Review: Waiting for feedback/approval. Completed: Delivered and accepted.'
  },
  {
    question: 'Can I change project details after creation?',
    answer: 'Yes! Use the Edit button to modify project details, timeline, budget, and team assignments as needs evolve.'
  },
  {
    question: 'How do I handle project delays?',
    answer: 'Update the deadline immediately, notify stakeholders, explain the reason, and provide a new realistic timeline.'
  },
  {
    question: 'What if I need to add more team members?',
    answer: 'Edit the project and assign additional team members. Make sure to brief new members on project context and their role.'
  },
  {
    question: 'How do I track time and costs?',
    answer: 'Use the integrated time tracking features and regularly update actual costs against your budget projections.'
  },
  {
    question: 'What makes a project "successful"?',
    answer: 'Delivered on time, within budget, meets requirements, and stakeholders are satisfied with the quality and outcome.'
  }
];

export default function ProjectHelp({ onClose, className = "" }: ProjectHelpProps) {
  const [activeView, setActiveView] = useState<'overview' | 'tutorial' | 'faq'>('overview');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const startTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStep(1);
    setCompletedSteps([]);
    setActiveView('tutorial');
  };

  const nextStep = () => {
    if (selectedTutorial && currentStep < selectedTutorial.steps.length) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'getting-started': return <Star className="h-4 w-4" />;
      case 'management': return <Settings className="h-4 w-4" />;
      case 'advanced': return <Target className="h-4 w-4" />;
      case 'tips': return <Lightbulb className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Start */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">🚀 New to Project Management?</h3>
            <p className="text-blue-100 mb-4">
              Start with our quick guide to create and manage your first project in 6 minutes!
            </p>
            <Button
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => startTutorial(TUTORIALS[0])}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
          <div className="text-6xl opacity-20">📊</div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-center justify-center space-y-3"
          onClick={() => setActiveView('tutorial')}
        >
          <PlayCircle className="h-8 w-8 text-blue-500" />
          <div>
            <div className="font-semibold">Interactive Tutorials</div>
            <div className="text-sm text-gray-600">Step-by-step guides</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-center justify-center space-y-3"
          onClick={() => setActiveView('faq')}
        >
          <HelpCircle className="h-8 w-8 text-green-500" />
          <div>
            <div className="font-semibold">FAQ</div>
            <div className="text-sm text-gray-600">Common questions</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-center justify-center space-y-3"
        >
          <Phone className="h-8 w-8 text-purple-500" />
          <div>
            <div className="font-semibold">Get Help</div>
            <div className="text-sm text-gray-600">Contact support</div>
          </div>
        </Button>
      </div>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Project Management Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Clear Objectives</div>
                <div className="text-sm text-gray-600">Define what success looks like before you start</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium">Team Communication</div>
                <div className="text-sm text-gray-600">Regular updates prevent surprises and conflicts</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium">Realistic Timelines</div>
                <div className="text-sm text-gray-600">Better to under-promise and over-deliver</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">Track Progress</div>
                <div className="text-sm text-gray-600">Monitor metrics and adjust course when needed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTutorialList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Interactive Tutorials</h3>
        <Button variant="outline" onClick={() => setActiveView('overview')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TUTORIALS.map((tutorial) => (
          <Card key={tutorial.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6" onClick={() => startTutorial(tutorial)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(tutorial.category)}
                  <h4 className="font-semibold">{tutorial.title}</h4>
                </div>
                <Badge className={getDifficultyColor(tutorial.difficulty)}>
                  {tutorial.difficulty}
                </Badge>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{tutorial.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {tutorial.duration}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {tutorial.steps.length} steps
                  </div>
                </div>
                <Button size="sm">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTutorial = () => {
    if (!selectedTutorial) return null;

    const currentStepData = selectedTutorial.steps[currentStep - 1];
    const progress = ((currentStep - 1) / selectedTutorial.steps.length) * 100;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{selectedTutorial.title}</h3>
            <p className="text-gray-600">
              Step {currentStep} of {selectedTutorial.steps.length}: {currentStepData.title}
            </p>
          </div>
          <Button variant="outline" onClick={() => setActiveView('tutorial')}>
            <X className="h-4 w-4 mr-2" />
            Exit Tutorial
          </Button>
        </div>

        <Progress value={progress} className="h-2" />

        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <span className="text-2xl font-bold text-blue-600">{currentStep}</span>
              </div>
              <h4 className="text-2xl font-bold mb-2">{currentStepData.title}</h4>
            </div>

            <div className="prose max-w-none text-center mb-8">
              <p className="text-lg text-gray-700">{currentStepData.content}</p>
            </div>

            {currentStepData.tip && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-yellow-900 mb-1">💡 Pro Tip</div>
                    <div className="text-yellow-800">{currentStepData.tip}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {selectedTutorial.steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index + 1 < currentStep ? 'bg-green-500' :
                  index + 1 === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < selectedTutorial.steps.length ? (
            <Button onClick={nextStep}>
              Next Step
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setActiveView('overview')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete!
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderFAQ = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Frequently Asked Questions</h3>
        <Button variant="outline" onClick={() => setActiveView('overview')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>
      </div>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <HelpCircle className="h-4 w-4 mr-2 text-blue-500" />
                {item.question}
              </h4>
              <p className="text-gray-600 ml-6">{item.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Still have questions?</h4>
              <p className="text-blue-700">Contact your project manager or admin for personalized guidance.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <FolderOpen className="h-6 w-6 mr-3 text-blue-600" />
                Project Management Help Center
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Everything you need to know about managing successful projects
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {activeView === 'overview' && renderOverview()}
          {activeView === 'tutorial' && (selectedTutorial ? renderTutorial() : renderTutorialList())}
          {activeView === 'faq' && renderFAQ()}
        </CardContent>
      </Card>
    </div>
  );
}