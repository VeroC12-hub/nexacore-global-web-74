/*
🚀 EMAILJS SETUP INSTRUCTIONS:

1. Go to https://www.emailjs.com/ and create a free account
2. Create an Email Service (Gmail, Outlook, etc.)
3. Create an Email Template with these variables:
   - {{from_name}} - Sender's name
   - {{from_email}} - Sender's email
   - {{company}} - Company name
   - {{service}} - Service interest
   - {{message}} - Message content
   - {{timestamp}} - Submission time
   
4. Get your credentials from the EmailJS dashboard:
   - Service ID (from Email Services)
   - Template ID (from Email Templates)  
   - Public Key (from Account > API Keys)

5. Add this script to your index.html file:
   <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
   <script type="text/javascript">
     (function() {
       emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your public key
     })();
   </script>

6. Replace the placeholder values in the code below:
   - YOUR_SERVICE_ID
   - YOUR_TEMPLATE_ID  
   - YOUR_PUBLIC_KEY

📧 Example Email Template:
Subject: New Contact Form Submission from {{from_name}}

Hello,

You have received a new message from your website contact form:

Name: {{from_name}}
Email: {{from_email}}
Company: {{company}}
Service Interest: {{service}}
Submitted: {{timestamp}}

Message:
{{message}}

Reply to: {{from_email}}
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
  Loader2
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

  // EmailJS Configuration - Replace with your actual values
  const EMAILJS_CONFIG = {
    serviceID: 'YOUR_SERVICE_ID',      // Replace with your service ID
    templateID: 'YOUR_TEMPLATE_ID',    // Replace with your template ID
    publicKey: 'YOUR_PUBLIC_KEY',      // Replace with your public key
    demoMode: true  // Set to false once you've configured EmailJS
  };

  // Enhanced form submission handler with EmailJS
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Demo mode for testing before EmailJS setup
      if (EMAILJS_CONFIG.demoMode) {
        console.log('🧪 DEMO MODE: Form data that would be sent:', formData);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setSubmitStatus('success');
        toast({
          title: "🧪 Demo Mode: Message Simulated!",
          description: "This is a demo. Set up EmailJS to send real emails. Check console for form data.",
          duration: 6000,
        });
        
        setFormData({ name: '', email: '', company: '', service: '', message: '' });
        setTimeout(() => setSubmitStatus(null), 8000);
        return;
      }

      // Real EmailJS implementation
      const emailjs = window.emailjs;
      
      if (!emailjs) {
        throw new Error('EmailJS not loaded. Please ensure the EmailJS script is included in your HTML.');
      }

      // Check if configuration is still using placeholder values
      if (EMAILJS_CONFIG.serviceID === 'YOUR_SERVICE_ID' || 
          EMAILJS_CONFIG.templateID === 'YOUR_TEMPLATE_ID' || 
          EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
        throw new Error('Please configure your EmailJS credentials in the EMAILJS_CONFIG object.');
      }

      // Prepare template parameters
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        company: formData.company || 'Not specified',
        service: formData.service || 'Not specified',
        message: formData.message,
        to_email: 'info@nexacore-innovations.com',
        reply_to: formData.email,
        timestamp: new Date().toLocaleString(),
        subject: `New Contact Form Submission from ${formData.name}`,
      };

      console.log('📧 Sending email with EmailJS...', templateParams);

      // Send email using EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceID,
        EMAILJS_CONFIG.templateID,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );

      console.log('✅ EmailJS Response:', response);
      
      if (response.status === 200) {
        setSubmitStatus('success');
        toast({
          title: "✅ Message Sent Successfully!",
          description: "Thank you for contacting us! We'll get back to you within 24 hours.",
          duration: 5000,
        });
        
        // Clear form
        setFormData({ name: '', email: '', company: '', service: '', message: '' });
        setTimeout(() => setSubmitStatus(null), 8000);
      } else {
        throw new Error('Failed to send email');
      }
      
    } catch (error) {
      console.error('❌ Email Error:', error);
      setSubmitStatus('error');
      
      // Detailed error handling
      let errorMessage = "Please try again or contact us directly.";
      let errorTitle = "❌ Error Sending Message";
      
      if (error.message.includes('EmailJS not loaded')) {
        errorTitle = "⚙️ EmailJS Not Configured";
        errorMessage = "Please add the EmailJS script to your HTML file and configure your credentials.";
      } else if (error.message.includes('configure your EmailJS')) {
        errorTitle = "🔧 Configuration Required";
        errorMessage = "Please update the EMAILJS_CONFIG with your actual service credentials.";
      } else if (error.message.includes('Invalid service ID')) {
        errorTitle = "🔑 Invalid Service ID";
        errorMessage = "Please check your EmailJS service ID configuration.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 6000,
      });
      
      setTimeout(() => setSubmitStatus(null), 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      action: 'https://wa.me/233558330610?text=Hello%20Nexacore%20Innovations!%20I%20would%20like%20to%20discuss%20a%20project%20with%20you.'
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
      url: 'https://wa.me/233558330610?text=Hello%20Nexacore%20Innovations!',
      gradient: 'from-green-500 to-green-600'
    }
  ];

  // Enhanced quick booking function with better feedback
  const handleBookConsultation = () => {
    const subject = encodeURIComponent('🗓️ Consultation Request - Nexacore Innovations');
    const body = encodeURIComponent(`Hello Nexacore Innovations Team,

I hope this email finds you well! I would like to schedule a FREE 30-minute consultation to discuss my project requirements.

📋 PROJECT DETAILS:
• Project Type: [Please specify - Web Development, Mobile App, etc.]
• Timeline: [When do you need this completed?]
• Budget Range: [Optional]
• Special Requirements: [Any specific needs or questions?]

📅 PREFERRED CONSULTATION TIMES:
• Option 1: [Day/Time]
• Option 2: [Day/Time] 
• Option 3: [Day/Time]

Please let me know your available time slots that work best for both of us.

Looking forward to discussing how Nexacore Innovations can help bring my project to life!

Best regards,
[Your Name]
[Your Phone Number]`);
    
    // Open email client
    window.open(`mailto:info@nexacore-innovations.com?subject=${subject}&body=${body}`, '_blank');
    
    // Show feedback with enhanced message
    toast({
      title: "📧 Email Client Opened!",
      description: "Pre-filled consultation request ready to send. Check your email client.",
      duration: 4000,
    });
  };

  const handleWhatsAppChat = () => {
    const message = encodeURIComponent(`👋 Hello Nexacore Innovations!

I'm interested in your services and would like to discuss my project requirements.

🚀 I'm looking for help with:
• [Brief description of your project]

⏰ Best time to chat: [Your preferred time]

Can we schedule a quick chat to explore how you can help me achieve my goals?

Thank you! 😊`);
    
    const whatsappUrl = `https://wa.me/233558330610?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Show feedback with enhanced message
    toast({
      title: "💬 Opening WhatsApp...",
      description: "Redirecting to WhatsApp with pre-filled message for instant support!",
      duration: 4000,
    });
  };

  const handleEmergencyCall = () => {
    // First try to make the call
    window.open('tel:+233558330610', '_self');
    
    // Show feedback with enhanced message
    toast({
      title: "🚨 Calling Emergency Line",
      description: "Connecting you to our 24/7 emergency support. If call doesn't connect, try WhatsApp.",
      duration: 5000,
    });
    
    // Fallback option after 3 seconds if call doesn't work
    setTimeout(() => {
      toast({
        title: "📱 Alternative Contact Options",
        description: "Call not connecting? Try our WhatsApp for immediate assistance!",
        duration: 4000,
      });
    }, 3000);
  };

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
              <Card className="card-gradient p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-gradient-primary">Send us a Message</h2>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you within 24 hours with a detailed response.
                  </p>
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-green-800 font-medium">Message sent successfully!</p>
                      <p className="text-green-600 text-sm">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-red-800 font-medium">Error sending message</p>
                      <p className="text-red-600 text-sm">Please try again or contact us directly via email/phone.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
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
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Button 
                      onClick={handleSubmit}
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
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
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
            <Card className="card-service text-center group hover:scale-105 transition-all duration-300 cursor-pointer" onClick={handleBookConsultation}>
              <div className="p-6">
                <Calendar className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3 text-gradient-primary">Schedule a Call</h3>
                <p className="text-muted-foreground mb-6">
                  Book a free 30-minute consultation to discuss your project requirements.
                </p>
                <Button className="btn-hero w-full" onClick={(e) => {e.stopPropagation(); handleBookConsultation();}}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Consultation
                </Button>
              </div>
            </Card>

            <Card className="card-service text-center group hover:scale-105 transition-all duration-300 cursor-pointer" onClick={handleWhatsAppChat}>
              <div className="p-6">
                <MessageSquare className="w-12 h-12 text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3 text-gradient-primary">WhatsApp Chat</h3>
                <p className="text-muted-foreground mb-6">
                  Get instant responses to your questions via WhatsApp messaging.
                </p>
                <Button className="bg-green-500 hover:bg-green-600 text-white w-full" onClick={(e) => {e.stopPropagation(); handleWhatsAppChat();}}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </Card>

            <Card className="card-service text-center group hover:scale-105 transition-all duration-300 cursor-pointer" onClick={handleEmergencyCall}>
              <div className="p-6">
                <Clock className="w-12 h-12 text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3 text-gradient-primary">Emergency Support</h3>
                <p className="text-muted-foreground mb-6">
                  Need urgent assistance? Our emergency line is available 24/7.
                </p>
                <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white w-full" onClick={(e) => {e.stopPropagation(); handleEmergencyCall();}}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Office Hours */}
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
                <h4 className="font-semibold text-foreground mb-2">Ghana Time (GMT)</h4>
                <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Emergency Support</h4>
                <p className="text-muted-foreground">24/7 Available for Urgent Issues</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Response Time</h4>
                <p className="text-muted-foreground">Within 24 hours guaranteed</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
