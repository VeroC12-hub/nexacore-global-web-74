// api/quotes/[id]/pdf.ts - SYNTAX ERROR FIXED VERSION
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id: quoteId } = req.query;

    if (!quoteId || typeof quoteId !== 'string') {
      return res.status(400).json({ error: 'Quote ID is required' });
    }

    if (!supabase) {
      return res.status(500).json({ 
        error: 'Database configuration error'
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

    if (quoteError) {
      console.error('Quote fetch error:', quoteError);
      if (quoteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Quote not found' });
      }
      return res.status(500).json({ 
        error: 'Failed to fetch quote'
      });
    }

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const pdfHtml = generatePDF(quote);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="Quote-${quoteId}-NexaCore.html"`);
    res.status(200).send(pdfHtml);

  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ 
      error: 'PDF generation failed'
    });
  }
}

function generatePDF(quote: any): string {
  const clientName = quote.quote_requests?.full_name || 'Valued Client';
  const clientEmail = quote.quote_requests?.email || '';
  const clientCompany = quote.quote_requests?.company || '';
  const clientPhone = quote.quote_requests?.phone || '';
  const clientCountry = quote.quote_requests?.country || '';
  const serviceType = quote.quote_requests?.service_type || quote.service_type;
  const projectDescription = quote.quote_requests?.description || '';

  const formatDate = (dateString: string): string => {
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
  const deliverables = Array.isArray(quote.deliverables) ? quote.deliverables : [];
  const totalPrice = (quote.price || 0).toLocaleString();
  const currency = quote.currency || '$';

  const projectPhases = [
    'Discovery & Requirements Analysis',
    'Project Planning & Architecture Design', 
    'Development & Implementation',
    'Testing & Quality Assurance',
    'Deployment & Launch Support',
    'Documentation & Knowledge Transfer',
    'Post-Launch Support (30 days included)'
  ];

  const paymentSchedule = [
    '25% - Project Initiation (Upon contract signing)',
    '25% - Milestone 1 Completion (Requirements & Design approved)',
    '25% - Milestone 2 Completion (Development 75% complete)',
    '25% - Final Delivery (Testing complete, project deployed)'
  ];

  const whatIncludes = [
    'Complete project scope as outlined',
    'All deliverables listed in this quote',
    'Regular progress updates and communication',
    'Quality assurance and testing',
    'Documentation and user guides',
    '30 days post-launch support',
    'Source code and intellectual property transfer',
    'Training sessions (if applicable)'
  ];

  const deliverablesList = deliverables.map((deliverable: string) => 
    `<li style="padding: 8px 0; border-bottom: 1px solid #f8f9fa; color: #495057; font-weight: 500;">✅ ${deliverable}</li>`
  ).join('');

  const phasesList = projectPhases.map((phase, index) => 
    `<div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #dee2e6;">
      <div style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 15px; font-size: 14px;">${index + 1}</div>
      <div>${phase}</div>
    </div>`
  ).join('');

  const paymentList = paymentSchedule.map(payment => 
    `<li style="padding: 8px 0; border-bottom: 1px solid #f8f9fa; color: #495057; font-weight: 500;">${payment}</li>`
  ).join('');

  const includesList = whatIncludes.map(item => 
    `<li style="padding: 8px 0; border-bottom: 1px solid #f8f9fa; color: #495057; font-weight: 500;">✅ ${item}</li>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote #${quote.id} - ${clientName} - NexaCore Innovations</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #2c3e50; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; }
    .pdf-container { max-width: 210mm; margin: 0 auto; background: white; box-shadow: 0 0 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
    .company-logo { font-size: 28px; font-weight: 900; margin-bottom: 5px; }
    .company-tagline { font-size: 14px; opacity: 0.9; margin-bottom: 20px; }
    .quote-title { font-size: 36px; font-weight: 800; margin: 20px 0 10px 0; }
    .quote-subtitle { font-size: 16px; opacity: 0.9; }
    .client-section { display: flex; justify-content: space-between; padding: 40px; background: #f8f9fa; border-bottom: 3px solid #e9ecef; }
    .client-info, .quote-info { flex: 1; }
    .section-title { font-size: 18px; font-weight: 700; color: #495057; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
    .client-name { font-size: 24px; font-weight: 800; color: #2c3e50; margin-bottom: 8px; }
    .client-details { color: #6c757d; line-height: 1.8; }
    .quote-number { font-size: 24px; font-weight: 800; color: #667eea; margin-bottom: 8px; }
    .quote-dates { color: #6c757d; line-height: 1.8; }
    .price-section { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 40px; text-align: center; }
    .total-price { font-size: 48px; font-weight: 900; margin-bottom: 10px; }
    .price-label { font-size: 18px; font-weight: 600; margin-bottom: 15px; }
    .validity-info { background: rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 25px; display: inline-block; font-weight: 500; }
    .content-section { padding: 30px 40px; border-bottom: 1px solid #e9ecef; }
    .content-title { font-size: 20px; font-weight: 700; color: #2c3e50; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid #667eea; display: inline-block; }
    .content-text { color: #495057; line-height: 1.8; margin-bottom: 15px; }
    .list-style { list-style: none; padding: 0; }
    .phase-timeline { background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 20px 0; }
    .footer { background: #2c3e50; color: white; padding: 40px; text-align: center; }
    .footer h3 { font-size: 24px; margin-bottom: 15px; }
    .contact-info { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; }
    @media print { body { background: white !important; } .pdf-container { box-shadow: none; } .header, .price-section { -webkit-print-color-adjust: exact; } }
    @media (max-width: 768px) { .client-section { flex-direction: column; } .client-info, .quote-info { margin-bottom: 20px; } }
  </style>
</head>
<body>
  <div class="pdf-container">
    <div class="header">
      <div class="company-logo">NexaCore Innovations</div>
      <div class="company-tagline">Building Tomorrow's Technology Today</div>
      <h1 class="quote-title">PROJECT QUOTE</h1>
      <div class="quote-subtitle">Professional Technology Solutions</div>
    </div>
    
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

    <div class="price-section">
      <div class="total-price">${currency}${totalPrice}</div>
      <div class="price-label">Total Project Investment</div>
      <div class="validity-info">Valid until ${expiresDate}</div>
    </div>

    <div class="content-section">
      <h2 class="content-title">Project Overview</h2>
      <p class="content-text"><strong>Service Type:</strong> ${serviceType}</p>
      <p class="content-text"><strong>Client Requirements:</strong><br>${projectDescription || 'Custom requirements as discussed with our team.'}</p>
    </div>

    <div class="content-section">
      <h2 class="content-title">Detailed Project Scope</h2>
      <p class="content-text">${quote.scope || 'Comprehensive solution tailored to your specific requirements.'}</p>
    </div>

    <div class="content-section">
      <h2 class="content-title">Project Timeline</h2>
      <p class="content-text"><strong>Estimated Duration:</strong> ${quote.timeline || 'To be determined based on project complexity'}</p>
      <div class="phase-timeline">
        <h3 style="margin-bottom: 20px; color: #2c3e50;">Project Phases:</h3>
        ${phasesList}
      </div>
    </div>

    ${deliverables.length > 0 ? `
    <div class="content-section">
      <h2 class="content-title">Project Deliverables</h2>
      <ul class="list-style">${deliverablesList}</ul>
    </div>
    ` : ''}

    <div class="content-section">
      <h2 class="content-title">What's Included in This Quote</h2>
      <ul class="list-style">${includesList}</ul>
    </div>

    <div class="content-section">
      <h2 class="content-title">Payment Schedule</h2>
      <p class="content-text">Professional milestone-based payment structure:</p>
      <ul class="list-style">${paymentList}</ul>
    </div>

    <div class="content-section">
      <h2 class="content-title">Terms & Conditions</h2>
      <div class="content-text" style="white-space: pre-wrap;">${quote.terms || 'Standard terms and conditions apply. Payment terms: Net 30 days from invoice date. Project timeline begins after deposit receipt and final approval of requirements.'}</div>
    </div>

    <div class="footer">
      <h3>Ready to Get Started?</h3>
      <div class="contact-info">
        <p><strong>Email:</strong> projects@nexacore-innovations.com</p>
        <p><strong>Website:</strong> nexacore-innovations.com</p>
        <p><strong>Response Time:</strong> Within 24 hours</p>
      </div>
      <p style="margin-top: 30px;">© ${new Date().getFullYear()} NexaCore Innovations. All rights reserved.</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      document.title = 'Quote-${quote.id}-${clientName}-NexaCore';
    };
    
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    });

    setTimeout(function() {
      var btn = document.createElement('button');
      btn.innerHTML = 'Download PDF';
      btn.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #667eea; color: white; border: none; padding: 12px 20px; border-radius: 25px; cursor: pointer; font-weight: 600; z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.2);';
      btn.onclick = function() { window.print(); };
      document.body.appendChild(btn);
    }, 1000);
  </script>
</body>
</html>`;
}
