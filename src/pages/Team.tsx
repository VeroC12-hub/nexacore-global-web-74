import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Linkedin,
  Mail,
  Github,
  Globe,
  ArrowRight,
  Award,
  Code,
  Palette,
  Database,
  Briefcase,
  X,
  ZoomIn
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const Team = () => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; name: string } | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const teamMembers = [
    {
      id: 1,
      name: 'Godwin Ocloo',
      role: 'Co-Founder & Project Manager',
      image: '/profile1.png',
      bio: 'A certified industrial designer from WorldSkills, Godwin brings expertise in precision engineering and creative project management. He specializes in CAD design, 3D modeling, and complex project coordination. At NexaCore Innovations, Godwin leads strategy and business growth, empowering industries through impactful innovations.',
      expertise: ['CAD Design', '3D Modeling', 'Project Management', 'Technology Consulting', 'Product Development', 'Industrial Design'],
      social: {
        linkedin: 'https://www.linkedin.com/in/godwin-ocloo',
        email: 'godwin.ocloo@nexacore-innovations.com',
        portfolio: 'https://www.nexacore-innovations.com'
      },
      achievements: [
        'Certified Industrial Designer - WorldSkills',
        'Expert in precision engineering',
        'Led complex project coordination',
        'Co-Founded NexaCore Innovations'
      ]
    },
    {
      id: 2,
      name: 'Benjamin Agbesi',
      role: 'Co-Founder & Operations Manager',
      image: '/profile2.png',
      bio: 'With a strong background in business development and organizational management, Benjamin leads initiatives that drive operational excellence and sustainable growth. He plays an active role in strategic planning, strengthening client relationships, and ensuring every NexaCore project delivers meaningful value.',
      expertise: ['Business Development', 'Organizational Management', 'Strategic Planning', 'Client Relations', 'Operations Excellence', 'Team Building'],
      social: {
        linkedin: 'https://www.linkedin.com/in/benjamin-agbesi',
        email: 'benjamin@nexacore-innovations.com',
        portfolio: 'https://www.nexacore-innovations.com'
      },
      achievements: [
        'Expert in business development',
        'Drives operational excellence',
        'Strategic planning specialist',
        'Co-Founded NexaCore Innovations'
      ]
    },
    {
      id: 3,
      name: 'Manasseh Kabutey',
      role: 'Lead Software Developer',
      image: '/profile3.png',
      bio: 'Full-stack developer specializing in web and mobile applications. Expert in React, Next.js, Flutter, and modern web technologies. Manasseh builds scalable, user-friendly applications with a focus on performance and best practices.',
      expertise: ['Web Development', 'Mobile Development', 'React & Next.js', 'Flutter', 'UI/UX Design', 'Cloud Solutions'],
      social: {
        linkedin: 'https://www.linkedin.com/in/manasseh-kabutey',
        github: 'https://github.com/Qharny',
        portfolio: 'https://manassehkabutey.vercel.app',
        email: 'kabuteymanasseh5@gmail.com'
      },
      achievements: [
        'Built 20+ production applications',
        'Flutter & React specialist',
        'Full-stack architecture expert',
        'Open-source contributor'
      ]
    }
  ];

  const expertiseIcons = {
    'CAD Design': Code,
    '3D Modeling': Palette,
    'Project Management': Users,
    'Technology Consulting': Award,
    'Product Development': Code,
    'Industrial Design': Palette,
    'Business Development': Briefcase,
    'Organizational Management': Users,
    'Strategic Planning': Award,
    'Client Relations': Users,
    'Operations Excellence': Briefcase,
    'Team Building': Users,
    'Web Development': Code,
    'Mobile Development': Code,
    'React & Next.js': Code,
    'Flutter': Code,
    'UI/UX Design': Palette,
    'Cloud Solutions': Database
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-16 lg:pt-24 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
            <Users className="w-4 h-4 mr-2" />
            Meet Our Team
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient-hero">The People Behind</span><br />
            <span className="text-foreground">NexaCore Innovations</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our diverse team of experts brings together technical excellence, creative innovation,
            and global perspective to deliver exceptional solutions for our clients worldwide.
          </p>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {teamMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-8">
                  {/* Profile Image */}
                  <div className="md:col-span-2 flex flex-col items-center">
                    <div
                      className="relative w-48 h-48 rounded-full overflow-hidden mb-4 ring-4 ring-primary/20 cursor-pointer group"
                      onClick={() => setSelectedImage({ src: member.image, name: member.name })}
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-3 mb-4">
                      {member.social.linkedin && (
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {member.social.github && (
                        <a
                          href={member.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {member.social.portfolio && (
                        <a
                          href={member.social.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Globe className="w-5 h-5" />
                        </a>
                      )}
                      {member.social.email && (
                        <a
                          href={`mailto:${member.social.email}`}
                          className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Mail className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="md:col-span-3 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {member.name}
                      </h3>
                      <p className="text-lg text-primary font-medium mb-3">
                        {member.role}
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        {member.bio}
                      </p>
                    </div>

                    {/* Expertise */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Areas of Expertise</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {member.expertise.map((skill, index) => {
                          const Icon = expertiseIcons[skill] || Code;
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              <Icon className="w-4 h-4 text-primary" />
                              <span>{skill}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Achievements */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Key Achievements</h4>
                      <ul className="space-y-2">
                        {member.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Award className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Our <span className="text-gradient-primary">Impact</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Numbers that reflect our team's dedication and expertise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="card-gradient p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-muted-foreground">Projects Delivered</p>
            </Card>
            <Card className="card-gradient p-6 text-center">
              <div className="text-4xl font-bold text-success mb-2">25+</div>
              <p className="text-muted-foreground">Global Clients</p>
            </Card>
            <Card className="card-gradient p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <p className="text-muted-foreground">Client Satisfaction</p>
            </Card>
            <Card className="card-gradient p-6 text-center">
              <div className="text-4xl font-bold text-success mb-2">10+</div>
              <p className="text-muted-foreground">Service Categories</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Culture & Values */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Our <span className="text-gradient-primary">Team Culture</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The values and principles that guide how we work together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-gradient p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Collaboration First</h3>
              <p className="text-muted-foreground">
                We believe in the power of teamwork. Every project is a collaborative effort
                where diverse skills and perspectives come together to create exceptional solutions.
              </p>
            </Card>

            <Card className="card-gradient p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-success to-primary-glow rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Excellence & Innovation</h3>
              <p className="text-muted-foreground">
                We're committed to continuous learning and staying at the forefront of technology.
                Innovation isn't just what we do—it's who we are.
              </p>
            </Card>

            <Card className="card-gradient p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Global Mindset</h3>
              <p className="text-muted-foreground">
                Our team works across borders and time zones, bringing international perspectives
                to deliver culturally aware and globally relevant solutions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                How We <span className="text-gradient-primary">Work Together</span>
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Code className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Agile Development</h4>
                    <p className="text-muted-foreground">
                      We use agile methodologies to ensure flexibility, rapid delivery, and continuous improvement throughout every project.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Cross-Functional Teams</h4>
                    <p className="text-muted-foreground">
                      Each project benefits from diverse expertise—designers, developers, project managers, and analysts working in harmony.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Remote-First Approach</h4>
                    <p className="text-muted-foreground">
                      Our distributed team leverages modern collaboration tools to work seamlessly across locations and time zones.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="card-gradient p-6">
                <Award className="w-8 h-8 text-primary mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">100%</div>
                <p className="text-sm text-muted-foreground">Team Engagement</p>
              </Card>
              <Card className="card-gradient p-6">
                <Users className="w-8 h-8 text-success mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">3+</div>
                <p className="text-sm text-muted-foreground">Core Team Members</p>
              </Card>
              <Card className="card-gradient p-6">
                <Globe className="w-8 h-8 text-primary mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">2+</div>
                <p className="text-sm text-muted-foreground">Countries Represented</p>
              </Card>
              <Card className="card-gradient p-6">
                <Code className="w-8 h-8 text-success mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">10+</div>
                <p className="text-sm text-muted-foreground">Technologies Mastered</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-16 bg-gradient-to-br from-primary via-primary-glow to-success text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Want to Work With Us?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            We're always looking for talented individuals to join our growing team.
            If you're passionate about technology and innovation, let's talk!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link to="/contact">
                Get in Touch
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
              asChild
            >
              <Link to="/portfolio">
                View Our Work
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image */}
            <div className="bg-white rounded-lg overflow-hidden">
              <img
                src={selectedImage.src}
                alt={selectedImage.name}
                className="w-full h-auto max-h-[80vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="p-4 bg-gradient-to-r from-primary to-primary-glow">
                <p className="text-white text-center font-semibold text-lg">
                  {selectedImage.name}
                </p>
              </div>
            </div>

            {/* Instruction */}
            <p className="text-white/60 text-center mt-4 text-sm">
              Click anywhere outside the image to close
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Team;
