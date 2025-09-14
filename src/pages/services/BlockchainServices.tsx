import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Link2, 
  Coins, 
  Code2,
  ArrowRight,
  CheckCircle,
  Zap,
  Lock,
  Globe,
  TrendingUp,
  Users,
  Database
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import PortfolioDisplay from '@/components/portfolio/PortfolioDisplay';

const BlockchainServices = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Update page title and meta description dynamically
    document.title = "Blockchain & Web3 Development Services - NexaCore Innovations";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Professional blockchain and Web3 development services. Smart contracts, DApps, cryptocurrency solutions, and decentralized applications for businesses worldwide.'
      );
    }
  }, []);

  const blockchainServices = [
    {
      icon: Code2,
      title: "Smart Contract Development",
      description: "Secure and efficient smart contracts for various blockchain platforms",
      features: ["Ethereum Smart Contracts", "Solidity Development", "Contract Auditing", "Gas Optimization"]
    },
    {
      icon: Globe,
      title: "DApp Development",
      description: "Full-stack decentralized applications with modern user interfaces",
      features: ["Frontend Development", "Web3 Integration", "User Experience", "Cross-chain Support"]
    },
    {
      icon: Coins,
      title: "Cryptocurrency Solutions",
      description: "Custom cryptocurrency and token development services",
      features: ["ERC-20 Tokens", "BEP-20 Tokens", "NFT Development", "Token Economics"]
    },
    {
      icon: Shield,
      title: "Blockchain Security",
      description: "Security auditing and penetration testing for blockchain applications",
      features: ["Smart Contract Audits", "Security Assessment", "Vulnerability Testing", "Code Review"]
    },
    {
      icon: Link2,
      title: "Blockchain Integration",
      description: "Integrate blockchain technology into existing business systems",
      features: ["Legacy Integration", "API Development", "Wallet Integration", "Payment Processing"]
    },
    {
      icon: Database,
      title: "Blockchain Consulting",
      description: "Strategic consulting for blockchain adoption and implementation",
      features: ["Technology Assessment", "Use Case Analysis", "Architecture Design", "Implementation Roadmap"]
    }
  ];

  const platforms = [
    { name: "Ethereum", icon: "⟠", description: "Smart contracts and DApps" },
    { name: "Binance Smart Chain", icon: "🟡", description: "Fast and low-cost transactions" },
    { name: "Polygon", icon: "🔷", description: "Scalable blockchain solutions" },
    { name: "Solana", icon: "🌅", description: "High-performance blockchain" },
    { name: "Cardano", icon: "🔵", description: "Sustainable blockchain platform" },
    { name: "Avalanche", icon: "❄️", description: "Fast and eco-friendly blockchain" }
  ];

  const useCases = [
    {
      icon: Coins,
      title: "DeFi (Decentralized Finance)",
      description: "Build decentralized lending, trading, and yield farming platforms",
      examples: ["DEX Development", "Lending Protocols", "Yield Farming", "Liquidity Pools"]
    },
    {
      icon: Users,
      title: "NFT Marketplaces",
      description: "Create platforms for buying, selling, and trading non-fungible tokens",
      examples: ["NFT Minting", "Marketplace Development", "Royalty Systems", "Metadata Management"]
    },
    {
      icon: Shield,
      title: "Supply Chain Tracking",
      description: "Transparent and immutable supply chain management solutions",
      examples: ["Product Tracking", "Authentication", "Compliance Monitoring", "Quality Control"]
    },
    {
      icon: Lock,
      title: "Digital Identity",
      description: "Secure and decentralized identity verification systems",
      examples: ["KYC Solutions", "Identity Verification", "Credential Management", "Privacy Protection"]
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Enhanced Security",
      description: "Cryptographic security and immutable transaction records"
    },
    {
      icon: Globe,
      title: "Decentralization",
      description: "Eliminate single points of failure and reduce dependency on intermediaries"
    },
    {
      icon: TrendingUp,
      title: "Transparency",
      description: "Public ledger ensures transparency and accountability"
    },
    {
      icon: Zap,
      title: "Efficiency",
      description: "Automated processes through smart contracts reduce costs and time"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-16 lg:pt-24 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
            Blockchain & Web3 Development
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient-hero">Blockchain & Web3</span><br />
            <span className="text-foreground">Development Services</span>
          </h1>
          <div className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
            <p className="mb-4">
              Expert <strong>blockchain development</strong>, <strong>Web3 solutions</strong>, and <strong>smart contract development</strong> for the decentralized future.
            </p>
            <p>
              Our <strong>blockchain services</strong> include DApp development, cryptocurrency solutions, NFT platforms, and decentralized finance applications worldwide.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="btn-hero text-lg px-8 py-4"
              onClick={() => navigate('/get-started')}
            >
              Start Blockchain Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              className="text-lg px-8 py-4"
              onClick={() => navigate('/contact')}
            >
              Web3 Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Blockchain Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Complete <span className="text-gradient-primary">Blockchain Development</span> Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From smart contracts to full DApps, we build secure and scalable blockchain solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blockchainServices.map((service, index) => (
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

      {/* Platform Expertise */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              <span className="text-gradient-primary">Blockchain Platforms</span> We Support
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We develop on leading blockchain platforms to deliver optimal solutions for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{platform.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{platform.name}</h3>
                <p className="text-muted-foreground text-sm">{platform.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              <span className="text-gradient-primary">Blockchain Use Cases</span> & Applications
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore how blockchain technology can transform various industries and business processes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <useCase.icon className="w-12 h-12 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gradient-primary">{useCase.title}</h3>
                    <p className="text-muted-foreground mb-3">{useCase.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {useCase.examples.map((example, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{example}</Badge>
                      ))}
                    </div>
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
              Why Choose <span className="text-gradient-primary">Blockchain Technology</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Unlock the transformative power of blockchain for your business operations.
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
              Our <span className="text-gradient-primary">Blockchain Development</span> Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive approach to deliver secure and scalable blockchain solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              { step: "01", title: "Discovery", description: "Analyze requirements and blockchain feasibility" },
              { step: "02", title: "Architecture", description: "Design blockchain architecture and smart contracts" },
              { step: "03", title: "Development", description: "Build and test blockchain solutions" },
              { step: "04", title: "Security", description: "Comprehensive security auditing and testing" },
              { step: "05", title: "Deployment", description: "Deploy to mainnet with monitoring and support" }
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

      {/* Blockchain Portfolio Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Our <span className="text-gradient-primary">Blockchain & Web3</span> Projects
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover our portfolio of innovative blockchain solutions and Web3 applications.
              From smart contracts to decentralized platforms, see how we've helped businesses embrace blockchain technology.
            </p>
          </div>

          {/* Portfolio Display Component */}
          <PortfolioDisplay 
            serviceId="blockchain"
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
            Ready to Build the Decentralized Future?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Let's discuss how blockchain and Web3 technology can revolutionize your business and create new opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90"
              onClick={() => navigate('/get-started')}
            >
              Get Blockchain Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary"
              onClick={() => navigate('/contact')}
            >
              Schedule Web3 Consultation
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlockchainServices;