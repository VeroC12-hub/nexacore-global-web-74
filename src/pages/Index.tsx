import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cog, 
  Smartphone, 
  Palette, 
  BarChart3, 
  ArrowRight, 
  Globe, 
  Award,
  Users,
  CheckCircle,
  Star,
  Quote
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Add this import
import heroImage from '@/assets/hero-main.jpg';
import teamImage from '@/assets/team-collaboration.jpg';
import abstractBg from '@/assets/abstract-tech.jpg';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EnhancedHeroButtons from '@/components/EnhancedHeroButtons';

const Index = () => {
  const navigate = useNavigate(); // Add this hook

  // Function to handle service card click
  const handleServiceClick = (serviceTitle) => {
    // Map service titles to specific services in GetStarted
    const serviceMapping = {
      'Engineering & Technical': 'CAD Engineering',
      'Software & App Development': 'Software Engineering', 
      'Creative & Branding': 'Graphic Design',
      'Data & Digital Growth': 'Data Analysis'
    };

    const selectedService = serviceMapping[serviceTitle] || 'Software Engineering';
    
    // Navigate to GetStarted with the selected service as a URL parameter
    navigate(`/get-started?service=${encodeURIComponent(selectedService)}`);
  };

  const services = [
    {
      icon: Cog,
      title: 'Engineering & Technical',
      description: 'CAD Design, 3D Animation, AI/ML Engineering, Blockchain Solutions',
      features: ['CAD/Design Engineering', '3D Animation & VFX', 'AI/ML Engineering', 'Blockchain/Web3']
    },
    {
      icon: Smartphone,
      title: 'Software & App Development',
      description: 'Custom software, mobile apps, cybersecurity, and automation solutions',
      features: ['Custom Software', 'Mobile Apps', 'Cybersecurity', 'AI/ML Tools']
    },
    {
      icon: Palette,
      title: 'Creative & Branding',
      description: 'Graphic design, video editing, UI/UX design, and content creation',
      features: ['Graphic Design', 'Video Editing', 'UI/UX Design', 'Content Writing']
    },
    {
      icon: BarChart3,
      title: 'Data & Digital Growth',
      description: 'Analytics dashboards, Excel automation, Power BI, digital marketing',
      features: ['Data Analytics', 'Excel Automation', 'Power BI', 'Digital Marketing']
    }
  ];

  const stats = [
    { number: '50+', label: 'Projects Delivered' },
    { number: '25+', label: 'Global Clients' },
    { number: '15+', label: 'Expert Team Members' },
    { number: '5+', label: 'Years Experience' }
  ];

  const testimonials = [
    {
      name: 'Ocloo Godwin',
      company: 'NexaCore Innovations',
      role: 'Co-Founder & Project Manager',
      content: 'As a certified industrial designer from WorldSkills, I bring precision and creativity into every project. At NexaCore, we build solutions that work in the real world.',
      rating: 5
    },
    {
      name: 'Benjamin Agbesi',
      company: 'NexaCore Innovations',
      role: 'Co-Founder & Operations Manager',
      content: 'From branding to execution, we ensure every project runs smoothly and leaves a strong impact. Our process is our strength.',
      rating: 5
    },
    {
      name: 'Manasseh Kabutey',
      company: 'NexaCore Innovations',
      role: 'Software & App Dev Lead',
      content: 'We specialize in full-stack systems and cutting-edge app development. NexaCore delivers secure and scalable digital solutions.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-success/5"></div>
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${abstractBg})` }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:scale-105 transition-transform duration-300">
                  Innovation & Excellence
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="text-gradient-hero">Engineering Global</span><br />
                  <span className="text-foreground">Innovation with</span><br />
                  <span className="text-gradient-primary">Excellence</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  We're a multi-disciplinary team of engineers, developers, and designers delivering 
                  technical, creative, and digital solutions to clients worldwide.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/get-started">
                  <Button className="btn-hero text-lg px-8 py-4 group">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link to="/portfolio">
                  <Button variant="outline" className="btn-outline-primary text-lg px-8 py-4 group">
                    <span className="story-link">View Portfolio</span>
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center hover-lift group">
                    <div className="text-2xl lg:text-3xl font-bold text-gradient-primary group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              <div className="relative rounded-2xl overflow-hidden shadow-[var(--shadow-strong)] hover:shadow-[var(--shadow-glow)] transition-shadow duration-500">
                <img 
                  src={heroImage} 
                  alt="NexaCore Team Innovation" 
                  className="w-full h-auto animate-float hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-primary-glow/20 to-success/20 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-gradient-to-br from-success/20 to-primary/20 rounded-full blur-2xl animate-pulse-slow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              Our Expertise
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              <span className="text-gradient-primary">Comprehensive Solutions</span> for Every Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From engineering and software development to creative design and data analytics, 
              we provide end-to-end solutions that drive innovation and growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className="card-service group cursor-pointer hover:shadow-xl hover:shadow-primary/20 transition-all duration-300" 
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleServiceClick(service.title)}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 glow-primary group-hover:glow-success">
                  <service.icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gradient-primary group-hover:text-gradient-hero transition-all duration-300">{service.title}</h3>
                <p className="text-muted-foreground mb-4 group-hover:text-foreground transition-colors duration-300">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: `${idx * 50}ms` }}>
                      <CheckCircle className="w-4 h-4 text-success mr-2 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:text-foreground transition-colors duration-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Call-to-action overlay */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-primary/90 to-transparent absolute inset-0 flex items-end justify-center pb-6 rounded-lg">
                  <div className="text-white text-center">
                    <p className="font-semibold mb-2">Click to Get Started</p>
                    <ArrowRight className="w-5 h-5 mx-auto animate-bounce" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Enhanced Services Showcase with Blended Design */}
          <div className="text-center mt-20">
            {/* Section Header */}
            <div className="mb-12">
              <Badge className="bg-gradient-to-r from-primary/20 to-success/20 text-primary border-primary/30 mb-6 text-lg px-6 py-2">
                Complete Service Portfolio
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-gradient-hero">Our Services</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Discover our comprehensive range of professional services designed to bring your vision to life
              </p>
            </div>

            {/* Image with Blended Background */}
            <div className="relative max-w-5xl mx-auto">
              {/* Gradient Background Blend */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-success/10 to-primary-glow/5 rounded-3xl blur-3xl scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-success/5 via-primary/5 to-accent/10 rounded-3xl blur-2xl scale-105"></div>
              
              {/* Main Content Container */}
              <div className="relative bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                <Link to="/services" className="block group">
                  <div className="relative overflow-hidden rounded-2xl">
                    {/* Color Overlay for Blending */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-success/10 z-10 group-hover:from-primary/15 group-hover:to-success/15 transition-all duration-500"></div>
                    
                    {/* Glow Effects */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-success/20 to-primary-glow/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    <img 
                      src="/services/services.png" 
                      alt="NexaCore Complete Service Portfolio" 
                      className="w-full h-auto relative z-20 group-hover:scale-[1.02] transition-all duration-700 ease-out"
                    />
                    
                    {/* Interactive Overlay */}
                    <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent">
                      <div className="text-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="text-2xl font-bold mb-2">Explore All Services</div>
                        <div className="flex items-center justify-center">
                          <span className="text-lg mr-2">View Details</span>
                          <ArrowRight className="w-6 h-6 animate-bounce" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-primary/20 to-success/20 rounded-full blur-xl animate-pulse-slow"></div>
              <div className="absolute bottom-4 left-4 w-32 h-32 bg-gradient-to-br from-success/15 to-primary-glow/15 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Call-to-Action */}
            <div className="mt-12">
              <Link to="/services">
                <Button className="btn-hero text-lg px-8 py-4 group">
                  Explore All Services
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-success/10 text-success border-success/20">
                <Users className="w-4 h-4 mr-2" />
                Our Global Team
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold">
                <span className="text-gradient-primary">Expert Professionals</span><br />
                from Around the World
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our diverse team combines deep technical expertise with creative innovation. 
                Based in Ghana with international collaborators, we bring global perspectives 
                to every project while maintaining the highest standards of quality and professionalism.
              </p>
              <ul className="space-y-3">
                {[
                  'Certified engineers and developers',
                  'Lean Six Sigma practitioners',
                  'WorldSkills competition participants',
                  'Multi-cultural global perspective'
                ].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <Award className="w-5 h-5 text-success mr-3" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="btn-hero">
                Meet Our Team
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            
            <div className="relative">
              <img 
                src={teamImage} 
                alt="NexaCore Global Team" 
                className="rounded-2xl shadow-[var(--shadow-strong)]"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-success/10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-success/10 text-success border-success/20 mb-4">
              Client Success Stories
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              What Our <span className="text-gradient-primary">Global Clients</span> Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-gradient p-8 hover-lift card-interactive group" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }} />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-primary/30 mb-4 group-hover:text-primary/60 group-hover:scale-110 transition-all duration-300" />
                <p className="text-muted-foreground mb-6 italic leading-relaxed group-hover:text-foreground transition-colors duration-300">
                  "{testimonial.content}"
                </p>
                <div className="group-hover:translate-y-1 transition-transform duration-300">
                  <div className="font-semibold text-foreground group-hover:text-gradient-primary transition-all duration-300">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground group-hover:text-primary transition-colors duration-300">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-glow to-success"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-white/20 text-white border-white/30 mb-6">
            <Globe className="w-4 h-4 mr-2" />
            Ready to Start?
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Let's Build Something Amazing Together
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join our growing list of satisfied clients worldwide. Get a free consultation 
            and discover how we can transform your ideas into reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90"
              onClick={() => navigate('/get-started')}
            >
              Get Free Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary"
              onClick={() => navigate('/get-started')}
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
