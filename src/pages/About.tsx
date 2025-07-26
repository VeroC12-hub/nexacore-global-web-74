import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Globe,
  Award,
  Users,
  Target,
  ArrowRight,
  Heart,
  Lightbulb,
  Shield,
} from 'lucide-react';
import teamImage from '@/assets/team-collaboration.jpg';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  const values = [
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We embrace cutting-edge technologies and creative solutions to solve complex challenges.',
    },
    {
      icon: Heart,
      title: 'Excellence',
      description: 'Quality is at the heart of everything we do, ensuring exceptional results for every project.',
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'We believe in creating solutions that make a positive difference worldwide.',
    },
    {
      icon: Shield,
      title: 'Reliability',
      description: 'Our clients trust us to deliver on time, within budget, and beyond expectations.',
    },
  ];

  const achievements = [
    { icon: Award, title: 'Lean Six Sigma Certified', description: 'Process excellence and quality management' },
    { icon: Globe, title: 'WorldSkills Participants', description: 'International competition experience' },
    { icon: Users, title: '25+ Global Clients', description: 'Trusted by organizations worldwide' },
    { icon: Target, title: '98% Success Rate', description: 'Exceptional project completion record' },
  ];

  const founders = [
  { name: 'Ocloo Godwin', role: 'Engineering & Technical Lead, Project Manager' },
  { name: 'Benjamin Agbesi', role: 'Creativity & Branding Lead, Operations Manager' },
  { name: 'Manasseh Kabutey', role: 'Software & App Development Lead' },
];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-16 lg:pt-24 lg:pb-20 text-center bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
            <Globe className="w-4 h-4 mr-2" />
            About NexaCore
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient-hero">Engineering Global Innovation</span><br />
            <span className="text-foreground">with Excellence</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We are a multi-disciplinary team of engineers, developers, designers, and analysts dedicated to building solutions that matter.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Our <span className="text-gradient-primary">Story</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded in Ghana, NexaCore Innovations began with a vision to bridge the gap between innovation and real-world application. What started as a local effort has grown into a globally active team solving challenges in engineering, software, branding, and data.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our strength is our diversity — from AutoCAD and BIM engineering to mobile apps and marketing design, every member brings something powerful to the table.
            </p>
          </div>
          <div className="relative">
            <img src={teamImage} alt="Team" className="rounded-2xl shadow-xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-success/10 rounded-2xl" />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="card-gradient p-8">
            <Target className="w-12 h-12 text-primary mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-gradient-primary">Our Mission</h3>
            <p className="text-muted-foreground">
              To empower industries and institutions with technical solutions that drive innovation, 
              sustainability, and growth.
            </p>
          </Card>
          <Card className="card-gradient p-8">
            <Lightbulb className="w-12 h-12 text-success mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-gradient-primary">Our Vision</h3>
            <p className="text-muted-foreground">
              To be a global leader in multi-disciplinary technical services known for quality, impact, and integrity.
            </p>
          </Card>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Our <span className="text-gradient-primary">Core Values</span></h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            These values define who we are and how we work.
          </p>
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

      {/* Meet the Founders */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Meet Our <span className="text-gradient-primary">Founders</span></h2>
          <div className="flex flex-wrap justify-center gap-10 mt-10">
            {founders.map((person, index) => (
              <div key={index} className="text-center max-w-xs">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=0D8ABC&color=fff&size=150`}
                  alt={person.name}
                  className="h-32 w-32 rounded-full mx-auto mb-4 shadow-lg object-cover"
                />
                <h3 className="text-lg font-semibold text-foreground">{person.name}</h3>
                <p className="text-sm text-muted-foreground">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Our <span className="text-gradient-primary">Achievements</span></h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            These milestones reflect our journey and impact so far.
          </p>
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

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary via-primary-glow to-success text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Let’s Work Together</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Book a session with our team or send us a message — we're ready to bring your ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" asChild className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90">
              <Link to="/contact" className="flex items-center justify-center">
                Contact Us
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
