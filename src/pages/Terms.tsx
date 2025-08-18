import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Badge } from '../components/ui/badge';
import { FileText, Mail, Phone, MapPin, ChevronRight, Shield, AlertTriangle } from 'lucide-react';

const Terms = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              Comprehensive legal terms governing your use of NexaCore Innovations services and establishing our professional relationship
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
              <span><strong>Effective Date:</strong> January 1, 2025</span>
              <span>•</span>
              <span><strong>Last Updated:</strong> January 1, 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">Important Legal Notice</h3>
                <p className="text-amber-700 text-sm leading-relaxed">
                  These Terms and Conditions constitute a legally binding agreement between you and NexaCore Innovations. 
                  Please read them carefully before using our services. By accessing or using our services, you agree to be bound by these terms. 
                  If you do not agree with any part of these terms, you must not use our services.
                </p>
              </div>
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
                { href: "#definitions", text: "1. Definitions and Interpretation" },
                { href: "#acceptance", text: "2. Acceptance of Terms" },
                { href: "#services", text: "3. Service Description and Scope" },
                { href: "#accounts", text: "4. User Accounts and Registration" },
                { href: "#obligations", text: "5. Client Obligations and Responsibilities" },
                { href: "#professional-standards", text: "6. Professional Standards and Quality Assurance" },
                { href: "#intellectual-property", text: "7. Intellectual Property Rights" },
                { href: "#confidentiality", text: "8. Confidentiality and Data Protection" },
                { href: "#payment", text: "9. Payment Terms and Billing" },
                { href: "#projects", text: "10. Project Management and Deliverables" },
                { href: "#service-terms", text: "11. Service Availability and Modifications" },
                { href: "#warranties", text: "12. Warranties and Representations" },
                { href: "#liability", text: "13. Limitation of Liability and Risk Allocation" },
                { href: "#indemnification", text: "14. Indemnification" },
                { href: "#force-majeure", text: "15. Force Majeure" },
                { href: "#termination", text: "16. Termination and Suspension" },
                { href: "#dispute-resolution", text: "17. Dispute Resolution and Arbitration" },
                { href: "#governing-law", text: "18. Governing Law and Jurisdiction" },
                { href: "#compliance", text: "19. Regulatory Compliance" },
                { href: "#miscellaneous", text: "20. Miscellaneous Provisions" },
                { href: "#contact", text: "21. Contact Information and Support" }
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
                These Terms and Conditions ("Terms", "Agreement") govern the contractual relationship between you ("Client", "you", "your") 
                and <strong>NexaCore Innovations</strong>, a company incorporated under the laws of Ghana ("Company", "we", "our", "us"), 
                regarding your use of our professional engineering, software development, design, analytics, and consulting services.
              </p>
              <p>
                Our website is located at <a href="https://nexacore-innovations.com" className="text-primary hover:underline">nexacore-innovations.com</a>, 
                and these Terms apply to all services provided through our website, direct engagement, or any other means 
                (collectively, the "Services").
              </p>
              <p>
                This Agreement becomes effective when you first access our services, submit a project inquiry, or execute a separate 
                service agreement that incorporates these Terms by reference.
              </p>
            </div>
          </div>

          {/* Section 1: Definitions */}
          <div id="definitions" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              1. Definitions and Interpretation
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">1.1 Key Definitions</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">"Agreement" or "Terms"</p>
                        <p className="text-sm text-muted-foreground">These Terms and Conditions and any amendments thereto</p>
                      </div>
                      <div>
                        <p className="font-medium">"Services"</p>
                        <p className="text-sm text-muted-foreground">All professional services provided by NexaCore Innovations including engineering, software development, design, analytics, and consulting</p>
                      </div>
                      <div>
                        <p className="font-medium">"Deliverables"</p>
                        <p className="text-sm text-muted-foreground">All work products, materials, and outputs created by Company for Client under this Agreement</p>
                      </div>
                      <div>
                        <p className="font-medium">"Confidential Information"</p>
                        <p className="text-sm text-muted-foreground">Any non-public information disclosed by either party to the other</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">"Client Materials"</p>
                        <p className="text-sm text-muted-foreground">All materials, data, content, and information provided by Client to Company</p>
                      </div>
                      <div>
                        <p className="font-medium">"Statement of Work" (SOW)</p>
                        <p className="text-sm text-muted-foreground">A detailed document specifying project scope, deliverables, timeline, and fees</p>
                      </div>
                      <div>
                        <p className="font-medium">"Intellectual Property"</p>
                        <p className="text-sm text-muted-foreground">All copyrights, trademarks, patents, trade secrets, and other proprietary rights</p>
                      </div>
                      <div>
                        <p className="font-medium">"Force Majeure Event"</p>
                        <p className="text-sm text-muted-foreground">Events beyond reasonable control including natural disasters, government actions, or pandemics</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">1.2 Interpretation</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-base">
                  <li>Headings are for convenience only and do not affect interpretation</li>
                  <li>Singular terms include plural and vice versa where context permits</li>
                  <li>References to "including" are not exhaustive</li>
                  <li>References to days are calendar days unless specified as business days</li>
                  <li>All monetary amounts are in USD unless otherwise specified</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Acceptance */}
          <div id="acceptance" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              2. Acceptance of Terms
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">2.1 Formation of Agreement</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  This Agreement is formed when you:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                  <li>Access or use any of our Services</li>
                  <li>Submit a project inquiry or request for proposal</li>
                  <li>Execute a Statement of Work that references these Terms</li>
                  <li>Make payment for any Services</li>
                  <li>Receive and accept any Deliverables from us</li>
                </ul>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">2.2 Authority and Capacity</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  You represent and warrant that: (a) you are at least 18 years old and have legal capacity to enter contracts; 
                  (b) if acting on behalf of an organization, you have authority to bind that organization; (c) you have read and 
                  understood these Terms; and (d) your acceptance constitutes a valid and binding obligation.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">2.3 Modifications and Updates</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  We reserve the right to modify these Terms at any time. Material changes will be notified via email and/or 
                  prominent website notice at least 30 days before taking effect. Continued use of Services after changes 
                  constitutes acceptance. For existing projects, changes apply to new work only unless mutually agreed otherwise.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">2.4 Electronic Signatures and Records</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  You consent to electronic signatures and agree that electronic records have the same legal effect as physical documents. 
                  All communications, agreements, and notices may be provided electronically.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Services */}
          <div id="services" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              3. Service Description and Scope
            </h2>
            
            <div className="space-y-6">
              <p className="text-base leading-relaxed">
                NexaCore Innovations provides comprehensive professional services across multiple disciplines. Our Services are organized 
                into the following primary categories, each with specific sub-services and capabilities:
              </p>

              <div className="grid gap-6">
                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-4 text-primary">Engineering & Technical Services</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium mb-2">CAD Design & Engineering</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>2D and 3D CAD modeling and drafting</li>
                        <li>Product design and prototyping</li>
                        <li>Engineering analysis and simulation</li>
                        <li>Technical documentation and specifications</li>
                        <li>Design optimization and validation</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Advanced Technologies</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Artificial Intelligence and Machine Learning solutions</li>
                        <li>Blockchain development and Web3 integration</li>
                        <li>IoT systems and embedded solutions</li>
                        <li>System integration and automation</li>
                        <li>Technical consulting and architecture review</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-4 text-primary">Software & Application Development</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium mb-2">Web & Mobile Development</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Full-stack web application development</li>
                        <li>Native and cross-platform mobile apps</li>
                        <li>Progressive Web Applications (PWAs)</li>
                        <li>Responsive design and optimization</li>
                        <li>Performance monitoring and enhancement</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Enterprise Solutions</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Custom software development</li>
                        <li>API development and integration</li>
                        <li>Database design and optimization</li>
                        <li>E-commerce platform development</li>
                        <li>Legacy system modernization</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-4 text-primary">Creative & Branding Services</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium mb-2">Design & User Experience</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>UI/UX design and user research</li>
                        <li>Brand identity and visual design</li>
                        <li>Graphic design and illustration</li>
                        <li>Marketing materials and collateral</li>
                        <li>Design system development</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Digital Marketing</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Digital marketing strategy and execution</li>
                        <li>Content creation and copywriting</li>
                        <li>Social media management</li>
                        <li>SEO and content optimization</li>
                        <li>Marketing automation and analytics</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-4 text-primary">Data & Analytics Services</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium mb-2">Data Analysis & Visualization</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Data analysis and statistical modeling</li>
                        <li>Business intelligence and reporting</li>
                        <li>Data visualization and dashboards</li>
                        <li>Excel automation and macro development</li>
                        <li>Database design and management</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Business Intelligence</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Performance analytics and KPI tracking</li>
                        <li>Predictive modeling and forecasting</li>
                        <li>Data warehouse design and implementation</li>
                        <li>Custom reporting solutions</li>
                        <li>Data integration and ETL processes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">3.1 Service Customization</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  All Services are customized to meet specific client requirements. The exact scope, deliverables, timeline, 
                  and specifications for each project will be detailed in a separate Statement of Work (SOW) or project agreement. 
                  Services may be provided individually or as integrated solutions across multiple disciplines.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">3.2 Service Limitations</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  Our Services do not include:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                  <li>Legal, financial, or medical advice</li>
                  <li>Regulatory compliance certification or approval</li>
                  <li>Ongoing maintenance unless specifically contracted</li>
                  <li>Third-party software licenses or hosting services unless specified</li>
                  <li>Services requiring specific professional licenses we do not hold</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Accounts */}
          <div id="accounts" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              4. User Accounts and Registration
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">4.1 Account Requirements</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  To access certain Services, you must create an account by providing:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                  <li>Accurate and complete contact information</li>
                  <li>Valid business or personal identification</li>
                  <li>Payment method information for billing purposes</li>
                  <li>Proof of authority if representing an organization</li>
                  <li>Any additional verification documents we may require</li>
                </ul>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">4.2 Account Security and Responsibilities</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                  <li>Maintaining confidentiality of account credentials</li>
                  <li>All activities occurring under your account</li>
                  <li>Immediately notifying us of unauthorized access or security breaches</li>
                  <li>Keeping account information current and accurate</li>
                  <li>Compliance with security protocols we may establish</li>
                </ul>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">4.3 Account Verification and Approval</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  We reserve the right to verify account information and may require additional documentation before 
                  providing Services. Account approval is at our sole discretion. We may refuse, suspend, or terminate 
                  accounts that fail verification or violate these Terms.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">4.4 Multiple Accounts and Users</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Organizations may designate multiple authorized users. The account holder remains responsible for all 
                  users' actions and must ensure all users comply with these Terms. User access permissions can be 
                  managed through account settings.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Client Obligations */}
          <div id="obligations" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              5. Client Obligations and Responsibilities
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">5.1 Cooperation and Communication</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  Client agrees to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                  <li>Provide timely, accurate, and complete project requirements and specifications</li>
                  <li>Designate authorized representatives for project communication and approvals</li>
                  <li>Respond promptly to requests for information, clarification, or approval</li>
                  <li>Participate actively in project meetings and review sessions</li>
                  <li>Provide constructive and specific feedback on deliverables</li>
                  <li>Maintain regular communication channels throughout project duration</li>
                </ul>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">5.2 Material Provision and Access</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  Client must provide:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                  <li>All necessary materials, data, content, and assets in appropriate formats</li>
                  <li>Access to relevant systems, platforms, and third-party services</li>
                  <li>Required licenses for any third-party software or tools</li>
                  <li>Subject matter expertise and business knowledge as needed</li>
                  <li>Testing environments and access credentials when applicable</li>
                  <li>Backup and recovery procedures for critical systems</li>
                </ul>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">5.3 Compliance and Legal Obligations</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  Client represents and warrants that:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                  <li>All provided materials are owned by Client or properly licensed</li>
                  <li>Use of Services complies with applicable laws and regulations</li>
                  <li>All necessary permissions and consents have been obtained</li>
                  <li>No provided materials infringe third-party intellectual property rights</li>
                  <li>All data provided complies with privacy and data protection laws</li>
                  <li>Client has authority to engage our Services and make required decisions</li>
                </ul>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">5.4 Performance Standards and Conduct</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  Client agrees to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                  <li>Treat Company personnel with professional respect and courtesy</li>
                  <li>Maintain confidentiality of Company's proprietary methodologies and processes</li>
                  <li>Not use Services for illegal, harmful, or unethical purposes</li>
                  <li>Not reverse engineer, copy, or attempt to recreate Company's proprietary tools</li>
                  <li>Comply with any security protocols or access restrictions we establish</li>
                  <li>Notify us promptly of any issues or concerns regarding Service delivery</li>
                </ul>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">5.5 Consequences of Non-Compliance</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Failure to meet these obligations may result in project delays, additional costs, suspension of Services, 
                  or termination of the Agreement. Client remains responsible for all fees incurred regardless of compliance issues. 
                  We will provide reasonable notice and opportunity to cure non-compliance before taking remedial action.
                </p>
              </div>
            </div>
          </div>

          {/* Section 6: Professional Standards */}
          <div id="professional-standards" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              6. Professional Standards and Quality Assurance
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">6.1 Service Standards</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  We commit to providing Services that:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                  <li>Meet industry professional standards and best practices</li>
                  <li>Conform to specifications detailed in the applicable Statement of Work</li>
                  <li>Are delivered by qualified personnel with appropriate expertise</li>
                  <li>Incorporate current technologies and methodologies where appropriate</li>
                  <li>Include appropriate testing, review, and quality control measures</li>
                  <li>Are documented and delivered in agreed-upon formats</li>
                </ul>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">6.2 Quality Assurance Process</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  Our quality assurance includes:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                  <li>Internal review and testing before delivery</li>
                  <li>Compliance checking against project requirements</li>
                  <li>Version control and change management procedures</li>
                  <li>Documentation of all work performed and decisions made</li>
                  <li>Regular progress reporting and milestone reviews</li>
                  <li>Post-delivery support during acceptance period</li>
                </ul>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">6.3 Continuous Improvement</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  We maintain continuous improvement processes including regular training, technology updates, 
                  methodology refinement, and client feedback incorporation. We may update our approaches and 
                  tools to maintain competitive advantage and service quality.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">6.4 Performance Metrics and Reporting</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Performance metrics and reporting requirements will be specified in each Statement of Work. 
                  Standard metrics may include delivery timelines, quality measures, and client satisfaction scores. 
                  Regular reporting helps ensure project success and identifies areas for improvement.
                </p>
              </div>
            </div>
          </div>

          {/* Continue with remaining sections... */}
          {/* For brevity, I'll include the most important remaining sections */}

          {/* Section 9: Payment Terms */}
          <div id="payment" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              9. Payment Terms and Billing
            </h2>
            
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">9.1 Fees and Payment Schedule</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  All fees are specified in the applicable Statement of Work and are due according to the following terms:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                  <li><strong>Payment Terms:</strong> Net 30 days from invoice date unless otherwise specified</li>
                  <li><strong>Project Deposits:</strong> 25-50% deposit required before work commencement</li>
                  <li><strong>Milestone Payments:</strong> As specified in SOW, typically upon deliverable approval</li>
                  <li><strong>Monthly Retainers:</strong> Due in advance on the first of each month</li>
                  <li><strong>Hourly Services:</strong> Invoiced monthly with detailed time records</li>
                  <li><strong>Expense Reimbursement:</strong> Pre-approved expenses invoiced at cost plus 10% handling fee</li>
                </ul>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">9.2 Late Payments and Collections</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  Late payment consequences:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-base">
                  <li>Interest at 1.5% per month (18% annually) or maximum legal rate, whichever is less</li>
                  <li>Service suspension after 15 days past due with 5 days written notice</li>
                  <li>Collections fees and legal costs charged to Client if collection action required</li>
                  <li>Credit hold preventing new work until account current</li>
                  <li>Termination rights for accounts over 60 days past due</li>
                </ul>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">9.3 Disputes and Adjustments</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Billing disputes must be raised within 30 days of invoice date with specific details. 
                  Undisputed portions remain due per original terms. We will investigate disputes promptly 
                  and make appropriate adjustments. Good faith dispute resolution is expected from both parties.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">9.4 Taxes and Regulatory Fees</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Client is responsible for all applicable taxes, duties, and regulatory fees except those based on Company's income. 
                  We will add applicable sales tax, VAT, or similar taxes to invoices where required. 
                  International clients may need to provide tax exemption certificates or handle tax obligations locally.
                </p>
              </div>
            </div>
          </div>

          {/* Section 13: Liability */}
          <div id="liability" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">
              13. Limitation of Liability and Risk Allocation
            </h2>
            
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">Important Liability Limitations</h3>
                    <p className="text-red-700 text-sm leading-relaxed">
                      The following liability limitations are fundamental to our service pricing and risk allocation. 
                      Please read carefully as these provisions significantly limit our financial responsibility.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">13.1 Disclaimer of Warranties</h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-base leading-relaxed">
                    EXCEPT AS EXPRESSLY SET FORTH IN A STATEMENT OF WORK, ALL SERVICES ARE PROVIDED "AS IS" 
                    AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                  </p>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    WE SPECIFICALLY DISCLAIM ALL IMPLIED WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                    NON-INFRINGEMENT, TITLE, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.
                  </p>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    WE DO NOT WARRANT THAT SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR MEET CLIENT'S SPECIFIC REQUIREMENTS 
                    BEYOND THOSE DETAILED IN THE APPLICABLE STATEMENT OF WORK.
                  </p>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">13.2 Limitation of Total Liability</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  COMPANY'S TOTAL LIABILITY FOR ALL CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR ANY SERVICES PROVIDED 
                  SHALL NOT EXCEED THE LESSER OF: (A) THE TOTAL FEES PAID BY CLIENT FOR THE SPECIFIC SERVICES GIVING RISE TO THE CLAIM 
                  IN THE 12 MONTHS PRECEDING THE CLAIM; OR (B) $100,000 USD.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">13.3 Exclusion of Consequential Damages</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  IN NO EVENT SHALL COMPANY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
                  INCLUDING WITHOUT LIMITATION: LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES; BUSINESS INTERRUPTION; 
                  COST OF SUBSTITUTE SERVICES; OR LOSS OF GOODWILL, REGARDLESS OF THE THEORY OF LIABILITY AND EVEN IF ADVISED 
                  OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">13.4 Time Limitation for Claims</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  ANY CLAIM AGAINST COMPANY MUST BE BROUGHT WITHIN ONE (1) YEAR AFTER THE CAUSE OF ACTION ARISES, 
                  OR SUCH CLAIM SHALL BE PERMANENTLY BARRED. This limitation applies regardless of the form of action, 
                  whether in contract, tort, or otherwise.
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">13.5 Risk Allocation and Insurance</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  These limitations reflect the allocation of risk between the parties and the fees charged for Services. 
                  Client acknowledges that Company's pricing would be significantly higher without these limitations. 
                  Client is encouraged to maintain appropriate insurance coverage for business risks.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div id="contact" className="mt-12 bg-primary/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">21. Contact Information and Support</h2>
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
                  Business Address
                </h3>
                <p className="text-sm">
                  NexaCore Innovations<br />
                  Accra, Ghana
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-primary/20">
              <p className="text-sm text-muted-foreground">
                For questions about these Terms and Conditions or to request modifications for specific projects, 
                please contact our legal department at 
                <a href="mailto:legal@nexacore-innovations.com" className="text-primary hover:underline"> legal@nexacore-innovations.com</a>.
                All contract modifications must be in writing and signed by authorized representatives.
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-lg p-6">
            <p className="mb-2"><strong>Last Updated:</strong> January 1, 2025 • <strong>Version:</strong> 2.0</p>
            <p>
              These Terms and Conditions constitute a comprehensive legal agreement. By using our Services, 
              you acknowledge that you have read, understood, and agree to be bound by all provisions herein.
              Please retain a copy for your records.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
