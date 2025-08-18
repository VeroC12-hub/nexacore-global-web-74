import { useEffect, useState } from "react";
import { 
  ArrowRight, 
  Globe, 
  DollarSign, 
  FileText, 
  CheckCircle,
  Star,
  Shield,
  Clock,
  Users,
  User,
  Mail,
  Phone
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Full country and currency map
const currencyMap = {
  Afghanistan: { code: "AFN", symbol: "؋" },
  Albania: { code: "ALL", symbol: "L" },
  Algeria: { code: "DZD", symbol: "دج" },
  Angola: { code: "AOA", symbol: "Kz" },
  Argentina: { code: "ARS", symbol: "$" },
  Armenia: { code: "AMD", symbol: "֏" },
  Australia: { code: "AUD", symbol: "A$" },
  Austria: { code: "EUR", symbol: "€" },
  Azerbaijan: { code: "AZN", symbol: "₼" },
  Bahamas: { code: "BSD", symbol: "B$" },
  Bahrain: { code: "BHD", symbol: ".د.ب" },
  Bangladesh: { code: "BDT", symbol: "৳" },
  Belarus: { code: "BYN", symbol: "Br" },
  Belgium: { code: "EUR", symbol: "€" },
  Belize: { code: "BZD", symbol: "BZ$" },
  Benin: { code: "XOF", symbol: "CFA" },
  Bhutan: { code: "BTN", symbol: "Nu." },
  Bolivia: { code: "BOB", symbol: "Bs." },
  Bosnia: { code: "BAM", symbol: "KM" },
  Botswana: { code: "BWP", symbol: "P" },
  Brazil: { code: "BRL", symbol: "R$" },
  Bulgaria: { code: "BGN", symbol: "лв" },
  BurkinaFaso: { code: "XOF", symbol: "CFA" },
  Burundi: { code: "BIF", symbol: "FBu" },
  Cambodia: { code: "KHR", symbol: "៛" },
  Cameroon: { code: "XAF", symbol: "FCFA" },
  Canada: { code: "CAD", symbol: "C$" },
  Chad: { code: "XAF", symbol: "FCFA" },
  Chile: { code: "CLP", symbol: "$" },
  China: { code: "CNY", symbol: "¥" },
  Colombia: { code: "COP", symbol: "$" },
  Comoros: { code: "KMF", symbol: "CF" },
  Congo: { code: "CDF", symbol: "FC" },
  "Costa Rica": { code: "CRC", symbol: "₡" },
  Croatia: { code: "HRK", symbol: "kn" },
  Cuba: { code: "CUP", symbol: "₱" },
  Cyprus: { code: "EUR", symbol: "€" },
  Czechia: { code: "CZK", symbol: "Kč" },
  Denmark: { code: "DKK", symbol: "kr" },
  Djibouti: { code: "DJF", symbol: "Fdj" },
  Dominica: { code: "XCD", symbol: "$" },
  "Dominican Republic": { code: "DOP", symbol: "RD$" },
  Ecuador: { code: "USD", symbol: "$" },
  Egypt: { code: "EGP", symbol: "£" },
  "El Salvador": { code: "USD", symbol: "$" },
  Eritrea: { code: "ERN", symbol: "Nfk" },
  Estonia: { code: "EUR", symbol: "€" },
  Eswatini: { code: "SZL", symbol: "L" },
  Ethiopia: { code: "ETB", symbol: "Br" },
  Fiji: { code: "FJD", symbol: "FJ$" },
  Finland: { code: "EUR", symbol: "€" },
  France: { code: "EUR", symbol: "€" },
  Gabon: { code: "XAF", symbol: "FCFA" },
  Gambia: { code: "GMD", symbol: "D" },
  Georgia: { code: "GEL", symbol: "₾" },
  Germany: { code: "EUR", symbol: "€" },
  Ghana: { code: "GHS", symbol: "₵" },
  Greece: { code: "EUR", symbol: "€" },
  Grenada: { code: "XCD", symbol: "$" },
  Guatemala: { code: "GTQ", symbol: "Q" },
  Guinea: { code: "GNF", symbol: "FG" },
  Guyana: { code: "GYD", symbol: "G$" },
  Haiti: { code: "HTG", symbol: "G" },
  Honduras: { code: "HNL", symbol: "L" },
  Hungary: { code: "HUF", symbol: "Ft" },
  Iceland: { code: "ISK", symbol: "kr" },
  India: { code: "INR", symbol: "₹" },
  Indonesia: { code: "IDR", symbol: "Rp" },
  Iran: { code: "IRR", symbol: "﷼" },
  Iraq: { code: "IQD", symbol: "ع.د" },
  Ireland: { code: "EUR", symbol: "€" },
  Israel: { code: "ILS", symbol: "₪" },
  Italy: { code: "EUR", symbol: "€" },
  Jamaica: { code: "JMD", symbol: "J$" },
  Japan: { code: "JPY", symbol: "¥" },
  Jordan: { code: "JOD", symbol: "د.ا" },
  Kazakhstan: { code: "KZT", symbol: "₸" },
  Kenya: { code: "KES", symbol: "KSh" },
  Korea: { code: "KRW", symbol: "₩" },
  Kuwait: { code: "KWD", symbol: "د.ك" },
  Kyrgyzstan: { code: "KGS", symbol: "лв" },
  Laos: { code: "LAK", symbol: "₭" },
  Latvia: { code: "EUR", symbol: "€" },
  Lebanon: { code: "LBP", symbol: "ل.ل" },
  Lesotho: { code: "LSL", symbol: "M" },
  Liberia: { code: "LRD", symbol: "$" },
  Libya: { code: "LYD", symbol: "ل.د" },
  Lithuania: { code: "EUR", symbol: "€" },
  Luxembourg: { code: "EUR", symbol: "€" },
  Madagascar: { code: "MGA", symbol: "Ar" },
  Malawi: { code: "MWK", symbol: "MK" },
  Malaysia: { code: "MYR", symbol: "RM" },
  Maldives: { code: "MVR", symbol: "Rf" },
  Mali: { code: "XOF", symbol: "CFA" },
  Malta: { code: "EUR", symbol: "€" },
  Mauritania: { code: "MRU", symbol: "UM" },
  Mauritius: { code: "MUR", symbol: "₨" },
  Mexico: { code: "MXN", symbol: "$" },
  Moldova: { code: "MDL", symbol: "L" },
  Monaco: { code: "EUR", symbol: "€" },
  Mongolia: { code: "MNT", symbol: "₮" },
  Montenegro: { code: "EUR", symbol: "€" },
  Morocco: { code: "MAD", symbol: "د.م." },
  Mozambique: { code: "MZN", symbol: "MT" },
  Namibia: { code: "NAD", symbol: "$" },
  Nepal: { code: "NPR", symbol: "₨" },
  Netherlands: { code: "EUR", symbol: "€" },
  NewZealand: { code: "NZD", symbol: "NZ$" },
  Nicaragua: { code: "NIO", symbol: "C$" },
  Niger: { code: "XOF", symbol: "CFA" },
  Nigeria: { code: "NGN", symbol: "₦" },
  Norway: { code: "NOK", symbol: "kr" },
  Oman: { code: "OMR", symbol: "﷼" },
  Pakistan: { code: "PKR", symbol: "₨" },
  Panama: { code: "PAB", symbol: "B/." },
  Paraguay: { code: "PYG", symbol: "Gs" },
  Peru: { code: "PEN", symbol: "S/." },
  Philippines: { code: "PHP", symbol: "₱" },
  Poland: { code: "PLN", symbol: "zł" },
  Portugal: { code: "EUR", symbol: "€" },
  Qatar: { code: "QAR", symbol: "ر.ق" },
  Romania: { code: "RON", symbol: "lei" },
  Russia: { code: "RUB", symbol: "₽" },
  Rwanda: { code: "RWF", symbol: "FRw" },
  "Saudi Arabia": { code: "SAR", symbol: "﷼" },
  Senegal: { code: "XOF", symbol: "CFA" },
  Serbia: { code: "RSD", symbol: "din" },
  Seychelles: { code: "SCR", symbol: "₨" },
  Singapore: { code: "SGD", symbol: "S$" },
  Slovakia: { code: "EUR", symbol: "€" },
  Slovenia: { code: "EUR", symbol: "€" },
  Somalia: { code: "SOS", symbol: "S" },
  "South Africa": { code: "ZAR", symbol: "R" },
  Spain: { code: "EUR", symbol: "€" },
  SriLanka: { code: "LKR", symbol: "Rs" },
  Sudan: { code: "SDG", symbol: "£" },
  Sweden: { code: "SEK", symbol: "kr" },
  Switzerland: { code: "CHF", symbol: "CHF" },
  Syria: { code: "SYP", symbol: "£" },
  Taiwan: { code: "TWD", symbol: "NT$" },
  Tanzania: { code: "TZS", symbol: "TSh" },
  Thailand: { code: "THB", symbol: "฿" },
  Togo: { code: "XOF", symbol: "CFA" },
  Trinidad: { code: "TTD", symbol: "TT$" },
  Tunisia: { code: "TND", symbol: "د.ت" },
  Turkey: { code: "TRY", symbol: "₺" },
  Turkmenistan: { code: "TMT", symbol: "m" },
  Uganda: { code: "UGX", symbol: "USh" },
  Ukraine: { code: "UAH", symbol: "₴" },
  UAE: { code: "AED", symbol: "د.إ" },
  UK: { code: "GBP", symbol: "£" },
  USA: { code: "USD", symbol: "$" },
  Uruguay: { code: "UYU", symbol: "$U" },
  Uzbekistan: { code: "UZS", symbol: "лв" },
  Venezuela: { code: "VES", symbol: "Bs.S" },
  Vietnam: { code: "VND", symbol: "₫" },
  Yemen: { code: "YER", symbol: "﷼" },
  Zambia: { code: "ZMW", symbol: "ZK" },
  Zimbabwe: { code: "ZWL", symbol: "Z$" }
};

// Real currency exchange API function
const getExchangeRate = async (currencyCode) => {
  if (currencyCode === 'USD') return 1; // Base currency
  
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    return data.rates[currencyCode] || 1;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    
    try {
      const fallbackResponse = await fetch(`https://api.fxratesapi.com/latest?base=USD&symbols=${currencyCode}`);
      const fallbackData = await fallbackResponse.json();
      return fallbackData.rates[currencyCode] || 1;
    } catch (fallbackError) {
      console.error('Fallback API also failed:', fallbackError);
      return 1;
    }
  }
};

