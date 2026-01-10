import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Camera, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Eye,
  Lightbulb,
  Sparkles,
  Zap,
  Star,
  Users,
  Calendar,
  Tag,
  Image,
  Paperclip,
  Send,
  HelpCircle,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SimplePortfolioSubmissionProps {
  onClose: () => void;
  onSuccess: () => void;
  className?: string;
}

interface FormData {
  title: string;
  service_id: string;
  short_description: string;
  description: string;
  challenge: string;
  solution: string;
  results: string;
  client_name: string;
  show_client_name: boolean;
  tags: string[];
  metrics: { key: string; value: string }[];
  files: File[];
}

const SERVICES = [
  { id: 'cad-design', name: 'CAD Design & Engineering', icon: '🔧', description: 'Engineering, CAD models, technical drawings' },
  { id: 'ai-ml', name: 'AI & Machine Learning', icon: '🤖', description: 'AI models, machine learning, automation' },
  { id: 'blockchain', name: 'Blockchain & Web3', icon: '⛓️', description: 'Smart contracts, DeFi, blockchain apps' },
  { id: '3d-animation', name: '3D Animation & VFX', icon: '🎬', description: 'Animation, visual effects, 3D modeling' },
  { id: 'ecommerce-tech', name: 'E-Commerce Technology', icon: '🛒', description: 'Online stores, payment systems, e-commerce' },
  { id: 'mobile-dev', name: 'Mobile Development', icon: '📱', description: 'Mobile apps, iOS, Android development' },
  { id: 'web-development', name: 'Web Development', icon: '🌐', description: 'Websites, web apps, online platforms' },
  { id: 'ui-ux-design', name: 'UI/UX Design', icon: '🎨', description: 'User interfaces, user experience, design' },
  { id: 'data-analytics', name: 'Data Analytics', icon: '📊', description: 'Data analysis, dashboards, reporting' },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: '🔒', description: 'Security systems, penetration testing' }
];

