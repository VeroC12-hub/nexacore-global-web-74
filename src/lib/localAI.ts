// Local AI Assistant - No API needed!
// Uses knowledge base from Supabase to answer questions

import { supabase } from '@/integrations/supabase/client';

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

// Simple keyword-based search (no OpenAI needed)
export async function searchKnowledgeByKeywords(query: string): Promise<KnowledgeEntry[]> {
  try {
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3);

    // Search knowledge base using PostgreSQL full-text search
    const { data, error } = await supabase
      .from('ai_knowledge_base')
      .select('id, title, content, category, tags')
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(5);

    if (error) throw error;

    return (data || []) as KnowledgeEntry[];
  } catch (error) {
    console.error('Knowledge search error:', error);
    return [];
  }
}

// Intelligent response generator based on knowledge base
export async function generateLocalResponse(userMessage: string): Promise<string> {
  const message = userMessage.toLowerCase();

  // Search knowledge base
  const knowledgeResults = await searchKnowledgeByKeywords(userMessage);

  // Pattern matching for common questions
  if (message.includes('service') || message.includes('what do you do') || message.includes('offer')) {
    const serviceKnowledge = knowledgeResults.find(k => k.category === 'service' || k.title.includes('Service'));
    if (serviceKnowledge) {
      return `${serviceKnowledge.content}\n\nWould you like to know more about any specific service?`;
    }
    return `NexaCore offers comprehensive technology solutions including:\n\n• AI/ML Services - Custom machine learning models and data analytics\n• CAD Services - 2D/3D modeling and engineering design\n• Blockchain Services - Smart contracts and Web3 development\n• Remote Development Teams - Dedicated offshore teams\n• Engineering Technical Services - Technical consulting\n\nWhich service interests you most?`;
  }

  if (message.includes('price') || message.includes('cost') || message.includes('quote') || message.includes('pricing')) {
    const pricingKnowledge = knowledgeResults.find(k => k.category === 'pricing' || k.title.includes('Pricing'));
    if (pricingKnowledge) {
      return pricingKnowledge.content;
    }
    return `We offer flexible pricing models:\n\n1. **Fixed-Price Projects** ($5,000 - $100,000+)\n   - Best for well-defined scopes\n   - Milestone-based payments\n\n2. **Time & Materials**\n   - Developer rates: $25-80/hour\n   - Flexible for evolving requirements\n\n3. **Dedicated Team Model**\n   - Monthly retainers: $3,000-12,000/month\n   - Full-time developers\n\n4. **Retainer Packages**\n   - Starting from $2,000/month\n   - Ongoing support\n\n**Get a custom quote within 24-48 hours!** Contact us at info@nexacore-innovations.com`;
  }

  if (message.includes('contact') || message.includes('reach') || message.includes('email') || message.includes('phone')) {
    const contactKnowledge = knowledgeResults.find(k => k.category === 'contact');
    if (contactKnowledge) {
      return contactKnowledge.content;
    }
    return `**Contact NexaCore:**\n\n📧 **Email:** info@nexacore-innovations.com\n🌐 **Website:** www.nexacore-innovations.com\n⏰ **Hours:** Mon-Fri 9AM-6PM GMT\n📱 **Response Time:** 2-4 business hours\n\nWe offer free 30-minute consultations! Would you like to schedule one?`;
  }

  if (message.includes('timeline') || message.includes('how long') || message.includes('delivery') || message.includes('process')) {
    const timelineKnowledge = knowledgeResults.find(k => k.category === 'process' || k.title.includes('Timeline'));
    if (timelineKnowledge) {
      return timelineKnowledge.content;
    }
    return `**Project Timelines:**\n\n⚡ **Small Projects:** 2-4 weeks\n   (Landing pages, simple apps)\n\n📦 **Medium Projects:** 1-3 months\n   (Full web apps, e-commerce)\n\n🏢 **Large Projects:** 3-6 months\n   (Enterprise applications)\n\n**Development Process:**\n1. Discovery Phase (1-2 weeks)\n2. Design Phase (1-2 weeks)\n3. Development (varies, 2-week sprints)\n4. Testing & QA (1-2 weeks)\n5. Deployment (3-5 days)\n6. Support (ongoing)\n\nWeekly updates and bi-weekly demos included!`;
  }

  if (message.includes('technology') || message.includes('tech stack') || message.includes('tools') || message.includes('framework')) {
    const techKnowledge = knowledgeResults.find(k => k.category === 'technical' || k.title.includes('Technology'));
    if (techKnowledge) {
      return techKnowledge.content;
    }
    return `**Our Tech Stack:**\n\n**Frontend:** React, Next.js, Vue, TypeScript, Tailwind CSS\n**Backend:** Node.js, Python, Java, Go\n**Mobile:** React Native, Flutter, Native iOS/Android\n**Cloud:** AWS, Google Cloud, Azure, Vercel\n**AI/ML:** TensorFlow, PyTorch, OpenAI, Claude\n**Blockchain:** Ethereum, Solidity, Web3.js\n**Database:** PostgreSQL, MongoDB, Redis\n\nWe stay current with the latest technologies!`;
  }

  if (message.includes('ai') || message.includes('machine learning') || message.includes('ml')) {
    return `**AI/ML Services:**\n\n🧠 **Custom ML Models** - Tailored to your business needs\n📊 **Data Analytics** - Extract insights from your data\n👁️ **Computer Vision** - Image and video analysis\n💬 **Natural Language Processing** - Text analysis and chatbots\n🤖 **AI Integration** - OpenAI, Claude, Gemini integration\n📈 **Predictive Analytics** - Forecast trends and patterns\n\nWe build AI solutions that drive real business value!`;
  }

  if (message.includes('cad') || message.includes('design') || message.includes('engineering')) {
    return `**CAD & Engineering Services:**\n\n✏️ **2D/3D Modeling** - Precise technical drawings\n🏗️ **Product Design** - From concept to prototype\n🏛️ **Architectural Design** - Building and structure design\n⚡ **MEP Design** - Mechanical, Electrical, Plumbing\n🔧 **Reverse Engineering** - Recreate existing designs\n📐 **Technical Documentation** - Complete specifications\n\n**Software:** AutoCAD, SolidWorks, Revit, Fusion 360\n\nFree consultation to discuss your project!`;
  }

  if (message.includes('blockchain') || message.includes('web3') || message.includes('crypto') || message.includes('nft')) {
    return `**Blockchain & Web3 Services:**\n\n⛓️ **Smart Contracts** - Solidity, Rust development\n💰 **DeFi Applications** - Decentralized finance platforms\n🎨 **NFT Marketplaces** - Create and trade NFTs\n🪙 **Cryptocurrency** - Token development and integration\n🗳️ **DAO Development** - Decentralized organizations\n🌐 **Web3 Integration** - Connect traditional apps to blockchain\n\n**Platforms:** Ethereum, Polygon, Solana, BSC\n\nSecure, audited, production-ready blockchain solutions!`;
  }

  if (message.includes('quality') || message.includes('testing') || message.includes('qa')) {
    const qaKnowledge = knowledgeResults.find(k => k.category === 'quality');
    if (qaKnowledge) {
      return qaKnowledge.content;
    }
    return `**Quality Assurance:**\n\n✅ **Code Reviews** - Every pull request reviewed\n🧪 **Testing** - Unit, integration, end-to-end tests\n🔒 **Security** - OWASP compliance, penetration testing\n⚡ **Performance** - < 3s page loads, optimized APIs\n♿ **Accessibility** - WCAG 2.1 compliance\n📱 **Cross-platform** - Works on all devices\n\n**30-day warranty** on all deliverables!\nMinimum 80% code coverage on all projects.`;
  }

  if (message.includes('portfolio') || message.includes('case study') || message.includes('case studies') || message.includes('projects') || message.includes('examples') || message.includes('previous work') || message.includes('success stories')) {
    const portfolioKnowledge = knowledgeResults.find(k => k.category === 'portfolio');
    if (portfolioKnowledge) {
      return portfolioKnowledge.content;
    }
    return `**Our Portfolio:**\n\n🛍️ **E-Commerce Platform** - 300% sales increase for retail client\n🏥 **AI Healthcare Dashboard** - 40% reduction in patient wait times\n⛓️ **DeFi Staking Platform** - $5M+ TVL in first month\n🔧 **CAD Automation Tool** - 80% time savings on engineering tasks\n\n**Industries We Serve:**\n• FinTech & Banking\n• Healthcare & MedTech\n• E-Commerce & Retail\n• Real Estate & PropTech\n• Blockchain & Web3\n• Manufacturing & Engineering\n\n**150+ projects delivered** with 98% client satisfaction!\nWould you like to see detailed case studies?`;
  }

  if (message.includes('team') || message.includes('developers') || message.includes('expertise') || message.includes('experience') || message.includes('who') || message.includes('staff')) {
    const teamKnowledge = knowledgeResults.find(k => k.category === 'team');
    if (teamKnowledge) {
      return teamKnowledge.content;
    }
    return `**Our Team:**\n\n👥 **50+ Developers Available**\n\n**Specialists:**\n• Senior Full-Stack Developers (5+ years)\n• Frontend Experts (React, Vue, Angular)\n• Backend Engineers (Node.js, Python, Java)\n• Mobile Developers (React Native, Flutter)\n• AI/ML Engineers (TensorFlow, PyTorch)\n• Blockchain Developers (Solidity, Rust)\n• CAD Engineers (AutoCAD, SolidWorks)\n• DevOps Engineers (AWS, Docker, K8s)\n\n**Certifications:**\n✅ AWS Certified Solutions Architect\n✅ Google Cloud Professional\n✅ Certified Scrum Master\n✅ PMP Project Managers\n\n**Average team size:** 3-7 developers per project\nCan scale to 20+ for enterprise needs!`;
  }

  if (message.includes('support') || message.includes('maintenance') || message.includes('after launch') || message.includes('ongoing') || message.includes('hosting')) {
    const supportKnowledge = knowledgeResults.find(k => k.category === 'support');
    if (supportKnowledge) {
      return supportKnowledge.content;
    }
    return `**Support & Maintenance Plans:**\n\n**💼 Basic Support** - $500/month\n• 48-hour response time\n• Business hours coverage\n• Bug fixes & security patches\n• Monthly health checks\n\n**🚀 Professional Support** - $1,200/month\n• 24-hour response time\n• Extended hours coverage\n• Performance optimization\n• Weekly backups\n• Phone + email support\n\n**⭐ Enterprise Support** - $3,000+/month\n• 4-hour response (1 hour critical)\n• 24/7 availability\n• Dedicated account manager\n• Real-time monitoring\n• Custom SLAs\n\n**All plans include:** Security patches, dependency updates, database optimization, and emergency hotfixes!`;
  }

  if (message.includes('security') || message.includes('compliance') || message.includes('gdpr') || message.includes('hipaa') || message.includes('encryption') || message.includes('secure') || message.includes('data protection')) {
    const securityKnowledge = knowledgeResults.find(k => k.category === 'security');
    if (securityKnowledge) {
      return securityKnowledge.content;
    }
    return `**Security & Compliance:**\n\n🔒 **Application Security:**\n• OWASP Top 10 compliance\n• SQL injection & XSS protection\n• Encryption at rest and in transit (AES-256, TLS 1.3)\n• OAuth 2.0, JWT authentication\n• Rate limiting & DDoS protection\n• Regular penetration testing\n\n📋 **Compliance Standards:**\n• GDPR (EU Data Protection)\n• CCPA (California Privacy)\n• HIPAA (Healthcare)\n• SOC 2 Type II\n• PCI DSS (Payment data)\n• ISO 27001\n\n🛡️ **Code Security:**\n• Static code analysis (SonarQube)\n• Dependency vulnerability scanning\n• Secret management (Vault)\n• Multi-factor authentication\n\nYour data is safe with us!`;
  }

  if (message.includes('payment') || message.includes('pay') || message.includes('invoice') || message.includes('refund') || message.includes('billing') || message.includes('crypto')) {
    const paymentKnowledge = knowledgeResults.find(k => k.category === 'payment');
    if (paymentKnowledge) {
      return paymentKnowledge.content;
    }
    return `**Payment Information:**\n\n💳 **Accepted Methods:**\n• Credit/Debit Cards (Visa, Mastercard, Amex)\n• Bank Transfer (Wire, ACH)\n• PayPal & Wise\n• Cryptocurrency (Bitcoin, Ethereum, USDT)\n• Invoicing (Net 15, Net 30)\n\n💰 **Payment Terms (Fixed-Price):**\n• 30% deposit on signing\n• 30% at 50% completion\n• 30% at 90% completion\n• 10% final payment after delivery\n\n🔄 **Refund Policy:**\n• Full refund if we fail to start on time\n• Partial refund based on completed work\n• 14-day refund before work starts\n\n🎯 **Discounts:**\n• 10% off annual commitments\n• 15% off for non-profits & education\n• 5% off for referrals\n\nWe accept USD, EUR, GBP, and major cryptocurrencies!`;
  }

  if (message.includes('process') && (message.includes('work') || message.includes('manage') || message.includes('communication') || message.includes('agile') || message.includes('scrum') || message.includes('meetings'))) {
    const processKnowledge = knowledgeResults.find(k => k.category === 'process' && k.title.includes('Management'));
    if (processKnowledge) {
      return processKnowledge.content;
    }
    return `**Our Process:**\n\n📅 **Agile/Scrum Methodology:**\n• 2-week sprint cycles\n• Daily standups (15 min async)\n• Bi-weekly sprint demos\n• Code reviews on every PR\n• Continuous integration\n\n**Project Phases:**\n1. **Discovery** (1-2 weeks) - Requirements & planning\n2. **Design** (1-2 weeks) - Wireframes & architecture\n3. **Development** (Varies) - Iterative 2-week sprints\n4. **Testing** (1-2 weeks) - QA & UAT\n5. **Deployment** (3-5 days) - Launch & monitoring\n6. **Support** (Ongoing) - 30-day warranty\n\n💬 **Communication:**\n• Slack/Teams - Real-time (4-hour response)\n• Weekly status calls (30 min)\n• Bi-weekly sprint demos (60 min)\n• Monthly strategy sessions\n• Full transparency with live project board access!`;
  }

  if (message.includes('start') || message.includes('onboard') || message.includes('getting started') || message.includes('how to begin') || message.includes('first step') || message.includes('kickoff')) {
    const onboardingKnowledge = knowledgeResults.find(k => k.category === 'onboarding');
    if (onboardingKnowledge) {
      return onboardingKnowledge.content;
    }
    return `**Getting Started with NexaCore:**\n\n📝 **Step 1: Contact Us** (Day 1)\n• Fill out quote form or email info@nexacore-innovations.com\n• Get response within 4 hours\n\n📞 **Step 2: Discovery Call** (Day 2-3)\n• Free 30-60 minute consultation\n• Discuss your requirements\n• Answer all questions\n\n📋 **Step 3: Proposal** (Day 4-7)\n• Detailed scope, timeline, pricing\n• Team composition\n• Technology stack\n• Review & revisions included\n\n✍️ **Step 4: Contract** (Day 8-10)\n• Contract signing (DocuSign)\n• NDA if needed\n• 30% deposit payment\n\n🚀 **Step 5: Project Kickoff** (Week 2)\n• Meet your team\n• Setup communication tools\n• Requirements workshop\n• Development begins!\n\n**Timeline:** From first contact to project start in ~2 weeks!\nReady to begin? Contact us at info@nexacore-innovations.com`;
  }

  if (message.includes('about') || message.includes('company') || message.includes('who are you') || message.includes('mission') || message.includes('values') || message.includes('story') || message.includes('history')) {
    const companyKnowledge = knowledgeResults.find(k => k.category === 'company');
    if (companyKnowledge) {
      return companyKnowledge.content;
    }
    return `**About NexaCore Innovations:**\n\n🌟 Founded in 2020, we're a comprehensive technology solutions provider helping businesses worldwide with cutting-edge tech.\n\n**Our Mission:**\n> "To empower businesses through innovative technology solutions that drive growth, efficiency, and digital transformation."\n\n**Core Values:**\n🎯 **Excellence** - 80%+ code coverage, < 3s load times\n🤝 **Partnership** - Your success is our success\n🚀 **Innovation** - Stay ahead of tech trends\n💡 **Integrity** - Honest estimates, no hidden fees\n🌍 **Impact** - Support non-profits, open-source contributions\n\n**Achievements:**\n• 150+ projects delivered\n• 98% client satisfaction rate\n• 50+ five-star reviews\n• Clients in 15+ countries\n• $10M+ in client revenue generated\n\n**Global Team:** 50+ developers across North America, Europe, Asia, and Africa\n\nWe're remote-first with 24/7 coverage!`;
  }

  if (message.includes('sign up') || message.includes('signup') || message.includes('register') || message.includes('registration') || message.includes('create account') || message.includes('join') || message.includes('how do i get started')) {
    const signupKnowledge = knowledgeResults.find(k => k.category === 'signup');
    if (signupKnowledge) {
      return signupKnowledge.content;
    }
    return `**How to Sign Up with NexaCore:**\n\n📝 **Option 1: Request a Quote** (Recommended)\n• Visit www.nexacore-innovations.com\n• Click "Get a Quote"\n• Fill in your project details\n• Get response within 24-48 hours\n\n📧 **Option 2: Email Us Directly**\n• Email: info@nexacore-innovations.com\n• Response time: 2-4 business hours\n\n📞 **Option 3: Book Free Consultation**\n• 30-60 minute call\n• Discuss your needs\n• Get expert recommendations\n\n**No Account Needed For:**\n• Requesting quotes\n• Free consultations\n• General inquiries\n\n**What Happens Next:**\n• Within 4 hours: Acknowledgment\n• Within 24-48 hours: Personalized response\n• Within 1 week: Free consultation + proposal\n• Within 2 weeks: Project kickoff (if approved)\n\nReady to start? Contact us at info@nexacore-innovations.com`;
  }

  if (message.includes('faq') || message.includes('frequently asked') || message.includes('common question') || (message.includes('question') && message.includes('answer'))) {
    const faqKnowledge = knowledgeResults.find(k => k.category === 'faq');
    if (faqKnowledge) {
      return faqKnowledge.content;
    }
    return `**Frequently Asked Questions:**\n\n**Getting Started:**\n• Do I need to sign up? No, just request a quote!\n• How quickly can you start? Within 2 weeks of signing\n• Do you work with startups? Yes! All sizes welcome\n• Need technical knowledge? No, we guide you through\n\n**Pricing:**\n• Minimum project: $2,000\n• Payment plans? Yes! Milestone-based available\n• Accept crypto? Yes! BTC, ETH, USDT\n• Hidden fees? Never. All upfront.\n\n**Technical:**\n• What tech do you use? React, Node.js, Python, AI/ML, Blockchain\n• Work with existing code? Yes!\n• Do I get the source code? Yes, 100% ownership\n• Documentation included? Always!\n\n**Support:**\n• What happens after launch? 30-day warranty included\n• 24/7 support available? Yes, on Enterprise tier\n• Do you provide hosting? Yes, from $200/month\n\nMore questions? Ask me anything or email info@nexacore-innovations.com!`;
  }

  if (message.includes('industry') || message.includes('industries') || message.includes('sector') || message.includes('use case') || message.includes('vertical') || message.includes('fintech') || message.includes('healthcare') || message.includes('ecommerce') || message.includes('real estate')) {
    const industryKnowledge = knowledgeResults.find(k => k.category === 'industries');
    if (industryKnowledge) {
      return industryKnowledge.content;
    }
    return `**Industries We Serve:**\n\n🏦 **FinTech & Banking**\n• Payment gateways, trading platforms, crypto wallets\n• Compliance: PCI DSS, SOC 2, KYC/AML\n\n🏥 **Healthcare & MedTech**\n• Telemedicine, EHR integration, medical imaging AI\n• Compliance: HIPAA, HL7, FHIR\n\n🛍️ **E-Commerce & Retail**\n• Online stores, marketplaces, inventory management\n• Multi-currency, AR try-on, AI personalization\n\n🏘️ **Real Estate & PropTech**\n• Property platforms, virtual tours, smart home integration\n\n🎓 **Education & EdTech**\n• LMS, virtual classrooms, adaptive learning AI\n• Compliance: FERPA, COPPA\n\n🏭 **Manufacturing & Engineering**\n• CAD automation, IoT integration, predictive maintenance\n\n⛓️ **Blockchain & Web3**\n• Smart contracts, DeFi, NFTs, DAOs\n\n🚀 **SaaS & Enterprise**\n• CRM, BI dashboards, workflow automation\n\nDon't see your industry? We adapt to any sector!\nContact: info@nexacore-innovations.com`;
  }

  if (message.includes('review') || message.includes('testimonial') || message.includes('feedback') || message.includes('rating') || message.includes('what do clients say') || message.includes('client success') || message.includes('success stories')) {
    const testimonialKnowledge = knowledgeResults.find(k => k.category === 'testimonials');
    if (testimonialKnowledge) {
      return testimonialKnowledge.content;
    }
    return `**Client Testimonials:**\n\n⭐⭐⭐⭐⭐ **Sarah Johnson - CEO, TechStart**\n"Revenue increased 300% in 6 months! Delivered on time and within budget."\n\n⭐⭐⭐⭐⭐ **Michael Chen - CTO, HealthTech**\n"Invaluable HIPAA expertise. Beautiful, functional product."\n\n⭐⭐⭐⭐⭐ **David Martinez - Founder, CryptoVault**\n"Best blockchain developers. Secure, audited smart contracts."\n\n⭐⭐⭐⭐⭐ **Emily Williams - PM, RetailHub**\n"Flawless communication. Team felt like our team."\n\n**Overall Stats:**\n• Average Rating: 4.9/5.0\n• Client Satisfaction: 98%\n• Projects Completed: 150+\n• Repeat Clients: 70%\n• Referral Rate: 65%\n\n**Common Praise:**\n✅ Always responsive (90% of reviews)\n✅ Clean, well-tested code (85%)\n✅ Deep technical expertise (88%)\n✅ Excellent value/ROI (75%)\n\n**Awards:**\n🏆 Clutch Top Developer 2023\n🏆 Good Firms Top Rated 2024\n🏆 Featured on ProductHunt\n\nWant to be our next success story?`;
  }

  if (message.includes('why choose') || message.includes('why nexacore') || message.includes('competitor') || message.includes('comparison') || message.includes('better than') || message.includes('advantages') || message.includes('benefits') || message.includes('difference')) {
    const comparisonKnowledge = knowledgeResults.find(k => k.category === 'comparison');
    if (comparisonKnowledge) {
      return comparisonKnowledge.content;
    }
    return `**Why Choose NexaCore?**\n\n🎯 **True Full-Stack Expertise**\n✅ AI/ML + Web + Blockchain + CAD + Mobile\n✅ One team handles everything\n❌ Competitors: Often specialize in only one area\n\n💰 **Transparent Fixed Pricing**\n✅ Detailed proposals, no hidden fees\n✅ Milestone-based payments\n❌ Competitors: Vague estimates, scope creep charges\n\n⚡ **Fast Turnaround**\n✅ Quote in 24-48 hours, start in 2 weeks\n❌ Competitors: Weeks for quote, 1-2 months to start\n\n💬 **Real Communication**\n✅ Dedicated Slack, weekly calls, 4-hour response\n❌ Competitors: Email only, monthly updates\n\n🏆 **Quality Guarantees**\n✅ 80%+ code coverage, security testing, 30-day warranty\n❌ Competitors: No coverage requirements, no warranty\n\n🔒 **Security First**\n✅ OWASP compliance, pen testing, SOC 2/GDPR/HIPAA\n❌ Competitors: Basic security, limited compliance\n\n**Cost Comparison (Full-Stack Web App):**\n• NexaCore: $25,000 (3 months)\n• Agency A: $45,000 (6 months)\n• Agency B: $35,000 (4 months)\n\n**Bottom Line:** Premium quality at mid-tier pricing! 🚀`;
  }

  if (message.includes('remote team') || message.includes('dedicated team') || message.includes('hire developer') || message.includes('offshore') || message.includes('outsource') || message.includes('staff augmentation')) {
    const remoteTeamKnowledge = knowledgeResults.find(k => k.category === 'remote_teams');
    if (remoteTeamKnowledge) {
      return remoteTeamKnowledge.content;
    }
    return `**Remote Development Teams:**\n\n💰 **Cost Savings: 40-60% vs. Local Hiring**\n• US Senior Dev: $150K-220K/year\n• NexaCore Senior Dev: $60K-80K/year\n• Your Savings: $70K-140K per developer!\n\n🌟 **Access to 50+ Global Developers**\n• Senior developers (5+ years)\n• Pre-vetted talent\n• Multiple specializations\n• All time zones covered\n\n**Team Pricing:**\n• Solo Developer: $3,000-5,000/month\n• Small Team (2-3): $6,000-12,000/month\n• Full Team (5-7): $15,000-25,000/month\n• Enterprise (10+): $30,000+/month\n\n**What's Included:**\n✅ Pre-vetted developers\n✅ Project manager\n✅ All communication tools (Slack, Jira, etc.)\n✅ Time tracking & reporting\n✅ Code reviews & QA\n✅ Daily updates\n✅ IP rights (you own the code)\n\n**Time Zone Overlap:**\n✅ Guaranteed 4+ hours overlap\n✅ Available during your business hours\n✅ Nearly 24/7 productivity!\n\n**Perfect For:**\n✅ Startups building MVP\n✅ Companies scaling engineering\n✅ Long-term product development\n✅ Specialized skill needs\n\nStart in as little as 1 week!`;
  }

  // If we found relevant knowledge, return it
  if (knowledgeResults.length > 0) {
    const topResult = knowledgeResults[0];
    return `${topResult.content}\n\nWould you like to know more about this or something else?`;
  }

  // Default friendly response
  return `I'd be happy to help you learn more about NexaCore! I can tell you about:\n\n**Getting Started:**\n• **Sign Up** - How to get started and request a quote\n• **Contact** - How to reach us and response times\n• **Onboarding** - Step-by-step process from quote to kickoff\n\n**Our Services:**\n• **Services** - AI/ML, CAD, Blockchain, Software Development\n• **Industries** - FinTech, Healthcare, E-commerce, Real Estate, etc.\n• **Remote Teams** - Hire dedicated offshore developers\n• **Support Plans** - Ongoing maintenance and hosting\n\n**Pricing & Terms:**\n• **Pricing** - Flexible models, payment methods, discounts\n• **Payments** - Cards, crypto, wire, refund policies\n• **Project Management** - How we work (Agile/Scrum)\n\n**Trust & Quality:**\n• **Portfolio** - Case studies and success stories\n• **Testimonials** - What our clients say (98% satisfaction!)\n• **Why Choose Us** - How we compare to competitors\n• **Security** - GDPR, HIPAA, SOC 2 compliance\n• **Team** - 50+ developers, certifications, expertise\n• **Company** - Our mission, values, and achievements\n\n**Other Topics:**\n• **FAQs** - Common questions and answers\n• **Technologies** - Our tech stack and tools\n• **Quality** - QA standards and testing\n• **Timelines** - Project delivery schedules\n\nWhat would you like to know about?`;
}

// Track conversation context for better responses
let conversationContext: string[] = [];

export function addToContext(message: string) {
  conversationContext.push(message);
  if (conversationContext.length > 5) {
    conversationContext.shift(); // Keep last 5 messages
  }
}

export function clearContext() {
  conversationContext = [];
}

// Learn from user feedback
export async function learnFromFeedback(messageId: string, helpful: boolean, comment?: string) {
  try {
    await supabase.from('ai_learning_feedback').insert([{
      message_id: messageId,
      feedback_type: helpful ? 'positive' : 'negative',
      user_comment: comment,
      priority: helpful ? 'low' : 'high',
    }]);
  } catch (error) {
    console.error('Error saving feedback:', error);
  }
}
