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
    // Using exchangerate-api.com (free tier available)
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    return data.rates[currencyCode] || 1;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    
    // Fallback to alternative API
    try {
      const fallbackResponse = await fetch(`https://api.fxratesapi.com/latest?base=USD&symbols=${currencyCode}`);
      const fallbackData = await fallbackResponse.json();
      return fallbackData.rates[currencyCode] || 1;
    } catch (fallbackError) {
      console.error('Fallback API also failed:', fallbackError);
      return 1; // Ultimate fallback
    }
  }
};

// Service pricing in USD
const servicePricing = {
  "Software Engineering": 3000 - 20000,
  "Data Analysis": 800 - 5000,
  "CAD Engineering": 500 - 5000,
  "Graphic Design": 200 - 2000,
  "Digital Marketing": 500 - 5000,
  "Video Editing & Motion Graphics": 500 - 3000,
  "UI/UX Design": 1000 - 7000,
  "Cybersecurity Solutions": 3000 - 10000,
  "Mobile App Development": 3000 - 15000,
  "Content Writing / Copywriting": 200 - 1500,
  "3D Animation & VFX": 1000 - 10000,
  "Web3 & Blockchain Engineering": 5000 - 30000,
  "E-Commerce Solutions": 2000 - 10000,
  "AI / Machine Learning Engineering": 5000 - 25000
};
const GetStarted = () => {
  const [country, setCountry] = useState("Ghana");
  const [currency, setCurrency] = useState(currencyMap["Ghana"]);
  const [rate, setRate] = useState(1);
  const [service, setService] = useState("Software Engineering");
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
      setRate(1); // Fallback to 1:1 rate
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!clientName.trim()) {
      alert("Please provide your name");
      return;
    }
    if (!clientEmail.trim()) {
      alert("Please provide your email address");
      return;
    }
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail.trim())) {
      alert("Please provide a valid email address");
      return;
    }
    
    if (!projectDescription.trim()) {
      alert("Please provide a project description");
      return;
    }

    setSubmitting(true);

    try {
      // Check if EmailJS is available
      if (!window.emailjs) {
        throw new Error('EmailJS not loaded. Please refresh the page and try again.');
      }

      const currentDate = new Date();
      const convertedPrice = (currentServicePrice * rate).toFixed(2);

      // FIXED: Business email parameters - simplified and corrected
      const businessEmailParams = {
        to_name: 'NexaCore Innovations Team',
        to_email: 'info@nexacore-innovations.com',
        from_name: clientName.trim(),
        from_email: clientEmail.trim(),
        reply_to: clientEmail.trim(),
        
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        client_phone: clientPhone.trim() || "Not provided",
        client_country: country,
        service_type: service,
        project_description: projectDescription.trim(),
        estimated_price: `${currency.symbol} ${convertedPrice}`,
        base_price_usd: `$${currentServicePrice}`,
        exchange_rate: rate.toFixed(4),
        currency_code: currency.code,
        submission_date: currentDate.toLocaleDateString(),
        submission_time: currentDate.toLocaleTimeString(),
        
        subject: `New Project Inquiry - ${service}`,
        message: `New project inquiry from ${clientName.trim()} for ${service}. Project: ${projectDescription.trim()}`
      };

      // FIXED: Client email parameters - ensure all required fields are present
      const clientEmailParams = {
        email: clientEmail.trim(), // <-- this fixes the issue
        // CRITICAL: These must match your EmailJS template variable names exactly
        to_name: clientName.trim(),
        to_email: clientEmail.trim(),
        from_name: 'NexaCore Innovation Team',
        from_email: 'info@nexacore-innovations.com',
        reply_to: 'info@nexacore-innovations.com',
        
        // Additional parameters for the client template
        client_name: clientName.trim(),
        service_type: service,
        estimated_price: `${currency.symbol} ${convertedPrice}`,
        project_description: projectDescription.trim(),
        country: country,
        submission_date: currentDate.toLocaleDateString(),
        client_phone: clientPhone.trim() || "Not provided",
        
        subject: `Thank you for your inquiry - ${service}`,
        message: `Thank you ${clientName.trim()} for your ${service} inquiry. We'll get back to you within 24 hours.`
      };

      console.log('Sending business email with params:', businessEmailParams);
      
      // Send business notification email
      const businessResponse = await window.emailjs.send(
        'service_skk2xfl', // Your service ID
        'template_con_nexacore', // Business template ID
        businessEmailParams,
        'YUqPQV4IrK7H3F3-T' // Your public key
      );
      
      console.log('Business email sent successfully:', businessResponse);

      // Add a small delay before sending the client email
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Sending client email with params:', clientEmailParams);
      
      // Send client confirmation email
      const clientResponse = await window.emailjs.send(
        'service_skk2xfl', // Same service ID
        'template_client_nexacore', // Client template ID
        clientEmailParams,
        'YUqPQV4IrK7H3F3-T' // Your public key
      );
      
      console.log('Client email sent successfully:', clientResponse);

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);

      // Clear form after successful submission
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setProjectDescription("");

    } catch (error) {
      console.error('Detailed error sending emails:', error);
      
      // More specific error handling
      let errorMessage = 'Sorry, there was an error submitting your request. Please try again or contact us directly at info@nexacore-innovations.com';
      
      if (error.status === 400) {
        errorMessage = 'Invalid email parameters. Please check all required fields are filled correctly.';
      } else if (error.status === 401 || error.status === 403) {
        errorMessage = 'Authentication failed. Please refresh the page and try again.';
      } else if (error.status === 404) {
        errorMessage = 'Email service configuration error. Please contact us directly at info@nexacore-innovations.com';
      } else if (error.message && error.message.includes('EmailJS not loaded')) {
        errorMessage = 'Email service not ready. Please refresh the page and try again.';
      } else if (error.text && error.text.includes('empty')) {
        errorMessage = 'Email configuration error. Please contact us directly at info@nexacore-innovations.com';
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetQuote = () => {
    if (!clientEmail.trim()) {
      alert("Please provide your email address first so we can send you the quote!");
      return;
    }
    alert("Free quote request submitted! We'll send a detailed quote to your email within 24 hours.");
  };

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    const initializeExchangeRate = async () => {
      setLoading(true);
      setExchangeError(false);
      try {
        const exchangeRate = await getExchangeRate(currencyMap["Ghana"].code);
        setRate(exchangeRate);
      } catch (error) {
        console.error("Error fetching initial exchange rate:", error);
        setExchangeError(true);
        setRate(12.50); // Reasonable fallback for GHS
      } finally {
        setLoading(false);
      }
    };

    initializeExchangeRate();
  }, []);

  const currentServicePrice = servicePricing[service] || 100;
  const convertedPrice = (currentServicePrice * rate).toFixed(2);

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
          
          {/* Trust Indicators */}
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
            {/* Background Pattern */}
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

            {/* Success Message */}
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

            {/* Exchange Rate Error */}
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
                  {/* Client Name */}
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

                  {/* Client Email */}
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
                  {/* Client Phone */}
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

                  {/* Country Selection */}
                  <div className="space-y-3">
                    <label htmlFor="country" className="block text-lg font-semibold text-gray-900 flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-blue-600" />
                      Your Country
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
                  </div>
                </div>
              </div>

              {/* Project Information Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                  Project Details
                </h3>

                {/* Service Selection */}
                <div className="space-y-3">
                  <label htmlFor="service" className="block text-lg font-semibold text-gray-900 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-blue-600" />
                    Service Type
                  </label>
                  <select 
                    id="service" 
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {Object.keys(servicePricing).map((serviceType) => (
                      <option key={serviceType} value={serviceType}>
                        {serviceType}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Description */}
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
                <div className="flex items-center mb-4">
                  <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">Real-Time Price Estimate</h3>
                </div>
                
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-gray-600">Fetching live exchange rates...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-gradient-primary">
                      {currency.symbol} {convertedPrice}
                    </div>
                    <p className="text-sm text-gray-600">
                      Base price: ${currentServicePrice} USD • Live rate: {rate.toFixed(4)} {currency.code}/USD
                    </p>
                    <p className="text-xs text-gray-500">
                      *Prices updated with real-time exchange rates. Final cost may vary based on project complexity.
                    </p>
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
                  disabled={submitting}
                >
                  Get Free Quote
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

      <style jsx>{`
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
