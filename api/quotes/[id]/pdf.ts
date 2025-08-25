// api/quotes/[id]/pdf.ts - TABLE-BASED PROFESSIONAL FORMAT
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

    const pdfHtml = generateTableBasedPDF(quote);

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
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
}

function getExpiresDate(quote: any): string {
  if (quote.expires_at && formatDate(quote.expires_at)) {
    return formatDate(quote.expires_at);
  }
  const created = quote.created_at;
  if (created) {
    const createdDate = new Date(created);
    createdDate.setDate(createdDate.getDate() + 30); // Default 30 days
    return formatDate(createdDate.toISOString());
  }
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function generateTableBasedPDF(quote: any) {
  const clientName = quote.quote_requests?.full_name || 'Valued Client';
  const clientEmail = quote.quote_requests?.email || '';
  const clientCompany = quote.quote_requests?.company || '';
  const clientPhone = quote.quote_requests?.phone || '';
  const clientCountry = quote.quote_requests?.country || '';
  const serviceType = quote.quote_requests?.service_type || quote.service_type;
  const projectDescription = quote.quote_requests?.description || '';

  const createdDate = formatDate(quote.created_at) || new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const expiresDate = getExpiresDate(quote);
  const deliverables = Array.isArray(quote.deliverables) ? quote.deliverables : [];
  const totalPrice = (quote.price || 0);
  const currency = quote.currency || '$';

  // Break down the quote into service components for the table
  const serviceBreakdown = [
    {
      task: 'Discovery & Requirements Analysis',
      hours: Math.round(totalPrice * 0.15 / 100),
      rate: 100,
      cost: Math.round(totalPrice * 0.15)
    },
    {
      task: 'Project Planning & Architecture Design',
      hours: Math.round(totalPrice * 0.15 / 100),
      rate: 100,
      cost: Math.round(totalPrice * 0.15)
    },
    {
      task: 'Development & Implementation',
      hours: Math.round(totalPrice * 0.40 / 100),
      rate: 100,
      cost: Math.round(totalPrice * 0.40)
    },
    {
      task: 'Testing & Quality Assurance',
      hours: Math.round(totalPrice * 0.15 / 100),
      rate: 100,
      cost: Math.round(totalPrice * 0.15)
    },
    {
      task: 'Deployment & Documentation',
      hours: Math.round(totalPrice * 0.15 / 100),
      rate: 100,
      cost: Math.round(totalPrice * 0.15)
    }
  ];

  const subtotal = serviceBreakdown.reduce((sum, item) => sum + item.cost, 0);
  const grandTotal = totalPrice;

  return `<!DOCTYPE html>
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.4;
      color: #333;
      background: #f8f9fa;
      padding: 20px;
    }
    
    .quote-container {
      max-width: 21cm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    
    /* Header with logo and gradient */
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%);
      color: white;
      padding: 30px 40px;
      text-align: center;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    
    .company-logo {
      width: 50px;
      height: 50px;
      margin-right: 15px;
    }
    
    .company-name {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(45deg, #ffffff, #e0f2fe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .quote-title {
      font-size: 24px;
      font-weight: 600;
      margin-top: 10px;
    }
    
    /* Company Information Section */
    .info-section {
      padding: 30px 40px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #3b82f6;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 2px solid #3b82f6;
      display: inline-block;
    }
    
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    .info-table td {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      vertical-align: top;
    }
    
    .info-label {
      background: #f3f4f6;
      font-weight: 600;
      color: #3b82f6;
      min-width: 150px;
    }
    
    .info-value {
      background: white;
    }
    
    /* Quote Details Bar */
    .quote-details {
      background: #f8f9fa;
      padding: 20px 40px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .quote-details-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .quote-details-table td {
      padding: 10px 15px;
      border: 1px solid #d1d5db;
      text-align: center;
      font-weight: 600;
    }
    
    .quote-details-table .header-cell {
      background: #3b82f6;
      color: white;
    }
    
    /* Service Breakdown Table */
    .breakdown-section {
      padding: 30px 40px;
    }
    
    .service-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .breakdown-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    .breakdown-table th {
      background: linear-gradient(135deg, #3b82f6, #14b8a6);
      color: white;
      padding: 12px 15px;
      font-weight: 600;
      text-align: center;
      border: 1px solid #2563eb;
    }
    
    .breakdown-table td {
      padding: 12px 15px;
      border: 1px solid #d1d5db;
      text-align: center;
    }
    
    .breakdown-table tbody tr:nth-child(even) {
      background: #f9fafb;
    }
    
    .breakdown-table tbody tr:hover {
      background: #f3f4f6;
    }
    
    .task-cell {
      text-align: left !important;
      font-weight: 500;
    }
    
    .total-row {
      background: #e5e7eb !important;
      font-weight: 600;
    }
    
    .grand-total-row {
      background: linear-gradient(135deg, #3b82f6, #14b8a6) !important;
      color: white !important;
      font-weight: 700;
      font-size: 16px;
    }
    
    /* Payment Terms */
    .payment-section {
      padding: 30px 40px;
      background: #f8f9fa;
      border-top: 1px solid #e5e7eb;
    }
    
    .payment-terms {
      background: white;
      padding: 20px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .payment-terms h3 {
      color: #3b82f6;
      margin-bottom: 15px;
      font-size: 16px;
    }
    
    .payment-terms ul {
      list-style: disc;
      padding-left: 20px;
    }
    
    .payment-terms li {
      margin-bottom: 8px;
      color: #4b5563;
    }
    
    /* Terms and Conditions */
    .terms-section {
      background: white;
      padding: 20px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .terms-section h3 {
      color: #3b82f6;
      margin-bottom: 15px;
      font-size: 16px;
    }
    
    .terms-section ol {
      padding-left: 20px;
    }
    
    .terms-section li {
      margin-bottom: 10px;
      color: #4b5563;
      line-height: 1.6;
    }
    
    /* Signature Section */
    .signature-section {
      background: white;
      padding: 20px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
    }
    
    .signature-section h3 {
      color: #3b82f6;
      margin-bottom: 15px;
      font-size: 16px;
    }
    
    .signature-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    
    .signature-table td {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      vertical-align: middle;
    }
    
    .signature-label {
      background: #f3f4f6;
      font-weight: 600;
      color: #3b82f6;
      width: 200px;
    }
    
    .signature-field {
      background: white;
      min-height: 40px;
    }
    
    /* Footer */
    .footer {
      background: linear-gradient(135deg, #1f2937, #374151);
      color: white;
      padding: 30px 40px;
      text-align: center;
    }
    
    .contact-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .contact-item {
      padding: 15px;
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }
    
    .contact-item strong {
      display: block;
      margin-bottom: 5px;
      color: #60a5fa;
    }
    
    /* Print Styles */
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .quote-container {
        box-shadow: none;
        border-radius: 0;
      }
      
      .header, .footer, .grand-total-row {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    
    @media (max-width: 768px) {
      .info-section {
        padding: 20px;
      }
      
      .breakdown-section {
        padding: 20px;
      }
      
      .breakdown-table {
        font-size: 12px;
      }
    }
  </style>
</head>
<body>
  <div class="quote-container">
    <!-- Header -->
    <div class="header">
      <div class="logo-section">
        <img src="https://www.nexacore-innovations.com/nexacore-logo.png" 
             alt="NexaCore Innovations Logo" 
             class="company-logo"
             onerror="this.style.display='none'">
        <div class="company-name">NexaCore Innovations</div>
      </div>
      <div class="quote-title">Project Quote - ${serviceType}</div>
    </div>

    <!-- Company Information -->
    <div class="info-section">
      <div class="section-title">Company's Information:</div>
      <table class="info-table">
        <tr>
          <td class="info-label">Company Logo:</td>
          <td class="info-value">
            <img src="https://www.nexacore-innovations.com/nexacore-logo.png" 
                 alt="NexaCore Logo" style="height: 30px;" 
                 onerror="this.style.display='none'">
          </td>
          <td class="info-label">Company's Address:</td>
          <td class="info-value">Accra, Ghana</td>
        </tr>
        <tr>
          <td class="info-label">Company's Name:</td>
          <td class="info-value">NexaCore Innovations</td>
          <td class="info-label">Company's Email Address:</td>
          <td class="info-value">projects@nexacore-innovations.com</td>
        </tr>
        <tr>
          <td class="info-label">Company's Phone Number:</td>
          <td class="info-value">+233 209 628 907</td>
          <td class="info-label">Website:</td>
          <td class="info-value">www.nexacore-innovations.com</td>
        </tr>
      </table>
    </div>

    <!-- Client Information -->
    <div class="info-section">
      <div class="section-title">Client's Information:</div>
      <table class="info-table">
        <tr>
          <td class="info-label">Client's Name:</td>
          <td class="info-value">${clientName}</td>
          <td class="info-label">Client's Phone Number:</td>
          <td class="info-value">${clientPhone}</td>
        </tr>
        <tr>
          <td class="info-label">Client's Company:</td>
          <td class="info-value">${clientCompany}</td>
          <td class="info-label">Client's Email Address:</td>
          <td class="info-value">${clientEmail}</td>
        </tr>
        <tr>
          <td class="info-label">Client's Address:</td>
          <td class="info-value">${clientCountry}</td>
          <td class="info-label">Service Type:</td>
          <td class="info-value">${serviceType}</td>
        </tr>
      </table>
    </div>

    <!-- Quote Details -->
    <div class="quote-details">
      <table class="quote-details-table">
        <tr>
          <td class="header-cell">Quote Number</td>
          <td class="header-cell">Date</td>
          <td class="header-cell">Valid Until</td>
        </tr>
        <tr>
          <td>#${quote.id}</td>
          <td>${createdDate}</td>
          <td>${expiresDate}</td>
        </tr>
      </table>
    </div>

    <!-- Service Breakdown -->
    <div class="breakdown-section">
      <div class="service-title">${serviceType} Quote</div>
      
      <table class="breakdown-table">
        <thead>
          <tr>
            <th>Task Description</th>
            <th>Estimated Hours</th>
            <th>Hourly Rate</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
          ${serviceBreakdown.map(item => `
            <tr>
              <td class="task-cell">${item.task}</td>
              <td>${item.hours}</td>
              <td>${currency}${item.rate}</td>
              <td>${currency}${item.cost.toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td class="task-cell"><strong>Subtotal</strong></td>
            <td><strong>${serviceBreakdown.reduce((sum, item) => sum + item.hours, 0)}</strong></td>
            <td></td>
            <td><strong>${currency}${subtotal.toLocaleString()}</strong></td>
          </tr>
        </tbody>
      </table>

      ${deliverables.length > 0 ? `
      <h4 style="margin: 20px 0 10px 0; color: #3b82f6;">Additional Services</h4>
      <table class="breakdown-table">
        <thead>
          <tr>
            <th>Item Description</th>
            <th>Quantity</th>
            <th>Unit Cost</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
          ${deliverables.slice(0, 3).map((deliverable, index) => `
            <tr>
              <td class="task-cell">${deliverable}</td>
              <td>1</td>
              <td>${currency}${Math.round((grandTotal - subtotal) / Math.min(deliverables.length, 3))}</td>
              <td>${currency}${Math.round((grandTotal - subtotal) / Math.min(deliverables.length, 3))}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td class="task-cell"><strong>Additional Total</strong></td>
            <td></td>
            <td></td>
            <td><strong>${currency}${(grandTotal - subtotal).toLocaleString()}</strong></td>
          </tr>
        </tbody>
      </table>
      ` : ''}

      <table class="breakdown-table">
        <tr class="grand-total-row">
          <td class="task-cell"><strong>Grand Total:</strong></td>
          <td></td>
          <td></td>
          <td><strong>${currency}${grandTotal.toLocaleString()}</strong></td>
        </tr>
      </table>
    </div>

    <!-- Payment Terms and Conditions -->
    <div class="payment-section">
      <div class="payment-terms">
        <h3>Payment Terms</h3>
        <p style="margin-bottom: 15px; color: #4b5563;">
          A <strong>25% deposit (${currency}${Math.round(grandTotal * 0.25).toLocaleString()})</strong> is required to commence work. The remaining balance will be invoiced as follows:
        </p>
        <ul>
          <li><strong>25% (${currency}${Math.round(grandTotal * 0.25).toLocaleString()})</strong> due upon completion of requirements and design phase.</li>
          <li><strong>25% (${currency}${Math.round(grandTotal * 0.25).toLocaleString()})</strong> due upon development milestone completion.</li>
          <li><strong>25% (${currency}${Math.round(grandTotal * 0.25).toLocaleString()})</strong> due upon project completion and final delivery.</li>
        </ul>
      </div>

      <div class="terms-section">
        <h3>Terms and Conditions</h3>
        <ol>
          <li>Any additional costs or fees, such as software licenses or third-party services, will be invoiced separately and are not included in the project estimate.</li>
          <li>The client is responsible for providing all necessary assets, including images, logos, and content, in a timely manner. Delays in providing these may result in adjustments to the project timeline and costs.</li>
          <li>All intellectual property rights for the developed solution will be transferred to the client upon full payment of the project.</li>
          <li>The client agrees to provide feedback and approvals in a timely manner. Delays in communication may result in adjustments to the project timeline and costs.</li>
          <li>This quote is valid for 30 days from the date above. Project scope changes may affect the final cost.</li>
        </ol>
      </div>

      <div class="signature-section">
        <h3>Project Acceptance</h3>
        <p style="color: #4b5563; margin-bottom: 15px;">
          By signing below, the client acknowledges that they have read, understood, and agree to the terms and conditions outlined in this ${serviceType} Quote.
        </p>
        
        <table class="signature-table">
          <tr>
            <td class="signature-label">Client's Signature:</td>
            <td class="signature-field"></td>
            <td class="signature-label">Date:</td>
            <td class="signature-field" style="width: 120px;"></td>
          </tr>
          <tr>
            <td class="signature-label">Company's Name:</td>
            <td class="signature-field">NexaCore Innovations</td>
            <td class="signature-label"></td>
            <td class="signature-field"></td>
          </tr>
          <tr>
            <td class="signature-label">Representative's Signature:</td>
            <td class="signature-field"></td>
            <td class="signature-label">Date:</td>
            <td class="signature-field" style="width: 120px;"></td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="contact-info">
        <div class="contact-item">
          <strong>Email</strong>
          projects@nexacore-innovations.com
        </div>
        <div class="contact-item">
          <strong>Website</strong>
          www.nexacore-innovations.com
        </div>
        <div class="contact-item">
          <strong>Phone</strong>
          +233 209 628 907
        </div>
        <div class="contact-item">
          <strong>Location</strong>
          Accra, Ghana
        </div>
      </div>
      <p style="font-size: 14px; opacity: 0.8; margin-top: 20px;">
        © ${new Date().getFullYear()} NexaCore Innovations. All rights reserved. | Generated on ${new Date().toLocaleString()}
      </p>
    </div>
  </div>

  <script>
    window.onload = function() {
      document.title = 'Quote-${quote.id}-${clientName}-NexaCore';
      
      // Add print button
      setTimeout(() => {
        const printBtn = document.createElement('button');
        printBtn.innerHTML = 'Print/Download PDF';
        printBtn.style.cssText = \`
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #3b82f6, #14b8a6);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          z-index: 1000;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          font-size: 14px;
        \`;
        printBtn.onclick = () => window.print();
        document.body.appendChild(printBtn);
      }, 1000);
    };
    
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    });
  </script>
</body>
</html>`;
}
