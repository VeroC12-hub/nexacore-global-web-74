import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enhanced CORS handling
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

    console.log('Generating PDF for quote:', quoteId);

    // Enhanced error handling for database connection
    if (!process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL) {
      console.error('Supabase URL not configured');
      return res.status(500).json({ error: 'Database configuration error' });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase service role key not configured');
      return res.status(500).json({ error: 'Database authentication error' });
    }

    // Fetch quote data from database with enhanced error handling
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
      if (quoteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Quote not found' });
      }
      throw new Error(`Database error: ${quoteError.message}`);
    }

    if (!quote) {
      console.error('Quote not found for ID:', quoteId);
      return res.status(404).json({ error: 'Quote not found' });
    }

    console.log('Quote data retrieved successfully:', { id: quote.id, status: quote.status });

    const pdfHtml = generateQuotePDF(quote);

    // Set proper headers for PDF display
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="quote-${quoteId}.html"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).send(pdfHtml);

  } catch (error) {
    console.error('PDF generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ 
      error: 'PDF generation failed',
      details: errorMessage,
      quoteId: req.query.id
    });
  }
}

function generateQuotePDF(quote: any) {
  const clientName = quote.quote_requests?.full_name || 'Client';
  const clientEmail = quote.quote_requests?.email || quote.client_email;
  const clientCompany = quote.quote_requests?.company || '';
  const clientPhone = quote.quote_requests?.phone || '';
  const clientCountry = quote.quote_requests?.country || '';
  
  // Enhanced date formatting with error handling
  let formattedExpiresDate = 'Invalid Date';
  let formattedCreatedDate = 'Invalid Date';
  let formattedSentDate = '';
  let formattedApprovedDate = '';
  
  try {
    if (quote.expires_at) {
      const expiresDate = new Date(quote.expires_at);
      if (!isNaN(expiresDate.getTime())) {
        formattedExpiresDate = expiresDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    }
    
    if (quote.created_at) {
      const createdDate = new Date(quote.created_at);
      if (!isNaN(createdDate.getTime())) {
        formattedCreatedDate = createdDate.toLocaleDateString('en-US');
      }
    }
    
    if (quote.sent_at) {
      const sentDate = new Date(quote.sent_at);
      if (!isNaN(sentDate.getTime())) {
        formattedSentDate = sentDate.toLocaleDateString('en-US');
      }
    }
    
    if (quote.approved_at) {
      const approvedDate = new Date(quote.approved_at);
      if (!isNaN(approvedDate.getTime())) {
        formattedApprovedDate = approvedDate.toLocaleDateString('en-US');
      }
    }
  } catch (dateError) {
    console.warn('Date formatting error:', dateError);
  }

  // Enhanced deliverables handling
  const deliverables = Array.isArray(quote.deliverables) ? 
    quote.deliverables.filter(item => item && item.trim() !== '') : [];

  const pdfHtml = `
    <!DOCTYPE html>
    <html lang="en">
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
        }
        
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
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
          white-space: pre-wrap;
          word-wrap: break-word;
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
          transition: background-color 0.2s;
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
            </div>
            <div class="quote-meta">
              <div><strong>Created:</strong> ${formattedCreatedDate}</div>
              <div><strong>Valid Until:</strong> ${formattedExpiresDate}</div>
              ${formattedSentDate ? `<div><strong>Sent:</strong> ${formattedSentDate}</div>` : ''}
              ${formattedApprovedDate ? `<div><strong>Approved:</strong> ${formattedApprovedDate}</div>` : ''}
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
            <div class="info-value">${quote.service_type || 'Not specified'}</div>
          </div>
          
          <div class="info-box">
            <div class="info-label">Project Timeline</div>
            <div class="info-value">${quote.timeline || 'To be determined'}</div>
          </div>
        </div>

        <div class="price-section">
          <div class="price">${quote.currency || '$'} ${(quote.price || 0).toLocaleString()}</div>
          <div class="price-label">Total Project Investment</div>
          <div class="price-validity">Valid until ${formattedExpiresDate}</div>
        </div>

        <div class="section">
          <div class="section-title">
            Project Scope
          </div>
          <div class="quote-details">
            ${quote.scope || 'Project scope will be defined upon discussion.'}
          </div>
        </div>

        ${deliverables.length > 0 ? `
        <div class="section">
          <div class="section-title">
            Project Deliverables
          </div>
          <ul class="deliverable-list">
            ${deliverables.map((deliverable: string) => 
              `<li class="deliverable-item">${deliverable}</li>`
            ).join('')}
          </ul>
        </div>
        ` : ''}

        <div class="terms-section">
          <div class="section-title" style="margin-bottom: 15px; border: none; padding: 0;">
            Terms & Conditions
          </div>
          <div style="white-space: pre-wrap; line-height: 1.7;">${quote.terms || 'Standard terms and conditions apply.'}</div>
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
        window.onload = function() {
          console.log('Quote PDF loaded for Quote #${quote.id}');
          document.title = 'Quote #${quote.id} - ${clientName} - NexaCore Innovations';
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
    </html>
  `;

  return pdfHtml;
}
