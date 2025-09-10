import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Cpu, 
  Database, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Zap,
  Target,
  TrendingUp,
  Globe,
  Shield,
  Clock
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const AIMLServices = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Update page title and meta description dynamically
    document.title = "AI & Machine Learning Services - NexaCore Innovations";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Professional AI and machine learning services. Custom AI solutions, ML models, data analytics, and artificial intelligence development for businesses worldwide.'
      );
    }
  }, []);

  const aiServices = [
    {
      icon: Brain,
      title: "Machine Learning Models",
      description: "Custom ML algorithms for prediction, classification, and pattern recognition",
      features: ["Predictive Analytics", "Classification Models", "Regression Analysis", "Deep Learning"]
    },
    {
      icon: Database,
      title: "Data Analytics & AI",
      description: "Transform your data into actionable insights with AI-powered analytics",
      features: ["Big Data Processing", "Real-time Analytics", "AI Dashboards", "Business Intelligence"]
    },
    {
      icon: Cpu,
      title: "AI Integration Services",
      description: "Seamlessly integrate AI capabilities into your existing systems",
      features: ["API Development", "AI Chatbots", "Process Automation", "Legacy System AI"]
    },
    {
      icon: Target,
      title: "Computer Vision",
      description: "Advanced image and video processing solutions using AI",
      features: ["Image Recognition", "Object Detection", "Medical Imaging", "Quality Control AI"]
    },
    {
      icon: BarChart3,
      title: "Natural Language Processing",
      description: "AI solutions for text analysis, language understanding, and generation",
      features: ["Sentiment Analysis", "Text Classification", "Language Translation", "Content Generation"]
    },
    {
      icon: TrendingUp,
      title: "AI Consulting",
      description: "Strategic AI consulting to help you identify and implement AI opportunities",
      features: ["AI Strategy", "Feasibility Analysis", "ROI Assessment", "Implementation Roadmap"]
    }
  ];

  const industries = [
    { name: "Healthcare", icon: "🏥", description: "AI for medical diagnosis, drug discovery, and patient care" },
    { name: "Finance", icon: "💰", description: "Fraud detection, risk assessment, and algorithmic trading" },
    { name: "Manufacturing", icon: "🏭", description: "Predictive maintenance, quality control, and supply chain optimization" },
    { name: "Retail", icon: "🛒", description: "Recommendation engines, demand forecasting, and customer analytics" },
    { name: "Agriculture", icon: "🌾", description: "Crop monitoring, yield prediction, and precision farming" },
    { name: "Transportation", icon: "🚗", description: "Route optimization, autonomous systems, and fleet management" }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Faster Decision Making",
      description: "AI processes data instantly to provide real-time insights and recommendations"
    },
    {
      icon: TrendingUp,
      title: "Increased Efficiency",
      description: "Automate repetitive tasks and optimize processes with intelligent systems"
    },
    {
      icon: Shield,
      title: "Competitive Advantage",
      description: "Stay ahead with cutting-edge AI technology and data-driven strategies"
    },
    {
      icon: Globe,
      title: "Scalable Solutions",
      description: "AI systems that grow with your business and adapt to changing needs"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-16 lg:pt-24 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
            AI & Machine Learning Services
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient-hero">Artificial Intelligence</span><br />
            <span className="text-foreground">& Machine Learning Solutions</span>
          </h1>
          <div className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
            <p className="mb-4">
              Transform your business with custom <strong>AI services</strong>, <strong>machine learning solutions</strong>, and <strong>artificial intelligence development</strong>. 
            </p>
            <p>
              Our <strong>AI and ML services</strong> include predictive analytics, computer vision, natural language processing, and intelligent automation for businesses worldwide.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="btn-hero text-lg px-8 py-4"
              onClick={() => navigate('/get-started')}
            >
              Start AI Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              className="text-lg px-8 py-4"
              onClick={() => navigate('/contact')}
            >
              AI Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* AI Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Comprehensive <span className="text-gradient-primary">AI & ML Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From machine learning models to AI integration, we provide end-to-end artificial intelligence solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiServices.map((service, index) => (
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

      {/* Industries Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              <span className="text-gradient-primary">AI Solutions</span> for Every Industry
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI and machine learning services are tailored for various industries and business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{industry.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{industry.name}</h3>
                <p className="text-muted-foreground text-sm">{industry.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Why Choose Our <span className="text-gradient-primary">AI Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Partner with AI experts who understand both technology and business value.
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
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Our <span className="text-gradient-primary">AI Development</span> Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A structured approach to deliver successful AI and machine learning solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Data Assessment", description: "Evaluate your data quality and AI readiness" },
              { step: "02", title: "Model Design", description: "Design custom AI/ML models for your needs" },
              { step: "03", title: "Development", description: "Build and train AI systems with your data" },
              { step: "04", title: "Deployment", description: "Deploy AI solutions with monitoring and support" }
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary via-primary-glow to-success text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business with AI?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Let's discuss how our AI and machine learning services can drive innovation and growth for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90"
              onClick={() => navigate('/get-started')}
            >
              Get AI Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary"
              onClick={() => navigate('/contact')}
            >
              Schedule AI Consultation
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIMLServices;