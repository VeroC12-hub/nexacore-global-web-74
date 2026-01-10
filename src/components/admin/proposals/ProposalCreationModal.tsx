// =====================================================
// Proposal Creation Modal - 8-Step Wizard
// =====================================================

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Users,
  Target,
  TrendingUp,
  Palette,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  AlertCircle,
  Save,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreateProposal } from '@/hooks/useProposalActions';
import type { CreateProposalInput, ExecutiveSummary, ScopeOfWork, Methodology, DeliverablesSection, TeamBios, RiskAnalysis, SuccessMetrics, CustomSection } from '@/types/proposal';
import { supabase } from '@/integrations/supabase/client';

interface ProposalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (proposalId: string) => void;
  quoteRequestId?: string;
  prefilledData?: Partial<CreateProposalInput>;
}

interface StepConfig {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  {
    id: 1,
    title: 'Basic Information',
    description: 'Client details and proposal basics',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 2,
    title: 'Executive Summary',
    description: 'Overview and key benefits',
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 3,
    title: 'Scope & Methodology',
    description: 'Project scope and approach',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 4,
    title: 'Deliverables',
    description: 'Project outputs and timeline',
    icon: <CheckCircle className="h-5 w-5" />,
  },
  {
    id: 5,
    title: 'Team & Risks',
    description: 'Team members and risk analysis',
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: 6,
    title: 'Success Metrics',
    description: 'KPIs and measurement',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: 7,
    title: 'Custom Sections',
    description: 'Additional content',
    icon: <Plus className="h-5 w-5" />,
  },
  {
    id: 8,
    title: 'Branding & Review',
    description: 'Final review and send',
    icon: <Palette className="h-5 w-5" />,
  },
];

