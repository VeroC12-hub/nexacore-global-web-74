// api/quotes/[id]/pdf.ts - ENHANCED PDF GENERATION WITH ALL FEATURES INTACT
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id: quoteId } = req.query;

    if (!quoteId || typeof quoteId !== 'string') {
      console.error('Invalid quote ID:', quoteId);
      return res.status(400).json({ error: 'Quote ID is required' });
    }

    console.log('Generating comprehensive PDF for quote:', quoteId);

    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        quote_requests!inner(
          full_name,
          email,
          company,
          phone,
          country,
          service_type,
          description
        )
      `)
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      console.error('Quote fetch error:', quoteError);
      return res.status(404).json({ error: 'Quote not found' });
    }

    const pdfHtml = generateComprehensivePDF(quote);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="Quote-${quoteId}-NexaCore.html"`);
    res.status(200).send(pdfHtml);

  } catch (error) {
    console.error('PDF generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'PDF generation failed',
      details: errorMessage,
      quoteId: req.query.id
    });
  }
}

function generateComprehensivePDF(quote: any) {
  const clientName = quote.quote_requests?.full_name || 'Valued Client';
  const clientEmail = quote.quote_requests?.email || '';
  const clientCompany = quote.quote_requests?.company || '';
  const clientPhone = quote.quote_requests?.phone || '';
  const clientCountry = quote.quote_requests?.country || '';
  const serviceType = quote.quote_requests?.service_type || quote.service_type;
  const projectDescription = quote.quote_requests?.description || '';

  // Format dates
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const createdDate = formatDate(quote.created_at);
  const expiresDate = formatDate(quote.expires_at);
  
  // FIX THE SYNTAX ERROR: Complete the ternary operator
  const deliverables = Array.isArray(quote.deliverables) ? quote.deliverables : [];
  
  const totalPrice = (quote.price || 0).toLocaleString();
  const currency = quote.currency || '$';

  // Enhanced quote sections
  const projectPhases = [
    "🔍 Discovery & Requirements Analysis",
    "📋 Project Planning & Architecture Design", 
    "⚡ Development & Implementation",
    "🧪 Testing & Quality Assurance",
    "🚀 Deployment & Launch Support",
    "📚 Documentation & Knowledge Transfer",
    "🛠️ Post-Launch Support (30 days included)"
  ];

  const paymentSchedule = [
    "💰 25% - Project Initiation (Upon contract signing)",
    "💰 25% - Milestone 1 Completion (Requirements & Design approved)",
    "💰 25% - Milestone 2 Completion (Development 75% complete)",
    "💰 25% - Final Delivery (Testing complete, project deployed)"
  ];

  const whatIncludes = [
    "✅ Complete project scope as outlined",
    "✅ All deliverables listed in this quote",
    "✅ Regular progress updates and communication",
    "✅ Quality assurance and testing",
    "✅ Documentation and user guides",
    "✅ 30 days post-launch support",
    "✅ Source code and intellectual property transfer",
    "✅ Training sessions (if applicable)"
  ];

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote #${quote.id} - ${clientName} - NexaCore Innovations</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          line-height: 1.6;
          color: #2c3e50;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }
        
        .pdf-container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 30px rgba(0,0,0,0.1);
          position: relative;
        }
        
        /* Header Section */
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 40px 30px 40px;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 100px;
          height: 200px;
          background: rgba(255,255,255,0.1);
          transform: rotate(45deg);
        }
        
        .company-logo {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -1px;
          margin-bottom: 5px;
        }
        
        .company-tagline {
          font-size: 14px;
          opacity: 0.9;
          font-weight: 300;
        }
        
        .quote-title {
          font-size: 36px;
          font-weight: 800;
          text-align: center;
          margin: 30px 0 20px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .quote-subtitle {
          text-align: center;
          font-size: 16px;
          opacity: 0.9;
          font-weight: 300;
        }
        
        /* Client Info Section */
        .client-section {
          display: flex;
          justify-content: space-between;
          padding: 40px;
          background: #f8f9fa;
          border-bottom: 3px solid #e9ecef;
        }
        
        .client-info, .quote-info {
          flex: 1;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #495057;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .client-name {
          font-size: 24px;
          font-weight: 800;
          color: #2c3e50;
          margin-bottom: 8px;
        }
        
        .client-details {
          color: #6c757d;
          line-height: 1.8;
        }
        
        .quote-number {
          font-size: 24px;
          font-weight: 800;
          color: #667eea;
          margin-bottom: 8px;
        }
        
        .quote-dates {
          color: #6c757d;
          line-height: 1.8;
        }
        
        /* Price Section */
        .price-section {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          padding: 40px;
          text-align: center;
          margin: 0;
        }
        
        .total-price {
          font-size: 48px;
          font-weight: 900;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .price-label {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          opacity: 0.95;
        }
        
        .validity-info {
          background: rgba(255,255,255,0.2);
          padding: 12px 24px;
          border-radius: 25px;
          display: inline-block;
          font-weight: 500;
        }
        
        /* Content Sections */
        .content-section {
          padding: 30px 40px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .content-section:last-child {
          border-bottom: none;
        }
        
        .content-title {
          font-size: 20px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 20px;
          padding-bottom: 8px;
          border-bottom: 2px solid #667eea;
          display: inline-block;
        }
        
        .content-text {
          color: #495057;
          line-height: 1.8;
          margin-bottom: 15px;
        }
        
        .list-style {
          list-style: none;
          padding: 0;
        }
        
        .list-style li {
          padding: 8px 0;
          border-bottom: 1px solid #f8f9fa;
          color: #495057;
          font-weight: 500;
        }
        
        .list-style li:last-child {
          border-bottom: none;
        }
        
        /* Phase Timeline */
        .phase-timeline {
          background: #f8f9fa;
          padding: 25px;
          border-radius: 10px;
          margin: 20px 0;
        }
        
        .phase-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #dee2e6;
        }
        
        .phase-item:last-child {
          border-bottom: none;
        }
        
        .phase-number {
          background: #667eea;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          margin-right: 15px;
          font-size: 14px;
        }
        
        /* Footer */
        .footer {
          background: #2c3e50;
          color: white;
          padding: 40px;
          text-align: center;
        }
        
        .footer h3 {
          font-size: 24px;
          margin-bottom: 15px;
          color: #ecf0f1;
        }
        
        .footer p {
          margin-bottom: 8px;
          opacity: 0.9;
        }
        
        .contact-info {
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
        
        /* Print Styles */
        @media print {
          body {
            background: white !important;
          }
          
          .pdf-container {
            box-shadow: none;
            max-width: none;
          }
          
          .header, .price-section {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .client-section {
            flex-direction: column;
          }
          
          .client-info, .quote-info {
            margin-bottom: 20px;
          }
          
          .header, .content-section {
            padding: 20px;
          }
          
          .total-price {
            font-size: 36px;
          }
        }
      </style>
    </head>
    <body>
      <div class="pdf-container">
        <!-- Header -->
        <div class="header">
          <div class="company-logo">NexaCore Innovations</div>
          <div class="company-tagline">Building Tomorrow's Technology Today</div>
          
          <h1 class="quote-title">PROJECT QUOTE</h1>
          <div class="quote-subtitle">Professional Technology Solutions</div>
        </div>

        <!-- Client & Quote Info -->
        <div class="client-section">
          <div class="client-info">
            <div class="section-title">Prepared For</div>
            <div class="client-name">${clientName}</div>
            <div class="client-details">
              <div><strong>Email:</strong> ${clientEmail}</div>
              ${clientCompany ? `<div><strong>Company:</strong> ${clientCompany}</div>` : ''}
              ${clientPhone ? `<div><strong>Phone:</strong> ${clientPhone}</div>` : ''}
              ${clientCountry ? `<div><strong>Location:</strong> ${clientCountry}</div>` : ''}
            </div>
          </div>
          
          <div class="quote-info">
            <div class="section-title">Quote Details</div>
            <div class="quote-number">Quote #${quote.id}</div>
            <div class="quote-dates">
              <div><strong>Created:</strong> ${createdDate}</div>
              <div><strong>Valid Until:</strong> ${expiresDate}</div>
              <div><strong>Service:</strong> ${serviceType}</div>
            </div>
          </div>
        </div>

        <!-- Total Price -->
        <div class="price-section">
          <div class="total-price">${currency}${totalPrice}</div>
          <div class="price-label">Total Project Investment</div>
          <div class="validity-info">Valid until ${expiresDate}</div>
        </div>

        <!-- Project Overview -->
        <div class="content-section">
          <h2 class="content-title">📋 Project Overview</h2>
          <p class="content-text">
            <strong>Service Type:</strong> ${serviceType}
          </p>
          <p class="content-text">
            <strong>Client Requirements:</strong><br>
            ${projectDescription || 'Custom requirements as discussed with our team.'}
          </p>
        </div>

        <!-- Project Scope -->
        <div class="content-section">
          <h2 class="content-title">🎯 Detailed Project Scope</h2>
          <p class="content-text">
            ${quote.scope || 'Comprehensive solution tailored to your specific requirements. Our team will work closely with you to ensure all objectives are met with the highest quality standards.'}
          </p>
        </div>

        <!-- Project Timeline -->
        <div class="content-section">
          <h2 class="content-title">⏱️ Project Timeline</h2>
          <p class="content-text">
            <strong>Estimated Duration:</strong> ${quote.timeline || 'To be determined based on project complexity'}
          </p>
          
          <div class="phase-timeline">
            <h3 style="margin-bottom: 20px; color: #2c3e50;">Project Phases:</h3>
            ${projectPhases.map((phase, index) => `
              <div class="phase-item">
                <div class="phase-number">${index + 1}</div>
                <div>${phase}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Deliverables -->
        ${deliverables.length > 0 ? `
        <div class="content-section">
          <h2 class="content-title">📦 Project Deliverables</h2>
          <ul class="list-style">
            ${deliverables.map((deliverable: string) => 
              `<li>✅ ${deliverable}</li>`
            ).join('')}
          </ul>
        </div>
        ` : ''}

        <!-- What's Included -->
        <div class="content-section">
          <h2 class="content-title">✨ What's Included in This Quote</h2>
          <ul class="list-style">
            ${whatIncludes.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>

        <!-- Payment Schedule -->
        <div class="content-section">
          <h2 class="content-title">💳 Payment Schedule</h2>
          <p class="content-text">
            Professional milestone-based payment structure:
          </p>
          <ul class="list-style">
            ${paymentSchedule.map(payment => `<li>${payment}</li>`).join('')}
          </ul>
          <p class="content-text" style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">
            <strong>Payment Methods:</strong> Wire transfer, ACH, major credit cards, or PayPal. International clients: Wire transfer or PayPal preferred.
          </p>
        </div>

        <!-- Terms & Conditions -->
        <div class="content-section">
          <h2 class="content-title">📄 Terms & Conditions</h2>
          <div class="content-text" style="white-space: pre-wrap; line-height: 1.8;">
${quote.terms || `1. ACCEPTANCE: This quote is valid for 30 days from the date above.

2. PAYMENT TERMS: 
   - Net 30 days from invoice date
   - Late payments subject to 1.5% monthly interest charge
   - Services may be suspended for accounts 30+ days overdue

3. SCOPE CHANGES: 
   - Additional work outside the defined scope will be quoted separately
   - Change requests must be approved in writing
   - May affect timeline and total project cost

4. INTELLECTUAL PROPERTY:
   - Client owns all custom work upon final payment
   - NexaCore retains rights to general methodologies and frameworks
   - Third-party licenses remain with respective owners

5. WARRANTY & SUPPORT:
   - 30-day bug fix period included
   - Extended support available under separate agreement
   - No warranty on third-party components

6. CONFIDENTIALITY:
   - All client information treated as confidential
   - Non-disclosure agreement available upon request

7. LIMITATION OF LIABILITY:
   - Liability limited to project value
   - No consequential damages
   - Client responsible for data backups`}
          </div>
        </div>

        <!-- Call to Action -->
        <div class="content-section" style="background: #f8f9fa; text-align: center;">
          <h2 class="content-title">🚀 Ready to Get Started?</h2>
          <p class="content-text" style="font-size: 18px; margin-bottom: 25px;">
            We're excited to work with you on this project! Here's what happens next:
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 25px 0;">
            <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #e9ecef;">
              <h4 style="color: #667eea; margin-bottom: 10px;">1️⃣ Review & Approve</h4>
              <p style="font-size: 14px; margin: 0;">Review this quote and approve to proceed</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #e9ecef;">
              <h4 style="color: #667eea; margin-bottom: 10px;">2️⃣ Contract Signing</h4>
              <p style="font-size: 14px; margin: 0;">Sign project agreement and submit deposit</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #e9ecef;">
              <h4 style="color: #667eea; margin-bottom: 10px;">3️⃣ Project Kickoff</h4>
              <p style="font-size: 14px; margin: 0;">Schedule kickoff meeting and begin work</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <h3>🤝 Let's Build Something Amazing Together</h3>
          
          <div class="contact-info">
            <p><strong>📧 Email:</strong> projects@nexacore-innovations.com</p>
            <p><strong>🌐 Website:</strong> nexacore-innovations.com</p>
            <p><strong>📞 Questions:</strong> Available for consultation calls</p>
            <p><strong>⏰ Response Time:</strong> Within 24 hours</p>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; opacity: 0.8;">
            © ${new Date().getFullYear()} NexaCore Innovations. All rights reserved.
          </p>
          
          <p style="font-size: 12px; margin-top: 10px; opacity: 0.7;">
            This quote was generated on ${new Date().toLocaleString()} and contains confidential information.
          </p>
        </div>
      </div>

      <script>
        // PDF functionality
        window.onload = function() {
          console.log('Enhanced Quote PDF loaded');
          document.title = 'Quote-${quote.id}-${clientName}-NexaCore';
        };
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
          if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            window.print();
          }
          if (e.key === 'Escape') {
            window.close();
          }
        });
        
        // Auto-download functionality (optional)
        function downloadPDF() {
          window.print();
        }
        
        // Add download button after page loads
        setTimeout(() => {
          const downloadBtn = document.createElement('button');
          downloadBtn.innerHTML = '📄 Download PDF';
          downloadBtn.style.cssText = \`
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          \`;
          downloadBtn.onclick = () => window.print();
          document.body.appendChild(downloadBtn);
        }, 1000);
      </script>
    </body>
    </html>
  `;
}
