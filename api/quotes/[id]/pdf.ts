// api/quotes/[id]/pdf.ts - MODERN NEXACORE AESTHETIC DESIGN
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
    const quoteId = req.query.id || req.query.quoteId;
    
    if (!quoteId || typeof quoteId !== 'string') {
      return res.status(400).json({ 
        error: 'Quote ID is required',
        debug: { query: req.query, url: req.url, extractedId: quoteId }
      });
    }

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
      return res.status(404).json({ error: 'Quote not found' });
    }

    const pdfHtml = generateModernPDF(quote);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="Quote-${quoteId}-NexaCore.html"`);
    res.status(200).send(pdfHtml);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'PDF generation failed',
      details: errorMessage,
      quoteId: req.query.id
    });
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function parseTimeline(timeline: string): number {
  if (!timeline) return 0;
  timeline = timeline.toLowerCase();
  let days = 0;
  const daysMatch = timeline.match(/(\d+)\s*day/);
  if (daysMatch) days = parseInt(daysMatch[1], 10);
  const weeksMatch = timeline.match(/(\d+)\s*week/);
  if (weeksMatch) days = parseInt(weeksMatch[1], 10) * 7;
  const monthsMatch = timeline.match(/(\d+)\s*month/);
  if (monthsMatch) days = parseInt(monthsMatch[1], 10) * 30;
  return days;
}

function getExpiresDate(quote: any): string {
  if (quote.expires_at && formatDate(quote.expires_at)) {
    return formatDate(quote.expires_at);
  }
  const created = quote.created_at;
  const daysToAdd = parseTimeline(quote.timeline);
  if (created && daysToAdd > 0) {
    const createdDate = new Date(created);
    createdDate.setDate(createdDate.getDate() + daysToAdd);
    return formatDate(createdDate.toISOString());
  }
  return 'TBD';
}

function generateModernPDF(quote: any) {
  const clientName = quote.quote_requests?.full_name || 'Valued Client';
  const clientEmail = quote.quote_requests?.email || '';
  const clientCompany = quote.quote_requests?.company || '';
  const clientPhone = quote.quote_requests?.phone || '';
  const clientCountry = quote.quote_requests?.country || '';
  const serviceType = quote.quote_requests?.service_type || quote.service_type;
  const projectDescription = quote.quote_requests?.description || '';

  const createdDate = formatDate(quote.created_at) || 'TBD';
  const expiresDate = getExpiresDate(quote);
  const deliverables = Array.isArray(quote.deliverables) ? quote.deliverables : [];
  const totalPrice = (quote.price || 0).toLocaleString();
  const currency = quote.currency || '$';

  const projectPhases = [
    "Discovery & Requirements Analysis",
    "Project Planning & Architecture Design", 
    "Development & Implementation",
    "Testing & Quality Assurance",
    "Deployment & Launch Support",
    "Documentation & Knowledge Transfer",
    "Post-Launch Support (30 days included)"
  ];

  const paymentSchedule = [
    "25% - Project Initiation (Upon contract signing)",
    "25% - Milestone 1 Completion (Requirements & Design approved)",
    "25% - Milestone 2 Completion (Development 75% complete)",
    "25% - Final Delivery (Testing complete, project deployed)"
  ];

  const whatIncludes = [
    "Complete project scope as outlined",
    "All deliverables listed in this quote",
    "Regular progress updates and communication",
    "Quality assurance and testing",
    "Documentation and user guides",
    "30 days post-launch support",
    "Source code and intellectual property transfer",
    "Training sessions (if applicable)"
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote #${quote.id} - ${clientName} - NexaCore Innovations</title>
  <style>
    /* Modern NexaCore Design System */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :root {
      --primary: #3b82f6;
      --primary-600: #2563eb;
      --primary-700: #1d4ed8;
      --success: #10b981;
      --success-600: #059669;
      --purple-500: #8b5cf6;
      --purple-600: #7c3aed;
      --teal-500: #14b8a6;
      --teal-600: #0d9488;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-300: #d1d5db;
      --gray-400: #9ca3af;
      --gray-600: #4b5563;
      --gray-700: #374151;
      --gray-800: #1f2937;
      --gray-900: #111827;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: var(--gray-800);
      background: linear-gradient(135deg, var(--gray-50) 0%, #ffffff 100%);
      min-height: 100vh;
    }
    
    .pdf-container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border-radius: 24px;
      overflow: hidden;
      position: relative;
    }
    
    /* Modern Gradient Header */
    .header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--purple-600) 50%, var(--teal-600) 100%);
      color: white;
      padding: 48px 40px;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 200px;
      height: 400px;
      background: rgba(255,255,255,0.1);
      transform: rotate(15deg);
      border-radius: 20px;
    }
    
    .header::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 150px;
      height: 300px;
      background: rgba(255,255,255,0.05);
      transform: rotate(-15deg);
      border-radius: 20px;
    }
    
    .company-branding {
      position: relative;
      z-index: 10;
      text-align: center;
    }
    
    .company-logo {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -1px;
      margin-bottom: 8px;
      background: linear-gradient(45deg, #ffffff, #f1f5f9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .company-tagline {
      font-size: 16px;
      opacity: 0.9;
      font-weight: 300;
      margin-bottom: 32px;
    }
    
    .quote-title {
      font-size: 42px;
      font-weight: 800;
      margin-bottom: 12px;
      text-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .quote-subtitle {
      font-size: 18px;
      opacity: 0.95;
      font-weight: 400;
    }
    
    /* Modern Card-based Client Section */
    .client-section {
      padding: 48px 40px;
      background: var(--gray-50);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
    
    .info-card {
      background: white;
      padding: 32px;
      border-radius: 20px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--gray-200);
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--gray-600);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }
    
    .client-name {
      font-size: 28px;
      font-weight: 800;
      color: var(--gray-900);
      margin-bottom: 16px;
      background: linear-gradient(135deg, var(--primary), var(--purple-600));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .client-details {
      color: var(--gray-600);
      line-height: 1.8;
      font-size: 15px;
    }
    
    .quote-number {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, var(--teal-500), var(--success));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 16px;
    }
    
    .quote-dates {
      color: var(--gray-600);
      line-height: 1.8;
      font-size: 15px;
    }
    
    /* Modern Price Section */
    .price-section {
      background: linear-gradient(135deg, var(--success) 0%, var(--teal-600) 100%);
      color: white;
      padding: 56px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .price-section::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 300px;
      height: 300px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }
    
    .total-price {
      font-size: 56px;
      font-weight: 900;
      margin-bottom: 16px;
      text-shadow: 0 4px 8px rgba(0,0,0,0.2);
      position: relative;
      z-index: 10;
    }
    
    .price-label {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 24px;
      opacity: 0.95;
      position: relative;
      z-index: 10;
    }
    
    .validity-info {
      background: rgba(255,255,255,0.2);
      padding: 16px 32px;
      border-radius: 50px;
      display: inline-block;
      font-weight: 500;
      backdrop-filter: blur(10px);
      position: relative;
      z-index: 10;
    }
    
    /* Modern Content Sections */
    .content-section {
      padding: 48px 40px;
      border-bottom: 1px solid var(--gray-200);
    }
    
    .content-section:last-child {
      border-bottom: none;
    }
    
    .content-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 24px;
      position: relative;
      padding-bottom: 12px;
    }
    
    .content-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 4px;
      background: linear-gradient(135deg, var(--primary), var(--purple-600));
      border-radius: 2px;
    }
    
    .content-text {
      color: var(--gray-700);
      line-height: 1.8;
      margin-bottom: 20px;
      font-size: 16px;
    }
    
    .modern-list {
      list-style: none;
      padding: 0;
      display: grid;
      gap: 16px;
    }
    
    .modern-list li {
      background: var(--gray-50);
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid var(--primary);
      color: var(--gray-700);
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .modern-list li:hover {
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    /* Modern Phase Timeline */
    .phase-timeline {
      background: white;
      padding: 32px;
      border-radius: 20px;
      margin: 32px 0;
      border: 1px solid var(--gray-200);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    .phase-item {
      display: flex;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid var(--gray-200);
    }
    
    .phase-item:last-child {
      border-bottom: none;
    }
    
    .phase-number {
      background: linear-gradient(135deg, var(--primary), var(--purple-600));
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      margin-right: 20px;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    /* Modern Footer */
    .footer {
      background: linear-gradient(135deg, var(--gray-900) 0%, var(--gray-800) 100%);
      color: white;
      padding: 56px 40px;
      position: relative;
      overflow: hidden;
    }
    
    .footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--primary), var(--purple-600), var(--teal-600), transparent);
    }
    
    .footer h3 {
      font-size: 28px;
      margin-bottom: 24px;
      text-align: center;
      background: linear-gradient(45deg, #ffffff, var(--gray-300));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin: 32px 0;
    }
    
    .contact-item {
      background: rgba(255,255,255,0.1);
      padding: 24px;
      border-radius: 16px;
      text-align: center;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .highlight-box {
      background: linear-gradient(135deg, var(--primary)/10, var(--purple-600)/10);
      border: 1px solid var(--primary)/20;
      border-radius: 16px;
      padding: 24px;
      margin: 24px 0;
      color: var(--gray-700);
    }
    
    /* Print Styles */
    @media print {
      body { background: white !important; }
      .pdf-container { 
        box-shadow: none; 
        max-width: none;
        border-radius: 0;
      }
      .header, .price-section, .footer { 
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .client-section { 
        grid-template-columns: 1fr;
        padding: 32px 24px;
      }
      .header, .content-section { 
        padding: 32px 24px; 
      }
      .total-price { 
        font-size: 42px; 
      }
    }
  </style>
</head>
<body>
  <div class="pdf-container">
    <!-- Modern Header -->
    <div class="header">
      <div class="company-branding">
        <div class="company-logo">NexaCore Innovations</div>
        <div class="company-tagline">Engineering Global Innovation with Excellence</div>
        <h1 class="quote-title">PROJECT QUOTE</h1>
        <div class="quote-subtitle">Professional Technology Solutions</div>
      </div>
    </div>

    <!-- Modern Client Info Cards -->
    <div class="client-section">
      <div class="info-card">
        <div class="section-title">Prepared For</div>
        <div class="client-name">${clientName}</div>
        <div class="client-details">
          <div><strong>Email:</strong> ${clientEmail}</div>
          ${clientCompany ? `<div><strong>Company:</strong> ${clientCompany}</div>` : ''}
          ${clientPhone ? `<div><strong>Phone:</strong> ${clientPhone}</div>` : ''}
          ${clientCountry ? `<div><strong>Location:</strong> ${clientCountry}</div>` : ''}
        </div>
      </div>
      
      <div class="info-card">
        <div class="section-title">Quote Details</div>
        <div class="quote-number">Quote #${quote.id}</div>
        <div class="quote-dates">
          <div><strong>Created:</strong> ${createdDate}</div>
          <div><strong>Valid Until:</strong> ${expiresDate}</div>
          <div><strong>Service:</strong> ${serviceType}</div>
        </div>
      </div>
    </div>

    <!-- Modern Price Section -->
    <div class="price-section">
      <div class="total-price">${currency}${totalPrice}</div>
      <div class="price-label">Total Project Investment</div>
      <div class="validity-info">Valid until ${expiresDate}</div>
    </div>

    <!-- Project Overview -->
    <div class="content-section">
      <h2 class="content-title">Project Overview</h2>
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
      <h2 class="content-title">Detailed Project Scope</h2>
      <p class="content-text">
        ${quote.scope || 'Comprehensive solution tailored to your specific requirements. Our team will work closely with you to ensure all objectives are met with the highest quality standards.'}
      </p>
    </div>

    <!-- Project Timeline -->
    <div class="content-section">
      <h2 class="content-title">Project Timeline</h2>
      <p class="content-text">
        <strong>Estimated Duration:</strong> ${quote.timeline || 'To be determined based on project complexity'}
      </p>
      
      <div class="phase-timeline">
        <h3 style="margin-bottom: 24px; color: var(--gray-900); font-size: 20px;">Project Phases:</h3>
        ${projectPhases.map((phase, index) => `
          <div class="phase-item">
            <div class="phase-number">${index + 1}</div>
            <div style="font-weight: 500; color: var(--gray-700);">${phase}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Deliverables -->
    ${deliverables.length > 0 ? `
    <div class="content-section">
      <h2 class="content-title">Project Deliverables</h2>
      <ul class="modern-list">
        ${deliverables.map((deliverable: string) => 
          `<li>${deliverable}</li>`
        ).join('')}
      </ul>
    </div>
    ` : ''}

    <!-- What's Included -->
    <div class="content-section">
      <h2 class="content-title">What's Included in This Quote</h2>
      <ul class="modern-list">
        ${whatIncludes.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>

    <!-- Payment Schedule -->
    <div class="content-section">
      <h2 class="content-title">Payment Schedule</h2>
      <p class="content-text">
        Professional milestone-based payment structure:
      </p>
      <ul class="modern-list">
        ${paymentSchedule.map(payment => `<li>${payment}</li>`).join('')}
      </ul>
      <div class="highlight-box">
        <strong>Payment Methods:</strong> Wire transfer, ACH, major credit cards, or PayPal. International clients: Wire transfer or PayPal preferred.
      </div>
    </div>

    <!-- Terms & Conditions -->
    <div class="content-section">
      <h2 class="content-title">Terms & Conditions</h2>
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

    <!-- Modern Footer -->
    <div class="footer">
      <h3>Let's Build Something Amazing Together</h3>
      
      <div class="contact-grid">
        <div class="contact-item">
          <strong>Email</strong><br>
          projects@nexacore-innovations.com
        </div>
        <div class="contact-item">
          <strong>Website</strong><br>
          nexacore-innovations.com
        </div>
        <div class="contact-item">
          <strong>Questions</strong><br>
          Available for consultation calls
        </div>
        <div class="contact-item">
          <strong>Response Time</strong><br>
          Within 24 hours
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
        <p style="font-size: 14px; opacity: 0.8; margin-bottom: 8px;">
          © ${new Date().getFullYear()} NexaCore Innovations. All rights reserved.
        </p>
        <p style="font-size: 12px; opacity: 0.6;">
          This quote was generated on ${new Date().toLocaleString()} and contains confidential information.
        </p>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      document.title = 'Quote-${quote.id}-${clientName}-NexaCore';
      
      // Add floating download button
      setTimeout(() => {
        const downloadBtn = document.createElement('button');
        downloadBtn.innerHTML = '📄 Download PDF';
        downloadBtn.style.cssText = \`
          position: fixed;
          top: 24px;
          right: 24px;
          background: linear-gradient(135deg, var(--primary), var(--purple-600));
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          z-index: 1000;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(10px);
          font-size: 14px;
          transition: all 0.3s ease;
        \`;
        downloadBtn.onmouseover = () => downloadBtn.style.transform = 'translateY(-2px)';
        downloadBtn.onmouseout = () => downloadBtn.style.transform = 'translateY(0)';
        downloadBtn.onclick = () => window.print();
        document.body.appendChild(downloadBtn);
      }, 1000);
    };
    
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
      if (e.key === 'Escape') {
        window.close();
      }
    });
  </script>
</body>
</html>`;
}
