
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const services = [
  'Engineering & Technical',
  'Software & App Development',
  'Creative & Branding',
  'Data & Digital Growth',
];

const GetStarted = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    service: '',
    message: '',
    budget: '',
    timeline: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', form);
    alert('Thanks for reaching out! We’ll contact you soon.');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="py-20 bg-muted/30 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
            Get Started
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Let’s Kickstart Your Project</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Tell us what you need and our team will get in touch right away.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input name="name" placeholder="Your Full Name" value={form.name} onChange={handleChange} required />
              <Input type="email" name="email" placeholder="Your Email Address" value={form.email} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select
                name="service"
                value={form.service}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select Service</option>
                {services.map((srv, idx) => (
                  <option key={idx} value={srv}>{srv}</option>
                ))}
              </select>

              <select
                name="budget"
                value={form.budget}
                onChange={handleChange}
                className="input"
              >
                <option value="">Estimated Budget</option>
                <option value="< $500">Less than $500</option>
                <option value="$500 - $2000">$500 - $2000</option>
                <option value="> $2000">More than $2000</option>
              </select>
            </div>

            <Input
              name="timeline"
              placeholder="Preferred Timeline (optional)"
              value={form.timeline}
              onChange={handleChange}
            />

            <Textarea
              name="message"
              placeholder="Tell us about your project..."
              rows={5}
              value={form.message}
              onChange={handleChange}
              required
            />

            <Button type="submit" className="w-full text-lg py-4">
              Submit Request
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GetStarted;