export const ProposalCreationModal: React.FC<ProposalCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  quoteRequestId,
  prefilledData,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [clients, setClients] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<CreateProposalInput>({
    client_email: '',
    client_name: '',
    client_company: '',
    client_phone: '',
    title: '',
    service_type: '',
    total_price: 0,
    currency: 'USD',
    timeline: '',
    estimated_start_date: '',
    estimated_end_date: '',
    valid_until: '',
    executive_summary: {
      overview: '',
      key_benefits: [],
      investment_summary: '',
    },
    scope_of_work: {
      description: '',
      inclusions: [],
      exclusions: [],
    },
    methodology: {
      approach: '',
      phases: [],
      tools_technologies: [],
    },
    deliverables: {
      items: [],
    },
    team_bios: {
      members: [],
    },
    risk_analysis: {
      risks: [],
      mitigation_strategies: [],
    },
    success_metrics: {
      kpis: [],
      measurement_approach: '',
    },
    custom_sections: [],
    terms_and_conditions: '',
    use_custom_branding: false,
    branding_config: {
      colors: {
        primary: '#0098A6',
        secondary: '#1E3A5F',
        accent: '#CDDC39',
      },
      logo_url: null,
      company_name: 'NexaCore Innovations',
    },
  });

  const createProposalMutation = useCreateProposal();

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      fetchTeamMembers();

      // Apply prefilled data if provided
      if (prefilledData) {
        setFormData((prev) => ({ ...prev, ...prefilledData }));
      }

      // If quote request ID provided, fetch and prefill
      if (quoteRequestId) {
        fetchQuoteRequestData(quoteRequestId);
      }
    }
  }, [isOpen, quoteRequestId, prefilledData]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, location')
        .eq('role', 'member')
        .order('full_name');

      if (error) throw error;
      console.log('Fetched clients:', data);
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url')
        .neq('role', 'member')
        .order('full_name');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchQuoteRequestData = async (qrId: string) => {
    try {
      const { data: quoteRequest, error } = await supabase
        .from('quote_requests')
        .select('*, profiles!quote_requests_client_id_fkey(*)')
        .eq('id', qrId)
        .single();

      if (error) throw error;

      if (quoteRequest) {
        // Check for associated quote
        const { data: quote } = await supabase
          .from('quotes')
          .select('*')
          .eq('quote_request_id', qrId)
          .single();

        setFormData((prev) => ({
          ...prev,
          quote_request_id: qrId,
          quote_id: quote?.id,
          client_email: (quoteRequest as any).email || '',
          client_name: (quoteRequest as any).full_name || '',
          client_company: (quoteRequest as any).company || '',
          client_phone: (quoteRequest as any).phone || '',
          title: `Project Proposal: ${(quoteRequest as any).service_type}`,
          service_type: (quoteRequest as any).service_type || '',
          total_price: (quote as any)?.total_amount || (quote as any)?.price || 0,
          currency: (quote as any)?.currency || 'USD',
          timeline: (quoteRequest as any).timeline || '',
          executive_summary: {
            overview: `This proposal outlines our comprehensive approach to ${(quoteRequest as any).service_type} for ${(quoteRequest as any).full_name}.`,
            key_benefits: [],
            investment_summary: quote ? `Total Investment: ${(quote as any).currency} ${(quote as any).total_amount || (quote as any).price}` : '',
          },
          scope_of_work: {
            description: (quoteRequest as any).description || '',
            inclusions: [],
            exclusions: [],
          },
        }));

        toast.success('Quote request data loaded!');
      }
    } catch (error) {
      console.error('Error fetching quote request:', error);
      toast.error('Failed to load quote request data');
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.client_email || !formData.client_name || !formData.title || !formData.service_type) {
          toast.error('Please fill in all required fields');
          return false;
        }
        if (!formData.client_email.includes('@')) {
          toast.error('Please enter a valid email address');
          return false;
        }
        if (formData.total_price < 0) {
          toast.error('Price must be a positive number');
          return false;
        }
        break;
      // Other steps are optional, just warn if empty
      case 2:
        if (!formData.executive_summary?.overview) {
          toast.warning('Consider adding an executive summary overview');
        }
        break;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const result = await createProposalMutation.mutateAsync(formData);
      if (result.data) {
        toast.success('Proposal saved as draft!');
        onSuccess(result.data.id);
        handleClose();
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSendProposal = async () => {
    if (!validateCurrentStep()) return;

    setSaving(true);
    try {
      const result = await createProposalMutation.mutateAsync(formData);
      if (result.data) {
        // TODO: Add send functionality in Phase 6
        toast.success('Proposal created! Send functionality coming in Phase 6.');
        onSuccess(result.data.id);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setCurrentStep(1);
      setFormData({
        client_email: '',
        client_name: '',
        title: '',
        service_type: '',
        total_price: 0,
        currency: 'USD',
        executive_summary: { overview: '', key_benefits: [], investment_summary: '' },
        scope_of_work: { description: '', inclusions: [], exclusions: [] },
        methodology: { approach: '', phases: [], tools_technologies: [] },
        deliverables: { items: [] },
        team_bios: { members: [] },
        risk_analysis: { risks: [], mitigation_strategies: [] },
        success_metrics: { kpis: [], measurement_approach: '' },
        custom_sections: [],
        terms_and_conditions: '',
        use_custom_branding: false,
      });
      onClose();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderExecutiveSummary();
      case 3:
        return renderScopeAndMethodology();
      case 4:
        return renderDeliverables();
      case 5:
        return renderTeamAndRisks();
      case 6:
        return renderSuccessMetrics();
      case 7:
        return renderCustomSections();
      case 8:
        return renderBrandingAndReview();
      default:
        return null;
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client_id">Select Client *</Label>
          <Select
            value={formData.client_id || ''}
            onValueChange={(value) => {
              const client = clients.find((c) => c.id === value);
              if (client) {
                setFormData({
                  ...formData,
                  client_id: value,
                  client_email: client.email || '',
                  client_name: client.full_name || client.email || '',
                  client_company: client.location || '',
                  client_phone: client.phone || '',
                });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={clients.length > 0 ? "Select a client" : "No clients available"} />
            </SelectTrigger>
            <SelectContent>
              {clients.length === 0 ? (
                <SelectItem value="none" disabled>No clients found</SelectItem>
              ) : (
                clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.full_name || client.email} - {client.email}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {clients.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No clients with 'member' role found. Clients are users registered with the 'member' role.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_email">Client Email *</Label>
          <Input
            id="client_email"
            type="email"
            value={formData.client_email}
            onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
            placeholder="client@company.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client_name">Client Name *</Label>
          <Input
            id="client_name"
            value={formData.client_name}
            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            placeholder="John Smith"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_company">Company</Label>
          <Input
            id="client_company"
            value={formData.client_company || ''}
            onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
            placeholder="Acme Corp"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Proposal Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enterprise Web Development Project"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service_type">Service Type *</Label>
          <Select
            value={formData.service_type}
            onValueChange={(value) => setFormData({ ...formData, service_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Web Development">Web Development</SelectItem>
              <SelectItem value="Mobile App Development">Mobile App Development</SelectItem>
              <SelectItem value="Custom Software">Custom Software</SelectItem>
              <SelectItem value="E-commerce">E-commerce</SelectItem>
              <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
              <SelectItem value="Consulting">Consulting</SelectItem>
              <SelectItem value="Maintenance & Support">Maintenance & Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">Timeline</Label>
          <Input
            id="timeline"
            value={formData.timeline || ''}
            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
            placeholder="e.g., 12 weeks"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="total_price">Total Price</Label>
          <Input
            id="total_price"
            type="number"
            value={formData.total_price}
            onChange={(e) => setFormData({ ...formData, total_price: parseFloat(e.target.value) || 0 })}
            placeholder="25000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valid_until">Valid Until</Label>
          <Input
            id="valid_until"
            type="date"
            value={formData.valid_until?.split('T')[0] || ''}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value ? new Date(e.target.value).toISOString() : '' })}
          />
        </div>
      </div>
    </div>
  );

  const renderExecutiveSummary = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="overview">Project Overview</Label>
        <Textarea
          id="overview"
          value={formData.executive_summary?.overview || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              executive_summary: {
                ...formData.executive_summary!,
                overview: e.target.value,
              },
            })
          }
          placeholder="Provide a high-level overview of the project, its goals, and expected outcomes..."
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label>Key Benefits</Label>
        {(formData.executive_summary?.key_benefits || []).map((benefit, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={benefit}
              onChange={(e) => {
                const newBenefits = [...(formData.executive_summary?.key_benefits || [])];
                newBenefits[index] = e.target.value;
                setFormData({
                  ...formData,
                  executive_summary: {
                    ...formData.executive_summary!,
                    key_benefits: newBenefits,
                  },
                });
              }}
              placeholder="Key benefit"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                const newBenefits = formData.executive_summary?.key_benefits?.filter((_, i) => i !== index) || [];
                setFormData({
                  ...formData,
                  executive_summary: {
                    ...formData.executive_summary!,
                    key_benefits: newBenefits,
                  },
                });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setFormData({
              ...formData,
              executive_summary: {
                ...formData.executive_summary!,
                key_benefits: [...(formData.executive_summary?.key_benefits || []), ''],
              },
            });
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Benefit
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="investment_summary">Investment Summary</Label>
        <Textarea
          id="investment_summary"
          value={formData.executive_summary?.investment_summary || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              executive_summary: {
                ...formData.executive_summary!,
                investment_summary: e.target.value,
              },
            })
          }
          placeholder="Summarize the financial investment and expected ROI..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderScopeAndMethodology = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="scope_description">Scope Description</Label>
        <Textarea
          id="scope_description"
          value={formData.scope_of_work?.description || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              scope_of_work: {
                ...formData.scope_of_work!,
                description: e.target.value,
              },
            })
          }
          placeholder="Detailed description of project scope..."
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="methodology_approach">Methodology & Approach</Label>
        <Textarea
          id="methodology_approach"
          value={formData.methodology?.approach || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              methodology: {
                ...formData.methodology!,
                approach: e.target.value,
              },
            })
          }
          placeholder="Describe your approach and methodology..."
          rows={5}
        />
      </div>
    </div>
  );

  const renderDeliverables = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Define specific project deliverables</p>
      {(formData.deliverables?.items || []).map((item, index) => (
        <Card key={index}>
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between items-start">
              <Input
                value={item.title}
                onChange={(e) => {
                  const newItems = [...(formData.deliverables?.items || [])];
                  newItems[index] = { ...item, title: e.target.value };
                  setFormData({
                    ...formData,
                    deliverables: { items: newItems },
                  });
                }}
                placeholder="Deliverable title"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newItems = formData.deliverables?.items?.filter((_, i) => i !== index) || [];
                  setFormData({
                    ...formData,
                    deliverables: { items: newItems },
                  });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={item.description}
              onChange={(e) => {
                const newItems = [...(formData.deliverables?.items || [])];
                newItems[index] = { ...item, description: e.target.value };
                setFormData({
                  ...formData,
                  deliverables: { items: newItems },
                });
              }}
              placeholder="Deliverable description"
              rows={2}
            />
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const newDeliverable = {
            id: `del-${Date.now()}`,
            title: '',
            description: '',
            format: 'Document',
          };
          setFormData({
            ...formData,
            deliverables: {
              items: [...(formData.deliverables?.items || []), newDeliverable],
            },
          });
        }}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Deliverable
      </Button>
    </div>
  );

  const renderTeamAndRisks = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-4">Team Members (Optional)</h4>
        <p className="text-sm text-gray-600 mb-4">Select team members to include in the proposal</p>
        {/* Team selection will be added in full implementation */}
        <p className="text-sm text-yellow-600">Team and risk sections will be fully implemented in the complete version</p>
      </div>
    </div>
  );

  const renderSuccessMetrics = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="measurement_approach">Measurement Approach</Label>
        <Textarea
          id="measurement_approach"
          value={formData.success_metrics?.measurement_approach || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              success_metrics: {
                ...formData.success_metrics!,
                measurement_approach: e.target.value,
              },
            })
          }
          placeholder="Describe how success will be measured..."
          rows={4}
        />
      </div>
    </div>
  );

  const renderCustomSections = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Add custom sections to your proposal</p>
      {(formData.custom_sections || []).map((section, index) => (
        <Card key={section.id}>
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between items-start">
              <Input
                value={section.title}
                onChange={(e) => {
                  const newSections = [...(formData.custom_sections || [])];
                  newSections[index] = { ...section, title: e.target.value };
                  setFormData({ ...formData, custom_sections: newSections });
                }}
                placeholder="Section title"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newSections = formData.custom_sections?.filter((_, i) => i !== index) || [];
                  setFormData({ ...formData, custom_sections: newSections });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={section.content}
              onChange={(e) => {
                const newSections = [...(formData.custom_sections || [])];
                newSections[index] = { ...section, content: e.target.value };
                setFormData({ ...formData, custom_sections: newSections });
              }}
              placeholder="Section content"
              rows={4}
            />
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const newSection: CustomSection = {
            id: `custom-${Date.now()}`,
            title: '',
            content: '',
            order: (formData.custom_sections?.length || 0) + 1,
          };
          setFormData({
            ...formData,
            custom_sections: [...(formData.custom_sections || []), newSection],
          });
        }}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Custom Section
      </Button>
    </div>
  );

  const renderBrandingAndReview = () => (
    <div className="space-y-6">
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Ready to Create Proposal
          </CardTitle>
          <CardDescription className="text-green-700">
            Review the summary below and choose to save as draft or send to client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Client:</p>
              <p className="text-gray-900">{formData.client_name}</p>
              <p className="text-gray-600">{formData.client_email}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Service:</p>
              <p className="text-gray-900">{formData.service_type}</p>
              <p className="text-gray-600">
                {formData.currency} {formData.total_price?.toLocaleString()}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="font-medium text-gray-700">Proposal Title:</p>
            <p className="text-gray-900">{formData.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Badge variant="outline" className="bg-white">
                {formData.executive_summary?.overview ? 'Executive Summary ✓' : 'Executive Summary -'}
              </Badge>
            </div>
            <div>
              <Badge variant="outline" className="bg-white">
                {formData.deliverables?.items && formData.deliverables.items.length > 0
                  ? `${formData.deliverables.items.length} Deliverables ✓`
                  : 'No Deliverables'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="terms">Terms & Conditions</Label>
        <Textarea
          id="terms"
          value={formData.terms_and_conditions || ''}
          onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
          placeholder="Enter terms and conditions..."
          rows={6}
        />
      </div>
    </div>
  );

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Project Proposal</DialogTitle>
          <DialogDescription>
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id === currentStep ? 'text-blue-600 font-medium' : ''
                } ${step.id < currentStep ? 'text-green-600' : ''}`}
              >
                <div
                  className={`rounded-full p-2 ${
                    step.id === currentStep
                      ? 'bg-blue-100'
                      : step.id < currentStep
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                  }`}
                >
                  {step.icon}
                </div>
                <span className="mt-1 hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Step Content */}
        <div className="py-6">{renderStepContent()}</div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || saving}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep === STEPS.length ? (
              <>
                <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button type="button" onClick={handleSendProposal} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  {saving ? 'Creating...' : 'Create Proposal'}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
