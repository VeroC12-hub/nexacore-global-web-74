import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Cog,
  Compass,
  Layers,
  Monitor,
  Brain,
  Cpu,
  Database,
  BarChart3,
  Shield,
  Link2,
  Coins,
  Code2,
  ShoppingCart,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Award,
  Globe,
  Clock,
  FileText,
  Download,
  Settings,
  Target,
  TrendingUp,
  DollarSign,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Calculator,
  X,
  Quote,
  Building,
  Factory,
  Rocket,
  Heart,
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PortfolioDisplay from '@/components/portfolio/PortfolioDisplay';

export default function EngineeringTechnical() {
  const navigate = useNavigate();
  
  // No more manual data management - everything is automatic! 🎉

  // CAD Portfolio Data - Easy to Update
  const cadPortfolioData = {
    featured: [
      {
        id: 'conveyor-assembly',
        title: 'Industrial Conveyor Assembly',
        description: 'Complete 3D assembly with 200+ components, technical drawings, and manufacturing specs',
        software: 'SolidWorks',
        type: '3D Assembly',
        thumbnail: '/images/portfolio/cad/conveyor-assembly-thumb.jpg', // Preview image
        files: {
          dwg: '/downloads/cad/conveyor-assembly.dwg',
          pdf: '/downloads/cad/conveyor-assembly.pdf',
          step: '/downloads/cad/conveyor-assembly.step'
        },
        stats: { components: '200+', time: '3 weeks', complexity: 'High' }
      },
      {
        id: 'machine-parts',
        title: 'Precision Machine Parts',
        description: 'Detailed 2D technical drawings with GD&T, tolerances, and manufacturing notes',
        software: 'AutoCAD',
        type: 'Technical Drawing',
        thumbnail: '/images/portfolio/cad/machine-parts-thumb.jpg',
        files: {
          dwg: '/downloads/cad/machine-parts.dwg',
          pdf: '/downloads/cad/machine-parts.pdf'
        },
        stats: { drawings: '15 sheets', tolerance: '±0.001"', standard: 'ASME Y14.5' }
      }
    ],
    samples: [
      {
        name: 'Gear Assembly',
        type: '3D Model',
        software: 'SW',
        color: 'bg-blue-500',
        thumbnail: '/images/portfolio/cad/samples/gear-assembly.jpg',
        downloadUrl: '/downloads/cad/samples/gear-assembly.step'
      },
      {
        name: 'Bracket Design',
        type: '2D Drawing',
        software: 'AC',
        color: 'bg-green-500',
        thumbnail: '/images/portfolio/cad/samples/bracket-design.jpg',
        downloadUrl: '/downloads/cad/samples/bracket-design.dwg'
      },
      {
        name: 'Housing Part',
        type: '3D Model',
        software: 'SW',
        color: 'bg-purple-500',
        thumbnail: '/images/portfolio/cad/samples/housing-part.jpg',
        downloadUrl: '/downloads/cad/samples/housing-part.step'
      },
      {
        name: 'Weld Symbol',
        type: '2D Drawing',
        software: 'AC',
        color: 'bg-orange-500',
        thumbnail: '/images/portfolio/cad/samples/weld-symbol.jpg',
        downloadUrl: '/downloads/cad/samples/weld-symbol.pdf'
      },
      {
        name: 'PCB Layout',
        type: 'Electronic',
        software: 'KI',
        color: 'bg-red-500',
        thumbnail: '/images/portfolio/cad/samples/pcb-layout.jpg',
        downloadUrl: '/downloads/cad/samples/pcb-layout.pdf'
      },
      {
        name: 'Sheet Metal',
        type: '3D Model',
        software: 'SW',
        color: 'bg-cyan-500',
        thumbnail: '/images/portfolio/cad/samples/sheet-metal.jpg',
        downloadUrl: '/downloads/cad/samples/sheet-metal.step'
      }
    ]
  };

  const engineeringServices = [
    {
      id: 'cad-design',
      icon: Compass,
      title: 'CAD Design & Engineering',
      shortDesc: 'Professional 2D/3D CAD design, technical drawings, and engineering documentation',
      detailedDescription: `
        Our CAD design services transform your concepts into precise technical drawings and 3D models. 
        We work with architects, engineers, manufacturers, and product developers to create accurate, 
        industry-standard designs that can be used for manufacturing, construction, and product development.
        
        From initial sketches to final production drawings, our certified CAD professionals ensure 
        every detail meets industry standards and your specific requirements.
      `,
      process: [
        {
          step: 1,
          title: 'Requirement Analysis',
          description: 'We analyze your project requirements, specifications, and design constraints.',
          deliverable: 'Project brief and technical requirements document'
        },
        {
          step: 2,
          title: 'Concept Development',
          description: 'Create initial concepts and rough sketches for your approval.',
          deliverable: '2-3 concept sketches with basic dimensions'
        },
        {
          step: 3,
          title: '2D Technical Drawings',
          description: 'Develop precise 2D technical drawings with dimensions and annotations.',
          deliverable: 'Complete 2D technical drawings (PDF + DWG formats)'
        },
        {
          step: 4,
          title: '3D Modeling',
          description: 'Create detailed 3D models for visualization and manufacturing.',
          deliverable: '3D models in multiple formats (STEP, IGES, STL)'
        },
        {
          step: 5,
          title: 'Review & Revision',
          description: 'Review with client, incorporate feedback, and make necessary revisions.',
          deliverable: 'Final approved designs with revision documentation'
        }
      ],
      pricingTiers: [
        {
          tier: 'Basic CAD',
          price: '$45-60/hour',
          description: 'Simple 2D drawings and basic 3D models',
          includes: ['2D technical drawings', 'Basic 3D modeling', 'Standard file formats', 'Email support']
        },
        {
          tier: 'Professional CAD',
          price: '$70-90/hour',
          description: 'Complex assemblies and detailed engineering drawings',
          includes: ['Advanced 3D modeling', 'Assembly drawings', 'Multiple file formats', 'Phone support', 'Revision rounds included']
        },
        {
          tier: 'Enterprise CAD',
          price: '$100-150/hour',
          description: 'Complete engineering packages with simulations',
          includes: ['Full engineering package', 'FEA simulations', 'Material specifications', 'Dedicated project manager', 'Priority support']
        }
      ],
      caseStudy: {
        title: 'Manufacturing Equipment Design',
        challenge: 'A manufacturing company needed detailed CAD drawings for a custom conveyor system to optimize their production line.',
        solution: 'We created comprehensive 2D technical drawings and 3D models, including assembly instructions and parts lists.',
        result: 'The client successfully manufactured the conveyor system, reducing production time by 30% and saving $50,000 annually.',
        timeline: '3 weeks from concept to final delivery'
      },
      faqs: [
        {
          question: 'What file formats do you provide?',
          answer: 'We provide DWG, DXF, PDF for 2D drawings, and STEP, IGES, STL, and native SolidWorks files for 3D models.'
        },
        {
          question: 'How long does a typical CAD project take?',
          answer: 'Simple drawings: 1-3 days, Complex assemblies: 1-3 weeks, depending on complexity and revision cycles.'
        },
        {
          question: 'Do you provide manufacturing specifications?',
          answer: 'Yes, we include material specifications, tolerances, surface finishes, and manufacturing notes as needed.'
        },
        {
          question: 'Can you work from hand sketches?',
          answer: 'Absolutely! We regularly convert hand sketches, photos, and verbal descriptions into professional CAD drawings.'
        }
      ],
      tools: ['SolidWorks', 'AutoCAD', 'Fusion 360', 'Inventor', 'CATIA', 'KeyShot'],
      deliverables: [
        '2D technical drawings (DWG, PDF)',
        '3D models (STEP, IGES, STL)',
        'Assembly drawings and BOMs',
        'Manufacturing specifications',
        'Revision documentation',
        'Source files for future modifications'
      ]
    },
    {
      id: '3d-animation',
      icon: Monitor,
      title: '3D Animation & Visualization',
      shortDesc: 'High-quality 3D animations, product visualizations, and architectural walkthroughs',
      detailedDescription: `
        Our 3D animation and visualization services bring your products and concepts to life through 
        photorealistic renderings, product animations, and immersive walkthroughs. Whether you need 
        marketing materials, training videos, or architectural presentations, we create compelling 
        visual content that engages your audience.
        
        Using industry-leading software and advanced rendering techniques, we deliver broadcast-quality 
        animations that showcase your products in the best possible light.
      `,
      process: [
        {
          step: 1,
          title: 'Creative Brief',
          description: 'Understand your vision, target audience, and animation requirements.',
          deliverable: 'Creative brief and storyboard concepts'
        },
        {
          step: 2,
          title: '3D Modeling',
          description: 'Create accurate 3D models of your products or environments.',
          deliverable: 'Detailed 3D models ready for animation'
        },
        {
          step: 3,
          title: 'Scene Setup',
          description: 'Design lighting, materials, and camera movements for optimal presentation.',
          deliverable: 'Scene previews and lighting tests'
        },
        {
          step: 4,
          title: 'Animation Production',
          description: 'Create smooth animations with professional transitions and effects.',
          deliverable: 'Draft animation for review and feedback'
        },
        {
          step: 5,
          title: 'Post-Production',
          description: 'Add music, sound effects, text overlays, and final polish.',
          deliverable: 'Final high-definition video in multiple formats'
        }
      ],
      pricingTiers: [
        {
          tier: 'Product Animation',
          price: '$150-250/hour',
          description: 'Simple product rotations and feature highlights',
          includes: ['Product modeling', 'Basic animation', '1080p rendering', 'Standard music', '2 revisions']
        },
        {
          tier: 'Professional Animation',
          price: '$300-450/hour',
          description: 'Complex animations with multiple scenes and transitions',
          includes: ['Advanced animations', '4K rendering', 'Custom music', 'Professional voice-over', 'Unlimited revisions']
        },
        {
          tier: 'Cinematic Production',
          price: '$500-800/hour',
          description: 'Broadcast-quality animations with advanced effects',
          includes: ['Cinematic quality', 'Advanced VFX', 'Professional editing', 'Multiple formats', 'Rush delivery available']
        }
      ],
      caseStudy: {
        title: 'Product Launch Animation',
        challenge: 'A tech startup needed a compelling animation to showcase their new IoT device for investor presentations.',
        solution: 'We created a 90-second cinematic animation highlighting key features, benefits, and use cases.',
        result: 'The animation helped secure $2M in Series A funding and was used across all marketing channels.',
        timeline: '4 weeks from concept to final delivery'
      },
      faqs: [
        {
          question: 'What video formats do you deliver?',
          answer: 'We deliver MP4, MOV, and AVI formats in various resolutions from 1080p to 4K, optimized for different platforms.'
        },
        {
          question: 'Can you animate existing CAD models?',
          answer: 'Yes! We can import and animate CAD models from most major software packages including SolidWorks, AutoCAD, and more.'
        },
        {
          question: 'How long does animation production take?',
          answer: 'Simple animations: 1-2 weeks, Complex productions: 4-8 weeks, depending on length and complexity.'
        },
        {
          question: 'Do you provide voiceover services?',
          answer: 'Yes, we work with professional voice talent and can provide scripts, recording, and post-production services.'
        }
      ],
      tools: ['Blender', 'Maya', '3ds Max', 'Cinema 4D', 'After Effects', 'Premiere Pro'],
      deliverables: [
        'HD/4K video files (MP4, MOV)',
        'Social media optimized versions',
        'Individual scene renders',
        'Project files for future edits',
        'Audio tracks (music/SFX)',
        'Storyboard documentation'
      ]
    },
    {
      id: 'ai-ml',
      icon: Brain,
      title: 'AI/ML Engineering',
      shortDesc: 'Custom artificial intelligence and machine learning solutions for business automation',
      detailedDescription: `
        Transform your business with cutting-edge AI and machine learning solutions. Our AI engineers 
        develop custom models, predictive analytics systems, and intelligent automation tools that 
        help businesses make data-driven decisions and automate complex processes.
        
        From computer vision and natural language processing to predictive modeling and recommendation 
        systems, we build AI solutions that deliver measurable business value and competitive advantages.
      `,
      process: [
        {
          step: 1,
          title: 'AI Strategy Consultation',
          description: 'Assess your business needs and identify AI opportunities.',
          deliverable: 'AI strategy document and feasibility analysis'
        },
        {
          step: 2,
          title: 'Data Analysis',
          description: 'Analyze your data quality, structure, and preparation requirements.',
          deliverable: 'Data assessment report and preparation plan'
        },
        {
          step: 3,
          title: 'Model Development',
          description: 'Design, train, and optimize machine learning models for your specific use case.',
          deliverable: 'Trained models with performance metrics'
        },
        {
          step: 4,
          title: 'System Integration',
          description: 'Integrate AI models into your existing systems and workflows.',
          deliverable: 'Deployed AI system with API integration'
        },
        {
          step: 5,
          title: 'Monitoring & Optimization',
          description: 'Monitor performance and continuously optimize model accuracy.',
          deliverable: 'Performance dashboard and optimization reports'
        }
      ],
      pricingTiers: [
        {
          tier: 'AI Consultation',
          price: '$200-300/hour',
          description: 'Strategy consultation and proof-of-concept development',
          includes: ['AI strategy assessment', 'Feasibility analysis', 'Proof of concept', 'Implementation roadmap']
        },
        {
          tier: 'Custom AI Development',
          price: '$250-400/hour',
          description: 'Full-scale AI/ML model development and deployment',
          includes: ['Custom model development', 'Data preprocessing', 'Model training & validation', 'API development', '6 months support']
        },
        {
          tier: 'Enterprise AI Solutions',
          price: '$400-600/hour',
          description: 'Complex enterprise AI systems with ongoing optimization',
          includes: ['Multi-model systems', 'Advanced optimization', 'Real-time monitoring', 'Dedicated AI team', 'Priority support']
        }
      ],
      caseStudy: {
        title: 'Inventory Optimization AI',
        challenge: 'A retail chain needed to optimize inventory levels across 200+ stores to reduce waste and improve availability.',
        solution: 'We developed a machine learning system that predicts demand patterns, seasonal trends, and optimal stock levels.',
        result: 'Reduced inventory costs by 25% while improving product availability by 15%, saving $3M annually.',
        timeline: '12 weeks from data analysis to full deployment'
      },
      faqs: [
        {
          question: 'What types of AI/ML problems do you solve?',
          answer: 'We specialize in predictive analytics, computer vision, NLP, recommendation systems, fraud detection, and process automation.'
        },
        {
          question: 'Do you work with existing data systems?',
          answer: 'Yes, we integrate with databases, APIs, cloud platforms, and existing software systems to leverage your current data.'
        },
        {
          question: 'How accurate are your AI models?',
          answer: 'Accuracy varies by use case, but we typically achieve 85-95% accuracy and continuously optimize for better performance.'
        },
        {
          question: 'Can you explain how the AI makes decisions?',
          answer: 'Yes, we provide explainable AI solutions with clear documentation of how models make decisions and recommendations.'
        }
      ],
      tools: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenAI API', 'Azure AI', 'AWS SageMaker'],
      deliverables: [
        'Trained ML models',
        'Model documentation and API',
        'Performance analytics dashboard',
        'Integration code and guides',
        'Training data and scripts',
        'Ongoing optimization reports'
      ]
    },
    {
      id: 'blockchain',
      icon: Shield,
      title: 'Blockchain & Web3 Development',
      shortDesc: 'Secure blockchain applications, smart contracts, and decentralized solutions',
      detailedDescription: `
        Build the future with our blockchain and Web3 development services. We create secure, 
        scalable decentralized applications (DApps), smart contracts, and blockchain integrations 
        that enable trustless transactions and transparent business processes.
        
        From DeFi protocols and NFT marketplaces to supply chain solutions and tokenization 
        platforms, we deliver enterprise-grade blockchain solutions that drive innovation 
        and create new business opportunities.
      `,
      process: [
        {
          step: 1,
          title: 'Blockchain Strategy',
          description: 'Assess your use case and determine the optimal blockchain architecture.',
          deliverable: 'Blockchain strategy and technical architecture'
        },
        {
          step: 2,
          title: 'Smart Contract Development',
          description: 'Design and develop secure smart contracts with comprehensive testing.',
          deliverable: 'Audited smart contracts with test coverage'
        },
        {
          step: 3,
          title: 'DApp Development',
          description: 'Build user-friendly decentralized applications with modern interfaces.',
          deliverable: 'Fully functional DApp with web3 integration'
        },
        {
          step: 4,
          title: 'Security Audit',
          description: 'Comprehensive security testing and vulnerability assessment.',
          deliverable: 'Security audit report with recommendations'
        },
        {
          step: 5,
          title: 'Deployment & Launch',
          description: 'Deploy to mainnet with monitoring and ongoing support.',
          deliverable: 'Deployed application with monitoring dashboard'
        }
      ],
      pricingTiers: [
        {
          tier: 'Smart Contract Basic',
          price: '$300-500/hour',
          description: 'Simple smart contracts with basic functionality',
          includes: ['Basic smart contract', 'Unit testing', 'Deployment guide', 'Basic audit', '3 months support']
        },
        {
          tier: 'DApp Development',
          price: '$400-650/hour',
          description: 'Full decentralized applications with complex features',
          includes: ['Complete DApp', 'Advanced smart contracts', 'Web3 frontend', 'Comprehensive testing', '6 months support']
        },
        {
          tier: 'Enterprise Blockchain',
          price: '$600-1000/hour',
          description: 'Enterprise-grade blockchain solutions with advanced security',
          includes: ['Multi-chain support', 'Advanced security', 'Scalability optimization', 'Professional audit', '12 months support']
        }
      ],
      caseStudy: {
        title: 'Supply Chain Transparency Platform',
        challenge: 'A manufacturing company needed to provide transparent supply chain tracking for premium products.',
        solution: 'We built a blockchain platform that tracks products from raw materials to end consumers with immutable records.',
        result: 'Increased customer trust by 40% and reduced counterfeit products by 85%, leading to 25% revenue increase.',
        timeline: '16 weeks from concept to full deployment'
      },
      faqs: [
        {
          question: 'Which blockchains do you develop on?',
          answer: 'We primarily work with Ethereum, Polygon, Binance Smart Chain, and Solana, but can adapt to other networks as needed.'
        },
        {
          question: 'How do you ensure smart contract security?',
          answer: 'We follow security best practices, conduct comprehensive testing, and perform security audits before deployment.'
        },
        {
          question: 'What are the ongoing costs for blockchain applications?',
          answer: 'Costs include gas fees for transactions, hosting for frontends, and optional ongoing development. We provide detailed cost projections.'
        },
        {
          question: 'Can you integrate with existing business systems?',
          answer: 'Yes, we can connect blockchain applications to existing databases, APIs, and business systems through secure integrations.'
        }
      ],
      tools: ['Solidity', 'Web3.js', 'Ethers.js', 'Hardhat', 'Truffle', 'MetaMask', 'IPFS'],
      deliverables: [
        'Smart contracts (verified on blockchain)',
        'DApp frontend and backend',
        'Web3 integration code',
        'Security audit report',
        'Deployment and usage guides',
        'Ongoing monitoring dashboard'
      ]
    },
    {
      id: 'ecommerce-tech',
      icon: ShoppingCart,
      title: 'E-Commerce Technology',
      shortDesc: 'Complete e-commerce solutions with payment integration and performance optimization',
      detailedDescription: `
        Launch and scale your online business with our comprehensive e-commerce technology solutions. 
        We build fast, secure, and conversion-optimized online stores that provide exceptional 
        shopping experiences across all devices.
        
        From custom e-commerce platforms to marketplace integrations and payment processing, 
        we handle all technical aspects so you can focus on growing your business and serving customers.
      `,
      process: [
        {
          step: 1,
          title: 'Business Analysis',
          description: 'Understand your products, target market, and business requirements.',
          deliverable: 'E-commerce strategy and technical requirements'
        },
        {
          step: 2,
          title: 'Platform Setup',
          description: 'Set up e-commerce platform with catalog, inventory, and user management.',
          deliverable: 'Configured e-commerce platform with admin access'
        },
        {
          step: 3,
          title: 'Design & Customization',
          description: 'Create custom design and optimize for user experience and conversions.',
          deliverable: 'Custom-designed storefront with responsive layout'
        },
        {
          step: 4,
          title: 'Payment Integration',
          description: 'Integrate secure payment gateways and configure tax/shipping calculations.',
          deliverable: 'Fully functional checkout with payment processing'
        },
        {
          step: 5,
          title: 'Testing & Launch',
          description: 'Comprehensive testing, performance optimization, and go-live support.',
          deliverable: 'Live e-commerce store with performance monitoring'
        }
      ],
      pricingTiers: [
        {
          tier: 'Starter Store',
          price: '$100-150/hour',
          description: 'Basic e-commerce setup with essential features',
          includes: ['Product catalog setup', 'Basic payment integration', 'Responsive design', 'SSL certificate', '3 months support']
        },
        {
          tier: 'Professional Store',
          price: '$150-250/hour',
          description: 'Advanced features with marketing and analytics integration',
          includes: ['Custom design', 'Advanced features', 'SEO optimization', 'Analytics setup', 'Inventory management', '6 months support']
        },
        {
          tier: 'Enterprise Solution',
          price: '$250-400/hour',
          description: 'High-performance stores with advanced integrations',
          includes: ['Custom development', 'Third-party integrations', 'Performance optimization', 'Multi-channel selling', 'Priority support']
        }
      ],
      caseStudy: {
        title: 'Fashion Brand E-Commerce Launch',
        challenge: 'A fashion startup needed a high-converting online store with inventory management and international shipping.',
        solution: 'We built a custom Shopify Plus store with advanced product filtering, size guides, and international payment options.',
        result: 'Achieved $500K in revenue within 6 months of launch with a 3.2% conversion rate and 95% customer satisfaction.',
        timeline: '8 weeks from requirements to launch'
      },
      faqs: [
        {
          question: 'Which e-commerce platforms do you work with?',
          answer: 'We specialize in Shopify, WooCommerce, Magento, and custom solutions, choosing the best fit for your needs.'
        },
        {
          question: 'Can you handle payment processing setup?',
          answer: 'Yes, we integrate with all major payment gateways including Stripe, PayPal, Square, and regional payment providers.'
        },
        {
          question: 'Do you provide ongoing maintenance?',
          answer: 'Yes, we offer maintenance packages including updates, security monitoring, performance optimization, and feature additions.'
        },
        {
          question: 'How do you optimize for mobile commerce?',
          answer: 'We design mobile-first experiences with fast loading, intuitive navigation, and optimized checkout flows for mobile devices.'
        }
      ],
      tools: ['Shopify Plus', 'WooCommerce', 'Magento', 'Stripe', 'PayPal', 'Google Analytics', 'Klaviyo'],
      deliverables: [
        'Fully functional e-commerce store',
        'Admin panel with training',
        'Payment gateway integration',
        'SEO optimization setup',
        'Analytics and tracking',
        'Maintenance and support plan'
      ]
    }
  ];

  const stats = [
    { icon: Users, value: '500+', label: 'Engineering Projects Completed' },
    { icon: Award, value: '98%', label: 'Client Satisfaction Rate' },
    { icon: Globe, value: '35+', label: 'Countries Served' },
    { icon: Clock, value: '24/7', label: 'Global Support Available' }
  ];

  const handleGetStarted = (serviceId: string) => {
    const serviceNames = {
      'cad-design': 'CAD Design Engineering',
      '3d-animation': '3D Animation & VFX',
      'ai-ml': 'AI/ML Engineering',
      'blockchain': 'Blockchain Development',
      'ecommerce-tech': 'E-Commerce Development'
    };
    
    navigate(`/get-started?service=${encodeURIComponent(serviceNames[serviceId] || 'Engineering Services')}`);
  };

  const handleContactUs = () => {
    navigate('/contact');
  };

  // ROI Calculator State and Functions
  const [roiCalculator, setRoiCalculator] = useState({
    isOpen: false,
    activeService: null,
    currentProject: {
      projectValue: 100000,
      currentCost: 30000,
      timeframe: 6,
      efficiency: 20
    }
  });

  const calculateROI = (service, inputs) => {
    const { projectValue, currentCost, timeframe, efficiency } = inputs;
    
    const serviceMultipliers = {
      'cad-design': { costSavings: 0.25, timeSavings: 0.30, qualityImprovement: 0.15 },
      '3d-animation': { marketingROI: 3.5, conversionIncrease: 0.40, brandValue: 50000 },
      'ai-ml': { costReduction: 0.30, efficiency: 0.45, revenueIncrease: 0.25 },
      'blockchain': { trustIncrease: 0.35, fraudReduction: 0.85, operationalSavings: 0.20 },
      'ecommerce-tech': { conversionIncrease: 0.25, customerLifetimeValue: 1.4, operationalEfficiency: 0.30 }
    };
    
    const multiplier = serviceMultipliers[service] || serviceMultipliers['cad-design'];
    
    const annualSavings = currentCost * (multiplier.costSavings || multiplier.costReduction || 0.25);
    const efficiencyGains = projectValue * (multiplier.efficiency || multiplier.conversionIncrease || 0.20);
    const totalBenefits = annualSavings + efficiencyGains;
    
    const investmentCost = service === 'ai-ml' ? 75000 : service === 'blockchain' ? 120000 : service === '3d-animation' ? 45000 : service === 'ecommerce-tech' ? 35000 : 25000;
    
    const roi = ((totalBenefits - investmentCost) / investmentCost) * 100;
    const paybackPeriod = investmentCost / (totalBenefits / 12);
    
    return {
      roi: Math.round(roi),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      annualSavings: Math.round(annualSavings),
      totalBenefits: Math.round(totalBenefits),
      investmentCost
    };
  };

  const openROICalculator = (serviceId) => {
    setRoiCalculator({ ...roiCalculator, isOpen: true, activeService: serviceId });
  };

  const updateROIInputs = (field, value) => {
    setRoiCalculator({
      ...roiCalculator,
      currentProject: {
        ...roiCalculator.currentProject,
        [field]: parseInt(value) || 0
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 text-primary border-primary/20">
              Engineering & Technical Services
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Professional Engineering & 
              <span className="text-primary"> Technical Solutions</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              From CAD design and 3D animation to AI/ML development and blockchain solutions, 
              we provide comprehensive engineering services that drive innovation and deliver 
              exceptional results for businesses worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => handleGetStarted('general')} className="text-lg px-8">
                Start Your Project <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/portfolio')}>
                View Our Portfolio
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Engineering & Technical Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive technical expertise across multiple engineering disciplines, 
              delivering innovative solutions with proven methodologies and industry-leading tools.
            </p>
          </div>

          {/* Service Cards */}
          <div className="space-y-32">
            {engineeringServices.map((service, index) => (
              <div key={service.id} className="space-y-12">
                {/* Service Header with Hero Image */}
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-primary/10">
                      <service.icon className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{service.title}</h3>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">{service.shortDesc}</p>
                  
                  {/* Hero Image Placeholder */}
                  <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 aspect-video max-w-4xl mx-auto mb-8">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <service.icon className="w-24 h-24 text-primary/40 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {service.id === 'cad-design' && '3D CAD Models & Technical Drawings'}
                          {service.id === '3d-animation' && 'Product Animations & Visualizations'}
                          {service.id === 'ai-ml' && 'AI Models & Data Analytics Dashboards'}
                          {service.id === 'blockchain' && 'Smart Contracts & DApp Interfaces'}
                          {service.id === 'ecommerce-tech' && 'E-Commerce Stores & Shopping Experiences'}
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary">Portfolio Examples Coming Soon</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Main Service Description */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Service Overview */}
                    <Card className="p-6">
                      <h4 className="text-xl font-bold text-foreground mb-4">Service Overview</h4>
                      <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">
                        {service.detailedDescription}
                      </p>
                      
                      {/* Live Database Portfolio */}
                      <div className="mt-6">
                        <PortfolioDisplay 
                          serviceId={service.id}
                          maxProjects={6}
                          showLoadingState={true}
                        />
                      </div>
                    </Card>

                    {/* Process Steps with Images */}
                    <Card className="p-6">
                      <h4 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        Our {service.title.split(' ')[0]} Process
                      </h4>
                      <div className="space-y-6">
                        {service.process.map((step, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold">
                                {step.step}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                  <h5 className="font-semibold text-foreground mb-2">{step.title}</h5>
                                  <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                                  <div className="flex items-center gap-2 text-primary">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm font-medium">{step.deliverable}</span>
                                  </div>
                                </div>
                                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                                  <div className="text-center">
                                    <service.icon className="w-6 h-6 text-primary/60 mx-auto mb-1" />
                                    <p className="text-xs text-muted-foreground">Step {step.step}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Sidebar Content */}
                  <div className="space-y-6">
                    {/* Quick Action Card */}
                    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                      <h4 className="text-lg font-bold text-foreground mb-4 text-center">
                        Start Your {service.title.split(' ')[0]} Project
                      </h4>
                      <div className="text-center mb-6">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {service.pricingTiers[0].price}
                        </div>
                        <p className="text-sm text-muted-foreground">Starting price</p>
                      </div>
                      <div className="space-y-2 mb-4">
                        <Button 
                          onClick={() => handleGetStarted(service.id)} 
                          className="w-full"
                          size="lg"
                        >
                          Get Quote <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => openROICalculator(service.id)}
                          variant="outline"
                          className="w-full"
                          size="lg"
                        >
                          <Calculator className="mr-2 w-4 h-4" />
                          Calculate ROI
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>Free consultation</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>24-48h response time</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>Satisfaction guarantee</span>
                        </div>
                      </div>
                    </Card>

                    {/* Pricing Tiers */}
                    <Card className="p-6">
                      <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Pricing Options
                      </h4>
                      <div className="space-y-4">
                        {service.pricingTiers.map((tier, idx) => (
                          <div key={idx} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-foreground">{tier.tier}</h5>
                              <span className="text-primary font-bold">{tier.price}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>
                            <div className="space-y-1">
                              {tier.includes.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-success" />
                                  <span className="text-xs text-muted-foreground">{item}</span>
                                </div>
                              ))}
                              {tier.includes.length > 3 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  +{tier.includes.length - 3} more features
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Case Study Card */}
                    <Card className="p-6">
                      <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Success Story
                      </h4>
                      
                      {/* Case Study Image Placeholder */}
                      <div className="aspect-video bg-gradient-to-br from-success/20 to-primary/20 rounded-lg mb-4 flex items-center justify-center">
                        <div className="text-center">
                          <TrendingUp className="w-12 h-12 text-success/60 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Before/After Comparison</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h5 className="font-semibold text-foreground">{service.caseStudy.title}</h5>
                        <div className="text-sm">
                          <span className="font-medium text-success uppercase text-xs">Result</span>
                          <p className="text-foreground font-medium mt-1">{service.caseStudy.result}</p>
                        </div>
                        <div className="flex items-center gap-2 text-primary">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">{service.caseStudy.timeline}</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Read Full Case Study <ArrowRight className="ml-2 w-3 h-3" />
                        </Button>
                      </div>
                    </Card>

                    {/* Tools & Tech */}
                    <Card className="p-6">
                      <h4 className="text-lg font-bold text-foreground mb-4">Tools We Use</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {service.tools.map((tool, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-sm text-foreground">{tool}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Contact Info */}
                    <Card className="p-6 bg-gradient-to-br from-secondary/10 to-accent/10">
                      <h4 className="text-lg font-bold text-foreground mb-4">Need Help Choosing?</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Speak with our {service.title.split(' ')[0].toLowerCase()} experts to find the right solution for your project.
                      </p>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full" onClick={handleContactUs}>
                          <Phone className="w-4 h-4 mr-2" />
                          Schedule Call
                        </Button>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">or call directly</p>
                          <p className="text-sm font-medium text-foreground">+233209628907</p>
                        </div>
                      </div>
                      
                      {/* Instant Quote Button */}
                      <div className="mt-4 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20">
                        <h5 className="font-semibold text-foreground mb-2 text-sm">Need an Instant Quote?</h5>
                        <p className="text-xs text-muted-foreground mb-3">
                          Get a preliminary quote in under 2 minutes based on your requirements.
                        </p>
                        <Button size="sm" className="w-full" onClick={() => openROICalculator(service.id)}>
                          <Zap className="w-3 h-3 mr-2" />
                          Instant Quote Generator
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Full-width Case Study Details */}
                <Card className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        {service.caseStudy.title} - Detailed Case Study
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground uppercase">The Challenge</span>
                          <p className="text-muted-foreground mt-1">{service.caseStudy.challenge}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-muted-foreground uppercase">Our Solution</span>
                          <p className="text-muted-foreground mt-1">{service.caseStudy.solution}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-success uppercase">Measurable Results</span>
                          <p className="text-foreground font-medium mt-1">{service.caseStudy.result}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{service.caseStudy.timeline}</span>
                          </div>
                          <Button size="sm">
                            View More Cases <ArrowRight className="ml-2 w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Before/After Mockup */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">BEFORE</p>
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-8 h-8 bg-muted-foreground/30 rounded mx-auto mb-2"></div>
                              <p className="text-xs text-muted-foreground">Original State</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success mb-2">AFTER</p>
                          <div className="aspect-square bg-gradient-to-br from-success/20 to-primary/20 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <service.icon className="w-8 h-8 text-success mx-auto mb-2" />
                              <p className="text-xs text-success">Optimized Solution</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-success/10 rounded-lg">
                          <div className="text-2xl font-bold text-success mb-1">
                            {service.id === 'cad-design' && '30%'}
                            {service.id === '3d-animation' && '$2M'}
                            {service.id === 'ai-ml' && '25%'}
                            {service.id === 'blockchain' && '85%'}
                            {service.id === 'ecommerce-tech' && '$500K'}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {service.id === 'cad-design' && 'Time Saved'}
                            {service.id === '3d-animation' && 'Funding Secured'}
                            {service.id === 'ai-ml' && 'Cost Reduction'}
                            {service.id === 'blockchain' && 'Fraud Reduction'}
                            {service.id === 'ecommerce-tech' && 'Revenue Generated'}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-primary/10 rounded-lg">
                          <div className="text-2xl font-bold text-primary mb-1">
                            {service.id === 'cad-design' && '$50K'}
                            {service.id === '3d-animation' && '4 weeks'}
                            {service.id === 'ai-ml' && '$3M'}
                            {service.id === 'blockchain' && '40%'}
                            {service.id === 'ecommerce-tech' && '3.2%'}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {service.id === 'cad-design' && 'Annual Savings'}
                            {service.id === '3d-animation' && 'Project Timeline'}
                            {service.id === 'ai-ml' && 'Annual Savings'}
                            {service.id === 'blockchain' && 'Trust Increase'}
                            {service.id === 'ecommerce-tech' && 'Conversion Rate'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get answers to common questions about our engineering and technical services.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {engineeringServices.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <div key={service.id}>
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <ServiceIcon className="w-5 h-5 text-primary" />
                    {service.title} FAQ
                  </h3>
                  <div className="space-y-4">
                    {service.faqs.map((faq, idx) => (
                      <Card key={idx} className="p-4">
                        <h4 className="font-semibold text-foreground mb-2 flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          {faq.question}
                        </h4>
                        <p className="text-sm text-muted-foreground pl-6">{faq.answer}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ROI Calculator Modal */}
      {roiCalculator.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Calculator className="w-6 h-6 text-primary" />
                ROI Calculator - {engineeringServices.find(s => s.id === roiCalculator.activeService)?.title}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setRoiCalculator({ ...roiCalculator, isOpen: false })}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground mb-4">Project Details</h4>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Annual Project Value ($)</label>
                  <input 
                    type="number" 
                    value={roiCalculator.currentProject.projectValue}
                    onChange={(e) => updateROIInputs('projectValue', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="100000"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Annual Costs ($)</label>
                  <input 
                    type="number" 
                    value={roiCalculator.currentProject.currentCost}
                    onChange={(e) => updateROIInputs('currentCost', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="30000"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project Timeline (months)</label>
                  <input 
                    type="number" 
                    value={roiCalculator.currentProject.timeframe}
                    onChange={(e) => updateROIInputs('timeframe', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="6"
                  />
                </div>
              </div>
              
              {/* Results Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground mb-4">Projected ROI</h4>
                
                {(() => {
                  const results = calculateROI(roiCalculator.activeService, roiCalculator.currentProject);
                  return (
                    <div className="space-y-4">
                      <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                        <div className="text-3xl font-bold text-success mb-2">{results.roi}%</div>
                        <p className="text-sm text-muted-foreground">Return on Investment</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <div className="text-xl font-bold text-primary">${results.annualSavings.toLocaleString()}</div>
                          <p className="text-xs text-muted-foreground">Annual Savings</p>
                        </div>
                        <div className="p-3 bg-secondary/10 rounded-lg">
                          <div className="text-xl font-bold text-secondary">{results.paybackPeriod} mo</div>
                          <p className="text-xs text-muted-foreground">Payback Period</p>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Investment Cost:</span>
                            <span className="font-medium">${results.investmentCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Annual Benefits:</span>
                            <span className="font-medium text-success">${results.totalBenefits.toLocaleString()}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-bold">
                            <span>Net Annual Benefit:</span>
                            <span className="text-success">${(results.totalBenefits - results.investmentCost/12).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleGetStarted(roiCalculator.activeService)}
                          className="flex-1"
                        >
                          Get Started
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={handleContactUs}
                          className="flex-1"
                        >
                          Discuss Results
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Client Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real testimonials from businesses that have transformed their operations with our engineering solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                title: "CTO, TechFlow Manufacturing",
                company: "Fortune 500 Manufacturing",
                image: "SC",
                testimonial: "NexaCore's CAD engineering saved us 6 months on our new product line. Their 3D modeling precision reduced our prototype costs by 70% and accelerated our time-to-market significantly.",
                service: "CAD Design & 3D Modeling",
                results: "70% cost reduction, 6 months faster launch",
                rating: 5
              },
              {
                name: "Marcus Rodriguez",
                title: "Founder & CEO",
                company: "AgroTech Innovations",
                image: "MR",
                testimonial: "The AI/ML solution NexaCore built for our crop monitoring system increased our prediction accuracy to 94%. We now serve 500+ farms across 3 countries with their intelligent algorithms.",
                service: "AI/ML Development",
                results: "94% accuracy, 500+ farms served",
                rating: 5
              },
              {
                name: "Jennifer Kim",
                title: "Operations Director",
                company: "Global Supply Chain Corp",
                image: "JK",
                testimonial: "Their blockchain supply chain solution eliminated 85% of our counterfeit issues and increased customer trust by 40%. The transparency and traceability are game-changing.",
                service: "Blockchain Development",
                results: "85% fraud reduction, 40% trust increase",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Quote className="w-8 h-8 text-primary/20" />
                </div>
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Testimonial */}
                <p className="text-muted-foreground mb-6 italic">"{testimonial.testimonial}"</p>
                
                {/* Results Badge */}
                <div className="mb-4">
                  <Badge variant="secondary" className="text-xs">{testimonial.results}</Badge>
                </div>
                
                {/* Client Info */}
                <div className="flex items-center gap-3 border-t pt-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    <p className="text-xs text-primary">{testimonial.company}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {testimonial.service}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Video Testimonial Placeholder */}
          <div className="mt-12 text-center">
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 max-w-2xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-6 flex items-center justify-center relative group cursor-pointer hover:from-primary/30 hover:to-secondary/30 transition-all">
                <div className="absolute inset-0 bg-black/20 rounded-lg group-hover:bg-black/30 transition-colors"></div>
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Play className="w-6 h-6 ml-1" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Watch Client Success Stories</h4>
                  <p className="text-muted-foreground">See how our engineering solutions transformed businesses</p>
                </div>
              </div>
              <Button variant="outline">
                <Play className="mr-2 w-4 h-4" />
                Watch Video Testimonials
              </Button>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Industry-Specific Sections */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Industry-Specific Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Specialized engineering expertise tailored for your industry's unique challenges and requirements.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: Factory,
                industry: "Manufacturing & Industrial",
                description: "CAD design, automation systems, and process optimization for manufacturing excellence.",
                services: ["Factory Layout Design", "Production Line Optimization", "Quality Control Systems", "Industrial IoT Solutions"],
                caseExample: "Reduced production downtime by 45% for automotive parts manufacturer",
                clientTypes: ["Automotive", "Aerospace", "Consumer Goods", "Heavy Machinery"]
              },
              {
                icon: Rocket,
                industry: "Technology & Startups",
                description: "Rapid prototyping, MVP development, and scalable technical architectures for growth.",
                services: ["MVP Development", "Technical Architecture", "AI/ML Integration", "Blockchain Solutions"],
                caseExample: "Helped 50+ startups secure $120M+ in funding with technical prototypes",
                clientTypes: ["SaaS Startups", "FinTech", "HealthTech", "EdTech"]
              },
              {
                icon: Building,
                industry: "Enterprise & Fortune 500",
                description: "Large-scale system integration, digital transformation, and enterprise-grade solutions.",
                services: ["Legacy System Modernization", "Enterprise AI", "Supply Chain Optimization", "Digital Transformation"],
                caseExample: "$50M+ in cost savings across 15 Fortune 500 implementations",
                clientTypes: ["Banking", "Retail", "Healthcare", "Energy"]
              }
            ].map((industry, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <industry.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{industry.industry}</h3>
                  <p className="text-muted-foreground">{industry.description}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Specialized Services</h4>
                    <div className="space-y-2">
                      {industry.services.map((service, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                    <p className="text-sm font-medium text-success mb-1">Success Example</p>
                    <p className="text-xs text-muted-foreground">{industry.caseExample}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-sm">Client Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {industry.clientTypes.map((type, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{type}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4">
                    View {industry.industry} Solutions
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Credentials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Expert Engineering Team
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Certified professionals with decades of combined experience and industry-leading credentials.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Team Stats */}
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "25+", label: "Senior Engineers", icon: Users },
                  { value: "50+", label: "Certifications", icon: Award },
                  { value: "15", label: "Years Average Experience", icon: Clock },
                  { value: "98%", label: "Client Retention Rate", icon: Heart }
                ].map((stat, idx) => (
                  <div key={idx} className="text-center p-4 bg-background rounded-lg shadow-sm">
                    <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
              
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Key Certifications & Credentials</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Certified SolidWorks Professional (CSWP)",
                    "AWS Certified Machine Learning - Specialty",
                    "Certified Ethical Hacker (CEH)",
                    "Google Cloud Professional Data Engineer",
                    "Certified Blockchain Developer",
                    "Adobe Certified Expert (ACE)",
                    "Microsoft Azure AI Engineer Associate",
                    "Shopify Plus Certified Developer"
                  ].map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <Award className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{cert}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            
            {/* Team Showcase */}
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <h3 className="text-lg font-bold text-foreground mb-4">Meet Our Lead Engineers</h3>
                <div className="space-y-4">
                  {[
                    {
                      name: "Dr. Alex Thompson",
                      title: "Lead AI/ML Engineer",
                      credentials: "PhD Computer Science, Stanford • 12 years ML experience",
                      avatar: "AT",
                      specialties: ["Deep Learning", "Computer Vision", "NLP"]
                    },
                    {
                      name: "Maria Rodriguez",
                      title: "Senior CAD Engineer",
                      credentials: "PE License • Mechanical Engineering, MIT • 15 years experience",
                      avatar: "MR",
                      specialties: ["3D Modeling", "FEA Analysis", "Manufacturing"]
                    },
                    {
                      name: "David Chen",
                      title: "Blockchain Architect",
                      credentials: "MS Cryptography • Former Ethereum Core Developer",
                      avatar: "DC",
                      specialties: ["Smart Contracts", "DeFi", "Security Audits"]
                    }
                  ].map((engineer, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-background rounded-lg">
                      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                        {engineer.avatar}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{engineer.name}</h4>
                        <p className="text-sm text-primary">{engineer.title}</p>
                        <p className="text-xs text-muted-foreground mb-2">{engineer.credentials}</p>
                        <div className="flex flex-wrap gap-1">
                          {engineer.specialties.map((specialty, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{specialty}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Quality Assurance</h3>
                <div className="space-y-3">
                  {[
                    { label: "ISO 9001:2015 Certified", icon: Award },
                    { label: "SOC 2 Type II Compliant", icon: Shield },
                    { label: "Regular Security Audits", icon: Settings },
                    { label: "24/7 Monitoring & Support", icon: Clock }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2">
                      <item.icon className="w-5 h-5 text-success" />
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Start Your Engineering Project?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Whether you need CAD design, AI/ML development, or any other technical service, 
            our expert engineers are ready to bring your vision to life with precision and innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => handleGetStarted('general')}
              className="text-lg px-8"
            >
              Start Your Project <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleContactUs}
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Phone className="mr-2 w-5 h-5" />
              Schedule Consultation
            </Button>
          </div>
          
          {/* Contact Info */}
          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>+233209628907</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>info@nexacore-innovations.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>24/7 Global Support</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Live Chat Widget Placeholder */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          {/* Chat Button */}
          <Button 
            size="lg" 
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => handleContactUs()}
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
          
          {/* Notification Badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            1
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="bg-foreground text-background px-2 py-1 rounded text-xs whitespace-nowrap">
              Chat with Engineering Expert
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}