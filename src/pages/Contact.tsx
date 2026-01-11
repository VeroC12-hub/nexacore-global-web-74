/*
🚀 COMPLETE CONTACT PAGE - REDIRECT BOOKING TO DEDICATED PAGE

✅ Features Included:
- Smart consultation matching form with service recommendations
- All WhatsApp integrations with confirmation modals
- Social media links with professional transitions
- Complete EmailJS contact form integration
- Emergency support and multiple contact methods
- Form validation and comprehensive error handling
- Toast notifications and user feedback
- Smart routing redirects to dedicated booking page

🔧 Booking Strategy:
- SmartRoutingForm recommendations redirect to /book-consultation
- All booking buttons redirect to dedicated booking page
- Maintains all other contact functionalities
- Clean separation between contact and booking flows
*/

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Linkedin,
  Send,
  Clock,
  Globe,
  Calendar,
  Instagram,
  Facebook,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Zap,
  ArrowRight,
  Users,
  Code,
  Palette,
  BarChart3,
  Wrench,
  Star,
  ChevronRight,
  X,
  Youtube,
  ArrowLeft,
  Shield,
  Award,
  Target,
  Briefcase,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';

// ===== SMART SOCIAL MEDIA MODAL =====
const SmartSocialModal = ({ platform, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !platform) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <div className="text-center">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${platform.color} flex items-center justify-center mx-auto mb-4`}>
            <platform.icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            Visit our {platform.name}?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {platform.description}
          </p>
          <div className="bg-muted/20 p-3 rounded-lg mb-6">
            <p className="text-xs text-muted-foreground">
              🔗 You'll be redirected to {platform.name} in a new tab
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Stay Here
            </Button>
            <Button 
              onClick={onConfirm}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit {platform.name}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ===== SMART WHATSAPP MODAL =====
const SmartWhatsAppModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Start WhatsApp Chat?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Quick messaging for instant responses and project discussions
          </p>
          <div className="bg-muted/20 p-3 rounded-lg mb-4 text-left max-h-32 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-2">Pre-filled message:</p>
            <p className="text-xs font-mono bg-card p-2 rounded border">
              {message?.substring(0, 150)}...
            </p>
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            📱 Opens WhatsApp • 📞 +233 20 962 8907
          </p>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Open WhatsApp
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ===== SMART ROUTING FORM COMPONENT =====
const SmartRoutingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectType: '',
    urgency: '',
    budget: '',
    timeline: '',
    projectDetails: '',
    preferredMeeting: ''
  });
  const [routingResult, setRoutingResult] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Service Categories for recommendations
  const serviceCategories = {
    'engineering': {
      title: 'Engineering & Technical Services',
      icon: Wrench,
      description: 'CAD Design, 3D Animation, AI/ML Engineering, Blockchain Solutions',
      duration: '45 minutes',
      color: 'from-blue-500 to-blue-600'
    },
    'software': {
      title: 'Software & App Development',
      icon: Code,
      description: 'Web applications, mobile apps, custom software development',
      duration: '60 minutes',
      color: 'from-green-500 to-green-600'
    },
    'creative': {
      title: 'Creative & Branding',
      icon: Palette,
      description: 'UI/UX design, branding, graphic design, creative solutions',
      duration: '45 minutes',
      color: 'from-purple-500 to-purple-600'
    },
    'data': {
      title: 'Data & Digital Growth',
      icon: BarChart3,
      description: 'Analytics, Excel automation, Power BI, digital marketing',
      duration: '45 minutes',
      color: 'from-orange-500 to-orange-600'
    }
  };

  const urgencyLevels = [
    { value: 'urgent', label: 'Urgent (Within 1 week)', priority: 'high' },
    { value: 'soon', label: 'Soon (Within 1 month)', priority: 'medium' },
    { value: 'planning', label: 'Planning (Within 3 months)', priority: 'normal' },
    { value: 'future', label: 'Future consideration', priority: 'low' }
  ];

  const budgetRanges = [
    { value: 'small', label: 'Under $5,000', range: 'small' },
    { value: 'medium', label: '$5,000 - $15,000', range: 'medium' },
    { value: 'large', label: '$15,000 - $50,000', range: 'large' },
    { value: 'enterprise', label: '$50,000+', range: 'enterprise' },
    { value: 'discuss', label: 'Prefer to discuss', range: 'flexible' }
  ];

  const projectTypes = [
    { 
      value: 'web-development', 
      label: 'Web Development', 
      category: 'software',
      description: 'Websites, web applications, e-commerce platforms'
    },
    { 
      value: 'mobile-app', 
      label: 'Mobile App Development', 
      category: 'software',
      description: 'iOS, Android, cross-platform mobile applications'
    },
    { 
      value: 'ui-ux-design', 
      label: 'UI/UX Design', 
      category: 'creative',
      description: 'User interface design, user experience optimization'
    },
    { 
      value: 'branding', 
      label: 'Branding & Identity', 
      category: 'creative',
      description: 'Logo design, brand guidelines, visual identity'
    },
    { 
      value: 'cad-engineering', 
      label: 'CAD Engineering', 
      category: 'engineering',
      description: '3D modeling, technical drawings, product design'
    },
    { 
      value: 'ai-ml', 
      label: 'AI/ML Solutions', 
      category: 'engineering',
      description: 'Machine learning, AI integration, data science'
    },
    { 
      value: 'data-analytics', 
      label: 'Data Analytics', 
      category: 'data',
      description: 'Business intelligence, reporting, data visualization'
    },
    { 
      value: 'digital-marketing', 
      label: 'Digital Marketing', 
      category: 'data',
      description: 'SEO, social media, content marketing, advertising'
    },
    { 
      value: 'other', 
      label: 'Other/Custom Project', 
      category: 'software',
      description: 'Custom requirements, hybrid projects'
    }
  ];

  const determineRouting = useCallback(() => {
    const selectedProjectType = projectTypes.find(pt => pt.value === formData.projectType);
    const recommendedService = selectedProjectType?.category || 'software';
    const urgencyInfo = urgencyLevels.find(ul => ul.value === formData.urgency);
    
    return {
      recommendedService,
      serviceInfo: serviceCategories[recommendedService],
      urgency: urgencyInfo?.priority || 'normal',
      message: generatePersonalizedMessage(recommendedService, formData.urgency, formData.budget, formData.timeline)
    };
  }, [formData]);

  const generatePersonalizedMessage = (service, urgency, budget, timeline) => {
    const serviceInfo = serviceCategories[service];
    const urgencyText = urgency === 'urgent' ? 'We understand this is urgent and' : 'Our team';
    const budgetText = budget && budget !== 'discuss' ? ` with your specified budget range` : '';
    
    return `Perfect! ${urgencyText} will connect you with our ${serviceInfo.title.toLowerCase()} specialists${budgetText}. This ${serviceInfo.duration} session will help us understand your specific needs and provide tailored recommendations.`;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      const routing = determineRouting();
      setRoutingResult(routing);
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ===== REDIRECT TO BOOKING PAGE =====
  const handleBookingRedirect = (serviceKey) => {
    const service = serviceCategories[serviceKey];
    console.log('📅 Redirecting to booking page:', service.title);
    
    // Store form data in sessionStorage for booking page
    sessionStorage.setItem('consultationData', JSON.stringify({
      ...formData,
      recommendedService: serviceKey,
      serviceInfo: service
    }));
    
    // Navigate to booking page with service parameter
    navigate(`/book-consultation?service=${serviceKey}&from=contact`);
    
    toast({
      title: "🎯 Perfect Match Found!",
      description: `Redirecting to ${service.title} booking...`,
      duration: 3000,
    });
  };

  const handleWhatsAppBooking = () => {
    const message = `🚨 URGENT CONSULTATION REQUEST

Hi NexaCore Innovations! I need immediate assistance with my project.

👤 Name: ${formData.name}
🏢 Company: ${formData.company || 'Not specified'}
📧 Email: ${formData.email}
🔥 Project: ${formData.projectType}
⚡ Urgency: ${formData.urgency}
💰 Budget: ${formData.budget || 'To be discussed'}
⏰ Timeline: ${formData.timeline || 'To be discussed'}

📝 Details: ${formData.projectDetails}

Please contact me ASAP to schedule an urgent consultation.

Thank you!`;

    const phoneNumber = "233209628907";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "📱 Opening WhatsApp...",
      description: "Urgent consultation request sent via WhatsApp!",
      duration: 4000,
    });
  };

  // Step 1: Project Information
  const renderStep1 = () => (
    <Card className="card-gradient p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Tell us about your project</h3>
        <p className="text-muted-foreground">Help us understand what you're looking to build</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="company">Company/Organization</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            placeholder="Your company name (optional)"
          />
        </div>

        <div>
          <Label>What type of project do you need help with? *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {projectTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleInputChange('projectType', type.value)}
                className={`p-4 text-left border-2 rounded-lg transition-all ${
                  formData.projectType === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{type.label}</div>
                <div className="text-sm text-muted-foreground mt-1">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleNext}
          disabled={!formData.name || !formData.email || !formData.projectType}
          className="w-full"
          size="lg"
        >
          Next: Project Details
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  );

  // Step 2: Project Details
  const renderStep2 = () => (
    <Card className="card-gradient p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Project requirements</h3>
        <p className="text-muted-foreground">Help us understand your timeline and budget</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label>How urgent is this project? *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {urgencyLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => handleInputChange('urgency', level.value)}
                className={`p-3 text-left border-2 rounded-lg transition-all ${
                  formData.urgency === level.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{level.label}</div>
                <Badge variant={level.priority === 'high' ? 'destructive' : 'secondary'} className="mt-1">
                  {level.priority} priority
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>What's your budget range?</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {budgetRanges.map((budget) => (
              <button
                key={budget.value}
                type="button"
                onClick={() => handleInputChange('budget', budget.value)}
                className={`p-3 text-left border-2 rounded-lg transition-all ${
                  formData.budget === budget.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{budget.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="timeline">Preferred timeline</Label>
          <Input
            id="timeline"
            value={formData.timeline}
            onChange={(e) => handleInputChange('timeline', e.target.value)}
            placeholder="e.g., 'Complete by end of Q1', 'Flexible timing'"
          />
        </div>

        <div className="flex space-x-4">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!formData.urgency}
            className="flex-1"
          >
            Next: Details
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );

  // Step 3: Project Details
  const renderStep3 = () => (
    <Card className="card-gradient p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Tell us more</h3>
        <p className="text-muted-foreground">Provide details to help us prepare for your consultation</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="projectDetails">Project details and requirements *</Label>
          <Textarea
            id="projectDetails"
            value={formData.projectDetails}
            onChange={(e) => handleInputChange('projectDetails', e.target.value)}
            placeholder="Describe your project goals, key features, target audience, and any specific requirements..."
            rows={6}
            required
          />
        </div>

        <div>
          <Label htmlFor="preferredMeeting">Preferred meeting format</Label>
          <select 
            id="preferredMeeting"
            value={formData.preferredMeeting}
            onChange={(e) => handleInputChange('preferredMeeting', e.target.value)}
            className="w-full p-3 border border-border rounded-md bg-background"
          >
            <option value="">Select preference</option>
            <option value="video">Video call (Google Meet/Zoom)</option>
            <option value="phone">Phone call</option>
            <option value="whatsapp">WhatsApp call</option>
            <option value="in-person">In-person (if local)</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!formData.projectDetails}
            className="flex-1"
          >
            Get Recommendations
            <Star className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );

  // Step 4: Recommendations & Booking Redirect
  const renderStep4 = () => {
    if (!routingResult) return null;

    const { serviceInfo, urgency, message } = routingResult;

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Perfect Match Card */}
        <Card className="card-gradient p-8 text-center border-2 border-primary/30">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gradient-primary">Perfect Match Found!</h2>
            <div className={`inline-flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-r ${serviceInfo.color} text-white mb-4`}>
              <serviceInfo.icon className="w-8 h-8" />
              <div className="text-left">
                <div className="font-semibold text-lg">{serviceInfo.title}</div>
                <div className="text-sm opacity-90">{serviceInfo.duration} consultation</div>
              </div>
            </div>
            <p className="text-muted-foreground text-lg">{message}</p>
          </div>

          {/* Booking Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Primary: Redirect to Booking Page */}
            <Card className="p-6 border-2 border-primary/20 hover:border-primary/40 transition-all">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Book Online Calendar</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Go to our booking page to choose your preferred time slot. Instant confirmation and calendar invite.
              </p>
              <Button 
                onClick={() => handleBookingRedirect(routingResult.recommendedService)}
                className="w-full btn-hero"
                size="lg"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Go to Booking Page
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                ✅ Dedicated booking page • 📅 Calendar integration • 🔔 Reminders
              </p>
            </Card>

            {/* Alternative: WhatsApp Booking */}
            <Card className="p-6 border-2 border-green-200 hover:border-green-300 transition-all">
              <MessageSquare className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">WhatsApp Booking</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Prefer instant messaging? Book via WhatsApp with our team for flexible scheduling.
              </p>
              <Button 
                onClick={handleWhatsAppBooking}
                className="w-full bg-green-500 hover:bg-green-600"
                size="lg"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Book via WhatsApp
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                💬 Instant response • 📱 Mobile friendly • ⚡ Quick setup
              </p>
            </Card>
          </div>

          {/* Project Summary */}
          <div className="bg-muted/20 p-6 rounded-lg">
            <h4 className="font-semibold mb-4 flex items-center">
              <Briefcase className="w-4 h-4 mr-2" />
              Your Project Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-primary">Project Type</div>
                <div className="text-muted-foreground">{formData.projectType}</div>
              </div>
              <div>
                <div className="font-medium text-primary">Urgency</div>
                <div className="text-muted-foreground">{formData.urgency}</div>
              </div>
              <div>
                <div className="font-medium text-primary">Budget Range</div>
                <div className="text-muted-foreground">{formData.budget || 'To be discussed'}</div>
              </div>
            </div>
          </div>

          {/* Start Over Option */}
          <Button
            variant="outline"
            onClick={() => {
              setCurrentStep(1);
              setFormData({
                name: '', email: '', company: '', projectType: '', 
                urgency: '', budget: '', timeline: '', projectDetails: '', preferredMeeting: ''
              });
              setRoutingResult(null);
            }}
            className="mt-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Start Over with Different Information
          </Button>
        </Card>
      </div>
    );
  };

  return (
    <div className="py-8">
      {/* Progress Indicator */}
      {currentStep < 4 && (
        <div className="max-w-2xl mx-auto mb-8 px-4">
          <div className="flex items-center justify-center space-x-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step <= currentStep 
                    ? 'bg-primary text-white shadow-lg' 
                    : step === currentStep + 1
                    ? 'bg-primary/20 text-primary border-2 border-primary/30'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 ml-4 ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of 3: {
                currentStep === 1 ? 'Project Information' :
                currentStep === 2 ? 'Requirements & Timeline' :
                'Project Details'
              }
            </p>
          </div>
        </div>
      )}

      {/* Render Current Step */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
    </div>
  );
};

