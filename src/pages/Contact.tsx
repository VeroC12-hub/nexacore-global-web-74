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
  Calendar
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: '', email: '', company: '', service: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      value: '+233 54087377',
      description: 'Mon-Fri 9AM-6PM GMT',
      action: 'tel:+233540873777'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'info@nexacoreinnovations.com',
      description: 'We reply within 24 hours',
      action: 'mailto:info@nexacoreinnovations.com'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Accra, Ghana',
      description: 'Global Remote Team',
      action: '#'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp',
      value: '+233 54087377',
      description: 'Quick chat support',
      action: 'https://wa.me/233540873777'
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
                  <Card key={index} className="card-gradient p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center flex-shrink-0">
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
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
                    <Linkedin className="w-5 h-5 text-white" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gradient-to-br from-success to-success/80 rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </a>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">Service Interest</Label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
                    />
                  </div>

                  <Button type="submit" className="btn-hero w-full md:w-auto">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
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
            <Card className="card-service text-center">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gradient-primary">Schedule a Call</h3>
              <p className="text-muted-foreground mb-6">
                Book a free 30-minute consultation to discuss your project requirements.
              </p>
              <Button className="btn-hero w-full">Book Consultation</Button>
            </Card>

            <Card className="card-service text-center">
              <MessageSquare className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gradient-primary">WhatsApp Chat</h3>
              <p className="text-muted-foreground mb-6">
                Get instant responses to your questions via WhatsApp messaging.
              </p>
              <Button className="btn-success w-full">Start Chat</Button>
            </Card>

            <Card className="card-service text-center">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gradient-primary">Emergency Support</h3>
              <p className="text-muted-foreground mb-6">
                Need urgent assistance? Our emergency line is available 24/7.
              </p>
              <Button variant="outline" className="btn-outline-primary w-full">Call Now</Button>
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