// Service pricing structured by service type and tier - 5 comprehensive tiers
const serviceData = {
  "Software Engineering": {
    description: "Custom software development, web applications, APIs, and system integration solutions",
    "Basic": { 
      min: 200, max: 800, 
      description: "Simple scripts, basic automation, small tools, single-page applications. 1-2 weeks delivery. Junior developer. Basic testing." 
    },
    "Essential": { 
      min: 500, max: 2000, 
      description: "Multi-page applications, database integration, basic user authentication. 2-4 weeks delivery. Mid-level developer. Standard testing & documentation." 
    },
    "Professional": { 
      min: 1500, max: 5000, 
      description: "Complex web applications, API development, payment integration, admin panels. 1-2 months delivery. Senior developer. Full testing, documentation, deployment." 
    },
    "Premium": { 
      min: 3000, max: 12000, 
      description: "Advanced applications, microservices, real-time features, third-party integrations. 2-3 months. Expert team. Advanced testing, CI/CD, monitoring setup." 
    },
    "Enterprise": { 
      min: 8000, max: 25000, 
      description: "Enterprise-grade systems, scalable architecture, security audits, performance optimization. 3-6 months. Dedicated senior team. Full DevOps, maintenance, support." 
    }
  },
  "Data Analysis": {
    description: "Data processing, visualization, insights extraction, and business intelligence solutions",
    "Basic": { 
      min: 100, max: 500, 
      description: "Simple data cleaning, basic charts, Excel/CSV processing. 3-5 days. Basic insights and summary reports." 
    },
    "Essential": { 
      min: 300, max: 1000, 
      description: "Data visualization dashboards, trend analysis, automated reporting. 1-2 weeks. Interactive charts, basic predictions." 
    },
    "Professional": { 
      min: 800, max: 2500, 
      description: "Advanced analytics, statistical modeling, database optimization. 2-4 weeks. Custom dashboards, performance metrics, data pipeline setup." 
    },
    "Premium": { 
      min: 2000, max: 6000, 
      description: "Machine learning models, predictive analytics, real-time data processing. 1-2 months. Advanced visualizations, automated insights, API integration." 
    },
    "Enterprise": { 
      min: 5000, max: 15000, 
      description: "Big data solutions, AI-powered analytics, enterprise data warehouse. 2-4 months. Real-time dashboards, advanced ML, full data infrastructure." 
    }
  },
  "CAD Engineering": {
    description: "Computer-aided design, 3D modeling, technical drawings, and engineering documentation",
    "Basic": { 
      min: 100, max: 400, 
      description: "Simple 2D drawings, basic part modeling, standard dimensions. 2-5 days. Basic technical drawings, simple assemblies." 
    },
    "Essential": { 
      min: 200, max: 800, 
      description: "3D part design, assembly modeling, basic simulations. 1-2 weeks. Detailed drawings, material specifications, basic analysis." 
    },
    "Professional": { 
      min: 500, max: 1500, 
      description: "Complex assemblies, motion simulation, stress analysis. 2-4 weeks. Complete documentation, manufacturing drawings, tolerance analysis." 
    },
    "Premium": { 
      min: 1000, max: 3000, 
      description: "Advanced simulations, optimization, custom components. 1-2 months. FEA analysis, thermal simulations, design validation." 
    },
    "Enterprise": { 
      min: 2500, max: 8000, 
      description: "Full product development, prototyping support, manufacturing consultation. 2-4 months. Complete design package, testing protocols, production guidance." 
    }
  },
  "Graphic Design": {
    description: "Visual identity, branding, marketing materials, and digital design solutions",
    "Basic": { 
      min: 30, max: 150, 
      description: "Simple logo design, basic business cards, social media posts. 2-3 days. 2 concepts, 1 revision, basic file formats." 
    },
    "Essential": { 
      min: 100, max: 400, 
      description: "Professional logo, business stationery, basic brand guidelines. 1 week. 3 concepts, 3 revisions, standard file package." 
    },
    "Professional": { 
      min: 300, max: 1000, 
      description: "Complete brand identity, marketing materials, style guide. 2-3 weeks. Full branding package, unlimited revisions, all file formats." 
    },
    "Premium": { 
      min: 800, max: 2500, 
      description: "Advanced branding, packaging design, comprehensive marketing suite. 1-2 months. Brand strategy, market research, extensive material library." 
    },
    "Enterprise": { 
      min: 2000, max: 6000, 
      description: "Full corporate identity, brand architecture, implementation guidelines. 2-3 months. Brand strategy, trademark assistance, launch support, brand management." 
    }
  },
  "Digital Marketing": {
    description: "Online marketing strategies, social media management, SEO, and advertising campaigns",
    "Basic": { 
      min: 80, max: 300, 
      description: "Social media account setup, basic content calendar, simple posts. 1 week. 1 platform, 10 posts, basic engagement." 
    },
    "Essential": { 
      min: 200, max: 800, 
      description: "Multi-platform social media, content creation, basic SEO. 2-4 weeks. 2-3 platforms, content strategy, performance tracking." 
    },
    "Professional": { 
      min: 600, max: 2000, 
      description: "Comprehensive social strategy, paid advertising, email campaigns. 1-2 months. Multi-channel campaigns, A/B testing, detailed analytics." 
    },
    "Premium": { 
      min: 1500, max: 5000, 
      description: "Advanced marketing automation, influencer partnerships, conversion optimization. 2-3 months. Full funnel strategy, advanced targeting, ROI optimization." 
    },
    "Enterprise": { 
      min: 3000, max: 12000, 
      description: "Complete digital marketing strategy, brand management, market research. 3-6 months. Omnichannel approach, advanced analytics, dedicated account management." 
    }
  },
  "Video Editing & Motion Graphics": {
    description: "Video production, editing, motion graphics, animation, and post-production services",
    "Basic": { 
      min: 50, max: 300, 
      description: "Simple video editing, basic transitions, text overlays. 2-3 days. Up to 5 minutes, basic color correction, standard formats." 
    },
    "Essential": { 
      min: 150, max: 600, 
      description: "Professional editing, motion graphics, audio enhancement. 1 week. Up to 15 minutes, custom graphics, multiple format delivery." 
    },
    "Professional": { 
      min: 400, max: 1500, 
      description: "Advanced editing, 3D graphics, color grading, sound design. 2-3 weeks. Complex animations, professional audio, 4K delivery." 
    },
    "Premium": { 
      min: 1000, max: 4000, 
      description: "Cinematic quality, advanced VFX, custom animations. 1-2 months. Hollywood-style effects, original music, multi-camera editing." 
    },
    "Enterprise": { 
      min: 3000, max: 10000, 
      description: "Broadcast quality, complex VFX, complete post-production. 2-4 months. Cinema-grade color, advanced compositing, full production support." 
    }
  },
  "UI/UX Design": {
    description: "User interface and experience design for web and mobile applications",
    "Basic": { 
      min: 150, max: 600, 
      description: "Simple wireframes, basic mockups, standard UI elements. 3-5 days. Mobile or web, basic user flow, simple prototypes." 
    },
    "Essential": { 
      min: 400, max: 1200, 
      description: "User research, wireframes, interactive prototypes. 1-2 weeks. Responsive design, user testing, design system basics." 
    },
    "Professional": { 
      min: 1000, max: 3000, 
      description: "Complete UX process, advanced prototyping, usability testing. 3-4 weeks. Full design system, accessibility compliance, developer handoff." 
    },
    "Premium": { 
      min: 2500, max: 6000, 
      description: "Advanced user research, complex interactions, design strategy. 1-2 months. Multi-platform design, advanced animations, user analytics integration." 
    },
    "Enterprise": { 
      min: 5000, max: 15000, 
      description: "Enterprise design systems, design ops, cross-platform strategy. 2-4 months. Design governance, team training, scalable design infrastructure." 
    }
  },
  "Cybersecurity Solutions": {
    description: "Security assessments, penetration testing, security implementation, and compliance solutions",
    "Basic": { 
      min: 200, max: 800, 
      description: "Basic security scan, vulnerability assessment, simple report. 3-5 days. Automated scanning, basic recommendations, summary report." 
    },
    "Essential": { 
      min: 500, max: 1500, 
      description: "Security audit, basic penetration testing, security recommendations. 1-2 weeks. Manual testing, detailed report, remediation guidance." 
    },
    "Professional": { 
      min: 1200, max: 4000, 
      description: "Comprehensive security assessment, advanced pen testing, compliance check. 2-4 weeks. Full security review, compliance mapping, implementation plan." 
    },
    "Premium": { 
      min: 3000, max: 8000, 
      description: "Advanced threat modeling, security architecture review, incident response plan. 1-2 months. Advanced testing, security training, monitoring setup." 
    },
    "Enterprise": { 
      min: 6000, max: 20000, 
      description: "Complete security program, 24/7 monitoring, compliance management. 2-6 months. Security operations center, threat hunting, ongoing support." 
    }
  },
  "Mobile App Development": {
    description: "iOS and Android mobile application development and deployment",
    "Basic": { 
      min: 300, max: 1000, 
      description: "Simple single-screen app, basic functionality, one platform. 1-2 weeks. Basic UI, simple features, app store submission." 
    },
    "Essential": { 
      min: 800, max: 2500, 
      description: "Multi-screen app, user authentication, basic backend. 3-4 weeks. Cross-platform or native, database integration, push notifications." 
    },
    "Professional": { 
      min: 2000, max: 6000, 
      description: "Complex app features, payment integration, advanced UI. 1-3 months. Advanced functionality, API integration, comprehensive testing." 
    },
    "Premium": { 
      min: 5000, max: 15000, 
      description: "Advanced features, real-time capabilities, scalable backend. 2-4 months. Custom animations, offline functionality, advanced security." 
    },
    "Enterprise": { 
      min: 12000, max: 40000, 
      description: "Enterprise-grade app, complex integrations, full ecosystem. 3-8 months. Enterprise security, advanced analytics, ongoing maintenance." 
    }
  },
  "Content Writing": {
    description: "Professional writing services for web, marketing, technical documentation, and SEO content",
    "Basic": { 
      min: 20, max: 100, 
      description: "Blog posts, simple web copy, basic editing. 1-2 days. Up to 1000 words, basic SEO, standard formatting." 
    },
    "Essential": { 
      min: 50, max: 250, 
      description: "SEO-optimized content, social media copy, product descriptions. 3-5 days. Research included, keyword optimization, multiple formats." 
    },
    "Professional": { 
      min: 150, max: 600, 
      description: "Comprehensive content strategy, technical writing, copywriting. 1-2 weeks. Content calendar, brand voice development, performance tracking." 
    },
    "Premium": { 
      min: 400, max: 1200, 
      description: "Advanced content marketing, thought leadership, multi-channel content. 2-4 weeks. Content strategy, influencer collaboration, comprehensive editing." 
    },
    "Enterprise": { 
      min: 1000, max: 3000, 
      description: "Complete content ecosystem, brand journalism, content governance. 1-3 months. Editorial guidelines, content team training, content audits." 
    }
  },
  "3D Animation & VFX": {
    description: "3D modeling, animation, visual effects, and rendering for various media",
    "Basic": { 
      min: 150, max: 800, 
      description: "Simple 3D models, basic animations, standard rendering. 3-5 days. Basic lighting, simple textures, HD output." 
    },
    "Essential": { 
      min: 400, max: 1500, 
      description: "Complex 3D scenes, character animation, motion graphics. 1-2 weeks. Advanced materials, rigging, multiple camera angles." 
    },
    "Professional": { 
      min: 1000, max: 4000, 
      description: "Photorealistic rendering, advanced animation, particle effects. 2-4 weeks. Advanced lighting, physics simulation, 4K output." 
    },
    "Premium": { 
      min: 3000, max: 10000, 
      description: "Cinematic quality, complex VFX, advanced simulations. 1-3 months. Fluid dynamics, advanced compositing, multiple format delivery." 
    },
    "Enterprise": { 
      min: 8000, max: 25000, 
      description: "Broadcast/film quality, complex productions, team collaboration. 2-6 months. Advanced pipeline, render farm usage, post-production integration." 
    }
  },
  "Web3 & Blockchain": {
    description: "Blockchain development, smart contracts, DeFi applications, and Web3 solutions",
    "Basic": { 
      min: 500, max: 2000, 
      description: "Simple smart contracts, basic DApp frontend, testnet deployment. 1-2 weeks. Basic functionality, standard templates, basic testing." 
    },
    "Essential": { 
      min: 1200, max: 4000, 
      description: "Custom smart contracts, Web3 integration, mainnet deployment. 2-4 weeks. Token contracts, basic DeFi features, security review." 
    },
    "Professional": { 
      min: 3000, max: 10000, 
      description: "Complex DApps, advanced smart contracts, tokenomics design. 1-3 months. DeFi protocols, NFT platforms, comprehensive testing." 
    },
    "Premium": { 
      min: 8000, max: 25000, 
      description: "Advanced DeFi protocols, cross-chain solutions, complex tokenomics. 2-4 months. Multi-chain deployment, advanced security, governance systems." 
    },
    "Enterprise": { 
      min: 20000, max: 80000, 
      description: "Enterprise blockchain solutions, custom protocols, full ecosystem. 3-12 months. Custom blockchain, institutional-grade security, regulatory compliance." 
    }
  },
  "E-Commerce Solutions": {
    description: "Online store development, payment integration, inventory management, and e-commerce optimization",
    "Basic": { 
      min: 200, max: 800, 
      description: "Simple online store, basic product catalog, payment integration. 1-2 weeks. Template-based, basic checkout, standard features." 
    },
    "Essential": { 
      min: 600, max: 2000, 
      description: "Custom e-commerce site, inventory management, multiple payment options. 2-4 weeks. Responsive design, basic SEO, order management." 
    },
    "Professional": { 
      min: 1500, max: 5000, 
      description: "Advanced e-commerce features, multi-vendor support, analytics integration. 1-2 months. Custom development, advanced features, performance optimization." 
    },
    "Premium": { 
      min: 4000, max: 12000, 
      description: "Enterprise e-commerce, advanced automation, omnichannel integration. 2-3 months. Custom functionality, API integrations, advanced analytics." 
    },
    "Enterprise": { 
      min: 10000, max: 30000, 
      description: "Large-scale e-commerce platform, complex integrations, scalable architecture. 3-6 months. Enterprise features, advanced security, ongoing optimization." 
    }
  },
  "AI / Machine Learning": {
    description: "Artificial intelligence solutions, machine learning models, and AI integration services",
    "Basic": { 
      min: 400, max: 1500, 
      description: "Simple AI integration, basic data analysis, pre-trained models. 1-2 weeks. API integration, basic predictions, simple dashboards." 
    },
    "Essential": { 
      min: 1000, max: 3000, 
      description: "Custom ML models, data preprocessing, model training. 2-4 weeks. Custom datasets, model evaluation, basic deployment." 
    },
    "Professional": { 
      min: 3000, max: 8000, 
      description: "Advanced ML solutions, deep learning, computer vision. 1-3 months. Complex models, advanced preprocessing, production deployment." 
    },
    "Premium": { 
      min: 7000, max: 20000, 
      description: "AI platform development, advanced algorithms, real-time processing. 2-4 months. Custom AI solutions, advanced optimization, scalable infrastructure." 
    },
    "Enterprise": { 
      min: 15000, max: 60000, 
      description: "Enterprise AI solutions, custom algorithms, AI infrastructure. 3-12 months. Advanced research, custom hardware optimization, ongoing AI development." 
    }
  }
};