export default function SimplePortfolioSubmission({ 
  onClose, 
  onSuccess, 
  className = "" 
}: SimplePortfolioSubmissionProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    service_id: '',
    short_description: '',
    description: '',
    challenge: '',
    solution: '',
    results: '',
    client_name: '',
    show_client_name: false,
    tags: [],
    metrics: [{ key: '', value: '' }],
    files: []
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      updateFormData('tags', [...formData.tags, tag.trim()]);
    }
  };

  const removeTag = (index: number) => {
    updateFormData('tags', formData.tags.filter((_, i) => i !== index));
  };

  const addMetric = () => {
    updateFormData('metrics', [...formData.metrics, { key: '', value: '' }]);
  };

  const updateMetric = (index: number, field: 'key' | 'value', value: string) => {
    const newMetrics = [...formData.metrics];
    newMetrics[index][field] = value;
    updateFormData('metrics', newMetrics);
  };

  const removeMetric = (index: number) => {
    if (formData.metrics.length > 1) {
      updateFormData('metrics', formData.metrics.filter((_, i) => i !== index));
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    updateFormData('files', [...formData.files, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      updateFormData('files', [...formData.files, ...files]);
    }
  };

  const removeFile = (index: number) => {
    updateFormData('files', formData.files.filter((_, i) => i !== index));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim() && formData.service_id && formData.short_description.trim();
      case 2:
        return formData.description.trim() && formData.challenge.trim() && formData.solution.trim();
      case 3:
        return formData.results.trim();
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      // Prepare project data
      const projectData = {
        title: formData.title,
        service_id: formData.service_id,
        short_description: formData.short_description,
        description: formData.description,
        challenge: formData.challenge,
        solution: formData.solution,
        results: formData.results,
        client_name: formData.client_name || null,
        show_client_name: formData.show_client_name,
        tags: formData.tags.length > 0 ? formData.tags : null,
        project_metrics: formData.metrics
          .filter(m => m.key && m.value)
          .reduce((acc, m) => ({ ...acc, [m.key]: m.value }), {}),
        submission_status: 'pending_review',
        is_published: false,
        is_featured: false
      };

      const { data: project, error: projectError } = await supabase
        .from('portfolio_projects')
        .insert([projectData])
        .select()
        .single();

      if (projectError) throw projectError;

      // Handle file uploads if any
      if (formData.files.length > 0) {
        const filePromises = formData.files.map(async (file, index) => {
          // In real implementation, upload files to storage and get URLs
          const fileData = {
            portfolio_project_id: project.id,
            filename: file.name,
            original_filename: file.name,
            file_path: `portfolio/${project.id}/${file.name}`,
            file_type: file.type.split('/')[0] || 'document',
            file_size_bytes: file.size,
            file_url: `pending-upload-${Date.now()}-${index}`, // Temporary
            is_downloadable: true,
            description: `Project file: ${file.name}`
          };

          return supabase
            .from('portfolio_files')
            .insert([fileData]);
        });

        await Promise.all(filePromises);
      }

      onSuccess();
      
    } catch (error) {
      console.error('Submission error:', error);
      // Show error message to user
    } finally {
      setSubmitting(false);
    }
  };

  const getStepIcon = (step: number) => {
    if (step < currentStep) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (step === currentStep) return <div className="h-5 w-5 rounded-full bg-blue-500 animate-pulse" />;
    return <div className="h-5 w-5 rounded-full bg-gray-300" />;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
            <div className="text-center mb-8">
              <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Let's Start with the Basics</h3>
              <p className="text-gray-600">Tell us about your amazing project!</p>
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center mb-3">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                Project Title
              </Label>
              <Input
                placeholder="e.g., Revolutionary E-Commerce Platform"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Make it catchy and descriptive!</p>
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center mb-3">
                <Zap className="h-4 w-4 mr-2 text-blue-500" />
                Service Category
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SERVICES.map((service) => (
                  <div
                    key={service.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      formData.service_id === service.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateFormData('service_id', service.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{service.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{service.name}</div>
                        <div className="text-xs text-gray-500">{service.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center mb-3">
                <FileText className="h-4 w-4 mr-2 text-green-500" />
                Quick Summary
              </Label>
              <Textarea
                placeholder="A brief, exciting description of what this project does..."
                value={formData.short_description}
                onChange={(e) => updateFormData('short_description', e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Keep it short and sweet - think elevator pitch!
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
            <div className="text-center mb-8">
              <Lightbulb className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tell the Story</h3>
              <p className="text-gray-600">What problem did you solve and how?</p>
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center mb-3">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                Detailed Description
              </Label>
              <Textarea
                placeholder="Describe your project in detail. What does it do? What technologies did you use? What makes it special?"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center mb-3">
                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                The Challenge
              </Label>
              <Textarea
                placeholder="What problem or challenge were you trying to solve? What made this project necessary?"
                value={formData.challenge}
                onChange={(e) => updateFormData('challenge', e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center mb-3">
                <Zap className="h-4 w-4 mr-2 text-green-500" />
                Your Solution
              </Label>
              <Textarea
                placeholder="How did you solve it? What approach did you take? What made your solution unique or effective?"
                value={formData.solution}
                onChange={(e) => updateFormData('solution', e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
            <div className="text-center mb-8">
              <Star className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Show the Impact</h3>
              <p className="text-gray-600">What amazing results did you achieve?</p>
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center mb-3">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Results & Impact
              </Label>
              <Textarea
                placeholder="What were the outcomes? Did you save time/money? Improve efficiency? Get positive feedback? Share the success!"
                value={formData.results}
                onChange={(e) => updateFormData('results', e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center mb-3">
                <Users className="h-4 w-4 mr-2 text-blue-500" />
                Client Information
              </Label>
              <div className="space-y-3">
                <Input
                  placeholder="Client/Company name (optional)"
                  value={formData.client_name}
                  onChange={(e) => updateFormData('client_name', e.target.value)}
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showClient"
                    checked={formData.show_client_name}
                    onCheckedChange={(checked) => updateFormData('show_client_name', checked)}
                  />
                  <Label htmlFor="showClient" className="text-sm">
                    Show client name publicly (uncheck to keep confidential)
                  </Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
            <div className="text-center mb-8">
              <Plus className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Add the Extras</h3>
              <p className="text-gray-600">Files, tags, and metrics to make it shine!</p>
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-base font-semibold flex items-center mb-3">
                <Paperclip className="h-4 w-4 mr-2 text-blue-500" />
                Project Files (Optional)
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag files here or <button 
                    type="button"
                    className="text-blue-500 hover:underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500">
                  Images, PDFs, CAD files, code, etc.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              {formData.files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <Label className="text-base font-semibold flex items-center mb-3">
                <Tag className="h-4 w-4 mr-2 text-green-500" />
                Tags (Optional)
              </Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(index)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add tags (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                e.g., React, AI, Mobile, Innovation, etc.
              </p>
            </div>

            {/* Metrics */}
            <div>
              <Label className="text-base font-semibold flex items-center mb-3">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                Project Metrics (Optional)
              </Label>
              <div className="space-y-3">
                {formData.metrics.map((metric, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Metric name (e.g., Cost Savings)"
                      value={metric.key}
                      onChange={(e) => updateMetric(index, 'key', e.target.value)}
                    />
                    <Input
                      placeholder="Value (e.g., $50,000)"
                      value={metric.value}
                      onChange={(e) => updateMetric(index, 'value', e.target.value)}
                    />
                    {formData.metrics.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMetric(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMetric}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Metric
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Submit Your Portfolio Project
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Step {currentStep} of {totalSteps} - {
                  currentStep === 1 ? 'Project Basics' :
                  currentStep === 2 ? 'Tell the Story' :
                  currentStep === 3 ? 'Show Impact' : 'Add Extras'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setShowHelp(!showHelp)}>
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  {getStepIcon(step)}
                  <span className={`ml-2 text-sm font-medium ${
                    step <= currentStep ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    Step {step}
                  </span>
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {showHelp && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {currentStep === 1 && (
                  <>
                    <li>• Choose a title that clearly explains what your project does</li>
                    <li>• Pick the service category that best matches your work</li>
                    <li>• Keep the summary under 2-3 sentences</li>
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <li>• Tell the story: Problem → Your Solution → Why it worked</li>
                    <li>• Mention specific technologies or methods you used</li>
                    <li>• Focus on what made this project challenging or unique</li>
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <li>• Quantify your success with numbers when possible</li>
                    <li>• Include client feedback or testimonials if available</li>
                    <li>• You can keep client names private if needed</li>
                  </>
                )}
                {currentStep === 4 && (
                  <>
                    <li>• Files help showcase your work visually</li>
                    <li>• Tags help people find your project later</li>
                    <li>• Metrics show the business value you delivered</li>
                  </>
                )}
              </ul>
            </div>
          )}

          {renderStep()}
        </CardContent>

        <div className="border-t p-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="flex items-center"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Review
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}