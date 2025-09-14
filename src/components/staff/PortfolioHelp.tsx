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
  Camera,
  Upload,
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
  Phone
} from 'lucide-react';

interface PortfolioHelpProps {
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
  category: 'getting-started' | 'submission' | 'advanced' | 'tips';
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
    id: 'first-submission',
    title: 'Your First Portfolio Submission',
    description: 'Learn how to submit your first project in just 5 minutes',
    duration: '5 min',
    difficulty: 'Easy',
    category: 'getting-started',
    steps: [
      {
        id: 1,
        title: 'Access the Portfolio Section',
        content: 'Go to your Staff Dashboard and click on the "Portfolio Management" tab. You\'ll see all your submissions and can add new ones.',
        tip: 'The Portfolio tab shows a count of your pending submissions!'
      },
      {
        id: 2,
        title: 'Click "Add Portfolio Project"',
        content: 'Look for the bright blue "Add Portfolio Project" button. This opens our simple 4-step submission wizard.',
        tip: 'The wizard saves your progress automatically!'
      },
      {
        id: 3,
        title: 'Fill in the Basics (Step 1)',
        content: 'Enter your project title, choose the right service category, and write a quick summary. Think of it like describing your project to a friend!',
        tip: 'A good title is specific and exciting: "AI-Powered Inventory System" instead of just "Inventory System"'
      },
      {
        id: 4,
        title: 'Tell Your Story (Steps 2-3)',
        content: 'Describe the challenge you faced, how you solved it, and what amazing results you achieved. This is where your project really shines!',
        tip: 'Include specific numbers when possible: "Reduced processing time by 50%" is much better than "Made it faster"'
      },
      {
        id: 5,
        title: 'Add Files and Submit (Step 4)',
        content: 'Upload any images, documents, or files that showcase your work. Then hit submit and wait for admin approval!',
        tip: 'Screenshots and before/after images are incredibly powerful for showing your impact'
      }
    ]
  },
  {
    id: 'writing-tips',
    title: 'Writing Compelling Project Descriptions',
    description: 'Make your projects stand out with great writing',
    duration: '8 min',
    difficulty: 'Easy',
    category: 'tips',
    steps: [
      {
        id: 1,
        title: 'Start with the Problem',
        content: 'Every great project story starts with a problem. What challenge were you trying to solve? What was broken or inefficient?',
        tip: 'Frame it as "Before our solution..." to create contrast'
      },
      {
        id: 2,
        title: 'Explain Your Approach',
        content: 'How did you tackle the problem? What technologies did you use? What made your approach unique or clever?',
        tip: 'Don\'t just list technologies - explain WHY you chose them'
      },
      {
        id: 3,
        title: 'Show the Impact',
        content: 'What changed after your project? Use specific numbers, feedback quotes, or measurable improvements.',
        tip: 'Business impact > Technical details. Show how you made things better for people!'
      },
      {
        id: 4,
        title: 'Use Simple, Clear Language',
        content: 'Write like you\'re explaining to a smart colleague, not a technical manual. Avoid jargon when possible.',
        tip: 'Read your description out loud - if it sounds natural, you\'re on the right track!'
      }
    ]
  },
  {
    id: 'file-management',
    title: 'Managing Project Files and Images',
    description: 'Best practices for uploading and organizing your project files',
    duration: '6 min',
    difficulty: 'Easy',
    category: 'submission',
    steps: [
      {
        id: 1,
        title: 'Choose the Right Files',
        content: 'Select files that best showcase your work: screenshots, diagrams, final deliverables, code samples, or design mockups.',
        tip: 'Quality over quantity - 3-5 great files are better than 20 mediocre ones'
      },
      {
        id: 2,
        title: 'Optimize File Sizes',
        content: 'Keep images under 5MB each. For large files like CAD models or videos, consider creating preview images instead.',
        tip: 'Compress images without losing quality using online tools before uploading'
      },
      {
        id: 3,
        title: 'Use Descriptive Names',
        content: 'Name your files clearly: "dashboard-final-design.png" instead of "IMG_001.png". This helps everyone understand what they\'re looking at.',
        tip: 'Include version numbers if you have multiple iterations: "v1", "v2", "final"'
      },
      {
        id: 4,
        title: 'Add Context in Descriptions',
        content: 'When uploading, briefly describe each file: "Main dashboard interface" or "Before/after performance comparison".',
        tip: 'Think of file descriptions as captions that tell the story'
      }
    ]
  },
  {
    id: 'approval-process',
    title: 'Understanding the Approval Process',
    description: 'What happens after you submit and how to get approved faster',
    duration: '4 min',
    difficulty: 'Easy',
    category: 'getting-started',
    steps: [
      {
        id: 1,
        title: 'Submission Status Tracking',
        content: 'After submitting, you can track your project status: Draft → Pending Review → Published (or Revision Needed).',
        tip: 'Check your dashboard regularly for status updates and admin feedback'
      },
      {
        id: 2,
        title: 'Admin Review Process',
        content: 'Admins review your submission for completeness, quality, and alignment with company standards. They may request changes or approve immediately.',
        tip: 'Complete, well-written submissions get approved much faster!'
      },
      {
        id: 3,
        title: 'Handling Revision Requests',
        content: 'If changes are requested, don\'t worry! Click "Edit" on your submission, make the suggested improvements, and resubmit.',
        tip: 'Read admin feedback carefully - they\'re helping make your project shine even brighter'
      },
      {
        id: 4,
        title: 'Published Projects',
        content: 'Once approved, your project appears on the public website and in service-specific portfolio sections. Congratulations!',
        tip: 'Published projects can be featured by admins for even more visibility'
      }
    ]
  },
  {
    id: 'advanced-features',
    title: 'Advanced Portfolio Features',
    description: 'Client privacy, metrics, tags, and other advanced options',
    duration: '10 min',
    difficulty: 'Medium',
    category: 'advanced',
    steps: [
      {
        id: 1,
        title: 'Client Privacy Settings',
        content: 'You can choose to show or hide client names. Use this for confidential projects or when client agreements require privacy.',
        tip: 'You can still describe the project type: "Major Financial Institution" instead of the actual name'
      },
      {
        id: 2,
        title: 'Project Metrics and KPIs',
        content: 'Add quantifiable results: cost savings, time reductions, performance improvements, user satisfaction scores, etc.',
        tip: 'Metrics make your projects more credible and show business value'
      },
      {
        id: 3,
        title: 'Using Tags Effectively',
        content: 'Tags help people find your projects later. Use technology names, industry terms, and descriptive keywords.',
        tip: 'Think about what someone would search for to find projects like yours'
      },
      {
        id: 4,
        title: 'Project Categories and Services',
        content: 'Choose the most accurate service category. This determines where your project appears on the website and in searches.',
        tip: 'When in doubt, ask an admin which category fits best'
      }
    ]
  }
];

