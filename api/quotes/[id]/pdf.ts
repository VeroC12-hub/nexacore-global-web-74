// api/quotes/[id]/pdf.ts - Vercel API Route for PDF Generation
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
      return res.status(400).json({ error: 'Quote ID is required' });
    }

    console.log('Generating PDF for quote:', quoteId);

    // Fetch quote data from database
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        quote_requests!inner(
          full_name,
          email,
          company,
          phone,
          country
        )
      `)
      .eq('id', quoteId)
      .single();

    if (quoteError) {
      console.error('Quote fetch error:', quoteError);
      throw new Error('Quote not found');
    }

    if (!quote) {
      throw new Error('Quote not found');
    }

    const pdfHtml = generateQuotePDF(quote);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="quote-${quoteId}.html"`);
    res.status(200).send(pdfHtml);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}

function generateQuotePDF(quote: any) {
  const clientName = quote.quote_requests?.full_name || 'Client';
  const clientEmail = quote.quote_requests?.email || quote.client_email;
  const clientCompany = quote.quote_requests?.company || '';
  const clientPhone = quote.quote_requests?.phone || '';
  const clientCountry = quote.quote_requests?.country || '';
  
  // Ensure expires_at is properly formatted
  const expiresDate = new Date(quote.expires_at);
  const isValidDate = !isNaN(expiresDate.getTime());
  const formattedExpiresDate = isValidDate 
    ? expiresDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Invalid Date';

  const pdfHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote #${quote.id} - NexaCore Innovations</title>
      <style>
        @page {
          margin: 15mm;
          size: A4;
        }
        
        @media print {
          body { margin: 0; -webkit-print-color-adjust: exact; color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .container { box-shadow: none; border-radius: 0; }
          .header { border-radius: 0; }
          .price-section { border-radius: 8px; }
        }
        
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #1f2937; 
          margin: 0; 
          padding: 0;
          background: white;
          font-size: 14px;
        }
        
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .header { 
          background: linear-gradient(135deg, #2563eb, #059669); 
          color: white; 
          padding: 30px; 
          text-align: center; 
        }
        
        .company-logo {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }
        
        .company-tagline {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 15px;
        }
        
        .company-contact {
          font-size: 12px;
          opacity: 0.8;
        }
        
        .quote-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .quote-info {
          flex: 1;
        }
        
        .quote-number {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 8px;
        }
        
        .quote-meta {
          color: #6b7280;
          font-size: 13px;
          line-height: 1.5;
        }
        
        .client-info {
          text-align: right;
          max-width: 250px;
        }
        
        .client-label {
          font-weight: bold;
          margin-bottom: 8px;
          color: #374151;
        }
        
        .client-name {
          font-size: 16px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 4px;
        }
        
        .client-details {
          color: #6b7280;
          font-size: 13px;
          line-height: 1.4;
        }
        
        .quote-details {
          background: #f8fafc;
          padding: 25px;
          margin: 20px 30px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        
        .price-section {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          padding: 35px;
          text-align: center;
          margin: 30px;
          border-radius: 10px;
          border: 2px solid #059669;
        }
        
        .price {
          font-size: 42px;
          font-weight: 900;
          color: #059669;
          margin-bottom: 8px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .price-label {
          font-size: 16px;
          color: #065f46;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        .price-validity {
          font-size: 12px;
          color: #065f46;
          background: rgba(255, 255, 255, 0.7);
          padding: 5px 12px;
          border-radius: 15px;
          display: inline-block;
        }
        
        .section {
          margin: 30px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
        }
        
        .section-icon {
          margin-right: 8px;
          font-size: 16px;
        }
        
        .deliverable-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .deliverable-item {
          background: #f8fafc;
          padding: 12px 15px;
          margin: 8px 0;
          border-radius: 6px;
          border-left: 4px solid #3b82f6;
          position: relative;
          font-size: 14px;
        }
        
        .deliverable-item::before {
          content: "✓";
          color: #059669;
          font-weight: bold;
          margin-right: 10px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 25px 30px;
        }
        
        .info-box {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #6b7280;
        }
        
        .info-label {
          font-weight: bold;
          color: #6b7280;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        
        .info-value {
          font-size: 15px;
          color: #1f2937;
          font-weight: 600;
        }
        
        .terms-section {
          background: #fffbeb;
          padding: 25px;
          margin: 30px;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
        }
        
        .important-info {
          background: #fef2f2;
          padding: 20px;
          margin: 30px;
          border-radius: 8px;
          border-left: 4px solid #ef4444;
        }
        
        .important-list {
          margin: 0;
          padding-left: 18px;
          color: #dc2626;
          line-height: 1.7;
        }
        
        .important-list li {
          margin-bottom: 6px;
        }
        
        .footer {
          background: #1f2937;
          color: white;
          padding: 30px;
          text-align: center;
          margin-top: 40px;
        }
        
        .footer-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 12px;
        }
        
        .footer-subtitle {
          margin-bottom: 20px;
          opacity: 0.9;
        }
        
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }
        
        .contact-item {
          font-size: 13px;
        }
        
        .contact-label {
          font-weight: bold;
          display: block;
          margin-bottom: 4px;
        }
        
        .footer-bottom {
          margin-top: 25px;
          padding-top: 15px;
          border-top: 1px solid #4b5563;
          font-size: 12px;
          opacity: 0.8;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          margin-left: 10px;
          text-transform: uppercase;
        }
        
        .status-sent { background: #fef3c7; color: #92400e; }
        .status-approved { background: #dcfce7; color: #166534; }
        .status-draft { background: #f3f4f6; color: #4b5563; }
        .status-declined { background: #fecaca; color: #991b1b; }
        
        .print-controls {
          padding: 15px;
          background: #f8fafc;
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .btn {
          background: #2563eb;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          margin: 0 8px;
        }
        
        .btn:hover {
          background: #1d4ed8;
        }
        
        .btn-secondary {
          background: #6b7280;
        }
        
        .btn-secondary:hover {
          background: #4b5563;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="print-controls no-print">
          <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
          <button class="btn btn-secondary" onclick="window.close()">✕ Close</button>
        </div>
        
        <div class="header">
          <div class="company-logo">NEXACORE INNOVATIONS</div>
          <div class="company-tagline">Building the future, one innovation at a time</div>
          <div class="company-contact">
            📧 projects@nexacore-innovations.com • 🌐 nexacore-innovations.com
          </div>
        </div>

        <div class="quote-header">
          <div class="quote-info">
            <div class="quote-number">
              Quote #${quote.id}
              <span class="status-badge status-${quote.status}">${quote.status}</span>
            </div>
            <div class="quote-meta">
              <div><strong>Created:</strong> ${new Date(quote.created_at).toLocaleDateString()}</div>
              <div><strong>Valid Until:</strong> ${formattedExpiresDate}</div>
              ${quote.sent_at ? `<div><strong>Sent:</strong> ${new Date(quote.sent_at).toLocaleDateString()}</div>` : ''}
              ${quote.approved_at ? `<div><strong>Approved:</strong> ${new Date(quote.approved_at).toLocaleDateString()}</div>` : ''}
            </div>
          </div>
          
          <div class="client-info">
            <div class="client-label">Prepared For:</div>
            <div class="client-name">${clientName}</div>
            <div class="client-details">
              <div>${clientEmail}</div>
              ${clientCompany ? `<div>${clientCompany}</div>` : ''}
              ${clientPhone ? `<div>📞 ${clientPhone}</div>` : ''}
              ${clientCountry ? `<div>🌍 ${clientCountry}</div>` : ''}
            </div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <div class="info-label">Service Type</div>
            <div class="info-value">${quote.service_type}</div>
          </div>
          
          <div class="info-box">
            <div class="info-label">Project Timeline</div>
            <div class="info-value">${quote.timeline}</div>
          </div>
        </div>

        <div class="price-section">
          <div class="price">${quote.currency} ${quote.price.toLocaleString()}</div>
          <div class="price-label">Total Project Investment</div>
          <div class="price-validity">Valid until ${formattedExpiresDate}</div>
        </div>

        <div class="section">
          <div class="section-title">
            <span class="section-icon">📋</span>
            Project Scope
          </div>
          <div class="quote-details">
            <p style="margin: 0; line-height: 1.7;">${quote.scope}</p>
          </div>
        </div>

        ${quote.deliverables && quote.deliverables.length > 0 ? `
        <div class="section">
          <div class="section-title">
            <span class="section-icon">🎯</span>
            Project Deliverables
          </div>
          <ul class="deliverable-list">
            ${quote.deliverables.map((deliverable: string) => 
              `<li class="deliverable-item">${deliverable}</li>`
            ).join('')}
          </ul>
        </div>
        ` : ''}

        <div class="terms-section">
          <div class="section-title" style="margin-bottom: 15px; border: none; padding: 0;">
            <span class="section-icon">📝</span>
            Terms & Conditions
          </div>
          <p style="margin: 0; line-height: 1.7;">${quote.terms}</p>
        </div>

        <div class="important-info">
          <div class="section-title" style="margin-bottom: 15px; border: none; padding: 0; color: #dc2626;">
            <span class="section-icon">⚠️</span>
            Important Information
          </div>
          <ul class="important-list">
            <li>This quote is valid until <strong>${formattedExpiresDate}</strong></li>
            <li>Pricing may change after the expiration date</li>
            <li>Project timeline begins after deposit receipt and final scope approval</li>
            <li>All deliverables will be provided as outlined in the project scope</li>
            <li>Changes to scope may affect pricing and timeline</li>
          </ul>
        </div>

        <div class="footer">
          <div class="footer-title">Ready to Get Started?</div>
          <div class="footer-subtitle">
            Contact us to accept this quote and begin your project
          </div>
          
          <div class="contact-grid">
            <div class="contact-item">
              <span class="contact-label">Email</span>
              projects@nexacore-innovations.com
            </div>
            <div class="contact-item">
              <span class="contact-label">Website</span>
              nexacore-innovations.com
            </div>
            <div class="contact-item">
              <span class="contact-label">Quote Valid Until</span>
              ${formattedExpiresDate}
            </div>
          </div>
          
          <div class="footer-bottom">
            © ${new Date().getFullYear()} NexaCore Innovations. All rights reserved.<br>
            Quote #${quote.id} • Generated on ${new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      <script>
        // Print functionality
        window.onload = function() {
          console.log('Quote PDF loaded for Quote #${quote.id}');
          document.title = 'Quote #${quote.id} - ${clientName} - NexaCore Innovations';
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
      </script>
    </body>
    </html>
  `;

  return pdfHtml;
}
