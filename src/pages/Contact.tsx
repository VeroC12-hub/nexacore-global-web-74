/*
🚀 ENHANCED CONTACT PAGE WITH CALENDLY ROUTING INTEGRATION

✅ New Features Added:
- Smart Calendly routing form integrated
- Multiple booking options in hero section
- Enhanced user experience with guided consultation booking
- Maintains all existing EmailJS functionality
- Responsive design with your branding

🔧 Setup Required:
1. Create the 4 new Calendly event types (instructions provided)
2. Existing EmailJS integration remains unchanged
3. All WhatsApp and phone integrations preserved
*/

import { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

const Contact = () => {
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

// Smart Routing Form Component (Integrated)
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

  // Service Categories with Calendly URLs
  const serviceCategories = {
    'engineering': {
      title: 'Engineering & Technical Services',
      icon: Wrench,
      description: 'Custom software solutions, system architecture, technical consulting',
      calendlyUrl: 'https://calendly.com/godwin-ocloo-nexacore-innovations/engineering-consultation',
      duration: '45 minutes',
      color: 'from-blue-500 to-blue-600'
    },
    'software': {
      title: 'Software & App Development',
      icon: Code,
      description: 'Web applications, mobile apps, custom software development',
      calendlyUrl: 'https://calendly.com/godwin-ocloo-nexacore-innovations/software-development-consultation',
      duration: '60 minutes',
      color: 'from-green-500 to-green-600'
    },
    'creative': {
      title: 'Creative & Branding',
      icon: Palette,
      description: 'UI/UX design, branding, graphic design, creative solutions',
      calendlyUrl: 'https://calendly.com/godwin-ocloo-nexacore-innovations/creative-consultation',
      duration: '30 minutes',
      color: 'from-purple-500 to-purple-600'
    },
    'data': {
      title: 'Data & Digital Growth',
      icon: BarChart3,
      description: 'Analytics, digital marketing, data science, growth strategies',
      calendlyUrl: 'https://calendly.com/godwin-ocloo-nexacore-innovations/data-digital-consultation',
      duration: '45 minutes',
      color: 'from-orange-500 to-orange-600'
    },
    'consultation': {
      title: 'General Consultation',
      icon: MessageSquare,
      description: 'Strategic planning, project assessment, general inquiries',
      calendlyUrl: 'https://calendly.com/godwin-ocloo-nexacore-innovations/30min',
      duration: '30 minutes',
      color: 'from-teal-500 to-teal-600'
    }
  };

  // Routing Logic
  const determineRouting = () => {
    const { projectType, urgency, budget, timeline } = formData;
    
    if (urgency === 'emergency') {
      return {
        recommendedService: 'consultation',
        priority: 'urgent',
        message: 'Emergency consultation recommended - we\'ll prioritize your request immediately.',
        alternativeContact: true
      };
    }

    const routingMap = {
      'web-development': 'software',
      'mobile-app': 'software',
      'custom-software': 'engineering',
      'ui-ux-design': 'creative',
      'branding': 'creative',
      'digital-marketing': 'data',
      'data-analysis': 'data',
      'system-integration': 'engineering',
      'consultation': 'consultation',
      'other': 'consultation'
    };

    const recommendedService = routingMap[projectType] || 'consultation';
    
    return {
      recommendedService,
      priority: urgency === 'urgent' ? 'high' : 'normal',
      message: generatePersonalizedMessage(recommendedService, urgency, budget, timeline)
    };
  };

  const generatePersonalizedMessage = (service, urgency, budget, timeline) => {
    const serviceInfo = serviceCategories[service];
    const urgencyText = urgency === 'urgent' ? 'We understand this is urgent and' : 'Our team';
    const budgetText = budget ? ` with your ${budget} budget range` : '';
    
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

  const handleBooking = (serviceKey) => {
    const service = serviceCategories[serviceKey];
    console.log('📅 Booking initiated:', service.title);
    window.open(service.calendlyUrl, '_blank');
  };

  const handleWhatsAppFallback = () => {
    const message = encodeURIComponent(`🚨 URGENT CONSULTATION REQUEST

Hi NexaCore Innovations! I need immediate assistance with my project.

👤 Name: ${formData.name}
🏢 Company: ${formData.company || 'Not specified'}
📧 Email: ${formData.email}
🔥 Project: ${formData.projectType}
⚡ Urgency: ${formData.urgency}
💰 Budget: ${formData.budget || 'To be discussed'}
⏰ Timeline: ${formData.timeline || 'To be discussed'}

📝 Details: ${formData.projectDetails}

Please contact me ASAP to schedule an urgent consultation. Thank you!`);
    
    window.open(`https://wa.me/233209628907?text=${message}`, '_blank');
  };

  // Render methods for each step (condensed for space)
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
          <Users className="w-4 h-4 mr-2" />
          Step 1 of 3
        </Badge>
        <h3 className="text-2xl font-bold mb-3">Tell us about yourself</h3>
        <p className="text-muted-foreground">Let's start with some basic information so we can personalize your experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="smart-name">Full Name *</Label>
          <Input
            id="smart-name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Your full name"
            className="focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="smart-email">Email Address *</Label>
          <Input
            id="smart-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@company.com"
            className="focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="smart-company">Company/Organization</Label>
        <Input
          id="smart-company"
          value={formData.company}
          onChange={(e) => handleInputChange('company', e.target.value)}
          placeholder="Your company name (optional)"
          className="focus:ring-2 focus:ring-primary"
        />
      </div>

      <Button 
        onClick={handleNext}
        disabled={!formData.name || !formData.email}
        className="w-full btn-hero"
      >
        Continue to Project Details
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
          <Code className="w-4 h-4 mr-2" />
          Step 2 of 3
        </Badge>
        <h3 className="text-2xl font-bold mb-3">What's your project about?</h3>
        <p className="text-muted-foreground">Help us understand your needs so we can match you with the right specialist.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Project Type *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: 'web-development', label: 'Web Development', icon: '🌐' },
              { key: 'mobile-app', label: 'Mobile App', icon: '📱' },
              { key: 'custom-software', label: 'Custom Software', icon: '⚙️' },
              { key: 'ui-ux-design', label: 'UI/UX Design', icon: '🎨' },
              { key: 'branding', label: 'Branding & Identity', icon: '✨' },
              { key: 'digital-marketing', label: 'Digital Marketing', icon: '📈' },
              { key: 'data-analysis', label: 'Data & Analytics', icon: '📊' },
              { key: 'system-integration', label: 'System Integration', icon: '🔗' },
              { key: 'consultation', label: 'Strategic Consultation', icon: '💡' },
              { key: 'other', label: 'Other/Multiple', icon: '🔧' }
            ].map((type) => (
              <div
                key={type.key}
                onClick={() => handleInputChange('projectType', type.key)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.projectType === type.key
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{type.icon}</span>
                  <span className="font-medium">{type.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Urgency Level *</Label>
            <div className="space-y-2">
              {[
                { key: 'emergency', label: 'Emergency (Same Day)', color: 'text-red-600' },
                { key: 'urgent', label: 'Urgent (This Week)', color: 'text-orange-600' },
                { key: 'normal', label: 'Standard (Next 2 Weeks)', color: 'text-green-600' },
                { key: 'flexible', label: 'Flexible (When Available)', color: 'text-blue-600' }
              ].map((urgency) => (
                <div
                  key={urgency.key}
                  onClick={() => handleInputChange('urgency', urgency.key)}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.urgency === urgency.key
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className={`font-medium ${urgency.color}`}>{urgency.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Budget Range</Label>
            <div className="space-y-2">
              {[
                { key: 'under-5k', label: 'Under $5,000' },
                { key: '5k-15k', label: '$5,000 - $15,000' },
                { key: '15k-50k', label: '$15,000 - $50,000' },
                { key: 'over-50k', label: '$50,000+' },
                { key: 'discuss', label: 'Prefer to discuss' }
              ].map((budget) => (
                <div
                  key={budget.key}
                  onClick={() => handleInputChange('budget', budget.key)}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.budget === budget.key
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium">{budget.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleNext}
        disabled={!formData.projectType || !formData.urgency}
        className="w-full btn-hero"
      >
        Continue to Final Details
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
          <MessageSquare className="w-4 h-4 mr-2" />
          Step 3 of 3
        </Badge>
        <h3 className="text-2xl font-bold mb-3">Final details</h3>
        <p className="text-muted-foreground">A few more details to ensure we provide the most relevant consultation.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Timeline Expectations</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: 'asap', label: 'ASAP (Rush Project)' },
              { key: '1-month', label: 'Within 1 Month' },
              { key: '2-3-months', label: '2-3 Months' },
              { key: '3-6-months', label: '3-6 Months' },
              { key: '6-months+', label: '6+ Months' },
              { key: 'exploring', label: 'Just Exploring Ideas' }
            ].map((timeline) => (
              <div
                key={timeline.key}
                onClick={() => handleInputChange('timeline', timeline.key)}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.timeline === timeline.key
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="font-medium">{timeline.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="smart-details">Project Details (Optional)</Label>
          <Textarea
            id="smart-details"
            value={formData.projectDetails}
            onChange={(e) => handleInputChange('projectDetails', e.target.value)}
            placeholder="Tell us more about your project, specific requirements, challenges, or questions..."
            rows={4}
            className="focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-3">
          <Label>Preferred Meeting Style</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { key: 'video', label: 'Video Call', icon: '📹' },
              { key: 'phone', label: 'Phone Call', icon: '📞' },
              { key: 'either', label: 'Either Option', icon: '💬' }
            ].map((meeting) => (
              <div
                key={meeting.key}
                onClick={() => handleInputChange('preferredMeeting', meeting.key)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                  formData.preferredMeeting === meeting.key
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-2xl">{meeting.icon}</span>
                  <span className="font-medium">{meeting.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button 
        onClick={handleNext}
        className="w-full btn-hero"
      >
        Get My Consultation Recommendation
        <Zap className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const renderResults = () => {
    const recommendedService = serviceCategories[routingResult.recommendedService];
    
    return (
      <div className="space-y-8">
        {/* Success Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-3xl font-bold mb-3">Perfect Match Found!</h3>
          <p className="text-muted-foreground">Based on your needs, here's our recommendation:</p>
        </div>

        {/* Recommended Service */}
        <Card className={`p-6 border-2 border-transparent bg-gradient-to-r ${recommendedService.color} text-white relative overflow-hidden`}>
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/20 text-white border-white/30">
              <Star className="w-3 h-3 mr-1" />
              RECOMMENDED
            </Badge>
          </div>
          
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <recommendedService.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold mb-2">{recommendedService.title}</h4>
              <p className="text-white/90 mb-3">{recommendedService.description}</p>
              <div className="flex items-center space-x-4 text-sm text-white/80">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {recommendedService.duration}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Available Today
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-white/90 mb-6">{routingResult.message}</p>
          
          <Button 
            onClick={() => handleBooking(routingResult.recommendedService)}
            className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book This Consultation Now
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </Card>

        {/* Emergency Options */}
        {routingResult.priority === 'urgent' && (
          <Card className="p-6 border-2 border-red-200 bg-red-50">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-800 mb-2">🚨 Need Immediate Assistance?</h4>
                <p className="text-red-700 mb-4">
                  For urgent projects, we also offer instant communication channels:
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={handleWhatsAppFallback}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp Now
                  </Button>
                  <Button 
                    onClick={() => window.open('tel:+233209628907')}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call +233 209628907
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Alternative Services */}
        <div>
          <h4 className="font-semibold mb-4">Or explore other consultation options:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(serviceCategories)
              .filter(([key]) => key !== routingResult.recommendedService)
              .slice(0, 4)
              .map(([key, service]) => (
                <Card key={key} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleBooking(key)}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${service.color} rounded-lg flex items-center justify-center`}>
                      <service.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{service.title}</h5>
                      <p className="text-xs text-muted-foreground">{service.duration}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Card>
              ))}
          </div>
        </div>

        {/* Start Over */}
        <div className="text-center">
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
          >
            Start Over with New Information
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      {currentStep < 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-primary text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Content */}
      <Card className="card-gradient p-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderResults()}
      </Card>
    </div>
  );
};

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    message: ''
  });

  // Your EmailJS Configuration - PRODUCTION READY
  const EMAILJS_CONFIG = {
    serviceID: 'service_skk2xfl',
    templateID: 'template_ina7xpa', 
    publicKey: 'YUqPQV4IrK7H3F3-T'
  };

  // Calendly Configuration - UPDATE WITH YOUR ACTUAL CALENDLY URL
  const CALENDLY_CONFIG = {
    consultationUrl: 'https://calendly.com/godwin-ocloo-nexacore-innovations/30min',
    fallbackEnabled: true
  };

  // Production EmailJS form submission handler (unchanged)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "❌ Required Fields Missing",
        description: "Please fill in all required fields (Name, Email, and Message).",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "❌ Invalid Email Format",
        description: "Please enter a valid email address.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const emailjs = window.emailjs;
      
      if (!emailjs) {
        throw new Error('EmailJS library not loaded. Please ensure the EmailJS script is included in your HTML.');
      }

      const templateParams = {
        from_name: formData.name.trim(),
        from_email: formData.email.trim(),
        company: formData.company.trim() || 'Not specified',
        service: formData.service || 'Not specified',
        message: formData.message.trim(),
        to_email: 'info@nexacore-innovations.com',
        reply_to: formData.email.trim(),
        timestamp: new Date().toLocaleString('en-US', {
          timeZone: 'GMT',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        subject: `New Contact Form Submission from ${formData.name.trim()}`,
      };

      console.log('📧 Sending email via EmailJS...', {
        service: EMAILJS_CONFIG.serviceID,
        template: EMAILJS_CONFIG.templateID,
        sender: templateParams.from_email
      });

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceID,
        EMAILJS_CONFIG.templateID,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );

      console.log('✅ EmailJS Success Response:', response);
      
      if (response.status === 200) {
        setSubmitStatus('success');
        toast({
          title: "✅ Message Sent Successfully!",
          description: "Thank you for contacting NexaCore Innovations! We'll get back to you within 24 hours.",
          duration: 6000,
        });
        
        setFormData({ name: '', email: '', company: '', service: '', message: '' });
        setTimeout(() => setSubmitStatus(null), 10000);
      } else {
        throw new Error(`EmailJS returned status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ EmailJS Error:', error);
      setSubmitStatus('error');
      
      let errorMessage = "Please try again or contact us directly via phone/WhatsApp.";
      let errorTitle = "❌ Error Sending Message";
      
      if (error.message.includes('EmailJS library not loaded')) {
        errorTitle = "⚙️ EmailJS Not Available";
        errorMessage = "Email service temporarily unavailable. Please contact us via phone or WhatsApp for immediate assistance.";
      } else if (error.message.includes('Invalid service ID') || error.message.includes('service_id')) {
        errorTitle = "🔧 Service Configuration Error";
        errorMessage = "Email service configuration issue. Please contact us directly at info@nexacore-innovations.com";
      } else if (error.message.includes('Invalid template ID') || error.message.includes('template_id')) {
        errorTitle = "📧 Template Error";
        errorMessage = "Email template issue. Please try again or contact us directly.";
      } else if (error.message.includes('Invalid public key') || error.message.includes('public_key')) {
        errorTitle = "🔑 Authentication Error";
        errorMessage = "Email authentication failed. Please contact us directly.";
      } else if (error.message.includes('Network')) {
        errorTitle = "🌐 Network Error";
        errorMessage = "Network connection issue. Please check your internet and try again.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });
      
      setTimeout(() => setSubmitStatus(null), 10000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🗓️ CALENDLY INTEGRATION - Primary booking method
  const handleBookConsultation = () => {
    try {
      window.open(CALENDLY_CONFIG.consultationUrl, '_blank');
      
      toast({
        title: "📅 Opening Booking Calendar...",
        description: "Select your preferred time slot. Instant confirmation & calendar invite included!",
        duration: 5000,
      });
      
      console.log('📊 Consultation booking initiated via Calendly');
      
    } catch (error) {
      console.error('Error opening Calendly:', error);
      
      if (CALENDLY_CONFIG.fallbackEnabled) {
        toast({
          title: "⚠️ Calendly Unavailable",
          description: "Redirecting to WhatsApp for instant booking assistance...",
          duration: 4000,
        });
        
        setTimeout(() => {
          handleWhatsAppBooking();
        }, 1000);
      }
    }
  };

  // 💬 WHATSAPP BOOKING - Alternative method
  const handleWhatsAppBooking = () => {
    const message = encodeURIComponent(`🗓️ Hello NexaCore Innovations!

I'd like to book a FREE 30-minute consultation to discuss my project requirements.

📋 PROJECT DETAILS:
• Project Type: [Web Development, Mobile App, Design, etc.]
• Timeline: [When do you need this completed?]
• Budget Range: [Optional - helps us prepare better]
• Special Requirements: [Any specific needs?]

⏰ PREFERRED CONSULTATION TIMES:
• Option 1: [Your preferred day/time]
• Option 2: [Alternative day/time]
• Option 3: [Another backup option]

🌍 My Timezone: [Your timezone - e.g., GMT, EST, PST]
📞 My Contact: [Your phone number]

I'm excited to discuss how NexaCore Innovations can help bring my project to life!

Thank you! 😊`);
    
    const whatsappUrl = `https://wa.me/233209628907?text=${message}`;
    
    try {
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "💬 Opening WhatsApp Consultation...",
        description: "Pre-filled booking message ready! Quick scheduling via chat with our team.",
        duration: 5000,
      });
      
      console.log('📊 WhatsApp consultation booking initiated');
      
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      toast({
        title: "❌ Unable to Open WhatsApp",
        description: "Please manually message us at +233 558330610 for consultation booking.",
        variant: "destructive",
        duration: 6000,
      });
    }
  };

  // 💬 GENERAL WHATSAPP CHAT
  const handleWhatsAppChat = () => {
    const message = encodeURIComponent(`👋 Hello NexaCore Innovations!

I'm interested in your services and would like to discuss my project requirements.

🚀 I'm looking for help with:
• [Brief description of your project]

⏰ Best time to chat: [Your preferred time]

Can we schedule a quick chat to explore how you can help me achieve my goals?

Thank you! 😊`);
    
    const whatsappUrl = `https://wa.me/233209628907?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "💬 Opening WhatsApp...",
      description: "Redirecting to WhatsApp with pre-filled message for instant support!",
      duration: 4000,
    });
  };

  // 🚨 EMERGENCY SUPPORT
  const handleEmergencyCall = () => {
    window.open('tel:+233209628907', '_self');
    
    toast({
      title: "🚨 Calling Emergency Line",
      description: "Connecting you to our 24/7 emergency support. If call doesn't connect, try WhatsApp.",
      duration: 5000,
    });

    setTimeout(() => {
      toast({
        title: "📱 Alternative Contact Options",
        description: "Call not connecting? Try our WhatsApp for immediate assistance!",
        duration: 4000,
      });
    }, 3000);
  };

  // 📧 EMAIL CONSULTATION REQUEST (Backup method)
  const handleEmailConsultation = () => {
    const subject = encodeURIComponent('🗓️ Consultation Request - NexaCore Innovations');
    const body = encodeURIComponent(`Hello NexaCore Innovations Team,

I hope this email finds you well! I would like to schedule a FREE 30-minute consultation to discuss my project requirements.

📋 PROJECT DETAILS:
• Project Type: [Please specify - Web Development, Mobile App, Design, etc.]
• Timeline: [When do you need this completed?]
• Budget Range: [Optional - helps with preparation]
• Special Requirements: [Any specific needs or questions?]

📅 MY PREFERRED CONSULTATION TIMES:
• Option 1: [Day/Time + Timezone]
• Option 2: [Day/Time + Timezone] 
• Option 3: [Day/Time + Timezone]

📞 MY CONTACT DETAILS:
• Phone: [Your phone number]
• Email: [Your email address]
• Preferred contact method: [Email/Phone/WhatsApp]

Please let me know your available time slots that work best for both of us. I'm excited to discuss how NexaCore Innovations can help bring my project to life!

Looking forward to hearing from you soon.

Best regards,
[Your Name]
[Your Company/Organization]`);
    
    window.open(`mailto:info@nexacore-innovations.com?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "📧 Email Client Opened!",
      description: "Pre-filled consultation request ready to send. Check your email client.",
      duration: 4000,
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      value: '+233 209628907',
      description: 'Mon-Fri 9AM-6PM GMT',
      action: 'tel:+233209628907'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'info@nexacore-innovations.com',
      description: 'We reply within 24 hours',
      action: 'mailto:info@nexacore-innovations.com'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Accra, Ghana',
      description: 'Global Remote Team',
      action: 'https://maps.google.com/?q=Accra,Ghana'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp',
      value: '+233 209628907',
      description: 'Quick chat support',
      action: 'https://wa.me/233209628907?text=Hello%20NexaCore%20Innovations!%20I%20would%20like%20to%20discuss%20a%20project%20with%20you.'
    }
  ];

  const services = [
    'Engineering & Technical Services',
    'Software & App Development',
    'Creative & Branding',
    'Data & Digital Growth',
    'Consultation',
    'Other'
  ];

  const socialLinks = [
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://www.linkedin.com/company/108046319',
      gradient: 'from-primary to-primary-glow'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/nexacoreinnovations',
      gradient: 'from-pink-500 to-purple-600'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://web.facebook.com/people/NexaCore-Innovations/61578918113006',
      gradient: 'from-blue-600 to-blue-700'
    },
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      url: 'https://wa.me/233209628907?text=Hello%20NexaCore%20Innovations!',
      gradient: 'from-green-500 to-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section - Enhanced */}
      <section className="pt-16 pb-16 lg:pt-24 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
              <MessageSquare className="w-4 h-4 mr-2" />
              Get in Touch
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient-hero">Let's Start Your</span><br />
              <span className="text-foreground">Next Project</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Ready to transform your ideas into reality? Our global team is here to help you 
              achieve your goals with innovative solutions tailored to your needs.
            </p>

            {/* Enhanced Hero CTA Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                onClick={handleBookConsultation}
                className="btn-hero text-lg px-8 py-4"
                size="lg"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Free Consultation
                <ExternalLink className="w-4 h-4 ml-2" />
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
              ✅ Free consultation • 📅 Instant booking • 💬 24/7 support available
            </p>
          </div>
        </div>
      </section>

      {/* Smart Routing Form Section - NEW */}
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
              and consultation type for your specific project needs.
            </p>
          </div>

          <SmartRoutingForm />
        </div>
      </section>

      {/* Contact Form & Info - Enhanced */}
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
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gradient-primary">Contact Information</h3>
                <p className="text-muted-foreground mb-6">
                  Choose your preferred way to reach out. We're available across multiple time zones 
                  to serve our global clientele.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="card-gradient p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105"
                        onClick={() => window.open(info.action, info.action.startsWith('tel:') || info.action.startsWith('mailto:') ? '_self' : '_blank')}>
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

              {/* Social Links */}
              <div className="pt-6">
                <h4 className="font-semibold text-foreground mb-4">Follow Us</h4>
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.map((social, index) => (
                    <a 
                      key={index}
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`group flex items-center space-x-3 p-3 bg-gradient-to-r ${social.gradient} rounded-lg hover:scale-105 transition-all duration-200 text-white`}
                    >
                      <social.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="card-gradient p-8" id="contact-form">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-gradient-primary">Send us a Message</h3>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you within 24 hours with a detailed response.
                  </p>
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-green-800 dark:text-green-200 font-medium">Message sent successfully!</p>
                      <p className="text-green-600 dark:text-green-300 text-sm">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-red-800 dark:text-red-200 font-medium">Error sending message</p>
                      <p className="text-red-600 dark:text-red-300 text-sm">Please try again or contact us directly via email/phone.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                        disabled={isSubmitting}
                        className="focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@company.com"
                        required
                        disabled={isSubmitting}
                        className="focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company/Organization</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your company name"
                        disabled={isSubmitting}
                        className="focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">Service Interest</Label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      >
                        <option value="">Select a service</option>
                        {services.map((service) => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Project Details *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project, requirements, timeline, and any specific questions you have..."
                      rows={6}
                      required
                      disabled={isSubmitting}
                      className="focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Button 
                      type="submit"
                      className="btn-hero" 
                      disabled={isSubmitting}
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
                    <p className="text-sm text-muted-foreground">
                      * Required fields
                    </p>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions - Enhanced with Calendly */}
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
            {/* Calendly Booking - Primary Option */}
            <Card className="card-service text-center group hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-primary/20" onClick={handleBookConsultation}>
              <div className="p-6">
                <div className="relative">
                  <Calendar className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    <Zap className="w-3 h-3 mr-1" />
                    INSTANT
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gradient-primary">Schedule a Call</h3>
                <p className="text-muted-foreground mb-6">
                  Book a free 30-minute consultation instantly. Pick your preferred time slot and get automatic confirmation.
                </p>
                <Button className="btn-hero w-full group" onClick={(e) => {e.stopPropagation(); handleBookConsultation();}}>
                  <Calendar className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Book Now - Calendly
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  ✅ Instant confirmation • 📅 Calendar sync • 🔔 Reminders
                </p>
              </div>
            </Card>

            {/* WhatsApp Chat - Secondary Option */}
            <Card className="card-service text-center group hover:scale-105 transition-all duration-300 cursor-pointer" onClick={handleWhatsAppChat}>
              <div className="p-6">
                <MessageSquare className="w-12 h-12 text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3 text-gradient-primary">WhatsApp Chat</h3>
                <p className="text-muted-foreground mb-6">
                  Get instant responses to your questions via WhatsApp messaging with our team.
                </p>
                <Button className="bg-green-500 hover:bg-green-600 text-white w-full" onClick={(e) => {e.stopPropagation(); handleWhatsAppChat();}}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </Card>

            {/* Emergency Support - Tertiary Option */}
            <Card className="card-service text-center group hover:scale-105 transition-all duration-300 cursor-pointer" onClick={handleEmergencyCall}>
              <div className="p-6">
                <Clock className="w-12 h-12 text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3 text-gradient-primary">Emergency Support</h3>
                <p className="text-muted-foreground mb-6">
                  Need urgent assistance? Our emergency line is available 24/7 for critical issues.
                </p>
                <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white w-full" onClick={(e) => {e.stopPropagation(); handleEmergencyCall();}}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </Card>
          </div>

          {/* Alternative Booking Methods */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Prefer other booking methods?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" onClick={handleWhatsAppBooking} className="text-green-600 border-green-300 hover:bg-green-50">
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp Booking
              </Button>
              <Button variant="outline" onClick={handleEmailConsultation} className="text-blue-600 border-blue-300 hover:bg-blue-50">
                <Mail className="w-4 h-4 mr-2" />
                Email Booking
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Office Hours & Availability */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="card-gradient p-8 text-center">
            <Globe className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-gradient-primary">Global Availability</h2>
            <p className="text-lg text-muted-foreground mb-6">
              With team members across different time zones, we ensure round-the-clock support for our international clients.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-foreground mb-2">🇬🇭 Ghana Time (GMT)</h4>
                <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p className="text-muted-foreground">Saturday: 10:00 AM - 2:00 PM</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">🚨 Emergency Support</h4>
                <p className="text-muted-foreground">24/7 Available for Urgent Issues</p>
                <p className="text-muted-foreground">WhatsApp & Phone Support</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">⚡ Response Time</h4>
                <p className="text-muted-foreground">Within 24 hours guaranteed</p>
                <p className="text-muted-foreground">Usually within 2-4 hours</p>
              </div>
            </div>
            
            {/* Calendly Integration Info */}
            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h4 className="font-semibold text-primary mb-2">📅 Instant Booking Available</h4>
              <p className="text-sm text-muted-foreground">
                Use our Calendly integration above to see real-time availability and book instantly. 
                Perfect for consultations, project discussions, and technical meetings.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="text-gradient-primary">Frequently Asked</span> Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Quick answers to common questions about our services and booking process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-gradient p-6">
              <h4 className="font-semibold text-foreground mb-3">🆓 Is the consultation really free?</h4>
              <p className="text-muted-foreground text-sm">
                Yes! Our 30-minute consultation is completely free with no obligations. 
                We'll discuss your project, provide insights, and offer a tailored solution.
              </p>
            </Card>

            <Card className="card-gradient p-6">
              <h4 className="font-semibold text-foreground mb-3">⏱️ How quickly can we start?</h4>
              <p className="text-muted-foreground text-sm">
                Most projects can begin within 48-72 hours after agreement. 
                Emergency projects can often start the same day.
              </p>
            </Card>

            <Card className="card-gradient p-6">
              <h4 className="font-semibold text-foreground mb-3">🌍 Do you work with international clients?</h4>
              <p className="text-muted-foreground text-sm">
                Absolutely! We serve clients globally and have experience with different 
                time zones, currencies, and business requirements worldwide.
              </p>
            </Card>

            <Card className="card-gradient p-6">
              <h4 className="font-semibold text-foreground mb-3">💰 How do you handle pricing?</h4>
              <p className="text-muted-foreground text-sm">
                We provide transparent, detailed quotes based on project scope. 
                No hidden fees, flexible payment terms, and competitive pricing.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
