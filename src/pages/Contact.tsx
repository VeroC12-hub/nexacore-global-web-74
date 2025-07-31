/*
🚀 COMPLETE CONTACT FORM WITH CALENDLY INTEGRATION

✅ Features:
- Real EmailJS integration (production ready)
- Calendly booking system for consultations
- WhatsApp integration with smart fallbacks
- Enhanced user experience with better feedback
- Mobile responsive design
- Professional error handling

🔧 Setup Required:
1. EmailJS credentials (already configured)
2. Calendly account setup:
   - Go to calendly.com and create free account
   - Create "30-Minute Consultation" event
   - Replace 'nexacore-innovations' in the URL below with your actual Calendly username
   - Configure your availability and intake questions

📧 EmailJS Configuration:
- Service ID: service_skk2xfl
- Template ID: template_ina7xpa
- Public Key: YUqPQV4IrK7H3F3-T
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
  Zap
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
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
    // Alternative booking methods
    fallbackEnabled: true
  };

  // Production EmailJS form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "❌ Required Fields Missing",
        description: "Please fill in all required fields (Name, Email, and Message).",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    // Validate email format
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
      // Check if EmailJS is loaded
      const emailjs = window.emailjs;
      
      if (!emailjs) {
        throw new Error('EmailJS library not loaded. Please ensure the EmailJS script is included in your HTML.');
      }

      // Prepare template parameters for your EmailJS template
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

      // Send email using your EmailJS configuration
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
        
        // Clear form after successful submission
        setFormData({ name: '', email: '', company: '', service: '', message: '' });
        
        // Clear success status after 10 seconds
        setTimeout(() => setSubmitStatus(null), 10000);
      } else {
        throw new Error(`EmailJS returned status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ EmailJS Error:', error);
      setSubmitStatus('error');
      
      // Enhanced error handling with specific messages
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
      
      // Clear error status after 10 seconds
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
      // Open Calendly booking page
      window.open(CALENDLY_CONFIG.consultationUrl, '_blank');
      
      // Provide user feedback
      toast({
        title: "📅 Opening Booking Calendar...",
        description: "Select your preferred time slot. Instant confirmation & calendar invite included!",
        duration: 5000,
      });
      
      // Analytics tracking (optional)
      console.log('📊 Consultation booking initiated via Calendly');
      
    } catch (error) {
      console.error('Error opening Calendly:', error);
      
      // Fallback to WhatsApp if Calendly fails
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
    
    const whatsappUrl = `https://wa.me/233558330610?text=${message}`;
    
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
    
    const whatsappUrl = `https://wa.me/233558330610?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "💬 Opening WhatsApp...",
      description: "Redirecting to WhatsApp with pre-filled message for instant support!",
      duration: 4000,
    });
  };

  // 🚨 EMERGENCY SUPPORT
  const handleEmergencyCall = () => {
    window.open('tel:+233558330610', '_self');
    
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
      value: '+233 558330610',
      description: 'Mon-Fri 9AM-6PM GMT',
      action: 'tel:+233558330610'
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
      value: '+233 558330610',
      description: 'Quick chat support',
      action: 'https://wa.me/233558330610?text=Hello%20NexaCore%20Innovations!%20I%20would%20like%20to%20discuss%20a%20project%20with%20you.'
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
      url: 'https://wa.me/233558330610?text=Hello%20NexaCore%20Innovations!',
      gradient: 'from-green-500 to-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
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
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to transform your ideas into reality? Our global team is here to help you 
              achieve your goals with innovative solutions tailored to your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gradient-primary">Contact Information</h2>
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
                        <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                        <p className="text-primary font-medium mb-1">{info.value}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Social Links */}
              <div className="pt-6">
                <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
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
                  <h2 className="text-2xl font-bold mb-4 text-gradient-primary">Send us a Message</h2>
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
