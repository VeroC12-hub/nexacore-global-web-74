import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import countries from "@/data/countries"; // optional countries.js array

const currencyMap: Record<string, string> = {
  Ghana: "GHS",
  "United States": "USD",
  "United Kingdom": "GBP",
  Nigeria: "NGN",
  Kenya: "KES",
  Germany: "EUR",
};

const GetStarted = () => {
  const [country, setCountry] = useState("Ghana");
  const [currency, setCurrency] = useState(currencyMap["Ghana"]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setCountry(selected);
    setCurrency(currencyMap[selected] || "USD");
  };

  return (
    <div className="min-h-screen py-20 px-6 bg-background text-foreground">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center">Let’s Build Something Brilliant Together</h1>
        <p className="text-center text-muted-foreground max-w-xl mx-auto">
          Tell us what you need—we’ll help bring your idea to life with the right tools, skills, and solutions.
        </p>

        <form className="space-y-10">
          {/* Country + Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Your Country</label>
              <select
                value={country}
                onChange={handleCountryChange}
                className="w-full mt-2 p-2 border border-border rounded-md bg-background"
              >
                {Object.keys(currencyMap).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold">Currency</label>
              <input
                value={currency}
                readOnly
                className="w-full mt-2 p-2 border border-border rounded-md bg-muted"
              />
            </div>
          </div>

          {/* Services */}
          <div>
            <h2 className="text-lg font-semibold mb-4">What services do you need?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Software Engineering",
                "Data Analysis",
                "CAD Engineering",
                "Graphic Design",
                "Digital Marketing",
                "Video Editing & Motion Graphics",
                "UI/UX Design",
                "Cybersecurity Solutions",
                "Mobile App Development",
                "Content Writing / Copywriting",
                "3D Animation & VFX",
                "Web3 & Blockchain Engineering",
                "E-Commerce Solutions",
                "AI / Machine Learning Engineering",
              ].map((service, idx) => (
                <label key={idx} className="flex items-center space-x-2">
                  <input type="checkbox" value={service} className="accent-primary" />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold">Project Description</label>
            <textarea className="w-full mt-2 p-3 border border-border rounded-md min-h-[120px]" />
          </div>

          {/* Timeline & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Project Start Date</label>
              <input type="date" className="w-full mt-2 p-2 border border-border rounded-md" />
            </div>
            <div>
              <label className="font-semibold">Deadline (optional)</label>
              <input type="date" className="w-full mt-2 p-2 border border-border rounded-md" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="font-semibold">Budget Range</label>
            <div className="flex flex-wrap gap-4">
              {["< 5,000", "5,000 - 15,000", "15,000 - 30,000", "Not Sure"].map((b, i) => (
                <label key={i} className="flex items-center space-x-2">
                  <input type="radio" name="budget" value={b} className="accent-primary" />
                  <span>{currency} {b}</span>
                </label>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="font-semibold">Upload References</label>
            <input type="file" className="w-full mt-2" />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Full Name" className="p-2 border border-border rounded-md" />
            <input placeholder="Company (optional)" className="p-2 border border-border rounded-md" />
            <input placeholder="Email" className="p-2 border border-border rounded-md" />
            <input placeholder="Phone / WhatsApp" className="p-2 border border-border rounded-md" />
          </div>

          {/* Preferred Contact */}
          <div className="space-y-2">
            <label className="font-semibold">Preferred Contact Method</label>
            <div className="flex gap-4">
              {["Email", "Phone", "Zoom Meeting"].map((method, idx) => (
                <label key={idx} className="flex items-center space-x-2">
                  <input type="radio" name="contact-method" value={method} className="accent-primary" />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" className="accent-primary" />
            <span className="text-sm text-muted-foreground">
              I agree to be contacted regarding this inquiry and understand my data will be handled securely.
            </span>
          </div>

          <Button className="w-full text-lg mt-4">
            Get Started with NexaCore
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default GetStarted;
