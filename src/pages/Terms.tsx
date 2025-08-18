import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Badge } from '../components/ui/badge';
import { FileText, Mail, Phone, MapPin, ChevronRight, Shield } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-16 pb-8 lg:pt-24 lg:pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
              <FileText className="w-4 h-4 mr-2" />
              Terms and Conditions
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-gradient-hero">Terms and</span>{' '}
              <span className="text-foreground">Conditions</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Legal terms governing your use of NexaCore Innovations services
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-muted/30 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { href: "#acceptance", text: "1. Acceptance of Terms" },
                { href: "#services", text: "2. Service Description" },
                { href: "#accounts", text: "3. User Accounts and Registration" },
                { href: "#obligations", text: "4. User Obligations and Conduct" },
                { href: "#intellectual-property", text: "5. Intellectual Property Rights" },
                { href: "#service-terms", text: "6. Service Availability and Modifications" },
                { href: "#payment", text: "7. Payment Terms and Billing" },
                { href: "#projects", text: "8. Project Terms and Deliverables" },
                { href: "#liability", text: "9. Limitation of Liability" },
                { href: "#indemnification", text: "10. Indemnification" },
                { href: "#termination", text: "11. Termination" },
                { href: "#dispute-resolution", text: "12. Dispute Resolution" },
                { href: "#governing-law", text: "13. Governing Law" },
                { href: "#contact", text: "14. Contact Information" }
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
                These Terms and Conditions ("Terms") govern your use of the services provided by 
                <strong> NexaCore Innovations</strong> ("we," "our," or "us"), including our website at 
                <a href="https://nexacore-innovations.com" className="text-primary hover:underline"> nexacore-innovations.com</a> 
                and all related engineering, software development, design, and analytics services (collectively, the "Services").
              </p>
              <p>
                By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, 
                you may not access or use our Services.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <div id="acceptance" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              1. Acceptance of Terms
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">1.1 Agreement to Terms</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  By accessing, browsing, or using any part of our Services, you acknowledge that you have read, understood, 
                  and agree to be bound by these Terms and our Privacy Policy. These Terms constitute a legally binding agreement 
                  between you and NexaCore Innovations.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">1.2 Capacity to Enter Agreement</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  You represent and warrant that you are at least 18 years old and have the legal capacity to enter into this agreement. 
                  If you are using our Services on behalf of an organization, you represent that you have the authority to bind 
                  that organization to these Terms.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">1.3 Updates to Terms</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms 
                  on our website with a revised "Last Updated" date. Your continued use of our Services after such changes 
                  constitutes acceptance of the updated Terms.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div id="services" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              2. Service Description
            </h2>
            
            <div className="space-y-6">
              <p className="text-base leading-relaxed">
                NexaCore Innovations provides comprehensive technical and creative services to clients worldwide. Our Services include:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-3">Engineering & Technical Services</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>CAD Design and Engineering</li>
                    <li>3D Modeling and Animation</li>
                    <li>Technical Consulting</li>
                    <li>System Integration</li>
                    <li>AI/ML Solutions</li>
                    <li>Blockchain and Web3 Development</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-3">Software & App Development</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Web Application Development</li>
                    <li>Mobile App Development</li>
                    <li>Custom Software Solutions</li>
                    <li>API Development and Integration</li>
                    <li>E-commerce Solutions</li>
                    <li>Database Design and Management</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-3">Creative & Branding</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>UI/UX Design</li>
                    <li>Brand Identity Design</li>
                    <li>Graphic Design</li>
                    <li>Digital Marketing</li>
                    <li>Content Creation</li>
                    <li>Marketing Strategy</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-3">Data & Analytics</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Data Analysis and Visualization</li>
                    <li>Business Intelligence</li>
                    <li>Excel Automation and Dashboards</li>
                    <li>Database Optimization</li>
                    <li>Performance Analytics</li>
                    <li>Custom Reporting Solutions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div id="accounts" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              3. User Accounts and Registration
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">3.1 Account Creation</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  To access certain Services, you may need to create an account. You agree to provide accurate, current, 
                  and complete information during registration and to update such information to keep it accurate, current, and complete.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">3.2 Account Security</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities 
                  that occur under your account. You agree to notify us immediately of any unauthorized use of your account 
                  or any other breach of security.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">3.3 Account Verification</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  We may require verification of your identity or business information before providing certain Services. 
                  You agree to provide such verification promptly upon request.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div id="obligations" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              4. User Obligations and Conduct
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">4.1 Permitted Use</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  You may use our Services only for lawful purposes and in accordance with these Terms. You agree not to use our Services:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-base ml-4">
                  <li>In any way that violates applicable laws or regulations</li>
                  <li>To transmit harmful, offensive, or inappropriate content</li>
                  <li>To interfere with or disrupt our Services or servers</li>
                  <li>To attempt unauthorized access to our systems or other users' accounts</li>
                  <li>To engage in any fraudulent or deceptive practices</li>
                  <li>To infringe upon intellectual property rights of others</li>
                </ul>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">4.2 Content Standards</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Any content you provide to us must be accurate, lawful, and not infringe upon any third-party rights. 
                  You are solely responsible for the content you provide and its consequences.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">4.3 Cooperation</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  You agree to cooperate with us in good faith and provide timely feedback, approvals, and materials 
                  necessary for the successful completion of any Services.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div id="intellectual-property" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              5. Intellectual Property Rights
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">5.1 Our Intellectual Property</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  All content, features, and functionality of our Services, including but not limited to text, graphics, logos, 
                  software, and design elements, are owned by NexaCore Innovations and are protected by copyright, trademark, 
                  and other intellectual property laws.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">5.2 Work Product and Deliverables</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  Unless otherwise specified in a separate agreement:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-base">
                  <li>Custom work created specifically for you will be owned by you upon full payment</li>
                  <li>We retain ownership of our methodologies, processes, and general knowledge</li>
                  <li>We may retain samples of work for portfolio purposes (with your consent)</li>
                  <li>Any pre-existing intellectual property remains with its original owner</li>
                </ul>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">5.3 License Grant</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Subject to these Terms and your compliance with them, we grant you a limited, non-exclusive, 
                  non-transferable license to access and use our Services for your intended business purposes.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">5.4 Client Materials</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  You retain ownership of any materials you provide to us. By providing materials, you grant us a license 
                  to use them solely for the purpose of providing Services to you.
                </p>
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div id="service-terms" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              6. Service Availability and Modifications
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">6.1 Service Availability</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  We strive to provide reliable Services but cannot guarantee uninterrupted access. We may temporarily 
                  suspend Services for maintenance, updates, or other operational reasons with reasonable notice when possible.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">6.2 Service Modifications</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  We reserve the right to modify, update, or discontinue any aspect of our Services at any time. 
                  We will provide reasonable notice of material changes that affect your existing projects or Services.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">6.3 Third-Party Services</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Our Services may integrate with or rely on third-party services. We are not responsible for the availability, 
                  performance, or terms of such third-party services.
                </p>
              </div>
            </div>
          </div>

          {/* Section 7 */}
          <div id="payment" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              7. Payment Terms and Billing
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">7.1 Fees and Payment</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Fees for Services will be as specified in your project agreement or statement of work. All fees are due 
                  according to the payment schedule specified in your agreement. Payment terms are typically net 30 days 
                  unless otherwise specified.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">7.2 Late Payments</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Late payments may be subject to interest charges of 1.5% per month (or the maximum allowed by law) and 
                  may result in suspension of Services until payment is received.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">7.3 Disputes</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Any billing disputes must be raised within 30 days of the invoice date. We will work in good faith 
                  to resolve any legitimate billing concerns.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">7.4 Taxes</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  You are responsible for any applicable taxes, duties, or fees related to your use of our Services, 
                  except for taxes based on our income.
                </p>
              </div>
            </div>
          </div>

          {/* Section 8 */}
          <div id="projects" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              8. Project Terms and Deliverables
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">8.1 Project Scope</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Each project will be governed by a separate statement of work or project agreement that details 
                  the specific scope, deliverables, timeline, and fees. Any changes to the project scope may require 
                  additional fees and timeline adjustments.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">8.2 Client Responsibilities</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  Successful project completion requires your cooperation, including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                  <li>Providing necessary materials, information, and access</li>
                  <li>Timely review and approval of deliverables</li>
                  <li>Clear communication of requirements and feedback</li>
                  <li>Payment according to agreed schedule</li>
                </ul>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">8.3 Delivery and Acceptance</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Deliverables will be deemed accepted if you do not provide written notice of non-conformance within 
                  5 business days of delivery. Acceptance criteria will be specified in the project agreement.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">8.4 Revisions and Changes</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Minor revisions within the agreed scope are included. Major changes or additional revisions 
                  may incur additional fees and timeline extensions.
                </p>
              </div>
            </div>
          </div>

          {/* Section 9 */}
          <div id="liability" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              9. Limitation of Liability
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">9.1 Disclaimer of Warranties</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
                  INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                  OR NON-INFRINGEMENT.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">9.2 Limitation of Damages</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM OR RELATED TO 
                  OUR SERVICES SHALL NOT EXCEED THE AMOUNT PAID BY YOU FOR THE SPECIFIC SERVICES GIVING RISE TO THE CLAIM 
                  IN THE 12 MONTHS PRECEDING THE CLAIM.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">9.3 Exclusion of Consequential Damages</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
                  INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES.
                </p>
              </div>
            </div>
          </div>

          {/* Section 10 */}
          <div id="indemnification" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              10. Indemnification
            </h2>
            
            <div className="bg-muted/20 rounded-lg p-6">
              <p className="text-muted-foreground text-base leading-relaxed">
                You agree to indemnify, defend, and hold harmless NexaCore Innovations, its officers, directors, employees, 
                and agents from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable 
                attorney fees) arising from or related to: (a) your use of our Services; (b) your violation of these Terms; 
                (c) your violation of any applicable laws; or (d) any content or materials you provide to us.
              </p>
            </div>
          </div>

          {/* Section 11 */}
          <div id="termination" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              11. Termination
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">11.1 Termination by Either Party</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Either party may terminate these Terms or any project agreement at any time with written notice. 
                  Termination does not relieve either party of obligations incurred prior to termination.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">11.2 Effect of Termination</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Upon termination, you must pay for all Services provided up to the termination date. 
                  We will deliver any completed work and return your materials in our possession.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">11.3 Survival</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  The following sections shall survive termination: Intellectual Property Rights, Payment Terms, 
                  Limitation of Liability, Indemnification, and Governing Law.
                </p>
              </div>
            </div>
          </div>

          {/* Section 12 */}
          <div id="dispute-resolution" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              12. Dispute Resolution
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">12.1 Informal Resolution</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Before pursuing formal dispute resolution, the parties agree to attempt to resolve any disputes 
                  through good faith negotiations for a period of at least 30 days.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">12.2 Mediation</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  If informal negotiations fail, disputes shall be submitted to mediation before a mutually agreed mediator. 
                  The costs of mediation shall be shared equally between the parties.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">12.3 Arbitration</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  If mediation fails, any remaining disputes shall be resolved through binding arbitration under the rules 
                  of a recognized arbitration authority. The arbitration shall be conducted in English.
                </p>
              </div>
            </div>
          </div>

          {/* Section 13 */}
          <div id="governing-law" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              13. Governing Law
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">13.1 Applicable Law</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of Ghana, without regard 
                  to its conflict of law principles.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">13.2 Jurisdiction</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Subject to the dispute resolution procedures above, the courts of Ghana shall have exclusive jurisdiction 
                  over any disputes arising under these Terms.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">13.3 Severability</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions 
                  shall remain in full force and effect.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">13.4 Entire Agreement</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  These Terms, together with any applicable project agreements and our Privacy Policy, constitute the 
                  entire agreement between you and NexaCore Innovations regarding the use of our Services.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div id="contact" className="mt-12 bg-primary/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">14. Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-primary" />
                  General Inquiries
                </h3>
                <p className="text-sm mb-1">Email: <a href="mailto:info@nexacore-innovations.com" className="text-primary hover:underline">info@nexacore-innovations.com</a></p>
                <p className="text-sm">Website: <a href="/" className="text-primary hover:underline">nexacore-innovations.com</a></p>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary" />
                  Legal Department
                </h3>
                <p className="text-sm">Email: <a href="mailto:legal@nexacore-innovations.com" className="text-primary hover:underline">legal@nexacore-innovations.com</a></p>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-primary" />
                  Customer Support
                </h3>
                <p className="text-sm mb-1">Phone: <a href="tel:+233209628907" className="text-primary hover:underline">+233209628907</a></p>
                <p className="text-sm">Email: <a href="mailto:support@nexacore-innovations.com" className="text-primary hover:underline">support@nexacore-innovations.com</a></p>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Physical Address
                </h3>
                <p className="text-sm">
                  NexaCore Innovations<br />
                  Accra, Ghana
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-primary/20">
              <p className="text-sm text-muted-foreground">
                For questions about these Terms and Conditions, please contact our legal department at 
                <a href="mailto:legal@nexacore-innovations.com" className="text-primary hover:underline"> legal@nexacore-innovations.com</a>.
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-lg p-6">
            <p className="mb-2"><strong>Last Updated:</strong> January 1, 2025 • <strong>Version:</strong> 1.0</p>
            <p>
              These Terms and Conditions are effective as of the date first written above and will remain in effect 
              until terminated in accordance with the terms herein.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
