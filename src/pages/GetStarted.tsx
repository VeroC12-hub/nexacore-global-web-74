// src/pages/GetStarted.tsx - COMPLETE VERSION WITH "WHY CHOOSE NEXACORE" SECTION
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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

// COMPLETE COUNTRY AND CURRENCY MAP - ALL YOUR ORIGINAL COUNTRIES
const currencyMap = {
  Afghanistan: { code: "AFN", symbol: "Ø‹" },
  Albania: { code: "ALL", symbol: "L" },
  Algeria: { code: "DZD", symbol: "Ø¯Ø¬" },
  Angola: { code: "AOA", symbol: "Kz" },
  Argentina: { code: "ARS", symbol: "$" },
  Armenia: { code: "AMD", symbol: "Ö" },
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
  if (currencyCode === 'USD') return 1;
  
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
      description: "Enterprise-grade analytics platform, AI-powered insights, real-time processing. 2-4 months. Custom algorithms, advanced integrations, dedicated support." 
    }
  },
  "CAD Engineering": {
    description: "3D modeling, technical drawings, product design, and engineering simulations",
    "Basic": { 
      min: 150, max: 600, 
      description: "Simple 2D drawings, basic 3D models, standard parts. 3-7 days. Basic rendering and documentation." 
    },
    "Essential": { 
      min: 400, max: 1200, 
      description: "Complex 3D assemblies, technical drawings, material specifications. 1-2 weeks. Advanced rendering, multiple views, basic simulations." 
    },
    "Professional": { 
      min: 1000, max: 3500, 
      description: "Advanced simulations, stress analysis, motion studies. 2-4 weeks. FEA analysis, optimization studies, detailed documentation." 
    },
    "Premium": { 
      min: 2500, max: 8000, 
      description: "Product development lifecycle, advanced analysis, manufacturing drawings. 1-2 months. Complete design package, prototyping support, manufacturing guidance." 
    },
    "Enterprise": { 
      min: 6000, max: 20000, 
      description: "Full product development, advanced simulations, manufacturing optimization. 2-6 months. Complete engineering support, testing protocols, ongoing consultation." 
    }
  },
  "Graphic Design": {
    description: "Visual branding, marketing materials, digital graphics, and creative design solutions",
    "Basic": { 
      min: 50, max: 300, 
      description: "Simple logos, basic business cards, flyers. 2-5 days. 2-3 concepts, basic revisions included." 
    },
    "Essential": { 
      min: 200, max: 800, 
      description: "Complete branding package, marketing materials, social media graphics. 1-2 weeks. Multiple concepts, brand guidelines, file formats." 
    },
    "Professional": { 
      min: 600, max: 2000, 
      description: "Comprehensive brand identity, advanced marketing campaigns, web graphics. 2-3 weeks. Professional photography integration, advanced layouts, print-ready files." 
    },
    "Premium": { 
      min: 1500, max: 5000, 
      description: "Complete visual identity system, packaging design, large campaigns. 1-2 months. Market research, multiple brand applications, ongoing support." 
    },
    "Enterprise": { 
      min: 4000, max: 15000, 
      description: "Full brand transformation, multi-platform campaigns, brand strategy. 2-4 months. Complete rebrand, brand management, ongoing design support." 
    }
  },
  "AI/Machine Learning": {
    description: "Custom AI solutions, machine learning models, and intelligent automation systems",
    "Basic": { 
      min: 300, max: 1200, 
      description: "Simple ML models, basic data processing, automated classification. 1-2 weeks. Standard algorithms, basic training, simple deployment." 
    },
    "Essential": { 
      min: 1000, max: 3500, 
      description: "Custom ML models, data preprocessing, model optimization. 2-4 weeks. Advanced algorithms, feature engineering, performance tuning." 
    },
    "Professional": { 
      min: 2500, max: 8000, 
      description: "Complex AI solutions, deep learning models, real-time processing. 1-2 months. Advanced neural networks, GPU optimization, API development." 
    },
    "Premium": { 
      min: 6000, max: 18000, 
      description: "AI platform development, advanced algorithms, scalable infrastructure. 2-4 months. Custom architectures, distributed systems, advanced optimization." 
    },
    "Enterprise": { 
      min: 15000, max: 50000, 
      description: "Enterprise AI solutions, research-grade algorithms, complete AI infrastructure. 3-8 months. Custom research, hardware optimization, ongoing development." 
    }
  },
  "Mobile App Development": {
    description: "Native and cross-platform mobile applications for iOS and Android",
    "Basic": { 
      min: 400, max: 1500, 
      description: "Simple mobile apps, basic functionality, standard UI. 2-4 weeks. Basic features, app store deployment, simple backend." 
    },
    "Essential": { 
      min: 1200, max: 4000, 
      description: "Advanced mobile apps, custom UI/UX, API integration. 1-2 months. Push notifications, offline functionality, user authentication." 
    },
    "Professional": { 
      min: 3000, max: 10000, 
      description: "Complex mobile solutions, real-time features, advanced integrations. 2-3 months. Advanced features, payment integration, analytics, cloud sync." 
    },
    "Premium": { 
      min: 8000, max: 25000, 
      description: "Enterprise mobile apps, advanced security, scalable backend. 3-5 months. Enterprise features, advanced security, comprehensive testing." 
    },
    "Enterprise": { 
      min: 20000, max: 60000, 
      description: "Large-scale mobile platforms, custom frameworks, enterprise integration. 6-12 months. Complete mobile ecosystem, enterprise support, ongoing maintenance." 
    }
  }
};

