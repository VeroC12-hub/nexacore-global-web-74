// api/quotes/[id]/pdf.ts - CLEAN LETTERHEAD QUOTE PDF
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

    const pdfHtml = generateQuotePDF(quote);

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
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function getExpiresDate(quote: any): string {
  if (quote.expires_at && formatDate(quote.expires_at)) {
    return formatDate(quote.expires_at);
  }
  const created = quote.created_at;
  if (created) {
    const createdDate = new Date(created);
    createdDate.setDate(createdDate.getDate() + 30);
    return formatDate(createdDate.toISOString());
  }
  return formatDate(new Date().toISOString());
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'USD' || currency === '$') return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (currency === 'GHS' || currency === 'GH₵') return `GH₵${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generateQuotePDF(quote: any) {
  const clientName = quote.quote_requests?.full_name || 'Valued Client';
  const clientEmail = quote.quote_requests?.email || '';
  const clientCompany = quote.quote_requests?.company || '';
  const clientPhone = quote.quote_requests?.phone || '';
  const clientCountry = quote.quote_requests?.country || '';
  const serviceType = quote.quote_requests?.service_type || quote.service_type || '';
  const projectDescription = quote.quote_requests?.description || quote.scope || '';

  const createdDate = formatDate(quote.created_at) || formatDate(new Date().toISOString());
  const expiresDate = getExpiresDate(quote);
  const deliverables = Array.isArray(quote.deliverables) ? quote.deliverables : [];
  const totalPrice = quote.price || 0;
  const currency = quote.currency || 'USD';
  const timeline = quote.timeline || '';
  const terms = quote.terms || '';

  // Generate short quote number from UUID
  const quoteNumber = `NCI-${quote.id.substring(0, 8).toUpperCase()}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote ${quoteNumber} - ${clientName} - NexaCore Innovations</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif;
      color: #2d3748;
      background: #e8edf2;
      padding: 20px;
      line-height: 1.5;
      font-size: 13px;
    }

    .page {
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
      position: relative;
      overflow: hidden;
    }

    /* ─── LETTERHEAD HEADER ─── */
    .letterhead-header {
      background: linear-gradient(135deg, #1E3A5F 0%, #0098A6 100%);
      color: white;
      padding: 32px 48px 24px;
      position: relative;
    }
    .letterhead-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #CDDC39, #0098A6, #1E3A5F);
    }
    .lh-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .lh-brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .lh-brand img {
      width: 52px;
      height: 52px;
    }
    .lh-brand-text h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 3px;
      line-height: 1;
    }
    .lh-brand-text span {
      font-size: 9px;
      letter-spacing: 5px;
      text-transform: uppercase;
      opacity: 0.7;
    }
    .lh-contact {
      text-align: right;
      font-size: 11px;
      opacity: 0.85;
      line-height: 1.7;
    }
    .doc-type {
      margin-top: 18px;
      font-size: 22px;
      font-weight: 300;
      letter-spacing: 6px;
      text-transform: uppercase;
      opacity: 0.9;
    }

    /* ─── CONTENT BODY ─── */
    .content {
      padding: 36px 48px;
    }

    /* Quote meta bar */
    .meta-bar {
      display: flex;
      justify-content: space-between;
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px 24px;
      margin-bottom: 28px;
    }
    .meta-item {
      text-align: center;
    }
    .meta-item .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #718096;
      margin-bottom: 4px;
    }
    .meta-item .value {
      font-size: 14px;
      font-weight: 700;
      color: #1E3A5F;
    }

    /* Client details */
    .client-block {
      margin-bottom: 28px;
    }
    .section-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #0098A6;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .client-name {
      font-size: 18px;
      font-weight: 700;
      color: #1E3A5F;
      margin-bottom: 2px;
    }
    .client-details {
      color: #4a5568;
      font-size: 13px;
    }

    /* Project description */
    .project-desc {
      background: #f7fafc;
      border-left: 3px solid #0098A6;
      padding: 14px 18px;
      margin-bottom: 28px;
      border-radius: 0 6px 6px 0;
    }
    .project-desc .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #0098A6;
      font-weight: 700;
      margin-bottom: 4px;
    }

    /* ─── DELIVERABLES TABLE ─── */
    .deliverables-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
    }
    .deliverables-table th {
      background: #1E3A5F;
      color: white;
      padding: 10px 16px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .deliverables-table th:last-child {
      text-align: right;
    }
    .deliverables-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    .deliverables-table tbody tr:nth-child(even) {
      background: #f7fafc;
    }
    .deliverables-table .item-num {
      color: #0098A6;
      font-weight: 700;
      width: 40px;
    }

    /* Total row */
    .total-bar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      background: linear-gradient(135deg, #1E3A5F, #0098A6);
      color: white;
      padding: 14px 24px;
      border-radius: 0 0 6px 6px;
      margin-bottom: 28px;
    }
    .total-bar .total-label {
      font-size: 14px;
      font-weight: 600;
      margin-right: 32px;
      letter-spacing: 1px;
    }
    .total-bar .total-amount {
      font-size: 22px;
      font-weight: 800;
    }

    /* Timeline & Terms */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }
    .info-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px 18px;
    }
    .info-card.full-width {
      grid-column: 1 / -1;
    }
    .info-card h4 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #0098A6;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .info-card p, .info-card li {
      color: #4a5568;
      font-size: 12.5px;
      line-height: 1.6;
    }
    .info-card ul {
      padding-left: 16px;
    }
    .info-card li { margin-bottom: 4px; }

    /* Signature */
    .signature-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .sig-block .sig-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #718096;
      margin-bottom: 28px;
    }
    .sig-line {
      border-bottom: 1px solid #2d3748;
      margin-bottom: 6px;
      min-height: 30px;
    }
    .sig-sub {
      font-size: 10px;
      color: #a0aec0;
    }

    /* ─── LETTERHEAD FOOTER ─── */
    .letterhead-footer {
      background: linear-gradient(135deg, #0098A6, #1E3A5F);
      color: white;
      padding: 18px 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      position: relative;
    }
    .letterhead-footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #1E3A5F, #0098A6, #CDDC39);
    }
    .lf-items {
      display: flex;
      gap: 24px;
      opacity: 0.85;
    }
    .lf-copy {
      opacity: 0.6;
      font-size: 10px;
    }

    /* ─── PRINT ─── */
    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; min-height: auto; }
      .letterhead-header, .letterhead-footer, .total-bar,
      .deliverables-table th, .meta-bar {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- LETTERHEAD HEADER -->
    <div class="letterhead-header">
      <div class="lh-top">
        <div class="lh-brand">
          <img src="https://www.nexacore-innovations.com/nexacore-logo.png"
               alt="NexaCore" onerror="this.style.display='none'">
          <div class="lh-brand-text">
            <h1>NEXACORE</h1>
            <span>I N N O V A T I O N S</span>
          </div>
        </div>
        <div class="lh-contact">
          projects@nexacore-innovations.com<br>
          +233 209 628 907<br>
          www.nexacore-innovations.com
        </div>
      </div>
      <div class="doc-type">Quotation</div>
    </div>

    <!-- CONTENT -->
    <div class="content">
      <!-- Quote Meta -->
      <div class="meta-bar">
        <div class="meta-item">
          <div class="label">Quote No.</div>
          <div class="value">${quoteNumber}</div>
        </div>
        <div class="meta-item">
          <div class="label">Date</div>
          <div class="value">${createdDate}</div>
        </div>
        <div class="meta-item">
          <div class="label">Valid Until</div>
          <div class="value">${expiresDate}</div>
        </div>
        ${timeline ? `
        <div class="meta-item">
          <div class="label">Timeline</div>
          <div class="value">${timeline}</div>
        </div>` : ''}
      </div>

      <!-- Client Info -->
      <div class="client-block">
        <div class="section-label">Prepared For</div>
        <div class="client-name">${clientName}</div>
        <div class="client-details">
          ${clientCompany ? `${clientCompany}<br>` : ''}${clientEmail}${clientPhone ? ` &middot; ${clientPhone}` : ''}${clientCountry ? `<br>${clientCountry}` : ''}
        </div>
      </div>

      <!-- Project Description -->
      ${projectDescription ? `
      <div class="project-desc">
        <div class="label">Project &mdash; ${serviceType}</div>
        <p>${projectDescription}</p>
      </div>` : `
      <div class="project-desc">
        <div class="label">Service</div>
        <p>${serviceType}</p>
      </div>`}

      <!-- Deliverables Table -->
      ${deliverables.length > 0 ? `
      <table class="deliverables-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Deliverable / Item</th>
          </tr>
        </thead>
        <tbody>
          ${deliverables.map((item: string, i: number) => {
            // Strip leading numbers like "1." or "1)" from the item text
            const cleanItem = item.replace(/^\d+[\.\)]\s*/, '');
            return `<tr>
              <td class="item-num">${i + 1}</td>
              <td>${cleanItem}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>` : ''}

      <!-- Total -->
      <div class="total-bar">
        <span class="total-label">TOTAL</span>
        <span class="total-amount">${formatCurrency(totalPrice, currency)}</span>
      </div>

      <!-- Terms & Payment -->
      <div class="info-grid">
        ${terms ? `
        <div class="info-card full-width">
          <h4>Payment Terms</h4>
          <p>${terms}</p>
        </div>` : `
        <div class="info-card">
          <h4>Payment Terms</h4>
          <ul>
            <li>50% deposit to commence work</li>
            <li>50% upon project completion</li>
          </ul>
        </div>
        <div class="info-card">
          <h4>Notes</h4>
          <p>This quote is valid for 30 days from the date above. Changes to the scope may affect the final cost.</p>
        </div>`}
      </div>

      <!-- Signatures -->
      <div class="signature-row">
        <div class="sig-block">
          <div class="sig-label">Client Acceptance</div>
          <div class="sig-line"></div>
          <div class="sig-sub">Signature &amp; Date</div>
        </div>
        <div class="sig-block">
          <div class="sig-label">For NexaCore Innovations</div>
          <div class="sig-line"></div>
          <div class="sig-sub">Authorized Signature &amp; Date</div>
        </div>
      </div>
    </div>

    <!-- LETTERHEAD FOOTER -->
    <div class="letterhead-footer">
      <div class="lf-items">
        <span>projects@nexacore-innovations.com</span>
        <span>+233 209 628 907</span>
        <span>www.nexacore-innovations.com</span>
        <span>Accra, Ghana</span>
      </div>
      <div class="lf-copy">&copy; ${new Date().getFullYear()} NexaCore Innovations</div>
    </div>
  </div>

  <script>
    document.title = 'Quote-${quoteNumber}-${clientName.replace(/'/g, '')}-NexaCore';
    // Add print button
    const btn = document.createElement('button');
    btn.innerHTML = '&#x1F5A8; Print / Save as PDF';
    btn.className = 'no-print';
    btn.style.cssText = 'position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#0098A6,#1E3A5F);color:#fff;border:none;padding:12px 28px;border-radius:25px;cursor:pointer;font-weight:600;z-index:1000;box-shadow:0 4px 15px rgba(0,152,166,0.3);font-size:14px;';
    btn.onclick = () => window.print();
    document.body.appendChild(btn);
    document.addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'p') { e.preventDefault(); window.print(); } });
  </script>
</body>
</html>`;
}
