/*
🚀 DEDICATED BOOK CONSULTATION PAGE WITH SMART ROUTING

✅ Features:
- Full-page smart routing experience
- Professional consultation booking flow
- Integrated with your branding (Navbar + Footer)
- Emergency fallback options
- Analytics ready
- Mobile responsive design

🔧 Usage:
- Add to your routing: <Route path="/book-consultation" element={<BookConsultation />} />
- Update navigation to include link to /book-consultation
- All Calendly URLs configured for your account
*/

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Clock, 
  Users, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Code,
  Palette,
  BarChart3,
  Wrench,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Globe,
  Shield,
  Award
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BookConsultation = () => {
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
      color: 'from-blue-500 to-blue-600',
      features: ['System Architecture', 'Technical Consulting', 'Integration Solutions', 'Performance Optimization']
    },
    'software': {
      title: 'Software & App Development',
      icon: Code,
      description: 'Web applications, mobile apps, custom software development',
      calendlyUrl: 'https://calendly.com/godwin-ocloo-nexacore-innovations/software-development-consultation',
      duration: '60 minutes',
      color: 'from-green-500 to-green-600',
      features: ['Web Applications', 'Mobile Apps', 'Custom Software', 'API Development']
    },
    'creative': {
      title: 'Creative & Branding',
      icon: Palette,
      description: 'UI/UX design, branding, graphic design, creative solutions',
      calendlyUrl: 'https://calendly.com/godwin-ocloo-nexacore-innovations/creative-consultation',
      duration: '30 minutes',
      color: 'from-purple-500 to-purple-600',
      features: ['UI/UX Design', 'Brand Identity', 'Graphic Design', 'User Research']
    },
    'data': {
      title: 'Data & Digital Growth',
      icon: BarChart3,
      description: 'Analytics, digital marketing, data science, growth strategies',
      calendlyUrl: 'https://calendly.com/godwin-ocloo-nexacore-innovations/data-digital-consultation',
      duration: '45 minutes',
      color: 'from-orange-500 to-orange-600',
      features: ['Data Analytics', 'Digital Marketing', 'Growth Strategies', 'SEO Optimization']
    },
    'consultation': {
      title: 'General Consultation',
      icon: MessageSquare,
      description: 'Strategic planning, project assessment, general inquiries',
      calendlyUrl: 'https://calendly.com/godwin-ocloo-nexacore-innovations/30min',
      duration: '30 minutes',
      color: 'from-teal-500 to-teal-600',
      features: ['Strategic Planning', 'Project Assessment', 'Technology Advice', 'Business Consultation']
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

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBooking = (serviceKey) => {
    const service = serviceCategories[serviceKey];
    console.log('📅 Booking initiated:', service.title);
    
    // Track booking attempt for analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'consultation_booking_attempt', {
        'service_type': serviceKey,
        'urgency_level': formData.urgency,
        'budget_range': formData.budget,
        'project_type': formData.projectType
      });
    }
    
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
    
    window.open(`https://wa.me/233558330610?text=${message}`, '_blank');
  };

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
          <Users className="w-4 h-4 mr-2" />
          Step 1 of 3 • Personal Information
        </Badge>
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tell us about</span> yourself
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Let's start with some basic information so we can personalize your consultation experience.
        </p>
      </div>

      <Card className="p-8 max-w-2xl mx-auto bg-gradient-to-br from-white to-gray-50 shadow-lg">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your full name"
                className="h-12 text-base focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@company.com"
                className="h-12 text-base focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-base font-medium">Company/Organization</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Your company name (optional)"
              className="h-12 text-base focus:ring-2 focus:ring-primary"
            />
            <p className="text-sm text-muted-foreground">
              Help us understand your business context
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              onClick={handleNext}
              disabled={!formData.name || !formData.email}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex-1 h-12 text-base"
              size="lg"
            >
              Continue to Project Details
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Step 2: Project Information
  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
          <Code className="w-4 h-4 mr-2" />
          Step 2 of 3 • Project Details
        </Badge>
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">What's your project</span> about?
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Help us understand your needs so we can match you with the right specialist and consultation type.
        </p>
      </div>

      <Card className="p-8 max-w-4xl mx-auto bg-gradient-to-br from-white to-gray-50 shadow-lg">
        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-lg font-semibold">What type of project do you need help with? *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'web-development', label: 'Web Development', icon: '🌐', desc: 'Websites, web apps, e-commerce' },
                { key: 'mobile-app', label: 'Mobile App', icon: '📱', desc: 'iOS, Android, cross-platform' },
                { key: 'custom-software', label: 'Custom Software', icon: '⚙️', desc: 'Enterprise solutions, integrations' },
                { key: 'ui-ux-design', label: 'UI/UX Design', icon: '🎨', desc: 'User interface, user experience' },
                { key: 'branding', label: 'Branding & Identity', icon: '✨', desc: 'Logo, brand guidelines, marketing' },
                { key: 'digital-marketing', label: 'Digital Marketing', icon: '📈', desc: 'SEO, social media, campaigns' },
                { key: 'data-analysis', label: 'Data & Analytics', icon: '📊', desc: 'Business intelligence, reporting' },
                { key: 'system-integration', label: 'System Integration', icon: '🔗', desc: 'API connections, automation' },
                { key: 'consultation', label: 'Strategic Consultation', icon: '💡', desc: 'Planning, strategy, advice' },
                { key: 'other', label: 'Other/Multiple', icon: '🔧', desc: 'Multiple services or custom needs' }
              ].map((type) => (
                <div
                  key={type.key}
                  onClick={() => handleInputChange('projectType', type.key)}
                  className={`p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                    formData.projectType === type.key
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl flex-shrink-0">{type.icon}</span>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{type.label}</h4>
                      <p className="text-sm text-muted-foreground">{type.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">How urgent is this project? *</Label>
              <div className="space-y-3">
                {[
                  { key: 'emergency', label: 'Emergency (Same Day)', color: 'text-red-600', desc: 'Critical issue, immediate attention needed' },
                  { key: 'urgent', label: 'Urgent (This Week)', color: 'text-orange-600', desc: 'High priority, quick turnaround needed' },
                  { key: 'normal', label: 'Standard (Next 2 Weeks)', color: 'text-green-600', desc: 'Normal timeline, planned project' },
                  { key: 'flexible', label: 'Flexible (When Available)', color: 'text-blue-600', desc: 'No rush, when convenient' }
                ].map((urgency) => (
                  <div
                    key={urgency.key}
                    onClick={() => handleInputChange('urgency', urgency.key)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.urgency === urgency.key
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`font-semibold ${urgency.color}`}>{urgency.label}</span>
                        <p className="text-sm text-muted-foreground mt-1">{urgency.desc}</p>
                      </div>
                      {formData.urgency === urgency.key && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">What's your budget range?</Label>
              <div className="space-y-3">
                {[
                  { key: 'under-5k', label: 'Under $5,000', desc: 'Small projects, MVPs' },
                  { key: '5k-15k', label: '$5,000 - $15,000', desc: 'Medium projects, standard features' },
                  { key: '15k-50k', label: '$15,000 - $50,000', desc: 'Large projects, complex features' },
                  { key: 'over-50k', label: '$50,000+', desc: 'Enterprise solutions, full systems' },
                  { key: 'discuss', label: 'Prefer to discuss', desc: 'Will determine during consultation' }
                ].map((budget) => (
                  <div
                    key={budget.key}
                    onClick={() => handleInputChange('budget', budget.key)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.budget === budget.key
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-foreground">{budget.label}</span>
                        <p className="text-sm text-muted-foreground mt-1">{budget.desc}</p>
                      </div>
                      {formData.budget === budget.key && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              variant="outline"
              onClick={handleBack}
              className="h-12 text-base"
              size="lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!formData.projectType || !formData.urgency}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex-1 h-12 text-base"
              size="lg"
            >
              Continue to Final Details
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Step 3: Additional Details
  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
          <MessageSquare className="w-4 h-4 mr-2" />
          Step 3 of 3 • Final Details
        </Badge>
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Almost there!</span> Final details
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A few more details to ensure we provide the most relevant and valuable consultation for your needs.
        </p>
      </div>

      <Card className="p-8 max-w-3xl mx-auto bg-gradient-to-br from-white to-gray-50 shadow-lg">
        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-lg font-semibold">What's your expected timeline?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'asap', label: 'ASAP (Rush Project)', desc: 'Need to start immediately' },
                { key: '1-month', label: 'Within 1 Month', desc: 'Ready to begin soon' },
                { key: '2-3-months', label: '2-3 Months', desc: 'Standard planning timeline' },
                { key: '3-6-months', label: '3-6 Months', desc: 'Long-term planning' },
                { key: '6-months+', label: '6+ Months', desc: 'Future project planning' },
                { key: 'exploring', label: 'Just Exploring Ideas', desc: 'Research and discovery phase' }
              ].map((timeline) => (
                <div
                  key={timeline.key}
                  onClick={() => handleInputChange('timeline', timeline.key)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.timeline === timeline.key
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground">{timeline.label}</span>
                      <p className="text-sm text-muted-foreground mt-1">{timeline.desc}</p>
                    </div>
                    {formData.timeline === timeline.key && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="details" className="text-lg font-semibold">Tell us more about your project</Label>
            <Textarea
              id="details"
              value={formData.projectDetails}
              onChange={(e) => handleInputChange('projectDetails', e.target.value)}
              placeholder="Share your project vision, specific requirements, challenges you're facing, or any questions you have. The more details you provide, the better we can prepare for your consultation."
              rows={6}
              className="text-base focus:ring-2 focus:ring-primary"
            />
            <p className="text-sm text-muted-foreground">
              Optional, but recommended for a more tailored consultation experience
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold">Preferred consultation format</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'video', label: 'Video Call', icon: '📹', desc: 'Zoom, Google Meet, or Teams' },
                { key: 'phone', label: 'Phone Call', icon: '📞', desc: 'Traditional voice call' },
                { key: 'either', label: 'Either Option', icon: '💬', desc: 'Flexible, your choice' }
              ].map((meeting) => (
                <div
                  key={meeting.key}
                  onClick={() => handleInputChange('preferredMeeting', meeting.key)}
                  className={`p-5 border-2 rounded-lg cursor-pointer transition-all text-center ${
                    formData.preferredMeeting === meeting.key
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <span className="text-3xl">{meeting.icon}</span>
                    <div>
                      <h4 className="font-semibold text-foreground">{meeting.label}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{meeting.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              variant="outline"
              onClick={handleBack}
              className="h-12 text-base"
              size="lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex-1 h-12 text-base"
              size="lg"
            >
              Get My Consultation Recommendation
              <Zap className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Step 4: Results & Booking
  const renderResults = () => {
    if (!routingResult) return null;
    
    const recommendedService = serviceCategories[routingResult.recommendedService];
    
    return (
      <div className="space-y-10">
        {/* Success Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Perfect Match</span> Found!
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Based on your project details, we've identified the ideal consultation type and specialist for your needs.
          </p>
        </div>

        {/* Recommended Service */}
        <Card className={`relative p-8 border-2 border-transparent bg-gradient-to-r ${recommendedService.color} text-white overflow-hidden max-w-4xl mx-auto`}>
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/20 text-white border-white/30 text-sm px-3 py-1">
              <Star className="w-4 h-4 mr-1" />
              RECOMMENDED FOR YOU
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <recommendedService.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-3">{recommendedService.title}</h3>
                  <p className="text-white/90 text-lg mb-4">{recommendedService.description}</p>
                  <div className="flex flex-wrap items-center gap-6 text-white/80">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-medium">{recommendedService.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span className="font-medium">Available Today</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      <span className="font-medium">100% Free</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <p className="text-white/95 text-base leading-relaxed">{routingResult.message}</p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white/10 rounded-xl p-6">
                <h4 className="text-white font-semibold mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  What's Included:
                </h4>
                <ul className="space-y-3 text-white/90">
                  {recommendedService.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-3 text-white/70 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Button 
              onClick={() => handleBooking(routingResult.recommendedService)}
              className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold h-14 text-lg"
              size="lg"
            >
              <Calendar className="w-5 h-5 mr-3" />
              Book This Consultation Now - It's Free!
              <ExternalLink className="w-5 h-5 ml-3" />
            </Button>
            <p className="text-center text-white/80 text-sm mt-3">
              ✅ Instant confirmation • 📅 Calendar sync • 🔔 Automatic reminders
            </p>
          </div>
        </Card>

        {/* Emergency Options */}
        {routingResult.priority === 'urgent' && (
          <Card className="p-8 border-2 border-red-200 bg-red-50 max-w-4xl mx-auto">
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-red-800 mb-3">🚨 Need Immediate Assistance?</h4>
                <p className="text-red-700 mb-6 text-lg">
                  Since you marked this as urgent, we also offer instant communication channels for immediate support:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleWhatsAppFallback}
                    className="bg-green-500 hover:bg-green-600 text-white h-12 text-base"
                    size="lg"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    WhatsApp Urgent Support
                  </Button>
                  <Button 
                    onClick={() => window.open('tel:+233558330610')}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50 h-12 text-base"
                    size="lg"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call +233 558330610
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Alternative Services */}
        <div className="max-w-6xl mx-auto">
          <h4 className="text-2xl font-bold text-center mb-8">
            Or explore <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">other consultation options:</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(serviceCategories)
              .filter(([key]) => key !== routingResult.recommendedService)
              .map(([key, service]) => (
                <Card key={key} className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105" onClick={() => handleBooking(key)}>
                  <div className="text-center">
                    <div className={`w-14 h-14 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">{service.title}</h5>
                    <p className="text-sm text-gray-600 mb-3">{service.duration}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Book This Instead
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>

        {/* Contact Information */}
        <Card className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h4 className="text-xl font-bold mb-2">📞 Need Help or Have Questions?</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Our team is here to assist you with any questions about the consultation process
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h5 className="font-semibold mb-1">Email Support</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">info@nexacore-innovations.com</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h5 className="font-semibold mb-1">Phone Support</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">+233 558330610</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h5 className="font-semibold mb-1">WhatsApp</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available 24/7</p>
            </div>
          </div>
        </Card>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h5 className="font-semibold mb-1">100% Free Consultation</h5>
              <p className="text-sm text-gray-600">No hidden fees or obligations</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h5 className="font-semibold mb-1">Global Experience</h5>
              <p className="text-sm text-gray-600">Serving clients worldwide</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h5 className="font-semibold mb-1">Expert Team</h5>
              <p className="text-sm text-gray-600">Specialized consultants</p>
            </div>
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
            className="h-12 text-base px-8"
            size="lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Start Over with Different Information
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      {/* Header */}
      <section className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Consultation Booking
              </h1>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Find Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Perfect Match</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Answer a few quick questions and we'll automatically match you with the right specialist 
              and consultation type for your specific project needs.
            </p>
          </div>
        </div>
      </section>

      {/* Progress Indicator */}
      {currentStep < 4 && (
        <section className="pb-8">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step <= currentStep 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : step === currentStep + 1
                      ? 'bg-blue-100 text-blue-600 border-2 border-blue-300'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step < currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 3 && (
                    <div className={`w-20 h-2 mx-3 rounded-full transition-all ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-5">
              <span className="text-sm text-gray-500">Personal Info</span>
              <span className="text-sm text-gray-500">Project Details</span>
              <span className="text-sm text-gray-500">Final Details</span>
            </div>
          </div>
        </section>
      )}

      {/* Form Content */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderResults()}
        </div>
      </section>

      {/* Footer */}
      <div className="border-t bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p className="mb-2">🔒 Your information is secure and will only be used to provide you with the best consultation experience.</p>
            <p>Powered by <span className="font-semibold text-blue-600">NexaCore Innovations</span> • Calendly Integration • AI-Powered Matching</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookConsultation;
