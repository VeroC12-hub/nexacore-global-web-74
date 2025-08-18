import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Badge } from '../components/ui/badge';
import { Shield, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-16 pb-8 lg:pt-24 lg:pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-gradient-hero">Privacy</span>{' '}
              <span className="text-foreground">Policy</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              How we collect, use, and protect your personal information when you use our services
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
              <span><strong>Effective Date:</strong> January 1, 2025</span>
              <span>•</span>
              <span><strong>Last Updated:</strong> January 1, 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-muted/30 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { href: "#introduction", text: "Introduction" },
                { href: "#section-a", text: "Section A: Data Collection & Use" },
                { href: "#section-b", text: "Section B: Your Rights & Controls" },
                { href: "#section-c", text: "Section C: Account & Project Access" },
                { href: "#section-d", text: "Section D: Cookies & Technologies" },
                { href: "#section-e", text: "Section E: Additional Information" },
                { href: "#contact", text: "Contact Information" }
              ].map((item, index) => (
                <a 
                  key={index}
                  href={item.href} 
                  className="flex items-center text-primary hover:text-primary/80 transition-colors text-sm py-1"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  {item.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Introduction */}
          <div id="introduction" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Introduction</h2>
            <div className="prose prose-lg max-w-none space-y-4">
              <p>
                This Privacy Policy explains how we collect, use, and disclose your personal information when you use the 
                <strong> "NexaCore service"</strong> (that term and <strong>"NexaCore content"</strong> are defined in the 
                NexaCore Terms of Use available at nexacore-innovations.com/terms) or anywhere we display or reference this 
                Privacy Policy. It also explains what privacy rights you have and how to exercise them.
              </p>
              <p>
                Certain functionalities or services that are part of the NexaCore service may also provide you with contextual 
                privacy information or choices, in addition to the information and choices described in this Privacy Policy.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div id="contact" className="mb-12 bg-muted/30 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Mail className="w-6 h-6 mr-3 text-primary" />
              Contacting Us
            </h2>
            <div className="space-y-4">
              <p>
                For questions about this Privacy Policy, our use of your personal information, or how to exercise 
                <strong> your privacy rights</strong>, please contact our Data Protection Officer/Privacy Office at 
                <strong> privacy@nexacore-innovations.com</strong>.
              </p>
              <p>
                For general questions about the NexaCore service, your account, or how to contact customer service, 
                please visit <strong>nexacore-innovations.com/contact</strong>.
              </p>
              <p>
                Information about the specific NexaCore entity (or entities) that are responsible for your personal 
                information (known as the "data controller" in certain countries) is available at 
                <strong> nexacore-innovations.com/legal/corpinfo</strong>.
              </p>
            </div>
          </div>

          {/* Section A */}
          <div id="section-a" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              Section A: Our Collection, Use, and Disclosure of Personal Information
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">A1. The Categories of Personal Information We Collect</h3>
                <p className="mb-6">We collect the following categories of personal information about you:</p>
                
                <div className="space-y-4">
                  {[
                    {
                      title: "Personal Details",
                      content: "When you create your NexaCore account, we collect your contact information (such as your email address, phone number, physical address) and authentication information for your login (such as a password). Depending on how you set up your account and which features you use, we also collect: first and last name, company name, job title, industry, and other identifiers you provide to us."
                    },
                    {
                      title: "Payment Details", 
                      content: "We collect your payment details and other information to process your payments, including your payment history, billing address, tax information, and gift cards and promotional offers you have redeemed."
                    },
                    {
                      title: "Project and Service Information",
                      content: "We collect detailed information about your engineering projects, software requirements, design specifications, consultation needs, project timelines, budget parameters, technical requirements, deliverables, and service preferences. This includes project files, documentation, feedback, and revision requests."
                    },
                    {
                      title: "Usage Information",
                      content: "We collect information about your interaction with the NexaCore service, including services accessed and tools utilized, time spent on different service areas, features used, interaction patterns, service usage history, search queries, file uploads and downloads, and communication activities."
                    },
                    {
                      title: "Business Information",
                      content: "We collect information about your business operations, including company size, structure, and industry; business objectives and strategic goals; technology infrastructure and requirements; regulatory and compliance needs; and partnership relationships."
                    },
                    {
                      title: "Device and Network Information",
                      content: "We collect information about your devices used to access our service, including device IDs, IP addresses, device characteristics, performance data, and cookie data."
                    }
                  ].map((item, index) => (
                    <div key={index} className="bg-muted/20 rounded-lg p-4 border-l-4 border-primary/30">
                      <h4 className="font-semibold text-lg mb-2 text-primary">{item.title}</h4>
                      <p className="text-muted-foreground">{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">A2. How We Use Your Personal Information</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-muted rounded-lg">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-muted p-3 text-left font-semibold">Purpose</th>
                        <th className="border border-muted p-3 text-left font-semibold">Legal Basis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          purpose: "To provide engineering, software development, design, and analytics services",
                          legal: "Performance of contract, legitimate interests"
                        },
                        {
                          purpose: "To administer and operate our business including processing payments",
                          legal: "Performance of contract, legitimate interests"
                        },
                        {
                          purpose: "To research, analyze, and improve our services",
                          legal: "Legitimate interests, consent"
                        },
                        {
                          purpose: "To send marketing and informational messages",
                          legal: "Legitimate interests, consent"
                        },
                        {
                          purpose: "For safety, security, and fraud prevention",
                          legal: "Legitimate interests, legal compliance"
                        }
                      ].map((row, index) => (
                        <tr key={index} className="hover:bg-muted/20">
                          <td className="border border-muted p-3">{row.purpose}</td>
                          <td className="border border-muted p-3">{row.legal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Section B */}
          <div id="section-b" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              Section B: Your Rights and Controls
            </h2>
            
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold mb-4">B1. Your Privacy Rights</h3>
              
              <div className="grid gap-4">
                {[
                  {
                    title: "Access, Correct, Update, or Delete",
                    content: "You have the right to confirm whether we process your personal information and to access, correct, update, or request deletion of your personal information."
                  },
                  {
                    title: "Data Portability",
                    content: "You can request a copy of your personal information in a portable format. Contact privacy@nexacore-innovations.com to request your data."
                  },
                  {
                    title: "Withdraw Consent",
                    content: "You can withdraw your consent for processing activities that require consent, such as marketing communications."
                  },
                  {
                    title: "Restrict Processing",
                    content: "You can request that we restrict or limit our use of your personal information in certain circumstances."
                  },
                  {
                    title: "Right to Complain",
                    content: "You have the right to complain to a data protection authority about our processing of your personal information."
                  }
                ].map((right, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-muted/10 transition-colors">
                    <h4 className="font-semibold mb-2">{right.title}</h4>
                    <p className="text-muted-foreground text-sm">{right.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section C */}
          <div id="section-c" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              Section C: Access to Account and Project Information
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Account Sharing</h3>
                <p className="text-muted-foreground">
                  If you share your account with others in your organization, please ensure they are aware of this Privacy Policy. 
                  The account owner controls all account information and access permissions.
                </p>
              </div>
              
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Project Access</h3>
                <p className="text-muted-foreground">
                  Your project data and files are accessible to designated team members and NexaCore personnel involved in service delivery. 
                  When using collaborative features, shared information may be visible to other participants.
                </p>
              </div>
            </div>
          </div>

          {/* Section D */}
          <div id="section-d" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              Section D: Cookies and Other Technologies
            </h2>
            
            <div className="space-y-6">
              <p>We use cookies, pixel tags, and similar technologies for various purposes:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { type: "Essential Cookies", purpose: "Required for basic website functionality and security" },
                  { type: "Analytics Cookies", purpose: "Help us understand website usage and improve performance" },
                  { type: "Marketing Cookies", purpose: "Used for advertising and measuring marketing effectiveness" },
                  { type: "Preference Cookies", purpose: "Remember your settings and personalize your experience" }
                ].map((cookie, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{cookie.type}</h4>
                    <p className="text-sm text-muted-foreground">{cookie.purpose}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Managing Cookies:</strong> You can control cookies through your browser settings. 
                  Note that disabling certain cookies may affect website functionality.
                </p>
              </div>
            </div>
          </div>

          {/* Section E */}
          <div id="section-e" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              Section E: Other Important Privacy Information
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Data Security</h3>
                <p className="text-muted-foreground mb-4">
                  We implement comprehensive security measures including encryption, access controls, 
                  regular security assessments, and incident response procedures.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Data Retention</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-muted rounded-lg text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-muted p-2 text-left">Information Type</th>
                        <th className="border border-muted p-2 text-left">Retention Period</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { type: "Account Information", period: "Duration of service + 7 years" },
                        { type: "Project Files", period: "10 years from completion" },
                        { type: "Financial Records", period: "7 years from transaction" },
                        { type: "Marketing Data", period: "Until opt-out or 3 years inactive" }
                      ].map((item, index) => (
                        <tr key={index} className="hover:bg-muted/20">
                          <td className="border border-muted p-2">{item.type}</td>
                          <td className="border border-muted p-2">{item.period}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">International Transfers</h3>
                <p className="text-muted-foreground">
                  As a global service provider, we may transfer your information internationally. 
                  We ensure appropriate safeguards through Standard Contractual Clauses and other protective measures.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Children's Privacy</h3>
                <p className="text-muted-foreground">
                  Our services are not directed to individuals under 18 years of age. 
                  We do not knowingly collect personal information from children under 18.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Regional Privacy Rights</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">EU/UK Residents (GDPR)</h4>
                    <p className="text-sm text-muted-foreground">
                      Additional rights include data portability, right to restrict processing, 
                      and right to lodge complaints with data protection authorities.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">California Residents (CCPA)</h4>
                    <p className="text-sm text-muted-foreground">
                      Rights include knowing what information we collect, deleting personal information, 
                      and non-discrimination for exercising rights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-12 bg-primary/5 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-primary" />
                  General Privacy Inquiries
                </h3>
                <p className="text-sm">privacy@nexacore-innovations.com</p>
                <p className="text-sm">nexacore-innovations.com/privacy</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  Data Protection Officer
                </h3>
                <p className="text-sm">dpo@nexacore-innovations.com</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-primary" />
                  Customer Support
                </h3>
                <p className="text-sm">support@nexacore-innovations.com</p>
                <p className="text-sm">nexacore-innovations.com/contact</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Physical Address
                </h3>
                <p className="text-sm">
                  NexaCore Innovations<br />
                  Accra, Ghana
                </p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-lg p-4">
            <p><strong>Last Updated:</strong> January 1, 2025 • <strong>Version:</strong> 3.0</p>
            <p className="mt-2">
              We encourage you to review this Privacy Policy periodically for any updates or changes. 
              Your continued use of our services after any modifications indicates your acceptance of the updated Privacy Policy.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
