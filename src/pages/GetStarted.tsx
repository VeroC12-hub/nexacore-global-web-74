
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getExchangeRate } from "@/utils/getExchangeRate";

// Full country and currency map
const currencyMap: Record<string, { code: string; symbol: string }> = {
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


const GetStarted = () => {
  const [country, setCountry] = useState("Ghana");
  const [currency, setCurrency] = useState(currencyMap["Ghana"]);
  const [rate, setRate] = useState(1);

  const basePriceUSD = 100;

  const handleCountryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setCountry(selected);
    const selectedCurrency = currencyMap[selected] || { code: "USD", symbol: "$" };
    setCurrency(selectedCurrency);

    const exchangeRate = await getExchangeRate(selectedCurrency.code);
    setRate(exchangeRate);
  };

  useEffect(() => {
    handleCountryChange({ target: { value: "Ghana" } } as React.ChangeEvent<HTMLSelectElement>);
  }, []);

  const convertedPrice = (basePriceUSD * rate).toFixed(2);

  return (
    <div className="min-h-screen bg-background p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Get Started with NexaCore</h1>

      <div className="mb-4">
        <label htmlFor="country" className="block mb-1 font-medium">Your Country</label>
        <select
          id="country"
          value={country}
          onChange={handleCountryChange}
          className="w-full border px-4 py-2 rounded"
        >
          {Object.keys(currencyMap).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="service" className="block mb-1 font-medium">Service Type</label>
        <select id="service" className="w-full border px-4 py-2 rounded">
          <option>Software Engineering</option>
          <option>Data Analysis</option>
          <option>CAD Engineering</option>
          <option>Graphic Design</option>
          <option>Digital Marketing</option>
          <option>Video Editing & Motion Graphics</option>
          <option>UI/UX Design</option>
          <option>Cybersecurity Solutions</option>
          <option>Mobile App Development</option>
          <option>Content Writing / Copywriting</option>
          <option>3D Animation & VFX</option>
          <option>Web3 & Blockchain Engineering</option>
          <option>E-Commerce Solutions</option>
          <option>AI / Machine Learning Engineering</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Project Description</label>
        <textarea
          className="w-full border px-4 py-2 rounded h-32"
          placeholder="Tell us more about your project..."
        />
      </div>

      <div className="mb-6 text-lg">
        Estimated Price: <strong>{currency.symbol} {convertedPrice}</strong>
      </div>

      <Button className="bg-primary text-white px-6 py-3 rounded font-semibold hover:bg-primary/80 transition">
        Submit Request
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );
};

export default GetStarted;
