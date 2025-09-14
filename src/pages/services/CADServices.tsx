import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Cog, 
  Compass, 
  Layers, 
  Monitor,
  ArrowRight,
  CheckCircle,
  Ruler,
  Settings,
  Building,
  Wrench,
  Zap,
  Globe
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import PortfolioDisplay from '@/components/portfolio/PortfolioDisplay';

const CADServices = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Update page title and meta description dynamically
    document.title = "CAD Design & Engineering Services - NexaCore Innovations";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Professional CAD design and engineering services. 3D modeling, technical drawings, product design, and engineering consultation for manufacturing and construction worldwide.'
      );
    }
  }, []);

  const cadServices = [
    {
      icon: Compass,
      title: "2D Technical Drawings",
      description: "Precise 2D engineering drawings, blueprints, and technical documentation",
      features: ["Architectural Plans", "Mechanical Drawings", "Electrical Schematics", "Manufacturing Blueprints"]
    },
    {
      icon: Layers,
      title: "3D Modeling & Design",
      description: "Advanced 3D modeling for product visualization and engineering analysis",
      features: ["Product Modeling", "Assembly Design", "Surface Modeling", "Parametric Design"]
    },
    {
      icon: Monitor,
      title: "CAD Conversion Services",
      description: "Convert legacy drawings to modern CAD formats and update existing designs",
      features: ["Paper to CAD", "Format Conversion", "Design Updates", "File Migration"]
    },
    {
      icon: Building,
      title: "Architectural Design",
      description: "Complete architectural design services from concept to construction documents",
      features: ["Floor Plans", "Elevations", "Sections", "Construction Details"]
    },
    {
      icon: Wrench,
      title: "Mechanical Engineering",
      description: "Mechanical design, analysis, and engineering consultation services",
      features: ["Machine Design", "Part Design", "Assembly Planning", "Engineering Analysis"]
    },
    {
      icon: Settings,
      title: "Design Optimization",
      description: "Optimize designs for manufacturing, cost reduction, and performance",
      features: ["DFM Analysis", "Cost Optimization", "Performance Analysis", "Design Review"]
    }
  ];

  const software = [
    { name: "AutoCAD", icon: "🔧", description: "2D drafting and 3D modeling" },
    { name: "SolidWorks", icon: "⚙️", description: "3D CAD design and simulation" },
    { name: "Fusion 360", icon: "🔄", description: "Cloud-based 3D CAD/CAM" },
    { name: "Inventor", icon: "💡", description: "3D mechanical design" },
    { name: "Revit", icon: "🏢", description: "Building Information Modeling" },
    { name: "CATIA", icon: "✈️", description: "Advanced 3D design and engineering" }
  ];

  const industries = [
    {
      icon: Building,
      title: "Architecture & Construction",
      description: "Building design, construction drawings, and architectural visualization",
      projects: "500+ building projects completed"
    },
    {
      icon: Cog,
      title: "Manufacturing",
      description: "Product design, tooling, and manufacturing drawings for production",
      projects: "300+ product designs delivered"
    },
    {
      icon: Zap,
      title: "Electronics & Technology",
      description: "Enclosure design, component layouts, and technical documentation",
      projects: "200+ electronic product designs"
    },
    {
      icon: Settings,
      title: "Automotive",
      description: "Vehicle components, assemblies, and automotive engineering drawings",
      projects: "150+ automotive projects"
    }
  ];

  const benefits = [
    {
      icon: Ruler,
      title: "Precision & Accuracy",
      description: "Exact measurements and tolerances for manufacturing and construction"
    },
    {
      icon: Zap,
      title: "Faster Time to Market",
      description: "Accelerate your product development with professional CAD services"
    },
    {
      icon: Globe,
      title: "Global Standards",
      description: "Designs compliant with international standards and manufacturing requirements"
    },
    {
      icon: Settings,
      title: "Cost Optimization",
      description: "Design for manufacturability to reduce production costs and material waste"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-16 lg:pt-24 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
            CAD Design & Engineering Services
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient-hero">Professional CAD</span><br />
            <span className="text-foreground">Design & Engineering</span>
          </h1>
          <div className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
            <p className="mb-4">
              Expert <strong>CAD design services</strong>, <strong>engineering drawings</strong>, and <strong>3D modeling</strong> for manufacturing, construction, and product development.
            </p>
            <p>
              Our <strong>CAD services</strong> include 2D drafting, 3D modeling, technical drawings, and engineering consultation for businesses worldwide.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="btn-hero text-lg px-8 py-4"
              onClick={() => navigate('/get-started')}
            >
              Start CAD Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              className="text-lg px-8 py-4"
              onClick={() => navigate('/contact')}
            >
              Engineering Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* CAD Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Complete <span className="text-gradient-primary">CAD Design Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From concept sketches to production-ready drawings, we provide comprehensive CAD and engineering services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cadServices.map((service, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <service.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gradient-primary">{service.title}</h3>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Software Expertise */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              <span className="text-gradient-primary">CAD Software</span> Expertise
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We work with industry-leading CAD software to deliver professional engineering designs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {software.map((tool, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{tool.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
                <p className="text-muted-foreground text-sm">{tool.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              <span className="text-gradient-primary">Industries</span> We Serve
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our CAD design and engineering services span multiple industries and applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {industries.map((industry, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <industry.icon className="w-12 h-12 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gradient-primary">{industry.title}</h3>
                    <p className="text-muted-foreground mb-2">{industry.description}</p>
                    <Badge variant="secondary" className="text-xs">{industry.projects}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Why Choose Our <span className="text-gradient-primary">CAD Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional engineering expertise with proven track record in CAD design and technical documentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <benefit.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3 text-gradient-primary">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Our <span className="text-gradient-primary">CAD Design</span> Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A systematic approach to deliver accurate and manufacturable engineering designs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              { step: "01", title: "Requirements", description: "Understand your design specifications and constraints" },
              { step: "02", title: "Concept", description: "Create initial concepts and design alternatives" },
              { step: "03", title: "Modeling", description: "Develop detailed 2D/3D CAD models" },
              { step: "04", title: "Review", description: "Design review and optimization for manufacturing" },
              { step: "05", title: "Delivery", description: "Final drawings with documentation and support" }
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{process.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gradient-primary">{process.title}</h3>
                <p className="text-sm text-muted-foreground">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAD Portfolio Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Our <span className="text-gradient-primary">CAD Design & Engineering</span> Projects
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our comprehensive portfolio of professional CAD design projects.
              From precision engineering to complex assemblies, see the quality and expertise we bring to every design challenge.
            </p>
          </div>

          {/* Portfolio Display Component */}
          <PortfolioDisplay 
            serviceId="cad-design"
            maxProjects={6}
            showLoadingState={true}
            className="mb-8"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary via-primary-glow to-success text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Bring Your Ideas to Life?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Let our CAD design and engineering experts help you create professional, manufacturable designs for your next project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90"
              onClick={() => navigate('/get-started')}
            >
              Get CAD Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary"
              onClick={() => navigate('/contact')}
            >
              Engineering Consultation
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CADServices;