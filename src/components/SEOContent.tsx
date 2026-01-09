/**
 * SEO-Optimized Content Components
 * Rich, keyword-focused content for better search rankings
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  Award, 
  Globe, 
  Zap, 
  Shield,
  Clock,
  CheckCircle,
  Star,
  TrendingUp
} from 'lucide-react';

// Rich FAQ content for SEO
export const SEOFAQSection = () => {
  const faqs = [
    {
      question: "What engineering services does NexaCore Innovations provide in Ghana?",
      answer: "NexaCore Innovations offers comprehensive engineering services including CAD design, 3D modeling, mechanical engineering, product design, and technical consultation. We serve clients across Ghana, West Africa, and globally with professional engineering solutions."
    },
    {
      question: "How does NexaCore's software development process work?",
      answer: "Our agile software development process includes requirements analysis, UI/UX design, full-stack development, quality assurance, and deployment. We specialize in web applications, mobile apps, AI/ML solutions, and enterprise software for businesses worldwide."
    },
    {
      question: "What makes NexaCore different from other tech companies in Africa?",
      answer: "NexaCore Innovations combines engineering expertise with cutting-edge technology, offering integrated solutions from CAD design to AI implementation. Our certified team delivers international-quality services with local understanding and global reach."
    },
    {
      question: "Can NexaCore handle projects for international clients?",
      answer: "Yes, we serve clients globally with remote collaboration, international project management, and 24/7 support. Our team has delivered successful projects across multiple continents while maintaining the highest quality standards."
    },
    {
      question: "What industries does NexaCore Innovations specialize in?",
      answer: "We serve manufacturing, healthcare, fintech, e-commerce, education, and startup sectors. Our multidisciplinary approach allows us to deliver tailored engineering and technology solutions for any industry requirement."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white" itemScope itemType="https://schema.org/FAQPage">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions About Our Engineering & Tech Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get answers to common questions about NexaCore Innovations' comprehensive engineering, 
            software development, and technology solutions for businesses worldwide.
          </p>
        </div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow" itemScope itemType="https://schema.org/Question">
              <CardHeader>
                <CardTitle className="text-lg text-left" itemProp="name">
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent itemScope itemType="https://schema.org/Answer">
                <div itemProp="text">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Service areas for local SEO
export const ServiceAreasSection = () => {
  const areas = [
    {
      region: "Ghana & West Africa",
      cities: ["Accra", "Kumasi", "Tamale", "Cape Coast", "Sekondi-Takoradi"],
      description: "Local engineering and tech services across major Ghanaian cities"
    },
    {
      region: "Global Remote Services",
      cities: ["USA", "UK", "Canada", "Australia", "Europe"],
      description: "International software development and engineering consultation"
    }
  ];

  return (
    <section className="py-16 bg-blue-50" itemScope itemType="https://schema.org/Service">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" itemProp="name">
            Engineering Services Available Across Ghana and Worldwide
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto" itemProp="description">
            NexaCore Innovations delivers professional engineering, software development, and technology 
            solutions to clients locally in Ghana and internationally across multiple continents.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {areas.map((area, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-xl">{area.region}</CardTitle>
                </div>
                <CardDescription>{area.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {area.cities.map((city) => (
                    <Badge key={city} variant="outline" className="text-sm">
                      {city}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Company achievements and certifications for trust signals
export const AchievementsSection = () => {
  const achievements = [
    {
      icon: Award,
      title: "WorldSkills Certified",
      description: "Industrial design certification ensuring international quality standards",
      metric: "International Certification"
    },
    {
      icon: Users,
      title: "50+ Successful Projects",
      description: "Delivered engineering and software solutions across multiple industries",
      metric: "Project Success Rate: 98%"
    },
    {
      icon: Globe,
      title: "Global Client Base",
      description: "Serving clients across Ghana, Africa, and internationally",
      metric: "25+ Countries Served"
    },
    {
      icon: Zap,
      title: "Cutting-Edge Technology",
      description: "Latest tools in CAD, AI/ML, blockchain, and software development",
      metric: "Technology Innovation Leader"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Why Choose NexaCore Innovations for Your Engineering & Tech Needs
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Certified expertise, proven track record, and commitment to excellence in 
            engineering and technology solutions across Ghana and globally.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <Card key={index} className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors">
              <CardHeader className="text-center">
                <achievement.icon className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <CardTitle className="text-lg">{achievement.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-blue-100 text-sm mb-3">{achievement.description}</p>
                <Badge variant="secondary" className="text-xs">
                  {achievement.metric}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Technology stack showcase for technical SEO
export const TechnologyStackSection = () => {
  const technologies = {
    "Engineering & CAD": [
      "AutoCAD", "SolidWorks", "Fusion 360", "CATIA", "Inventor", "KeyShot"
    ],
    "Software Development": [
      "React", "Node.js", "Python", "TypeScript", "Next.js", "PostgreSQL"
    ],
    "AI & Machine Learning": [
      "TensorFlow", "PyTorch", "Scikit-learn", "OpenAI", "Hugging Face", "Computer Vision"
    ],
    "Blockchain & Web3": [
      "Ethereum", "Solidity", "Web3.js", "Smart Contracts", "DeFi", "NFT Development"
    ],
    "Data Analytics": [
      "Power BI", "Tableau", "Excel VBA", "Python Analytics", "SQL", "Business Intelligence"
    ],
    "Creative & Design": [
      "Adobe Creative Suite", "Figma", "Sketch", "After Effects", "Premiere Pro", "3D Animation"
    ]
  };

  return (
    <section className="py-16 bg-gray-50" itemScope itemType="https://schema.org/TechArticle">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" itemProp="headline">
            Advanced Technology Stack & Engineering Tools
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto" itemProp="description">
            NexaCore Innovations leverages industry-leading software and technologies to deliver 
            cutting-edge engineering and development solutions for complex projects.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(technologies).map(([category, tools]) => (
            <Card key={category} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <Badge key={tool} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Process methodology for service-focused content
export const ProcessMethodologySection = () => {
  const processes = [
    {
      step: "01",
      title: "Discovery & Analysis",
      description: "Comprehensive project assessment, requirements gathering, and technical feasibility analysis",
      keywords: "project analysis, requirements gathering, feasibility study"
    },
    {
      step: "02", 
      title: "Design & Planning",
      description: "Detailed engineering design, software architecture, and project timeline development",
      keywords: "engineering design, software architecture, project planning"
    },
    {
      step: "03",
      title: "Development & Implementation",
      description: "Agile development, continuous integration, and quality assurance throughout the process",
      keywords: "agile development, continuous integration, quality assurance"
    },
    {
      step: "04",
      title: "Testing & Validation",
      description: "Rigorous testing, performance optimization, and validation against requirements",
      keywords: "software testing, performance optimization, validation"
    },
    {
      step: "05",
      title: "Deployment & Support",
      description: "Seamless deployment, training, documentation, and ongoing maintenance support",
      keywords: "deployment, training, maintenance support"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Proven Engineering & Software Development Process
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            NexaCore Innovations follows a systematic approach to ensure successful project delivery, 
            from initial concept to final implementation and ongoing support.
          </p>
        </div>
        
        <div className="space-y-8">
          {processes.map((process, index) => (
            <div key={index} className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {process.step}
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {process.title}
                </h3>
                <p className="text-gray-700 mb-3">
                  {process.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {process.keywords.split(', ').map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Components are already exported inline above