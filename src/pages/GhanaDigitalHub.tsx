import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Building2,
  GraduationCap,
  Trophy,
  TrendingUp,
  Target,
  Users,
  Globe,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { generateGovernmentProposalPDF } from '@/utils/governmentProposalPDF';

const GhanaDigitalHub = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Proposal: Positioning Ghana as a Regional Hub for Digital Engineering & Design"
        description="A formal proposal by NexaCore Innovations and Autodesk, submitted to Hon. Sam George, to position Ghana as a West African hub for digital engineering and design."
        keywords="Ghana digital engineering proposal, NexaCore Autodesk proposal, Hon Sam George, digital engineering Ghana, West Africa design hub"
        url="https://nexacore-innovations.com/ghana-digital-hub"
      />
      <Navbar />

      {/* Proposal Header */}
      <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-success/5" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Document-style meta */}
          <div className="flex items-center gap-2 mb-8">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-widest">Formal Proposal</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-10 leading-tight">
            <span className="text-gradient-primary">Positioning Ghana</span><br />
            <span className="text-foreground">as a Regional Hub for</span><br />
            <span className="text-gradient-hero">Digital Engineering & Design</span>
          </h1>

          {/* Submission details */}
          <div className="border border-border rounded-xl p-6 bg-muted/30 space-y-3 text-sm mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-muted-foreground uppercase tracking-wide text-xs font-semibold mb-1">Submitted By</p>
                <p className="text-foreground font-semibold">NexaCore Innovations</p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase tracking-wide text-xs font-semibold mb-1">Partner</p>
                <p className="text-foreground font-semibold">Autodesk</p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase tracking-wide text-xs font-semibold mb-1">Submitted To</p>
                <p className="text-foreground font-semibold">Hon. Sam George</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/contact">
              <Button className="btn-hero text-lg px-8 py-4 group">
                Request a Meeting
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="btn-outline-primary text-lg px-8 py-4 group"
              onClick={() => generateGovernmentProposalPDF()}
            >
              <Download className="mr-2 w-5 h-5" />
              Download Proposal PDF
            </Button>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Badge className="bg-primary/10 text-primary border-primary/20">Introduction</Badge>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Ghana is experiencing steady growth in infrastructure, urban development, and digital
            transformation. However, much of the world now designs and delivers infrastructure using
            advanced digital platforms that improve efficiency, reduce waste, and enhance transparency.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            NexaCore Innovations, in collaboration with <strong className="text-foreground">Autodesk</strong> —
            a global leader in engineering and design technology — proposes a simple but strategic
            initiative to help Ghana strengthen its digital engineering capacity across professionals,
            universities, and public institutions.
          </p>
          <p className="text-lg font-semibold text-foreground">
            Our goal is to support Ghana in becoming a West African hub for modern digital design
            and infrastructure delivery.
          </p>
        </div>
      </section>

      {/* The Opportunity */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">The Opportunity</Badge>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Across the world, governments are adopting digital engineering systems to:
          </p>
          <ul className="space-y-4 mb-8">
            {[
              'Reduce project delays',
              'Improve cost control',
              'Enhance coordination across ministries',
              'Ensure better infrastructure planning'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-foreground text-lg">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Ghana has the talent and institutions to achieve this, but there is currently no
            coordinated national framework to drive structured adoption and training.
          </p>
          <p className="text-xl font-bold text-gradient-primary">This presents an opportunity.</p>
        </div>
      </section>

      {/* What We Propose */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">What We Propose</Badge>
          <h2 className="text-3xl font-bold mb-12 text-foreground">Simple Framework</h2>

          {/* Pillar 1 */}
          <div className="mb-14">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                1. Support for Professional Bodies and Agencies
              </h3>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4 ml-14">
              Working with institutions such as the:
            </p>
            <ul className="space-y-2 mb-4 ml-14">
              {['Ghana Institution of Engineering', 'Ghana Institute of Architects'].map((inst, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-foreground font-medium">{inst}</span>
                </li>
              ))}
            </ul>
            <p className="text-lg text-muted-foreground leading-relaxed ml-14">
              to introduce structured digital upskilling programs and modern design standards
              that align with global best practices.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="mb-14">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                2. Strengthening Universities and Technical Institutions
              </h3>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4 ml-14">
              Supporting universities and technical institutions to bridge the gap between
              theory and practice by:
            </p>
            <ul className="space-y-2 mb-4 ml-14">
              {[
                'Enhancing digital design training',
                'Providing internationally recognized certifications',
                'Preparing students for modern infrastructure and technology-driven industries'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-lg text-muted-foreground leading-relaxed ml-14">
              This will improve graduate employability and position Ghanaian talent competitively
              on the global stage.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                3. Hosting International Digital Design Competitions in Ghana
              </h3>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4 ml-14">
              Currently, major global engineering and design competitions are hosted in regions
              such as the United States and Germany.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed ml-14">
              With the right support, Ghana can host similar international competitions, attracting
              regional participation, showcasing local talent, and positioning the country as a
              continental innovation hub.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="bg-success/10 text-success border-success/20 mb-6">Why This Matters for Ghana</Badge>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            This initiative will:
          </p>
          <ul className="space-y-4 mb-8">
            {[
              { icon: TrendingUp, text: 'Support national digital transformation goals' },
              { icon: Target, text: 'Improve infrastructure planning and execution' },
              { icon: Users, text: 'Create opportunities for youth in high-value digital careers' },
              { icon: Globe, text: "Enhance Ghana's reputation as a forward-thinking technology-driven nation" }
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4">
                <div className="w-9 h-9 bg-gradient-to-br from-success/20 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-foreground text-lg">{item.text}</span>
              </li>
            ))}
          </ul>
          <p className="text-xl font-bold text-foreground border-l-4 border-primary pl-4">
            It is not merely a software initiative — it is a capacity-building and national
            positioning strategy.
          </p>
        </div>
      </section>

      {/* Request */}
      <section className="py-16 bg-gradient-to-br from-primary via-primary-glow to-success">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-white/20 text-white border-white/30 mb-6">Our Request</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            An Invitation to Discuss
          </h2>
          <p className="text-xl text-white/90 mb-6 max-w-3xl mx-auto leading-relaxed">
            We respectfully request the opportunity to briefly present this concept in person
            and explore how it can align with the Ministry's broader digital innovation agenda.
          </p>
          <p className="text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
            NexaCore Innovations is prepared to serve as a local implementation partner and
            coordinate with relevant stakeholders to ensure practical and measurable outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button variant="secondary" className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90">
                Contact Us
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/book-consultation">
              <Button variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
                Book a Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GhanaDigitalHub;
