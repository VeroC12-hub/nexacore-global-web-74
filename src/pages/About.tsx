import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Award, 
  Users, 
  Target,
  ArrowRight,
  Heart,
  Lightbulb,
  Shield
} from 'lucide-react';
import teamImage from '@/assets/team-collaboration.jpg';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  const values = [
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We embrace cutting-edge technologies and creative solutions to solve complex challenges.'
    },
    {
      icon: Heart,
      title: 'Excellence',
      description: 'Quality is at the heart of everything we do, ensuring exceptional results for every project.'
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'We believe in creating solutions that make a positive difference worldwide.'
    },
    {
      icon: Shield,
      title: 'Reliability',
      description: 'Our clients trust us to deliver on time, within budget, and beyond expectations.'
    }
  ];

  const achievements = [
    { icon: Award, title: 'Lean Six Sigma Certified', description: 'Process excellence and quality management' },
    { icon: Globe, title: 'WorldSkills Participants', description: 'International competition experience' },
    { icon: Users, title: '25+ Global Clients', description: 'Trusted by organizations worldwide' },
    { icon: Target, title: '98% Success Rate', description: 'Exceptional project completion record' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-16 pb-16 lg:pt-24 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
              <Globe className="w-4 h-4 mr-2" />
              About NexaCore
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient-hero">Engineering Global Innovation</span><br />
              <span className="text-foreground">with Excellence</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We are a multi-disciplinary team of engineers, software developers, designers, and analysts 
              dedicated to delivering world-class technical, creative, and digital solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Our <span className="text-gradient-primary">Story</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Founded with a vision to bridge the gap between innovative technology and practical solutions, 
                NexaCore Innovations has grown from a small team in Ghana to a globally recognized service provider.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our journey began with a simple belief: that exceptional technical expertise, combined with 
                creative thinking and international perspective, can solve the most complex challenges facing 
                businesses and institutions today.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Today, we serve clients across continents, from startups to universities, delivering solutions 
                that drive innovation, efficiency, and growth. Our diverse, internationally-minded team brings 
                unique perspectives to every project, ensuring culturally aware and globally relevant outcomes.
              </p>
            </div>
            
            <div className="relative">
              <img 
                src={teamImage} 
                alt="NexaCore Team at Work" 
                className="rounded-2xl shadow-[var(--shadow-strong)]"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-success/10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="card-gradient p-8">
              <Target className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gradient-primary">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To empower organizations worldwide with innovative technical solutions that drive growth, 
                efficiency, and success. We strive to be the bridge between cutting-edge technology and 
                practical business needs, delivering excellence in every project we undertake.
              </p>
            </Card>
            
            <Card className="card-gradient p-8">
              <Lightbulb className="w-12 h-12 text-success mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gradient-primary">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To be the leading global provider of multi-disciplinary technical services, recognized for 
                our innovation, quality, and cultural awareness. We envision a world where technology serves 
                humanity, breaking down barriers and creating opportunities for sustainable growth.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Our <span className="text-gradient-primary">Core Values</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do and shape how we work with our clients and each other.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="card-service text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gradient-primary">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Our <span className="text-gradient-primary">Achievements</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Recognition and milestones that reflect our commitment to excellence and continuous improvement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <Card key={index} className="card-gradient p-6 text-center">
                <achievement.icon className="w-10 h-10 text-success mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary via-primary-glow to-success">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Work with Us?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join our growing family of satisfied clients and experience the NexaCore difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90">
              Start Your Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
