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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-gradient-hero">Privacy</span>{' '}
              <span className="text-foreground">Policy</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              How we collect, use, and disclose your personal information when you use our services
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
              <span><strong>Effective Date:</strong> [Insert Date]</span>
              <span>•</span>
              <span><strong>Last Updated:</strong> [Insert Date]</span>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-muted/30 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { href: "#contacting-us", text: "Contacting Us" },
                { href: "#section-a", text: "Section A: Our Collection, Use, and Disclosure of Personal Information" },
                { href: "#section-b", text: "Section B: Your Rights and Controls" },
                { href: "#section-c", text: "Section C: Access to Account and Project Information" },
                { href: "#section-d", text: "Section D: Cookies and Other Technologies" },
                { href: "#section-e", text: "Section E: Other Important Privacy Information" }
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Introduction */}
          <div className="mb-12">
            <div className="space-y-4 text-base leading-relaxed">
              <p>
                This Privacy Policy explains how we collect, use, and disclose your personal information when you use the 
                <strong> "NexaCore service"</strong> (that term and <strong>"NexaCore content"</strong> are defined in the 
                NexaCore Terms of Use available at <a href="/terms" className="text-primary hover:underline">nexacore-innovations.com/terms</a>) 
                or anywhere we display or reference this Privacy Policy. It also explains what privacy rights you have and how to exercise them.
              </p>
              <p>
                Certain functionalities or services that are part of the NexaCore service may also provide you with contextual 
                privacy information or choices, in addition to the information and choices described in this Privacy Policy. 
                Please note that this Privacy Policy may be easier to navigate when viewed on your web browser.
              </p>
            </div>
          </div>

          {/* Contacting Us */}
          <div id="contacting-us" className="mb-12 bg-muted/30 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Mail className="w-6 h-6 mr-3 text-primary" />
              Contacting Us
            </h2>
            <div className="space-y-4 text-base">
              <p>
                For questions about this Privacy Policy, our use of your personal information, or how to exercise 
                <strong> your privacy rights</strong>, please contact our Data Protection Officer/Privacy Office at 
                <strong> <a href="mailto:privacy@nexacore-innovations.com" className="text-primary hover:underline">privacy@nexacore-innovations.com</a></strong>.
              </p>
              <p>
                For general questions about the NexaCore service, your account, or how to contact customer service, 
                please visit <strong><a href="/contact" className="text-primary hover:underline">nexacore-innovations.com/contact</a></strong>.
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
            
            <div className="space-y-10">
              {/* A1 */}
              <div>
                <h3 className="text-2xl font-semibold mb-6">A1. The Categories of Personal Information We Collect</h3>
                <p className="mb-6 text-base">We collect the following categories of personal information about you:</p>
                
                <div className="space-y-6">
                  <div className="bg-muted/20 rounded-lg p-6 border-l-4 border-primary/30">
                    <h4 className="font-semibold text-lg mb-3 text-primary">Personal Details</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      When you create your NexaCore account, we collect your contact information (such as your email address, phone number, physical address) 
                      and authentication information for your login (such as a password). Depending on how you subsequently set up your account and method of payment, 
                      and which features you use, we also collect one or more of the following: first and last name, company name, job title, industry, 
                      gender, date of birth, professional qualifications, and other identifiers you provide to us.
                    </p>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-6 border-l-4 border-primary/30">
                    <h4 className="font-semibold text-lg mb-3 text-primary">Payment Details</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      We collect your payment details, and other information to process your payments, including your payment history, billing address, 
                      tax information, and gift cards and promotional offers you have redeemed.
                    </p>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-6 border-l-4 border-primary/30">
                    <h4 className="font-semibold text-lg mb-3 text-primary">Project and Service Information</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      We collect detailed information about your engineering projects, software requirements, design specifications, consultation needs, 
                      project timelines, budget parameters, technical requirements, deliverables, and service preferences. This includes project files, 
                      documentation, feedback, and revision requests.
                    </p>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-6 border-l-4 border-primary/30">
                    <h4 className="font-semibold text-lg mb-3 text-primary">NexaCore Account/Service Information</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      We collect information that is associated with your NexaCore account and/or service usage (such as account settings, service preferences, 
                      project history, ratings and feedback you provide for our services), communication history, support tickets, consultation records, 
                      account/service settings, and choices in connection with your use of the NexaCore service.
                    </p>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-6 border-l-4 border-primary/30">
                    <h4 className="font-semibold text-lg mb-3 text-primary">Usage Information</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      We collect information about your interaction with the NexaCore service, including:
                    </p>
                    <ul className="list-disc list-inside mt-3 space-y-1 text-muted-foreground text-base">
                      <li>Services accessed and tools utilized</li>
                      <li>Time spent on different service areas and project phases</li>
                      <li>Features and functionalities used</li>
                      <li>Interaction patterns and user behavior</li>
                      <li>Service usage history and patterns</li>
                      <li>Search queries on the NexaCore service</li>
                      <li>File uploads, downloads, and modifications</li>
                      <li>Communication and collaboration activities</li>
                    </ul>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-6 border-l-4 border-primary/30">
                    <h4 className="font-semibold text-lg mb-3 text-primary">Business Information</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      We collect information about your business operations, including:
                    </p>
                    <ul className="list-disc list-inside mt-3 space-y-1 text-muted-foreground text-base">
                      <li>Company size, structure, and industry</li>
                      <li>Business objectives and strategic goals</li>
                      <li>Competitive landscape and market position</li>
                      <li>Technology infrastructure and requirements</li>
                      <li>Regulatory and compliance needs</li>
                      <li>Partnership and vendor relationships</li>
                    </ul>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-6 border-l-4 border-primary/30">
                    <h4 className="font-semibold text-lg mb-3 text-primary">Device and Network Information</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      We collect information about your computer or other devices you might use to access our service (such as workstations, mobile devices, 
                      tablets, and other internet-connected devices), your network, and network devices. The information includes:
                    </p>
                    <ul className="list-disc list-inside mt-3 space-y-1 text-muted-foreground text-base">
                      <li>Device IDs or other unique identifiers, including for your network devices (such as your router)</li>
                      <li>IP addresses (which can be used to tell us the general location of your device, such as your city, state/province, and postal code)</li>
                      <li>Device and software characteristics (such as type and configuration), referring source, standard web browser and application log information, and connection information including type (such as wifi or cellular)</li>
                      <li>Performance data such as crash reports, timestamps, and debug log messages</li>
                      <li>Cookie data, device identifiers, and other unique identifiers</li>
                    </ul>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-6 border-l-4 border-primary/30">
                    <h4 className="font-semibold text-lg mb-3 text-primary">Communications</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      If you communicate with NexaCore (such as contacting customer support via online chat, voice call, or email), or engage in our surveys 
                      or feedback requests, we collect the contents of such communications. We also collect details of communications that we send you 
                      (such as via email, notifications, or within the NexaCore service), and information about your interaction with these communications.
                    </p>
                  </div>
                </div>
              </div>

              {/* A2 */}
              <div>
                <h3 className="text-2xl font-semibold mb-6">A2. Where We Collect Personal Information From</h3>
                <p className="mb-6 text-base">We collect your personal information from the following sources:</p>
                
                <div className="space-y-6">
                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">Directly from You</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      When you register with the NexaCore service, update your account information, purchase products or services from us, 
                      submit project requirements, correspond with us, or respond to our surveys, you may provide (and we will collect) 
                      the following categories of personal information: personal details, payment details, project and service information, 
                      NexaCore account/service information, business information, and communications.
                    </p>
                  </div>

                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">Automatically When You Use Our Service</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      We automatically collect the following categories of personal information in connection with your use of the NexaCore service: 
                      NexaCore account/service information, project and service information, usage information, device and network information, 
                      and communications.
                    </p>
                  </div>

                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">From Partners Whose Products and Services You Use</h4>
                    <p className="text-muted-foreground text-base leading-relaxed mb-3">
                      We may collect the following categories of personal information about you from third parties whose services you use to access, 
                      pay for, or interact with the NexaCore service ("Partners"): personal details, payment details, usage information, 
                      and device and network information. Our Partners may include:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                      <li>Cloud service providers and hosting companies</li>
                      <li>Payment processors and financial institutions</li>
                      <li>Technology platforms and integration services</li>
                      <li>Professional service providers and consultants</li>
                      <li>Industry partners and referral sources</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">From Other Sources</h4>
                    <p className="text-muted-foreground text-base leading-relaxed mb-3">
                      We may collect the following categories of personal information about you from other sources: personal details, payment details, 
                      business information, and device and network information. These sources include:
                    </p>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-base">Service Providers</p>
                        <p className="text-sm text-muted-foreground">Such as vendors, agents, and contractors that collect or provide personal information to NexaCore in connection with services they perform on our behalf.</p>
                      </div>
                      <div>
                        <p className="font-medium text-base">NexaCore Marketing Providers</p>
                        <p className="text-sm text-muted-foreground">When you interact with marketing campaigns promoting the NexaCore service or content.</p>
                      </div>
                      <div>
                        <p className="font-medium text-base">Publicly Available Sources</p>
                        <p className="text-sm text-muted-foreground">Such as business directories, professional networks, industry databases, and other information available through public sources.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* A3 */}
              <div>
                <h3 className="text-2xl font-semibold mb-6">A3. How We Use Your Personal Information</h3>
                <p className="mb-6 text-base">
                  We use your personal information to provide, maintain, improve, and promote the NexaCore service, and to communicate with you. 
                  This involves using the categories of personal information listed above for the following purposes:
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-muted rounded-lg text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-muted p-4 text-left font-semibold">Purpose</th>
                        <th className="border border-muted p-4 text-left font-semibold">Categories of Personal Information Used</th>
                        <th className="border border-muted p-4 text-left font-semibold">Legal Basis</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-4 text-base">
                          <strong>To provide our engineering, software development, design, and analytics services</strong> including delivering personalized recommendations and solutions that we think will be of interest to you. This includes optimizing service delivery, localizing content relevant to your geography, and customizing solutions to meet your specific requirements.
                        </td>
                        <td className="border border-muted p-4 text-base">Personal details, NexaCore account/service information, project and service information, business information, usage information, device and network information, communications</td>
                        <td className="border border-muted p-4 text-base">Performance of contract, legitimate interests</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-4 text-base">
                          <strong>To administer and operate our business</strong> including processing payments, sending transactional communications, managing project deliverables, responding to inquiries and requests, and assisting with operational requests such as password resets and account management.
                        </td>
                        <td className="border border-muted p-4 text-base">Personal details, payment details, project and service information, NexaCore account/service information, usage information, device and network information, communications</td>
                        <td className="border border-muted p-4 text-base">Performance of contract, legitimate interests</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-4 text-base">
                          <strong>To research, analyze, and improve our services</strong> such as analyzing and understanding our clients to improve our services and optimize service delivery. This includes processing your information in connection with surveys and feedback collection.
                        </td>
                        <td className="border border-muted p-4 text-base">Personal details, payment details, project and service information, NexaCore account/service information, business information, usage information, device and network information, communications</td>
                        <td className="border border-muted p-4 text-base">Legitimate interests, consent</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-4 text-base">
                          <strong>To enable Partner integrations and collaborations</strong> so that our Partners can facilitate service delivery and make specialized services available to you through Partner integrations, based on your specific business needs.
                        </td>
                        <td className="border border-muted p-4 text-base">Personal details, payment details, NexaCore account/service information, business information, usage information, device and network information, communications</td>
                        <td className="border border-muted p-4 text-base">Performance of contract, legitimate interests</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-4 text-base">
                          <strong>To send marketing and informational messages</strong> including news and promotional communications about our services, new features, case studies, industry insights, and special offers. These messages may be personalized for you or your likely interests.
                        </td>
                        <td className="border border-muted p-4 text-base">Personal details, NexaCore account/service information, project and service information, business information, usage information, device and network information, communications</td>
                        <td className="border border-muted p-4 text-base">Legitimate interests, consent</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-4 text-base">
                          <strong>For safety, security, and fraud prevention</strong> including securing our systems, protecting our business, and investigating, preventing, and detecting prohibited or illegal activities and other security/technical issues.
                        </td>
                        <td className="border border-muted p-4 text-base">Personal details, payment details, NexaCore account/service information, usage information, device and network information, communications</td>
                        <td className="border border-muted p-4 text-base">Legitimate interests, legal compliance</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-4 text-base">
                          <strong>To comply with law and enforce the NexaCore Terms of Use</strong> including satisfying applicable law, regulation, legal process, or governmental request, and protecting against harm to rights, property or safety of NexaCore, its users or the public.
                        </td>
                        <td className="border border-muted p-4 text-base">Personal details, payment details, NexaCore account/service information, project and service information, usage information, device and network information, communications</td>
                        <td className="border border-muted p-4 text-base">Legal compliance, legitimate interests</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* A4 */}
              <div>
                <h3 className="text-2xl font-semibold mb-6">A4. Who We Disclose Personal Information To</h3>
                <p className="mb-6 text-base">We may disclose your personal information to the following parties:</p>
                
                <div className="space-y-6">
                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">The NexaCore Family of Companies</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      We share your personal information among the NexaCore family of companies as needed for the purposes described 
                      above in "How We Use Your Personal Information."
                    </p>
                  </div>

                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">Service Providers</h4>
                    <p className="text-muted-foreground text-base leading-relaxed mb-3">
                      We use Service Providers to perform services on our behalf or to assist us with the provision of services to you. 
                      For example, we use Service Providers to provide:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                      <li>Cloud hosting and infrastructure services</li>
                      <li>Payment processing and billing services</li>
                      <li>Analytics and business intelligence tools</li>
                      <li>Communication and collaboration platforms</li>
                      <li>Security and fraud prevention services</li>
                      <li>Marketing and customer relationship management systems</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">Partners</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      If you have a relationship with one or more of our Partners, we may share certain personal information with them 
                      to fulfill your requests in compliance with applicable law. This includes technology integration partners, 
                      specialized service providers, industry collaboration partners, and professional service networks.
                    </p>
                  </div>

                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">Legal Requirements</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      We may disclose your personal information as necessary to comply with applicable law, regulation, legal process, 
                      or governmental request, and processing necessary to protect against harm to the rights, property or safety of NexaCore, 
                      its users or the public, as required or permitted by law.
                    </p>
                  </div>
                </div>
              </div>

              {/* A5 */}
              <div>
                <h3 className="text-2xl font-semibold mb-6">A5. International Transfers of Personal Information</h3>
                <p className="mb-6 text-base leading-relaxed">
                  NexaCore operates from various countries around the world, as do its Service Providers, Partners, and other third parties 
                  to whom we may need to disclose your personal information. This means that when you use or interact with NexaCore, 
                  your personal information may be transferred to other countries that have different data protection laws than those where you reside.
                </p>
                <p className="mb-6 text-base leading-relaxed">
                  However, whenever we transfer personal information to other countries, we ensure that the personal information is transferred 
                  in accordance with applicable data protection laws and this Privacy Policy. Specifically, we use a variety of contractual, 
                  technical, and organizational measures as appropriate for such transfers, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-base">
                  <li>Standard Contractual Clauses (SCCs)</li>
                  <li>Adequacy decisions by relevant data protection authorities</li>
                  <li>Binding corporate rules and certification programs</li>
                  <li>Technical protections and encryption</li>
                  <li>Practices to challenge disproportionate or unlawful government authority requests</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section B */}
          <div id="section-b" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              Section B: Your Rights and Controls
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-6">B1. Your Privacy Rights</h3>
                
                <div className="space-y-6">
                  <div className="border rounded-lg p-6 hover:bg-muted/10 transition-colors">
                    <h4 className="font-semibold text-lg mb-3">Access, Correct, Update, or Delete Your Personal Information</h4>
                    <p className="text-muted-foreground text-base leading-relaxed mb-3">
                      You have a right to confirm whether we process your personal information and to access and receive a copy of the personal 
                      information we process about you. You may also correct or update out-of-date or inaccurate personal information or request 
                      that we delete personal information that we hold about you.
                    </p>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      To request a copy of your personal information, please visit nexacore-innovations.com/account/privacy or contact us at 
                      <a href="mailto:privacy@nexacore-innovations.com" className="text-primary hover:underline"> privacy@nexacore-innovations.com</a>. 
                      Under the "Account" section of our website, you can access and update information about your account, including your contact 
                      information, payment information, and various related information about your account.
                    </p>
                  </div>

                  <div className="border rounded-lg p-6 hover:bg-muted/10 transition-colors">
                    <h4 className="font-semibold text-lg mb-3">Portability and Downloading a Copy of Your Personal Information</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      You can request portability of or download a copy of your personal information. If you are the account owner, 
                      to download a copy of your personal information, please contact us at 
                      <a href="mailto:privacy@nexacore-innovations.com" className="text-primary hover:underline"> privacy@nexacore-innovations.com</a>.
                    </p>
                  </div>

                  <div className="border rounded-lg p-6 hover:bg-muted/10 transition-colors">
                    <h4 className="font-semibold text-lg mb-3">Objection, Restriction, and Withdrawal of Consent</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      You can object to or request that we restrict processing of your personal information. If we have collected and are processing 
                      your personal information with your consent, then you can withdraw your consent at any time. Withdrawing your consent will not 
                      affect the lawfulness of any processing we conducted prior to your withdrawal.
                    </p>
                  </div>

                  <div className="border rounded-lg p-6 hover:bg-muted/10 transition-colors">
                    <h4 className="font-semibold text-lg mb-3">Right to Complain</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      You have the right to complain to a data protection authority about our processing of your personal information but we encourage 
                      you to first contact us with any questions or concerns.
                    </p>
                  </div>

                  <div className="border rounded-lg p-6 hover:bg-muted/10 transition-colors">
                    <h4 className="font-semibold text-lg mb-3">Right Not to Be Subject to Automated Decision Making</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      You may have a right not to be subject to a decision made solely using automated means, where such decision would have a legal 
                      effect on you or produce a similarly significant effect.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6">B2. Communication and Marketing Preferences</h3>
                
                <div className="space-y-6">
                  <div className="bg-muted/20 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">Email and Text Messages</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      If you no longer want to receive certain communications from us via email or text message, please access the "Communication Preferences" 
                      option within the "Account" section of our website. Alternatively, click the "unsubscribe" link in the email or reply STOP to the 
                      text message. Please note that you cannot unsubscribe from transactional messages relating to your account or services.
                    </p>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">Marketing Communications</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      You can indicate your choices regarding marketing communications in the "Privacy and Data Settings" within the "Account" section 
                      of our website.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6">B3. Contact and Questions</h3>
                <p className="text-base">
                  If you want to exercise any of your rights, or have a question regarding our privacy practices, please contact our 
                  Data Protection Officer/Privacy Office at 
                  <a href="mailto:privacy@nexacore-innovations.com" className="text-primary hover:underline"> privacy@nexacore-innovations.com</a>.
                </p>
              </div>
            </div>
          </div>

          {/* Section C */}
          <div id="section-c" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              Section C: Access to Account and Project Information
            </h2>
            
            <div className="space-y-8">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">C1. Sharing Your Account with Others</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  As a NexaCore client, if you share your account with others in your organization, please ensure that they are aware of and have read 
                  this Privacy Policy. This Privacy Policy applies to their use of NexaCore services. Please note that the account owner controls the 
                  NexaCore account and all associated information. If you share or otherwise allow others to have access to your account, they may be 
                  able to see project information, account information, and service history.
                </p>
              </div>
              
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">C2. Project Access and Collaboration</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  <strong>Project Information:</strong> Your project data, files, and related information are accessible to team members you designate and NexaCore personnel involved in 
                  service delivery.
                </p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  <strong>Collaborative Features:</strong> When you use collaborative features of our service, information you share may be visible to other designated participants.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">C3. Removing Device Access to Your Account</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  To remove access to your NexaCore account from devices that are logged into the account, visit the "Account" section of our website, 
                  locate the "Security Settings" option, and follow the instructions to sign out of your devices. If you sell or return a device, 
                  be sure to first log out of your NexaCore account.
                </p>
              </div>
            </div>
          </div>

          {/* Section D */}
          <div id="section-d" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              Section D: Cookies and Other Technologies
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-6">D1. Types of Technologies We Use</h3>
                <p className="mb-6 text-base leading-relaxed">
                  We, our Service Providers, and marketing partners use cookies, pixel tags, hashed identifiers, and similar technologies for various reasons.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Small data files stored on your device when you access websites and online services.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Pixel Tags</h4>
                    <p className="text-sm text-muted-foreground">
                      Often work in conjunction with cookies to measure and improve our services.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Local Storage</h4>
                    <p className="text-sm text-muted-foreground">
                      Browser storage technologies (HTML5, IndexedDB, WebSQL) that store data on your device.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Hashed Identifiers</h4>
                    <p className="text-sm text-muted-foreground">
                      Privacy-protected contact information converted into alphanumeric sequences that cannot reveal your identity by themselves.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6">D2. Why We Use These Technologies</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-muted rounded-lg text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-muted p-3 text-left font-semibold">Purpose</th>
                        <th className="border border-muted p-3 text-left font-semibold">Description</th>
                        <th className="border border-muted p-3 text-left font-semibold">Technologies Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-3 font-medium">Essential Functions</td>
                        <td className="border border-muted p-3">Making it easy to access our service by remembering you when you return</td>
                        <td className="border border-muted p-3">Cookies, local storage</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-3 font-medium">Service Delivery</td>
                        <td className="border border-muted p-3">Providing core functionality and personalized experiences</td>
                        <td className="border border-muted p-3">Cookies, pixel tags, local storage</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-3 font-medium">Analytics and Improvement</td>
                        <td className="border border-muted p-3">Understanding how our service is used and improving performance</td>
                        <td className="border border-muted p-3">Cookies, pixel tags, analytics identifiers</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-3 font-medium">Marketing and Communication</td>
                        <td className="border border-muted p-3">Delivering and measuring effectiveness of marketing communications</td>
                        <td className="border border-muted p-3">Cookies, pixel tags, hashed identifiers</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-3 font-medium">Security and Fraud Prevention</td>
                        <td className="border border-muted p-3">Protecting our service and users from security threats</td>
                        <td className="border border-muted p-3">Cookies, device identifiers</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6">D3. How to Exercise Choice Regarding These Technologies</h3>
                
                <div className="space-y-6">
                  <div className="bg-primary/5 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">Cookie Preferences</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      You can manage cookie preferences through your browser settings or our cookie preference center available at 
                      nexacore-innovations.com/cookies.
                    </p>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">Browser Controls</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      Most browsers allow you to control cookie settings in the privacy or security section of your browser preferences.
                    </p>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">Marketing Opt-Out</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      To opt out of marketing-related tracking, please visit nexacore-innovations.com/account/privacy and adjust your marketing preferences.
                    </p>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">Device Settings</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      For mobile devices, you can control advertising identifiers in your device's privacy settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section E */}
          <div id="section-e" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              Section E: Other Important Privacy Information
            </h2>
            
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-semibold mb-6">E1. Security Measures</h3>
                <p className="mb-6 text-base leading-relaxed">
                  We implement comprehensive security measures to protect your personal information, including:
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold mb-3">Technical Safeguards</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Encryption of data in transit and at rest using industry-standard protocols</li>
                      <li>Secure server infrastructure with firewalls and intrusion detection</li>
                      <li>Multi-factor authentication and access controls</li>
                      <li>Regular security assessments and penetration testing</li>
                      <li>Automated threat detection and response systems</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold mb-3">Administrative Safeguards</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Employee training on data protection and security best practices</li>
                      <li>Role-based access controls and need-to-know principles</li>
                      <li>Background checks for personnel with access to sensitive data</li>
                      <li>Incident response procedures and breach notification protocols</li>
                      <li>Regular policy reviews and updates</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold mb-3">Physical Safeguards</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Secure facilities with controlled access</li>
                      <li>Environmental controls and monitoring systems</li>
                      <li>Secure disposal of physical media and equipment</li>
                      <li>Visitor management and escort procedures</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6">E2. Data Retention</h3>
                <p className="mb-6 text-base leading-relaxed">
                  We retain personal information for as long as necessary to fulfill the purposes described in this Privacy Policy, including:
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-muted rounded-lg text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-muted p-3 text-left font-semibold">Information Type</th>
                        <th className="border border-muted p-3 text-left font-semibold">Retention Period</th>
                        <th className="border border-muted p-3 text-left font-semibold">Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-3 font-medium">Account Information</td>
                        <td className="border border-muted p-3">Duration of service relationship plus 7 years</td>
                        <td className="border border-muted p-3">Service delivery, legal compliance</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-3 font-medium">Project Files and Deliverables</td>
                        <td className="border border-muted p-3">10 years from project completion</td>
                        <td className="border border-muted p-3">Client access, legal protection</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-3 font-medium">Financial Records</td>
                        <td className="border border-muted p-3">7 years from transaction date</td>
                        <td className="border border-muted p-3">Tax compliance, auditing</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-3 font-medium">Marketing Data</td>
                        <td className="border border-muted p-3">Until opt-out or 3 years of inactivity</td>
                        <td className="border border-muted p-3">Marketing communications</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-3 font-medium">Usage Analytics</td>
                        <td className="border border-muted p-3">26 months from collection</td>
                        <td className="border border-muted p-3">Service improvement</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="border border-muted p-3 font-medium">Support Communications</td>
                        <td className="border border-muted p-3">3 years from last contact</td>
                        <td className="border border-muted p-3">Customer service, quality assurance</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-base">
                  We take reasonable measures to securely destroy or de-identify personal information when it is no longer required.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6">E3. Third-Party Links and Services</h3>
                <p className="text-base leading-relaxed">
                  Our service may contain links to third-party websites, platforms, and applications. These third parties have their own privacy policies, 
                  and this Privacy Policy does not apply to their practices. We recommend reviewing their privacy policies before providing any personal information.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6">E4. Minors and Children's Privacy</h3>
                <p className="text-base leading-relaxed">
                  Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children under 18. 
                  If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information promptly.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6">E5. Regional Privacy Rights</h3>
                
                <div className="space-y-6">
                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">For European Union/UK Residents (GDPR/UK GDPR)</h4>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Legal Basis for Processing:</strong> We process your personal data based on performance of contract with you, 
                        our legitimate business interests, your consent (where applicable), and legal compliance requirements.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Additional Rights:</strong> In addition to the rights described in Section B, you have right to data portability, 
                        right to restrict processing, right to object to processing based on legitimate interests, and right to lodge a complaint with your local data protection authority.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Data Protection Officer:</strong> <a href="mailto:privacy@nexacore-innovations.com" className="text-primary hover:underline">privacy@nexacore-innovations.com</a>
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">For California Residents (CCPA/CPRA)</h4>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong>Your Rights Include:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-3">
                        <li><strong>Right to Know:</strong> What personal information we collect, use, and share</li>
                        <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
                        <li><strong>Right to Opt-Out:</strong> Of the sale or sharing of personal information</li>
                        <li><strong>Right to Non-Discrimination:</strong> For exercising your privacy rights</li>
                        <li><strong>Right to Correct:</strong> Inaccurate personal information</li>
                      </ul>
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> We do not sell personal information to third parties.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Requests:</strong> To exercise your rights, contact us at privacy@nexacore-innovations.com.
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3">For Other Jurisdictions</h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      We comply with applicable data protection laws in all jurisdictions where we operate. Contact us for information about 
                      your specific rights under local laws.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6">E6. Changes to This Privacy Policy</h3>
                <p className="text-base leading-relaxed mb-4">
                  We may update this Privacy Policy to reflect changes in our practices, services, or applicable laws. We will notify you 
                  of material changes through:
                </p>
                <ul className="list-disc list-inside space-y-1 text-base mb-4">
                  <li>Email notifications to registered users</li>
                  <li>Prominent notices on our website</li>
                  <li>Direct communication for significant changes</li>
                  <li>In-service notifications where appropriate</li>
                </ul>
                <p className="text-base leading-relaxed">
                  Your continued use of our services after any modifications indicates your acceptance of the updated Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6">E7. Business Transfers</h3>
                <p className="text-base leading-relaxed">
                  In the event of a merger, acquisition, or sale of all or a portion of our assets, personal information may be transferred 
                  to the acquiring entity, provided they agree to treat the information in accordance with this Privacy Policy.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-12 bg-primary/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">E8. Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-primary" />
                  General Privacy Inquiries
                </h3>
                <p className="text-sm mb-1">Email: <a href="mailto:privacy@nexacore-innovations.com" className="text-primary hover:underline">privacy@nexacore-innovations.com</a></p>
                <p className="text-sm">Website: nexacore-innovations.com/privacy</p>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  Data Protection Officer
                </h3>
                <p className="text-sm">Email: <a href="mailto:dpo@nexacore-innovations.com" className="text-primary hover:underline">dpo@nexacore-innovations.com</a></p>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-primary" />
                  Customer Support
                </h3>
                <p className="text-sm mb-1">Email: <a href="mailto:support@nexacore-innovations.com" className="text-primary hover:underline">support@nexacore-innovations.com</a></p>
                <p className="text-sm">Website: <a href="/contact" className="text-primary hover:underline">nexacore-innovations.com/contact</a></p>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Physical Address
                </h3>
                <p className="text-sm">
                  NexaCore Innovations<br />
                  [Insert Physical Address]<br />
                  [City, Country, Postal Code]
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-primary/20">
              <h3 className="font-semibold mb-3">E9. Governing Law</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This Privacy Policy is governed by the laws of Ghana and applicable international data protection regulations. 
                Any disputes will be resolved in accordance with these laws.
              </p>
              <h3 className="font-semibold mb-3">E10. Language</h3>
              <p className="text-sm text-muted-foreground">
                This Privacy Policy is originally written in English. Translations may be provided for convenience, 
                but in case of conflicts, the English version prevails.
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-lg p-6">
            <p className="mb-2"><strong>Last Updated:</strong> [Insert Date] • <strong>Version:</strong> 3.0</p>
            <p>
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
