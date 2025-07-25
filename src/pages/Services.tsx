import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Cog, 
  Smartphone, 
  Palette, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Code,
  Database,
  Shield,
  Zap,
  Cpu,
  Globe
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Services = () => {
  const serviceCategories = [
    {
      icon: Cog,
      title: 'Engineering & Technical Services',
      description: 'Advanced engineering solutions and technical expertise for complex projects',
      services: [
        { name: 'CAD/Design Engineering', description: 'Professional 2D/3D design and engineering drawings' },
        { name: '3D Animation & VFX', description: 'High-quality animations and visual effects for presentations' },
        { name: 'AI/ML Engineering', description: 'Machine learning models and artificial intelligence solutions' },
        { name: 'Blockchain/Web3 Solutions', description: 'Decentralized applications and smart contracts' },
        { name: 'E-Commerce Technology', description: 'Complete online store development and optimization' }
      ]
    },
    {
      icon: Smartphone,
      title: 'Software & App Development',
      description: 'Custom software solutions tailored to your business needs',
      services: [
        { name: 'Custom Software Development', description: 'Bespoke applications built for your requirements' },
        { name: 'Mobile App Development', description: 'iOS and Android apps with native performance' },
        { name: 'Cybersecurity Solutions', description: 'Comprehensive security assessments and implementations' },
        { name: 'AI/ML Tools & Automation', description: 'Intelligent automation and machine learning tools' },
        { name: 'API Development & Integration', description: 'Seamless system integration and API services' }
      ]
    },
    {
      icon: Palette,
      title: 'Creative & Branding',
      description: 'Visual identity and creative solutions that make your brand stand out',
      services: [
        { name: 'Graphic Design', description: 'Professional branding, logos, and marketing materials' },
        { name: 'Video Editing & Motion Graphics', description: 'Engaging video content and animations' },
        { name: 'UI/UX Design', description: 'User-centered design for web and mobile applications' },
        { name: 'Content Writing & Copywriting', description: 'Compelling content that converts and engages' },
        { name: 'Brand Strategy', description: 'Complete brand identity and positioning strategies' }
      ]
    },
    {
      icon: BarChart3,
      title: 'Data & Digital Growth',
      description: 'Transform your data into actionable insights and growth opportunities',
      services: [
        { name: 'Data Analytics & Dashboards', description: 'Interactive dashboards and business intelligence' },
        { name: 'Excel Automation', description: 'Advanced Excel solutions and VBA automation' },
        { name: 'Power BI Visualizations', description: 'Professional data visualization and reporting' },
        { name: 'Digital Marketing', description: 'Complete digital marketing strategies and execution' },
        { name: 'SEO & Content Strategy', description: 'Search optimization and content marketing' }
      ]
    }
  ];

  const technologies = [
    { name: 'React & Next.js', icon: Code },
    { name: 'Python & TensorFlow', icon: Cpu },
    { name: 'AWS & Azure', icon: Database },
    { name: 'Cybersecurity', icon: Shield },
    { name: 'Blockchain', icon: Zap },
    { name: 'Global Solutions', icon: Globe }
  ];

  const processSteps = [
    { step: '01', title: 'Discovery', description: 'We understand your needs, goals, and challenges' },
    { step: '02', title: 'Planning', description: 'Detailed project planning and timeline development' },
    { step: '03', title: 'Development', description: 'Agile development with regular progress updates' },
    { step: '04', title: 'Testing', description: 'Comprehensive testing and quality assurance' },
    { step: '05', title: 'Delivery', description: 'Final delivery with training and ongoing support' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-16 pb-16 lg:pt-24 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
              Our Services
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient-hero">Comprehensive Solutions</span><br />
              <span className="text-foreground">for Every Challenge</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From engineering and software development to creative design and data analytics, 
              we provide end-to-end solutions that drive innovation and growth.
            </p>
          </div>
        </div>
      </section>

      {/* Services Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {serviceCategories.map((category, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gradient-primary">{category.title}</h2>
                  </div>
                  <p className="text-lg text-muted-foreground">{category.description}</p>
                  <ul className="space-y-4">
                    {category.services.map((service, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-foreground">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Button className="btn-hero">
                    Learn More
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
                
                <Card className={`card-gradient p-8 ${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <category.icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gradient-primary">Professional Excellence</h3>
                    </div>
                    <ul className="space-y-3">
                      {['Global Standards', 'Certified Professionals', 'Quality Assurance', 'Ongoing Support'].map((item, idx) => (
                        <li key={idx} className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              <span className="text-gradient-primary">Technologies</span> We Master
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We stay at the forefront of technology to deliver cutting-edge solutions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {technologies.map((tech, index) => (
              <Card key={index} className="card-gradient p-6 text-center hover:scale-105 transition-transform duration-300">
                <tech.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">{tech.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Our <span className="text-gradient-primary">Process</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A proven methodology that ensures successful project delivery every time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {processSteps.map((process, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{process.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gradient-primary">{process.title}</h3>
                <p className="text-sm text-muted-foreground">{process.description}</p>
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary to-primary-glow transform -translate-x-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary via-primary-glow to-success">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Let's discuss your requirements and create a custom solution that drives your success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90">
              Get Free Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;