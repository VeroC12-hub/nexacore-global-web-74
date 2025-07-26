import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import nexacoreLogo from "../assets/nexacore-logo.png";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import nexacoreLogo from "../assets/nexacore-logo.png";

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

// Mock exchange rate function (replace with actual API call)
const getExchangeRate = async (currencyCode) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock exchange rates (in a real app, you'd fetch from an API)
  const mockRates = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    GHS: 12.50, // Ghana Cedis
    NGN: 450,   // Nigerian Naira
    ZAR: 18.5,  // South African Rand
    KES: 110,   // Kenyan Shilling
    // Add more as needed
  };
  
  return mockRates[currencyCode] || 1;
};

const Button = ({ children, className, variant, onClick, ...props }) => {
  const baseClasses = "px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    success: "bg-green-600 text-white hover:bg-green-700"
  };
  
  const variantClass = variants[variant] || variants.default;
  
  return (
    <button 
      className={`${baseClasses} ${variantClass} ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Service pricing in USD
const servicePricing = {
  "Software Engineering": 150,
  "Data Analysis": 120,
  "CAD Engineering": 180,
  "Graphic Design": 80,
  "Digital Marketing": 100,
  "Video Editing & Motion Graphics": 130,
  "UI/UX Design": 110,
  "Cybersecurity Solutions": 200,
  "Mobile App Development": 160,
  "Content Writing / Copywriting": 60,
  "3D Animation & VFX": 220,
  "Web3 & Blockchain Engineering": 250,
  "E-Commerce Solutions": 140,
  "AI / Machine Learning Engineering": 240
};

const GetStarted = () => {
  const [country, setCountry] = useState("Ghana");
  const [currency, setCurrency] = useState(currencyMap["Ghana"]);
  const [rate, setRate] = useState(1);
  const [service, setService] = useState("Software Engineering");
  const [projectDescription, setProjectDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCountryChange = async (e) => {
    const selected = e.target.value;
    setCountry(selected);
    const selectedCurrency = currencyMap[selected] || { code: "USD", symbol: "$" };
    setCurrency(selectedCurrency);

    setLoading(true);
    try {
      const exchangeRate = await getExchangeRate(selectedCurrency.code);
      setRate(exchangeRate);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setRate(1); // Fallback to 1:1 rate
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!projectDescription.trim()) {
      alert("Please provide a project description");
      return;
    }
    
    const formData = {
      country,
      service,
      projectDescription,
      estimatedPrice: `${currency.symbol} ${convertedPrice}`
    };
    
    console.log("Form submitted:", formData);
    alert("Request submitted successfully!");
  };

  const handleGetQuote = () => {
    alert("Free quote request submitted! We'll get back to you soon.");
  };

  const handleBackToHome = () => {
    // In a real app, you'd use React Router
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  useEffect(() => {
    // Initialize with Ghana on component mount
    const initializeExchangeRate = async () => {
      setLoading(true);
      try {
        const exchangeRate = await getExchangeRate(currencyMap["Ghana"].code);
        setRate(exchangeRate);
      } catch (error) {
        console.error("Error fetching initial exchange rate:", error);
        setRate(1);
      } finally {
        setLoading(false);
      }
    };

    initializeExchangeRate();
  }, []);

  // Get the current service price and convert to local currency
  const currentServicePrice = servicePricing[service] || 100;
  const convertedPrice = (currentServicePrice * rate).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-4xl mx-auto">
      
      <div 
        className="flex items-center space-x-4 mb-6 p-6 rounded-lg relative"
        style={{
          backgroundImage: `url(${nexacoreLogo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
        <h1 className="text-3xl font-bold text-white relative z-10">Get Started with NexaCore</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label htmlFor="country" className="block mb-2 font-medium text-gray-700">
            Your Country
          </label>
          <select
            id="country"
            value={country}
            onChange={handleCountryChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            {Object.keys(currencyMap).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="service" className="block mb-2 font-medium text-gray-700">
            Service Type
          </label>
          <select 
            id="service" 
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.keys(servicePricing).map((serviceType) => (
              <option key={serviceType} value={serviceType}>
                {serviceType}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 font-medium text-gray-700">
            Project Description
          </label>
          <textarea
            id="description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell us more about your project..."
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="text-lg font-semibold text-gray-900">
            Estimated Price: {loading ? (
              <span className="text-gray-500">Calculating...</span>
            ) : (
              <span className="text-blue-600">{currency.symbol} {convertedPrice}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Base price: ${currentServicePrice} USD • Exchange rate applied for {currency.code}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            className="text-lg px-6 py-3"
            onClick={handleSubmit}
          >
            Submit Request
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button 
            variant="outline" 
            className="text-lg px-6 py-3" 
            onClick={handleBackToHome}
          >
            Back to Home
          </Button>
          
          <Button 
            variant="success"
            className="text-lg px-6 py-3" 
            onClick={handleGetQuote}
          >
            Get Free Quote
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
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

// Mock exchange rate function (replace with actual API call)
const getExchangeRate = async (currencyCode) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock exchange rates (in a real app, you'd fetch from an API)
  const mockRates = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    GHS: 12.50, // Ghana Cedis
    NGN: 450,   // Nigerian Naira
    ZAR: 18.5,  // South African Rand
    KES: 110,   // Kenyan Shilling
    // Add more as needed
  };
  
  return mockRates[currencyCode] || 1;
};

const Button = ({ children, className, variant, onClick, ...props }) => {
  const baseClasses = "px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    success: "bg-green-600 text-white hover:bg-green-700"
  };
  
  const variantClass = variants[variant] || variants.default;
  
  return (
    <button 
      className={`${baseClasses} ${variantClass} ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Service pricing in USD
const servicePricing = {
  "Software Engineering": 150,
  "Data Analysis": 120,
  "CAD Engineering": 180,
  "Graphic Design": 80,
  "Digital Marketing": 100,
  "Video Editing & Motion Graphics": 130,
  "UI/UX Design": 110,
  "Cybersecurity Solutions": 200,
  "Mobile App Development": 160,
  "Content Writing / Copywriting": 60,
  "3D Animation & VFX": 220,
  "Web3 & Blockchain Engineering": 250,
  "E-Commerce Solutions": 140,
  "AI / Machine Learning Engineering": 240
};

const GetStarted = () => {
  const [country, setCountry] = useState("Ghana");
  const [currency, setCurrency] = useState(currencyMap["Ghana"]);
  const [rate, setRate] = useState(1);
  const [service, setService] = useState("Software Engineering");
  const [projectDescription, setProjectDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCountryChange = async (e) => {
    const selected = e.target.value;
    setCountry(selected);
    const selectedCurrency = currencyMap[selected] || { code: "USD", symbol: "$" };
    setCurrency(selectedCurrency);

    setLoading(true);
    try {
      const exchangeRate = await getExchangeRate(selectedCurrency.code);
      setRate(exchangeRate);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setRate(1); // Fallback to 1:1 rate
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!projectDescription.trim()) {
      alert("Please provide a project description");
      return;
    }
    
    const formData = {
      country,
      service,
      projectDescription,
      estimatedPrice: `${currency.symbol} ${convertedPrice}`
    };
    
    console.log("Form submitted:", formData);
    alert("Request submitted successfully!");
  };

  const handleGetQuote = () => {
    alert("Free quote request submitted! We'll get back to you soon.");
  };

  const handleBackToHome = () => {
    // In a real app, you'd use React Router
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  useEffect(() => {
    // Initialize with Ghana on component mount
    const initializeExchangeRate = async () => {
      setLoading(true);
      try {
        const exchangeRate = await getExchangeRate(currencyMap["Ghana"].code);
        setRate(exchangeRate);
      } catch (error) {
        console.error("Error fetching initial exchange rate:", error);
        setRate(1);
      } finally {
        setLoading(false);
      }
    };

    initializeExchangeRate();
  }, []);

  // Get the current service price and convert to local currency
  const currentServicePrice = servicePricing[service] || 100;
  const convertedPrice = (currentServicePrice * rate).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-4xl mx-auto">
      
      <div className="flex items-center space-x-4 mb-6">
        <img src={nexacoreLogo} alt="NexaCore Logo" className="h-12 w-19" />
        <h1 className="text-3xl font-bold text-gray-900">Get Started with NexaCore</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label htmlFor="country" className="block mb-2 font-medium text-gray-700">
            Your Country
          </label>
          <select
            id="country"
            value={country}
            onChange={handleCountryChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            {Object.keys(currencyMap).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="service" className="block mb-2 font-medium text-gray-700">
            Service Type
          </label>
          <select 
            id="service" 
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.keys(servicePricing).map((serviceType) => (
              <option key={serviceType} value={serviceType}>
                {serviceType}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 font-medium text-gray-700">
            Project Description
          </label>
          <textarea
            id="description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell us more about your project..."
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="text-lg font-semibold text-gray-900">
            Estimated Price: {loading ? (
              <span className="text-gray-500">Calculating...</span>
            ) : (
              <span className="text-blue-600">{currency.symbol} {convertedPrice}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Base price: ${currentServicePrice} USD • Exchange rate applied for {currency.code}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            className="text-lg px-6 py-3"
            onClick={handleSubmit}
          >
            Submit Request
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button 
            variant="outline" 
            className="text-lg px-6 py-3" 
            onClick={handleBackToHome}
          >
            Back to Home
          </Button>
          
          <Button 
            variant="success"
            className="text-lg px-6 py-3" 
            onClick={handleGetQuote}
          >
            Get Free Quote
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