const FAQ_ITEMS = [
  {
    question: 'How long does approval take?',
    answer: 'Most complete submissions are reviewed within 1-2 business days. Complex projects may take slightly longer.'
  },
  {
    question: 'Can I edit a project after submission?',
    answer: 'Yes! You can edit projects that are pending review or ask an admin to unpublish a live project for editing.'
  },
  {
    question: 'What if I don\'t have client permission to share?',
    answer: 'Use the "Hide client name" option and focus on the technical solution rather than client-specific details.'
  },
  {
    question: 'How do I make my project stand out?',
    answer: 'Include great visuals, specific results/metrics, and tell a compelling story about the problem you solved.'
  },
  {
    question: 'Can I submit team projects?',
    answer: 'Absolutely! Mention your role and the team members who contributed. Collaboration is encouraged!'
  },
  {
    question: 'What file types can I upload?',
    answer: 'Most common formats: images (JPG, PNG), documents (PDF, DOC), CAD files, code files, and more.'
  }
];

export default function PortfolioHelp({ onClose, className = "" }: PortfolioHelpProps) {
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
      case 'submission': return <Upload className="h-4 w-4" />;
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
            <h3 className="text-xl font-bold mb-2">👋 New to Portfolio Submissions?</h3>
            <p className="text-blue-100 mb-4">
              Start with our 5-minute quick start guide to submit your first project!
            </p>
            <Button
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => startTutorial(TUTORIALS[0])}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Quick Tutorial
            </Button>
          </div>
          <div className="text-6xl opacity-20">🚀</div>
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
            Quick Tips for Great Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Camera className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Include Visuals</div>
                <div className="text-sm text-gray-600">Screenshots and diagrams make your project much more engaging</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium">Show Impact</div>
                <div className="text-sm text-gray-600">Use numbers and specific results to demonstrate value</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium">Tell a Story</div>
                <div className="text-sm text-gray-600">Problem → Solution → Results makes for compelling reading</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">Be Complete</div>
                <div className="text-sm text-gray-600">Fill out all sections to get approved faster</div>
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
              <p className="text-blue-700">Contact your admin or project manager for personalized help.</p>
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
                <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
                Portfolio Help Center
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Everything you need to know about submitting great portfolio projects
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