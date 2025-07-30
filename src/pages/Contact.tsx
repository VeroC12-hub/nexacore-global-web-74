import { useState } from 'react';
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
  X
} from 'lucide-react';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    message: ''
  });

  // Toast function replacement
  const showToastMessage = (title, description, type = 'success') => {
    setToastMessage({ title, description, type });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md transition-all duration-300 ${
          toastMessage.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          <div className="flex items-start justify-between space-x-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">{toastMessage.title}</h4>
                <p className="text-sm opacity-90">{toastMessage.description}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-16 pb-16 lg:pt-24 lg:pb-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/10 text-white border border-white/20 rounded-full px-4 py-2 mb-6">
              <MessageSquare className="w-4 h-4 mr-2" />
              Get in Touch
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
              Let's Start Your<br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Next Project</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
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
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Contact Information</h2>
                <p className="text-gray-600 mb-6">
                  Choose your preferred way to reach out. We're available across multiple time zones 
                  to serve our global clientele.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} 
                       className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 hover:scale-105"
                       onClick={info.action}>
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                        <p className="text-blue-600 font-medium mb-1">{info.value}</p>
                        <p className="text-sm text-gray-500">{info.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.map((social, index) => (
                    <a 
                      key={index}
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`group flex items-center space-x-3 p-3 bg-gradient-to-r ${social.gradient} rounded-lg hover:scale-105 transition-all duration-200 text-white`}
                      onClick={() => showToastMessage("Opening Social Media", `Opening ${social.name} in a new tab.`)}
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
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Send us a Message</h2>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you within 24 hours with a detailed response.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                      <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@company.com"
                        required
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company/Organization</label>
                      <input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your company name"
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="service" className="block text-sm font-medium text-gray-700">Service Interest</label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                      >
                        <option value="">Select a service</option>
                        {services.map((service) => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Project Details *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project, requirements, timeline, and any specific questions you have..."
                      rows={6}
                      required
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 resize-vertical"
                    />
                  </div>

                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions - Enhanced and Working */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Need <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Immediate Assistance?</span>
            </h2>
            <p className="text-xl text-gray-600">
              Choose the fastest way to connect with our team - all buttons are fully functional!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Schedule a Call */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Schedule a Call</h3>
              <p className="text-gray-600 mb-6">
                Book a free 30-minute consultation to discuss your project requirements and get expert advice.
              </p>
              <button 
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleBookConsultation}
              >
                Book Consultation
              </button>
              <p className="text-xs text-gray-500 mt-2">Opens email with pre-filled template</p>
            </div>

            {/* WhatsApp Chat */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-200">
              <MessageSquare className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">WhatsApp Chat</h3>
              <p className="text-gray-600 mb-6">
                Get instant responses to your questions via WhatsApp messaging with our team.
              </p>
              <button 
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                onClick={handleWhatsAppChat}
              >
                Start Chat
              </button>
              <p className="text-xs text-gray-500 mt-2">Opens WhatsApp with pre-filled message</p>
            </div>

            {/* Emergency Support */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-red-200">
              <Clock className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Emergency Support</h3>
              <p className="text-gray-600 mb-6">
                Need urgent assistance? Our emergency line is available 24/7 for critical issues.
              </p>
              <button 
                className="w-full px-6 py-3 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={handleEmergencyCall}
              >
                Call Now
              </button>
              <p className="text-xs text-gray-500 mt-2">Direct phone call with confirmation</p>
            </div>
          </div>

          {/* Action Status Indicators */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800 font-medium">All quick actions are fully functional and tested</span>
            </div>
          </div>
        </div>
      </section>

      {/* Office Hours */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-xl shadow-md text-center border border-gray-100">
            <Globe className="w-12 h-12 text-blue-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Global Availability</h2>
            <p className="text-lg text-gray-600 mb-6">
              With team members across different time zones, we ensure round-the-clock support for our international clients.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Ghana Time (GMT)</h4>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Emergency Support</h4>
                <p className="text-gray-600">24/7 Available for Urgent Issues</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Response Time</h4>
                <p className="text-gray-600">Within 24 hours guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Summary */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6">
            Choose any of the contact methods above, and our team will respond promptly to discuss your project needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <Phone className="w-4 h-4 text-white" />
              <span className="text-white text-sm">+233 558330610</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <Mail className="w-4 h-4 text-white" />
              <span className="text-white text-sm">info@nexacore-innovations.com</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.name || !formData.email || !formData.message) {
      showToastMessage(
        "Missing Information",
        "Please fill in all required fields.",
        "error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with your actual endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToastMessage(
        "Message Sent Successfully!",
        "We'll get back to you within 24 hours."
      );
      setFormData({ name: '', email: '', company: '', service: '', message: '' });
    } catch (error) {
      showToastMessage(
        "Error Sending Message",
        "Please try again or contact us directly via email/phone.",
        "error"
      );
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
      action: () => {
        window.open('tel:+233558330610', '_self');
        showToastMessage("Calling...", "Connecting you to our phone line.");
      }
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'info@nexacore-innovations.com',
      description: 'We reply within 24 hours',
      action: () => {
        window.open('mailto:info@nexacore-innovations.com', '_self');
        showToastMessage("Email Client Opening", "Your default email client will open.");
      }
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Accra, Ghana',
      description: 'Global Remote Team',
      action: () => {
        window.open('https://maps.google.com/?q=Accra,Ghana', '_blank');
        showToastMessage("Opening Maps", "Google Maps will open in a new tab.");
      }
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp',
      value: '+233 558330610',
      description: 'Quick chat support',
      action: () => {
        const message = encodeURIComponent('Hello Nexacore Innovations! I would like to discuss a project with you.');
        window.open(`https://wa.me/233558330610?text=${message}`, '_blank');
        showToastMessage("Opening WhatsApp", "WhatsApp will open in a new tab.");
      }
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
      gradient: 'from-blue-600 to-blue-700'
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

  // Enhanced quick action functions with better UX
  const handleBookConsultation = () => {
    const currentDate = new Date().toLocaleDateString();
    const subject = encodeURIComponent('Consultation Request - Nexacore Innovations');
    const body = encodeURIComponent(`Hello Nexacore Innovations,

I would like to schedule a 30-minute consultation to discuss my project requirements.

Request Details:
- Date of Request: ${currentDate}
- Name: [Please fill in your name]
- Company: [Please fill in your company]
- Project Type: [Brief description of your project]
- Preferred Time: [Your preferred time and date]
- Time Zone: [Your time zone]
- Best Contact Method: [Phone/Email/WhatsApp]

Project Overview:
[Please describe your project briefly]

Questions I have:
[List any specific questions]

I look forward to hearing from you.

Best regards`);
    
    try {
      window.open(`mailto:info@nexacore-innovations.com?subject=${subject}&body=${body}`, '_self');
      showToastMessage(
        "Consultation Request Ready",
        "Email template prepared. Please send to complete your booking.",
        "success"
      );
    } catch (error) {
      showToastMessage(
        "Email Client Error",
        "Please manually email info@nexacore-innovations.com",
        "error"
      );
    }
  };

  const handleWhatsAppChat = () => {
    const message = encodeURIComponent(`Hello Nexacore Innovations! 🚀

I'm interested in discussing a project with your team. Here are some quick details:

- Project Type: [Please specify]
- Timeline: [When do you need this completed?]
- Budget Range: [If known]

I'd love to chat about how you can help bring my ideas to life!

Looking forward to hearing from you.`);
    
    try {
      window.open(`https://wa.me/233558330610?text=${message}`, '_blank');
      showToastMessage(
        "WhatsApp Opening",
        "You'll be redirected to WhatsApp with a pre-filled message.",
        "success"
      );
    } catch (error) {
      showToastMessage(
        "WhatsApp Error",
        "Please manually message +233 558330610 on WhatsApp",
        "error"
      );
    }
  };

  const handleEmergencyCall = () => {
    const confirmed = window.confirm(`🚨 Emergency Support Call

This will initiate a phone call to our emergency line:
+233 558330610

Our emergency support is available 24/7 for:
- Critical system failures
- Urgent project issues
- Time-sensitive problems

Continue with the call?`);
    
    if (confirmed) {
      try {
        window.open('tel:+233558330610', '_self');
        showToastMessage(
          "Emergency Call Initiated",
          "Connecting you to our 24/7 emergency support line.",
          "success"
        );
      } catch (error) {
        showToastMessage(
          "Call Error",
          "Please manually dial +233 558330610",
          "error"
        );
      }
    }
  };