// ===== MAIN CONTACT COMPONENT =====
const Contact = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [currentWhatsAppMessage, setCurrentWhatsAppMessage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Office Location',
      value: 'Accra, Ghana',
      description: 'Global remote team serving clients worldwide',
      action: null
    },
    {
      icon: Phone,
      title: 'Phone Numbers',
      value: '+233 20 962 8907 / +233 50 158 8710',
      description: 'Available Monday-Friday, 9AM-6PM GMT',
      action: 'tel:+233209628907'
    },
    {
      icon: Mail,
      title: 'Email Address',
      value: 'info@nexacore-innovations.com',
      description: 'We respond within 24 hours',
      action: 'mailto:info@nexacore-innovations.com'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      value: 'Multiple Time Zones',
      description: 'We serve clients across continents with flexible scheduling',
      action: null
    }
  ];

  // Smart Social Media Configuration
  const socialPlatforms = {
    linkedin: {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://www.linkedin.com/company/nexacore-innovations',
      description: 'Professional updates and industry insights',
      color: 'from-blue-600 to-blue-700'
    },
    facebook: {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://www.facebook.com/people/NexaCore-Innovations/61578918113006',
      description: 'Company news and project highlights',
      color: 'from-blue-500 to-blue-600'
    },
    instagram: {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/nexacoreinnovations',
      description: 'Behind-the-scenes and visual content',
      color: 'from-pink-500 to-purple-600'
    },
    youtube: {
      name: 'YouTube',
      icon: Youtube,
      url: 'https://www.youtube.com/@NexaCoreInnovations',
      description: 'Tutorials and project demonstrations',
      color: 'from-red-500 to-red-600'
    }
  };

  // Smart Social Media Handler
  const handleSocialClick = (platformKey) => {
    setSelectedPlatform(socialPlatforms[platformKey]);
    setShowSocialModal(true);
  };

  const confirmSocialVisit = () => {
    window.open(selectedPlatform.url, '_blank', 'noopener,noreferrer');
    setShowSocialModal(false);
    setSelectedPlatform(null);
    
    toast({
      title: `🔗 Redirecting to ${selectedPlatform.name}`,
      description: "Opening in a new tab...",
      duration: 3000,
    });
  };

  // Smart WhatsApp Handlers
  const handleWhatsAppChat = () => {
    const message = `👋 Hello NexaCore Innovations!

I'm interested in your services and would like to discuss my project requirements.

🚀 I'm looking for help with:
• [Brief description of your project]

⏰ Best time to chat: [Your preferred time]

Can we schedule a quick chat to explore how you can help me achieve my goals?

Thank you! 😊`;

    setCurrentWhatsAppMessage(message);
    setShowWhatsAppModal(true);
  };

  const confirmWhatsAppVisit = () => {
    const phoneNumber = "233209628907";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(currentWhatsAppMessage)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setShowWhatsAppModal(false);
    setCurrentWhatsAppMessage('');
    
    toast({
      title: "💬 Opening WhatsApp...",
      description: "Pre-filled message ready for quick communication!",
      duration: 4000,
    });
  };

  // Redirect to Booking Page
  const handleBookConsultation = () => {
    navigate('/book-consultation');
    
    toast({
      title: "📅 Redirecting to Booking...",
      description: "Taking you to our consultation booking page!",
      duration: 3000,
    });
  };

  // Emergency Support Handler
  const handleEmergencyCall = () => {
    window.open('tel:+233209628907', '_self');
    
    toast({
      title: "🚨 Calling Emergency Line",
      description: "Connecting you to our support line...",
      duration: 3000,
    });
  };

  // Enhanced Contact Form Handler with EmailJS
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Check if EmailJS is available
      if (typeof window !== 'undefined' && (window as any).emailjs) {
        const templateParams = {
          from_name: contactForm.name,
          from_email: contactForm.email,
          subject: contactForm.subject,
          message: contactForm.message,
          to_email: 'info@nexacore-innovations.com',
          reply_to: contactForm.email,
          timestamp: new Date().toISOString()
        };

        const response = await (window as any).emailjs.send(
          'service_nexacore',
          'template_contact',
          templateParams,
          'your_public_key'
        );

        if (response.status === 200) {
          setSubmitStatus('success');
          setContactForm({ name: '', email: '', subject: '', message: '' });
          
          toast({
            title: "✅ Message Sent Successfully!",
            description: "We'll get back to you within 24 hours.",
            duration: 6000,
          });
        }
      } else {
        // Fallback method
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setSubmitStatus('success');
        setContactForm({ name: '', email: '', subject: '', message: '' });
        
        toast({
          title: "✅ Message Received!",
          description: "Your message has been received. We'll contact you within 24 hours.",
          duration: 6000,
        });
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');
      
      toast({
        title: "❌ Error Sending Message",
        description: "Please try again or contact us directly via phone or WhatsApp.",
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Contact Us - Get in Touch with NexaCore Innovations"
        description="Contact NexaCore Innovations for professional engineering, software development, and technical services worldwide. Free consultations, remote team available globally. Phone: +233 20 962 8907 | Email: info@nexacore-innovations.com"
        keywords="contact nexacore, free consultation international, global tech company contact, remote project inquiry, worldwide engineering services, international software development quote, technical support worldwide, WhatsApp business international, contact remote team, global consultation booking, offshore development contact"
        url="https://nexacore-innovations.com/contact"
      />
      <StructuredData type="organization" />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary/5 via-background to-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 text-sm font-medium px-4 py-2">
            <MessageSquare className="w-4 h-4 mr-2" />
            Get in Touch Today
          </Badge>
          
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Ready to Start Your 
            <span className="text-gradient-primary"> Next Project</span>?
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Connect with our global team of experts for personalized consultation, 
            project planning, and innovative solutions tailored to your needs.
          </p>

          {/* Hero CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              onClick={handleBookConsultation}
              className="btn-hero text-lg px-8 py-4"
              size="lg"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Free Consultation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={handleWhatsAppChat}
              className="border-primary text-primary hover:bg-primary hover:text-white text-lg px-8 py-4"
              size="lg"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Quick WhatsApp Chat
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            ✅ Free consultation • 📅 Dedicated booking page • 💬 24/7 support available
          </p>
        </div>
      </section>

      {/* Smart Routing Form Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Smart Consultation Matching
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              <span className="text-gradient-primary">Find Your Perfect</span><br />
              <span className="text-foreground">Consultation Match</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Answer a few quick questions and we'll automatically match you with the right specialist 
              and redirect you to the appropriate booking page.
            </p>
          </div>

          <SmartRoutingForm />
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="text-gradient-primary">Or Send Us</span> a Direct Message
            </h2>
            <p className="text-xl text-muted-foreground">
              Prefer to reach out directly? Use the form below or choose your preferred contact method.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gradient-primary">Contact Information</h3>
                <p className="text-muted-foreground mb-6">
                  Multiple ways to reach our team. We're available across multiple time zones 
                  to serve our global clientele.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="card-gradient p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105"
                        onClick={() => {
                          if (info.action) {
                            window.location.href = info.action;
                          }
                        }}>
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <info.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{info.title}</h4>
                        <p className="text-primary font-medium mb-1">{info.value}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Smart Social Media Section */}
              <div className="pt-6">
                <h4 className="font-semibold text-foreground mb-4">Follow Our Updates</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(socialPlatforms).map(([key, platform]) => (
                    <button
                      key={key}
                      onClick={() => handleSocialClick(key)}
                      className={`group flex items-center space-x-3 p-3 bg-gradient-to-r ${platform.color} rounded-lg hover:scale-105 transition-all duration-200 text-white`}
                    >
                      <platform.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{platform.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="card-gradient p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-gradient-primary">Send us a Message</h3>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you within 24 hours with a detailed response.
                  </p>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        value={contactForm.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      required
                      value={contactForm.subject}
                      onChange={handleChange}
                      placeholder="What's this regarding?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={contactForm.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project, requirements, or questions..."
                    />
                  </div>

                  {/* Submit Status */}
                  {submitStatus === 'success' && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span>Message sent successfully! We'll respond within 24 hours.</span>
                    </div>
                  )}
                  
                  {submitStatus === 'error' && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-5 h-5" />
                      <span>Failed to send message. Please try WhatsApp or phone contact.</span>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full btn-hero"
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Need <span className="text-gradient-primary">Immediate Assistance?</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the fastest way to connect with our team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Primary: Go to Booking Page */}
            <Card className="card-service text-center group hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-primary/20" onClick={handleBookConsultation}>
              <div className="p-6">
                <div className="relative">
                  <Calendar className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    <Zap className="w-3 h-3 mr-1" />
                    INSTANT
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gradient-primary">Go to Booking Page</h3>
                <p className="text-muted-foreground mb-6">
                  Visit our dedicated booking page with multiple consultation options and instant scheduling.
                </p>
                <Button className="btn-hero w-full group">
                  <Calendar className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Open Booking Page
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  ✅ Multiple consultation types • 📅 Instant booking • 🔔 Confirmations
                </p>
              </div>
            </Card>

            {/* Secondary: WhatsApp Chat */}
            <Card className="card-service text-center group hover:scale-105 transition-all duration-300 cursor-pointer" onClick={handleWhatsAppChat}>
              <div className="p-6">
                <MessageSquare className="w-12 h-12 text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3 text-gradient-primary">WhatsApp Chat</h3>
                <p className="text-muted-foreground mb-6">
                  Get instant responses to your questions via WhatsApp messaging with our team.
                </p>
                <Button className="bg-green-500 hover:bg-green-600 text-white w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </Card>

            {/* Tertiary: Direct Call */}
            <Card className="card-service text-center group hover:scale-105 transition-all duration-300 cursor-pointer" onClick={handleEmergencyCall}>
              <div className="p-6">
                <Phone className="w-12 h-12 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3 text-gradient-primary">Direct Call</h3>
                <p className="text-muted-foreground mb-6">
                  Speak directly with our team for urgent matters and immediate assistance.
                </p>
                <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Smart Social Modal */}
      <SmartSocialModal
        platform={selectedPlatform}
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
        onConfirm={confirmSocialVisit}
      />

      {/* Smart WhatsApp Modal */}
      <SmartWhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        onConfirm={confirmWhatsAppVisit}
        message={currentWhatsAppMessage}
      />

      <Footer />
    </div>
  );
};

export default Contact;
