import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Clock, 
  Users, 
  Shield,
  ArrowRight,
  CheckCircle,
  Zap,
  Heart,
  Star,
  MapPin
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const RemoteDevelopment = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const globalAdvantages = [
    {
      icon: Globe,
      title: "Global Reach",
      description: "Serving clients across 50+ countries with engineering excellence"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock engineering services across all time zones"
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Skilled engineers, developers, and designers working remotely"
    },
    {
      icon: Shield,
      title: "Secure Services",
      description: "Enterprise-grade security for all remote engineering projects"
    }
  ];

  const services = [
    "Engineering Services",
    "Software Development Services", 
    "Remote Engineering",
    "Development Services",
    "Technical Services",
    "Digital Services",
    "IT Services", 
    "Consulting Services",
    "Design Services",
    "Analytics Services",
    "AI Services",
    "Blockchain Services"
  ];

  const regions = [
    { name: "North America", clients: "500+", flag: "🇺🇸" },
    { name: "Europe", clients: "300+", flag: "🇪🇺" },
    { name: "Asia Pacific", clients: "200+", flag: "🌏" },
    { name: "Middle East", clients: "150+", flag: "🇦🇪" },
    { name: "Australia", clients: "100+", flag: "🇦🇺" },
    { name: "Africa", clients: "250+", flag: "🌍" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Optimized for ALL keyword variations */}
      <section className="pt-16 pb-16 lg:pt-24 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
            Global Remote Services
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient-hero">Remote Engineering</span><br />
            <span className="text-foreground">Services Worldwide</span>
          </h1>
          <div className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
            <p className="mb-4">
              Professional <strong>engineering services</strong>, <strong>software development</strong>, and <strong>technical services</strong> delivered remotely to clients globally.
            </p>
            <p>
              Our <strong>services</strong> include engineering, development, design, consulting, and digital transformation - all available as <strong>remote services</strong> worldwide.
            </p>
          </div>
          
          {/* Service keyword variations for SEO */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {services.map((service, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {service}
              </Badge>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="btn-hero text-lg px-8 py-4"
              onClick={() => navigate('/get-started')}
            >
              Get Remote Services
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              className="text-lg px-8 py-4"
              onClick={() => navigate('/contact')}
            >
              Discuss Your Project
            </Button>
          </div>
        </div>
      </section>

      {/* Global Advantages */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Why Choose Our <span className="text-gradient-primary">Remote Engineering Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We deliver world-class engineering services, software development, and technical services remotely to businesses worldwide.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {globalAdvantages.map((advantage, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <advantage.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gradient-primary">{advantage.title}</h3>
                <p className="text-muted-foreground">{advantage.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              <span className="text-gradient-primary">Global Services</span> Reach
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our remote engineering services, development services, and technical services reach clients in every major market worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">{region.flag}</span>
                    {region.name}
                  </h3>
                  <Badge variant="secondary">{region.clients} clients</Badge>
                </div>
                <p className="text-muted-foreground">
                  Delivering engineering services and development services across {region.name}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Offered */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Complete <span className="text-gradient-primary">Remote Services</span> Portfolio
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From engineering to development, design to consulting - all our services are available remotely worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CheckCircle className="w-8 h-8 text-success mb-4" />
              <h3 className="text-xl font-semibold mb-3">Engineering Services</h3>
              <p className="text-muted-foreground mb-4">
                CAD design, 3D modeling, technical drawings, and engineering consulting services delivered remotely.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Remote CAD Engineering</li>
                <li>• 3D Design Services</li>
                <li>• Technical Consulting</li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Zap className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Development Services</h3>
              <p className="text-muted-foreground mb-4">
                Software development, web applications, mobile apps, and custom development services.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Remote Software Development</li>
                <li>• Web Development Services</li>
                <li>• Mobile App Development</li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Heart className="w-8 h-8 text-success mb-4" />
              <h3 className="text-xl font-semibold mb-3">Digital Services</h3>
              <p className="text-muted-foreground mb-4">
                Digital transformation, AI/ML solutions, and modern technology services for global businesses.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• AI & ML Services</li>
                <li>• Digital Transformation</li>
                <li>• Technology Consulting</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary via-primary-glow to-success text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready for World-Class Remote Services?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Join thousands of businesses worldwide who trust our remote engineering services, development services, and technical services for their success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90"
              onClick={() => navigate('/get-started')}
            >
              Start Your Remote Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary"
              onClick={() => navigate('/contact')}
            >
              Get Free Consultation
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RemoteDevelopment;