const GetStarted = () => {
  const [country, setCountry] = useState("USA");
  const [currency, setCurrency] = useState(currencyMap["USA"]);
  const [rate, setRate] = useState(1);
  const [selectedService, setSelectedService] = useState("Software Engineering");
  const [selectedTier, setSelectedTier] = useState("Basic");
  const [projectDescription, setProjectDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [exchangeError, setExchangeError] = useState(false);

  const handleCountryChange = async (e) => {
    const selected = e.target.value;
    setCountry(selected);
    const selectedCurrency = currencyMap[selected] || { code: "USD", symbol: "$" };
    setCurrency(selectedCurrency);
    setExchangeError(false);

    setLoading(true);
    try {
      const exchangeRate = await getExchangeRate(selectedCurrency.code);
      setRate(exchangeRate);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeError(true);
      setRate(1);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (e) => {
    const newService = e.target.value;
    setSelectedService(newService);
    
    // Reset to first available tier when service changes (excluding description)
    const availableTiers = Object.keys(serviceData[newService] || {}).filter(key => key !== 'description');
    if (availableTiers.length > 0) {
      setSelectedTier(availableTiers[0]);
    }
  };

  const handleTierChange = (e) => {
    setSelectedTier(e.target.value);
  };

  const handleSubmit = async () => {
    if (!clientName.trim()) {
      toast.error("Please provide your name");
      return;
    }
    if (!clientEmail.trim()) {
      toast.error("Please provide your email address");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail.trim())) {
      toast.error("Please provide a valid email address");
      return;
    }
    
    if (!projectDescription.trim()) {
      toast.error("Please provide a project description");
      return;
    }

    setSubmitting(true);

    try {
      // Get current pricing for budget estimate
      const currentServiceInfo = getCurrentServiceData();
      const currentMinPrice = currentServiceInfo.min;
      const currentMaxPrice = currentServiceInfo.max;
      const currentConvertedMinPrice = (currentMinPrice * rate).toFixed(2);
      const currentConvertedMaxPrice = (currentMaxPrice * rate).toFixed(2);
      
      // Save quote request to database
      const { data: quoteRequest, error: quoteError } = await supabase
        .from('quote_requests')
        .insert({
          full_name: clientName.trim(),
          email: clientEmail.trim(),
          phone: clientPhone.trim() || null,
          service_type: selectedService,
          tier: selectedTier,
          description: projectDescription.trim(),
          budget_estimate: currentMaxPrice,
          country: country,
          status: 'pending'
        })
        .select()
        .single();

      if (quoteError) {
        throw quoteError;
      }

      // Send email notifications using the Edge Function
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'quote_request',
            to: 'projects@nexacore-innovations.com',
            data: {
              full_name: clientName.trim(),
              email: clientEmail.trim(),
              phone: (clientPhone || '').trim() || null,
              country,
              service_type: selectedService,
              timeline: selectedTier || null,
              budget_estimate: currentMaxPrice,
              description: projectDescription.trim(),
            },
          },
        });

        // Client confirmation email
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'quote_request_confirmation',
            to: clientEmail.trim(),
            data: {
              full_name: clientName.trim(),
              service_type: selectedService,
            },
          },
        });
      } catch (e) {
        console.warn('Email notification failed, but quote request was saved', e);
      }
      
      setSubmitted(true);
      toast.success('Quote request submitted successfully!');
      
      // Redirect to client portal after 2 seconds
      setTimeout(() => {
        setSubmitted(false);
        window.location.href = '/client-portal';
      }, 2000);

      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setProjectDescription("");

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Sorry, there was an error submitting your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetQuote = async () => {
    // Use the same function for both submit and get quote
    await handleSubmit();
  };

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    const initializeExchangeRate = async () => {
      setLoading(true);
      setExchangeError(false);
      try {
        const exchangeRate = await getExchangeRate(currencyMap["USA"].code);
        setRate(exchangeRate);
      } catch (error) {
        console.error("Error fetching initial exchange rate:", error);
        setExchangeError(true);
        setRate(1.00);
      } finally {
        setLoading(false);
      }
    };

    initializeExchangeRate();
  }, []);

  // Initialize with valid service and tier
  useEffect(() => {
    const firstService = Object.keys(serviceData)[0];
    if (firstService && !serviceData[selectedService]) {
      setSelectedService(firstService);
    }
    
    const availableTiers = Object.keys(serviceData[selectedService] || {}).filter(key => key !== 'description');
    if (availableTiers.length > 0 && !availableTiers.includes(selectedTier)) {
      setSelectedTier(availableTiers[0]);
    }
  }, [selectedService, selectedTier]);

  const getCurrentServiceData = () => {
    const service = serviceData[selectedService];
    if (!service) return { min: 100, max: 1000, description: "Standard service" };
    
    const tier = service[selectedTier];
    if (!tier) {
      // If tier doesn't exist, try to get the first available tier
      const firstTier = Object.keys(service).filter(key => key !== 'description')[0];
      if (firstTier && service[firstTier]) {
        return service[firstTier];
      }
      return { min: 100, max: 1000, description: "Standard service" };
    }
    
    return tier;
  };

  const currentPricing = getCurrentServiceData();
  const minPrice = currentPricing.min;
  const maxPrice = currentPricing.max;
  const serviceDescription = currentPricing.description;
  const convertedMinPrice = (minPrice * rate).toFixed(2);
  const convertedMaxPrice = (maxPrice * rate).toFixed(2);

  // Get available tiers for current service (exclude description)
  const availableTiers = selectedService ? Object.keys(serviceData[selectedService] || {}).filter(key => key !== 'description') : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-teal-600/5"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-teal-100 text-blue-700 border border-blue-200">
            <Globe className="w-4 h-4 mr-2" />
            Get Started with NexaCore
          </Badge>
          
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Transform Your Ideas
            </span>
            <br />
            <span className="text-gray-900">Into Reality</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Tell us about your project and get an instant estimate with real-time currency conversion. 
            Our global team of experts is ready to bring your vision to life with cutting-edge solutions.
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              Trusted by 25+ clients
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              98% Success Rate
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              24/7 Support
            </div>
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 relative overflow-hidden card-gradient">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#6B7280" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <p className="text-green-800 font-medium">
                    Request submitted successfully!
                  </p>
                  <p className="text-green-700 text-sm">
                    You'll receive a confirmation email shortly. We'll contact you within 24 hours.
                  </p>
                </div>
              </div>
            )}

            {exchangeError && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center">
                <DollarSign className="w-6 h-6 text-yellow-600 mr-3" />
                <p className="text-yellow-800 text-sm">
                  Unable to fetch real-time exchange rates. Using approximate values.
                </p>
              </div>
            )}

            <div className="space-y-8 relative z-10">
              {/* Client Information Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                  Your Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label htmlFor="clientName" className="block text-lg font-semibold text-gray-900 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm hover:shadow-md transition-all duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="clientEmail" className="block text-lg font-semibold text-gray-900 flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-blue-600" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="clientEmail"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm hover:shadow-md transition-all duration-200"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label htmlFor="clientPhone" className="block text-lg font-semibold text-gray-900 flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-blue-600" />
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      id="clientPhone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm hover:shadow-md transition-all duration-200"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="country" className="block text-lg font-semibold text-gray-900 flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-blue-600" />
                      Your Country (for currency)
                    </label>
                    <select
                      id="country"
                      value={country}
                      onChange={handleCountryChange}
                      className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm hover:shadow-md transition-all duration-200"
                      disabled={loading}
                    >
                      {Object.keys(currencyMap).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">
                      💡 Used for currency conversion and invoicing. Choose any service tier regardless of location.
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Information Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                  Project Details
                </h3>

                {/* Service Selection */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label htmlFor="service" className="block text-lg font-semibold text-gray-900 flex items-center">
                      <Star className="w-5 h-5 mr-2 text-blue-600" />
                      Choose Your Service
                    </label>
                    <select 
                      id="service" 
                      value={selectedService}
                      onChange={handleServiceChange}
                      className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {Object.keys(serviceData).map((serviceName) => (
                        <option key={serviceName} value={serviceName}>
                          {serviceName}
                        </option>
                      ))}
                    </select>
                    
                    {/* Service Description */}
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="font-medium text-blue-800 mb-1">📋 About {selectedService}:</p>
                      <p>{serviceData[selectedService]?.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="tier" className="block text-lg font-semibold text-gray-900 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                      Choose Your Service Level
                    </label>
                    <select 
                      id="tier" 
                      value={selectedTier}
                      onChange={handleTierChange}
                      className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {availableTiers.map((tierName) => {
                        const tierData = serviceData[selectedService][tierName];
                        return (
                          <option key={tierName} value={tierName}>
                            {tierName} - ${tierData.min} - ${tierData.max}+ | {tierData.description.substring(0, 50)}...
                          </option>
                        );
                      })}
                    </select>
                    
                    {/* Detailed Tier Description */}
                    <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-800">
                          {selectedTier} Tier - ${minPrice} - ${maxPrice}+
                        </p>
                        <div className="flex items-center space-x-1">
                          {selectedTier === "Basic" && <span className="text-green-600">💰</span>}
                          {selectedTier === "Essential" && <span className="text-blue-600">⭐</span>}
                          {selectedTier === "Professional" && <span className="text-purple-600">🏆</span>}
                          {selectedTier === "Premium" && <span className="text-orange-600">💎</span>}
                          {selectedTier === "Enterprise" && <span className="text-red-600">🚀</span>}
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200">
                            {selectedTier}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{serviceDescription}</p>
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          💡 All tiers include our quality guarantee and post-delivery support. Higher tiers offer more features, faster delivery, and dedicated expertise.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="description" className="block text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Project Description *
                  </label>
                  <textarea
                    id="description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl h-36 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm hover:shadow-md transition-all duration-200 resize-none"
                    placeholder="Tell us about your project, goals, timeline, and any specific requirements..."
                    required
                  />
                </div>
              </div>

              {/* Price Estimate */}
              <Card className="bg-gradient-to-br from-blue-50 to-teal-50 p-6 border border-blue-200 card-gradient">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Real-Time Price Estimate
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedTier === "Basic" && <span className="text-green-600 text-lg">💰</span>}
                    {selectedTier === "Essential" && <span className="text-blue-600 text-lg">⭐</span>}
                    {selectedTier === "Professional" && <span className="text-purple-600 text-lg">🏆</span>}
                    {selectedTier === "Premium" && <span className="text-orange-600 text-lg">💎</span>}
                    {selectedTier === "Enterprise" && <span className="text-red-600 text-lg">🚀</span>}
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-white border border-gray-300">
                      {selectedTier} Tier
                    </span>
                  </div>
                </div>
                
                <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {selectedService} - {selectedTier}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {serviceDescription}
                  </p>
                </div>
                
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-gray-600">Fetching live exchange rates...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-gradient-primary">
                      {currency.symbol} {convertedMinPrice} - {currency.symbol} {convertedMaxPrice}+
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Base price: ${minPrice} - ${maxPrice}+ USD</span>
                      <span>Rate: {rate.toFixed(4)} {currency.code}/USD</span>
                    </div>
                    <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                      <p>*Prices updated with real-time exchange rates. Final cost depends on project complexity and specific requirements.</p>
                      <p className="mt-1 font-medium text-gray-700">
                        🌍 Same transparent pricing worldwide - choose what fits your needs and budget!
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  className="flex-1 text-lg py-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  onClick={handleSubmit}
                  disabled={!projectDescription.trim() || !clientName.trim() || !clientEmail.trim() || submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1 text-lg py-4 border-2"
                  onClick={handleBackToHome}
                  disabled={submitting}
                >
                  Back to Home
                </Button>
                
                <Button 
                  className="flex-1 text-lg py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={handleGetQuote}
                  disabled={!clientEmail.trim() || submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Get Free Quote'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Why Choose <span className="text-gradient-primary">NexaCore</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center group hover:scale-105 transition-transform duration-300 card-service">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient-primary">Expert Team</h3>
              <p className="text-muted-foreground">Global team of certified professionals with international experience</p>
            </Card>
            
            <Card className="p-6 text-center group hover:scale-105 transition-transform duration-300 card-service">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient-primary">Proven Results</h3>
              <p className="text-muted-foreground">98% success rate with 25+ satisfied clients worldwide</p>
            </Card>
            
            <Card className="p-6 text-center group hover:scale-105 transition-transform duration-300 card-service">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient-primary">Fast Delivery</h3>
              <p className="text-muted-foreground">Quick turnaround times without compromising on quality</p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .text-gradient-primary {
          background: linear-gradient(135deg, #2563eb, #059669);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .card-gradient {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .card-service {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default GetStarted;
