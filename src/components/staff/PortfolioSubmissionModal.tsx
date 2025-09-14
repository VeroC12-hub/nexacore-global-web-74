import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Upload,
  X,
  FileText,
  Image,
  Download,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';

interface PortfolioSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ProjectFile {
  id: string;
  filename: string;
  file_type: string;
  file_category: string;
  description: string;
  software_used: string;
  is_downloadable: boolean;
  file: File | null;
}

export default function PortfolioSubmissionModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: PortfolioSubmissionModalProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    service_id: '',
    client_name: '',
    show_client_name: false,
    challenge: '',
    solution: '',
    results: '',
    tags: [] as string[],
    project_metrics: {} as Record<string, string>
  });

  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [newTag, setNewTag] = useState('');
  const [metricKey, setMetricKey] = useState('');
  const [metricValue, setMetricValue] = useState('');

  const serviceOptions = [
    { value: 'cad-design', label: 'CAD Design & Engineering' },
    { value: 'ai-ml', label: 'AI & Machine Learning' },
    { value: 'blockchain', label: 'Blockchain & Web3' },
    { value: '3d-animation', label: '3D Animation & VFX' },
    { value: 'ecommerce-tech', label: 'E-Commerce Technology' },
    { value: 'mobile-dev', label: 'Mobile Development' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'ui-ux-design', label: 'UI/UX Design' },
    { value: 'data-analytics', label: 'Data Analytics' },
    { value: 'cybersecurity', label: 'Cybersecurity' }
  ];

  const fileCategories = [
    { value: 'cad_file', label: 'CAD File', icon: FileText },
    { value: '3d_model', label: '3D Model', icon: FileText },
    { value: 'documentation', label: 'Documentation', icon: FileText },
    { value: 'image', label: 'Image/Screenshot', icon: Image },
    { value: 'video', label: 'Video/Demo', icon: FileText },
    { value: 'code', label: 'Code/Source', icon: FileText }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addMetric = () => {
    if (metricKey.trim() && metricValue.trim()) {
      setFormData(prev => ({
        ...prev,
        project_metrics: {
          ...prev.project_metrics,
          [metricKey.trim()]: metricValue.trim()
        }
      }));
      setMetricKey('');
      setMetricValue('');
    }
  };

  const removeMetric = (key: string) => {
    setFormData(prev => ({
      ...prev,
      project_metrics: Object.fromEntries(
        Object.entries(prev.project_metrics).filter(([k]) => k !== key)
      )
    }));
  };

  const addFile = () => {
    const newFile: ProjectFile = {
      id: Math.random().toString(36).substr(2, 9),
      filename: '',
      file_type: '',
      file_category: '',
      description: '',
      software_used: '',
      is_downloadable: true,
      file: null
    };
    setFiles(prev => [...prev, newFile]);
  };

  const updateFile = (id: string, field: string, value: any) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, [field]: value } : file
    ));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleFileUpload = (id: string, file: File) => {
    updateFile(id, 'file', file);
    updateFile(id, 'filename', file.name);
    updateFile(id, 'file_type', file.name.split('.').pop()?.toLowerCase() || '');
  };

  const submitPortfolio = async () => {
    try {
      setLoading(true);

      // Create portfolio project (will be in pending state)
      const { data: project, error: projectError } = await supabase
        .from('portfolio_projects')
        .insert({
          ...formData,
          is_published: false, // Admin must approve
          is_featured: false,
          display_order: 999,
          submission_status: 'pending_review',
          submitted_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (projectError) throw projectError;

      toast.success('Portfolio project submitted for review!');
      
      // TODO: Handle file uploads to storage
      // For now, just create file records
      if (files.length > 0) {
        const fileRecords = files.map(file => ({
          portfolio_project_id: project.id,
          filename: file.filename,
          original_filename: file.filename,
          file_type: file.file_type,
          file_category: file.file_category,
          description: file.description,
          software_used: file.software_used,
          is_downloadable: file.is_downloadable,
          is_public: false, // Admin must approve
          file_path: `/uploads/pending/${project.id}/${file.filename}`,
          file_url: `/uploads/pending/${project.id}/${file.filename}`,
          display_order: 1
        }));

        await supabase.from('portfolio_files').insert(fileRecords);
      }

      onSuccess?.();
      onClose();
      
    } catch (error) {
      console.error('Error submitting portfolio:', error);
      toast.error('Failed to submit portfolio project');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Title *
        </label>
        <Input
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter project title"
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Category *
        </label>
        <Select value={formData.service_id} onValueChange={(value) => handleInputChange('service_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select service category" />
          </SelectTrigger>
          <SelectContent>
            {serviceOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Short Description *
        </label>
        <Input
          value={formData.short_description}
          onChange={(e) => handleInputChange('short_description', e.target.value)}
          placeholder="Brief one-line description for portfolio cards"
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detailed Description *
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Comprehensive project description including scope, technologies used, and approach"
          rows={4}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Name
          </label>
          <Input
            value={formData.client_name}
            onChange={(e) => handleInputChange('client_name', e.target.value)}
            placeholder="Client or company name"
          />
        </div>
        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            id="show_client"
            checked={formData.show_client_name}
            onChange={(e) => handleInputChange('show_client_name', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="show_client" className="text-sm text-gray-700">
            Show client name publicly
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Challenge
        </label>
        <Textarea
          value={formData.challenge}
          onChange={(e) => handleInputChange('challenge', e.target.value)}
          placeholder="What problem or challenge did this project solve?"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Solution
        </label>
        <Textarea
          value={formData.solution}
          onChange={(e) => handleInputChange('solution', e.target.value)}
          placeholder="How did you approach and solve the challenge?"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Results & Outcomes
        </label>
        <Textarea
          value={formData.results}
          onChange={(e) => handleInputChange('results', e.target.value)}
          placeholder="What were the measurable results and business impact?"
          rows={3}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Project Metrics */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Metrics
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={metricKey}
            onChange={(e) => setMetricKey(e.target.value)}
            placeholder="Metric name (e.g., 'Cost Savings')"
          />
          <Input
            value={metricValue}
            onChange={(e) => setMetricValue(e.target.value)}
            placeholder="Value (e.g., '$50,000')"
          />
          <Button type="button" onClick={addMetric} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {Object.entries(formData.project_metrics).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm"><strong>{key}:</strong> {value}</span>
              <X 
                className="h-4 w-4 cursor-pointer text-gray-500" 
                onClick={() => removeMetric(key)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Project Files</h3>
        <Button type="button" onClick={addFile} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add File
        </Button>
      </div>

      <div className="space-y-4">
        {files.map(file => (
          <Card key={file.id} className="p-4">
            <div className="flex items-start justify-between mb-4">
              <h4 className="font-medium">File {files.indexOf(file) + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Upload
                </label>
                <input
                  type="file"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(file.id, e.target.files[0])}
                  className="w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select 
                  value={file.file_category} 
                  onValueChange={(value) => updateFile(file.id, 'file_category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Input
                  value={file.description}
                  onChange={(e) => updateFile(file.id, 'description', e.target.value)}
                  placeholder="File description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Software Used
                </label>
                <Input
                  value={file.software_used}
                  onChange={(e) => updateFile(file.id, 'software_used', e.target.value)}
                  placeholder="e.g., AutoCAD 2024, SolidWorks"
                />
              </div>

              <div className="col-span-2 flex items-center">
                <input
                  type="checkbox"
                  id={`downloadable_${file.id}`}
                  checked={file.is_downloadable}
                  onChange={(e) => updateFile(file.id, 'is_downloadable', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor={`downloadable_${file.id}`} className="text-sm text-gray-700">
                  Allow downloads for this file
                </label>
              </div>
            </div>
          </Card>
        ))}

        {files.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No files added yet</p>
            <p className="text-sm">Add project files to showcase your work</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Submit Portfolio Project
          </DialogTitle>
        </DialogHeader>

        {/* Step Progress */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step ? <CheckCircle className="h-4 w-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            {currentStep === 1 && 'Basic Project Information'}
            {currentStep === 2 && 'Project Details & Metrics'}
            {currentStep === 3 && 'Files & Attachments'}
          </p>
        </div>

        {/* Form Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>
          
          <div className="flex gap-2">
            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && (!formData.title || !formData.service_id || !formData.short_description)) ||
                  (currentStep === 2 && !formData.description)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={submitPortfolio}
                disabled={loading || !formData.title || !formData.service_id}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Submitting...' : 'Submit for Review'}
              </Button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Submission Process</p>
              <p>Your portfolio project will be reviewed by administrators before being published on the public website. You'll receive notifications about the review status.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}