const GetStarted = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
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

  // Auto-scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load service from URL parameter
  useEffect(() => {
    const serviceFromUrl = searchParams.get('service');
    console.log('GetStarted - Service from URL:', serviceFromUrl);
    console.log('GetStarted - Available services:', Object.keys(serviceData));
    
    if (serviceFromUrl && serviceData[serviceFromUrl]) {
      setSelectedService(serviceFromUrl);
      console.log('GetStarted - Service set to:', serviceFromUrl);
    } else if (serviceFromUrl) {
      const availableServices = Object.keys(serviceData);
      const closeMatch = availableServices.find(service => 
        service.toLowerCase().includes(serviceFromUrl.toLowerCase()) ||
        serviceFromUrl.toLowerCase().includes(service.toLowerCase())
      );
      
      if (closeMatch) {
        setSelectedService(closeMatch);
        console.log('GetStarted - Close match found and set:', closeMatch);
      } else {
        console.log('GetStarted - No match found for service:', serviceFromUrl);
      }
    }

    const requestType = sessionStorage.getItem('requestType');
    if (requestType === 'quote') {
      sessionStorage.removeItem('requestType');
    }
  }, [searchParams]);

  const handleCountryChange = async (e) => {
    const selected = e.target.value;
    setCountry(selected);
    const selectedCurrency = currencyMap[selected];
    setCurrency(selectedCurrency);
    setLoading(true);
    setExchangeError(false);

    try {
      const exchangeRate = await getExchangeRate(selectedCurrency.code);
      setRate(exchangeRate);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeError(true);
      setRate(1.00);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentServiceData = () => {
    const service = serviceData[selectedService];
    if (!service) return { min: 100, max: 1000, description: "Standard service" };
    
    const tier = service[selectedTier];
    if (!tier) {
      const firstTier = Object.keys(service).filter(key => key !== 'description')[0];
      if (firstTier && service[firstTier]) {
        return service[firstTier];
      }
      return { min: 100, max: 1000, description: "Standard service" };
    }
    
    return tier;
  };

  const handleSubmit = async () => {
    if (!clientName.trim() || !clientEmail.trim() || !projectDescription.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      console.log('Submitting quote request...');

      const currentPricing = getCurrentServiceData();
      const currentMaxPrice = Math.round(currentPricing.max * rate);

      const { data: quoteRequest, error: quoteError } = await supabase
        .from('quote_requests')
        .insert({
          full_name: clientName.trim(),
          email: clientEmail.trim(),
          phone: clientPhone.trim() || null,
          country: country || null,
          service_type: selectedService,
          tier: selectedTier || null,
          description: projectDescription.trim(),
          budget_estimate: currentMaxPrice,
          timeline: null,
          status: 'pending'
        })
        .select()
        .single();

      if (quoteError) {
        throw quoteError;
      }

      console.log('Quote request created:', quoteRequest);

      try {
        const emailResponse = await supabase.functions.invoke('send-enhanced-quote-emails', {
          body: {
            type: 'quote_request_to_pm',
            data: {
              full_name: clientName.trim(),
              email: clientEmail.trim(),
              phone: clientPhone.trim() || null,
              country: country || null,
              service_type: selectedService,
              timeline: selectedTier || null,
              budget_estimate: currentMaxPrice,
              description: projectDescription.trim(),
              quote_request_id: quoteRequest.id,
            },
          },
        });

        console.log('Enhanced email sent to PM:', emailResponse);

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

      } catch (emailError) {
        console.warn('Enhanced email notification failed, but quote request was saved:', emailError);
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
        } catch (fallbackError) {
          console.warn('Fallback email also failed:', fallbackError);
        }
      }
      
      setSubmitted(true);
      toast.success('Quote request submitted successfully!');
      
      setTimeout(() => {
        setSubmitted(false);
        navigate('/client-portal');
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
    await handleSubmit();
  };

  const handleBackToHome = () => {
    navigate("/");
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

  const currentPricing = getCurrentServiceData();
  const minPrice = currentPricing.min;
  const maxPrice = currentPricing.max;
  const serviceDescription = currentPricing.description;
  const convertedMinPrice = (minPrice * rate).toFixed(0);
  const convertedMaxPrice = (maxPrice * rate).toFixed(0);

  const availableTiers = selectedService ? 
    Object.keys(serviceData[selectedService] || {}).filter(key => key !== 'description') : [];

  // Show success screen if submitted
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your quote request. We'll review your requirements and get back to you within 24 hours with a detailed proposal.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/client-portal')}
                className="w-full"
                size="lg"
              >
                Access Client Portal
              </Button>
              <Button
                onClick={handleBackToHome}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-6 text-blue-600 border-blue-200 bg-blue-50">
            🚀 Get Your Custom Quote
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Your Vision into{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Digital Reality
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get a personalized quote for your project from our expert team of engineers, 
            developers, and designers. No commitment required.
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 mb-8">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              100% Secure
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              24hr Response
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-purple-500" />
              Expert Team
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              5-Star Rated
            </div>
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 shadow-xl bg-white/80 backdrop-blur-sm border-0">
            
            {/* Service & Tier Selection */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <FileText className="w-6 h-6 mr-3 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Service Selection</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-gray-900">
                    What service do you need? *
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {Object.keys(serviceData).map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {serviceData[selectedService]?.description}
                  </p>
                </div>

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
              </div>

              {/* Tier Selection Grid */}
              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Choose your project tier: *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {availableTiers.map((tier) => {
                    const tierData = serviceData[selectedService][tier];
                    const isSelected = selectedTier === tier;
                    const convertedMin = (tierData.min * rate).toFixed(0);
                    const convertedMax = (tierData.max * rate).toFixed(0);
                    
                    return (
                      <button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 transform hover:scale-105 hover:shadow-md ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                            : 'border-gray-200 bg-white hover:border-blue-300 shadow-sm'
                        }`}
                      >
                        <div className={`font-semibold mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                          {tier}
                        </div>
                        <div className={`text-lg font-bold mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                          {currency.symbol}{convertedMin} - {currency.symbol}{convertedMax}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {tierData.description.split('.')[0]}.
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Display */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <DollarSign className="w-6 h-6 mr-2 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Estimated Price Range</h3>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-3">
                    {currency.symbol}{convertedMinPrice} - {currency.symbol}{convertedMaxPrice}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    {serviceDescription}
                  </p>
                  {loading && (
                    <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Updating currency rates...
                    </div>
                  )}
                  {exchangeError && (
                    <div className="mt-3 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg inline-block">
                      ⚠️ Using approximate exchange rates
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 mr-3 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Your Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                    Used for currency conversion and invoicing. Choose any service tier regardless of location.
                  </p>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <FileText className="w-6 h-6 mr-3 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
              </div>
              
              <div className="space-y-3">
                <label htmlFor="projectDescription" className="block text-lg font-semibold text-gray-900">
                  Describe your project requirements *
                </label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={6}
                  className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm hover:shadow-md transition-all duration-200 resize-none"
                  placeholder="Please provide detailed information about your project including goals, requirements, timeline, and any specific features you need..."
                  required
                />
                <p className="text-sm text-gray-500 leading-relaxed">
                  💡 The more details you provide, the more accurate and personalized your quote will be. 
                  Include timelines, specific features, integrations, and any technical requirements.
                </p>
              </div>
            </div>

            {/* Submit Section */}
            <div className="border-t border-gray-100 pt-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleGetQuote}
                  disabled={submitting || !clientName.trim() || !clientEmail.trim() || !projectDescription.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Submitting Your Request...
                    </>
                  ) : (
                    <>
                      Get My Custom Quote
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleBackToHome}
                  variant="outline"
                  className="flex-1 sm:flex-none border-2 border-gray-200 hover:border-gray-300 py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-200"
                  size="lg"
                >
                  Back to Home
                </Button>
              </div>

              <div className="mt-6 text-center">
                <div className="inline-flex items-center text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  No commitment required
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4 mr-2 text-blue-500" />
                  24-hour response guarantee
                  <span className="mx-2">•</span>
                  <Shield className="w-4 h-4 mr-2 text-purple-500" />
                  Your data is secure
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Why Choose NexaCore Section - FROM YOUR OLD CODE */}
      <section className="py-16 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">NexaCore</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center group hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-white/95 to-blue-50/90 backdrop-blur-sm border border-white/30">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Expert Team</h3>
              <p className="text-gray-600">Global team of certified professionals with international experience</p>
            </Card>
            
            <Card className="p-6 text-center group hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-white/95 to-green-50/90 backdrop-blur-sm border border-white/30">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Proven Results</h3>
              <p className="text-gray-600">98% success rate with 25+ satisfied clients worldwide</p>
            </Card>
            
            <Card className="p-6 text-center group hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-white/95 to-purple-50/90 backdrop-blur-sm border border-white/30">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Fast Delivery</h3>
              <p className="text-gray-600">Quick turnaround times without compromising on quality</p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GetStarted;
