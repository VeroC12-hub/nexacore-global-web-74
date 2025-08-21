import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();

    let emailResponse;

    switch (type) {
      case 'quote_request_to_pm':
        emailResponse = await sendQuoteRequestToPM(data);
        break;
      case 'quote_to_client':
        emailResponse = await sendQuoteToClient(data);
        break;
      case 'quote_response_to_pm':
        emailResponse = await sendQuoteResponseToPM(data);
        break;
      default:
        throw new Error(`Unsupported email type: ${type}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Email sending error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});

async function sendQuoteRequestToPM(data: any) {
  // Use environment variable for domain, fallback to localhost for development
  const baseUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';
  const loginUrl = `${baseUrl}/admin/create-quote?request_id=${data.quote_request_id}&token=${generateSecureToken()}`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Quote Request - NexaCore Innovations</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #2563eb, #059669); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .urgent { background: #fef2f2; border: 2px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0; color: #dc2626; }
        .quote-details { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-label { font-weight: 600; color: #64748b; }
        .detail-value { color: #1e293b; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #2563eb, #059669); color: white !important; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .priority-high { border-left-color: #ef4444; }
        .priority-urgent { border-left-color: #dc2626; background: #fef2f2; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🚨 New Quote Request</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Action Required - Create Quote</p>
        </div>

        <div class="content">
          ${data.budget_estimate && data.budget_estimate > 10000 ? 
            '<div class="urgent"><strong>🔥 High-Value Lead:</strong> This request has a budget estimate above $10,000</div>' 
            : ''
          }
          
          <h2>Client Information</h2>
          <div class="quote-details">
            <div class="detail-row">
              <span class="detail-label">Client Name:</span>
              <span class="detail-value">${data.full_name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${data.email}</span>
            </div>
            ${data.phone ? `
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${data.phone}</span>
            </div>
            ` : ''}
            ${data.country ? `
            <div class="detail-row">
              <span class="detail-label">Country:</span>
              <span class="detail-value">${data.country}</span>
            </div>
            ` : ''}
          </div>

          <h2>Project Details</h2>
          <div class="quote-details">
            <div class="detail-row">
              <span class="detail-label">Service Type:</span>
              <span class="detail-value">${data.service_type}</span>
            </div>
            ${data.timeline ? `
            <div class="detail-row">
              <span class="detail-label">Timeline:</span>
              <span class="detail-value">${data.timeline}</span>
            </div>
            ` : ''}
            ${data.budget_estimate ? `
            <div class="detail-row">
              <span class="detail-label">Budget Estimate:</span>
              <span class="detail-value">$${data.budget_estimate.toLocaleString()}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Description:</span>
              <span class="detail-value">${data.description}</span>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" class="cta-button">
              📝 Login & Create Quote
            </a>
          </div>

          <div style="background: #e6fffa; border: 1px solid #38b2ac; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c7a7b; margin: 0 0 10px 0;">Next Steps:</h3>
            <ol style="color: #2c7a7b; margin: 0; padding-left: 20px;">
              <li>Click the login button above (secure link expires in 7 days)</li>
              <li>Review the quote request in the admin dashboard</li>
              <li>Create and customize the quote</li>
              <li>Send it directly to the client with one click</li>
            </ol>
          </div>
        </div>

        <div class="footer">
          <p><strong>NexaCore Innovations</strong> - Projects Management System</p>
          <p>This secure link expires in 7 days.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'NexaCore Projects <projects@nexacore-innovations.com>',
      to: ['projects@nexacore-innovations.com'],
      subject: `🚨 New Quote Request: ${data.service_type} - ${data.full_name}`,
      html: emailHtml,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`);
  }

  return await response.json();
}

async function sendQuoteToClient(data: any) {
  const baseUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';
  const quoteUrl = `${baseUrl}/quote/${data.quote_id}`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Quote from NexaCore Innovations</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #2563eb, #059669); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .quote-summary { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #059669; }
        .price-highlight { font-size: 32px; font-weight: bold; color: #059669; text-align: center; margin: 20px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #2563eb, #059669); color: white !important; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .deliverables { list-style: none; padding: 0; }
        .deliverables li { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .deliverables li:before { content: "✓"; color: #059669; font-weight: bold; margin-right: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">💼 Your Quote is Ready!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">From NexaCore Innovations</p>
        </div>

        <div class="content">
          <h2>Hello ${data.client_name},</h2>
          
          <p>Thank you for your interest in our ${data.service_type} services. We've prepared a detailed quote based on your requirements.</p>

          <div class="quote-summary">
            <h3 style="margin-top: 0; color: #1e293b;">Quote Summary</h3>
            <div class="price-highlight">${data.currency} ${data.price.toLocaleString()}</div>
            <p><strong>Timeline:</strong> ${data.timeline}</p>
            <p><strong>Service:</strong> ${data.service_type}</p>
          </div>

          ${data.deliverables && data.deliverables.length > 0 ? `
          <h3>What's Included:</h3>
          <ul class="deliverables">
            ${data.deliverables.map(item => `<li>${item}</li>`).join('')}
          </ul>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${quoteUrl}" class="cta-button">
              📋 Review & Respond to Quote
            </a>
          </div>

          <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0;">Next Steps:</h4>
            <ol style="color: #1e40af; margin: 0; padding-left: 20px;">
              <li>Click the button above to review your complete quote</li>
              <li>Create an account or sign in to your client portal</li>
              <li>Accept, request changes, or ask questions</li>
              <li>Once accepted, we'll begin work immediately</li>
            </ol>
          </div>

          <p style="color: #64748b; font-size: 14px;">
            <strong>Quote expires:</strong> ${new Date(data.expires_at).toLocaleDateString()}
          </p>
        </div>

        <div class="footer">
          <p><strong>NexaCore Innovations</strong></p>
          <p>Building the future, one innovation at a time.</p>
          <p>Questions? Reply to this email or visit our website.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'NexaCore Projects <projects@nexacore-innovations.com>',
      to: [data.client_email],
      subject: `Your Quote is Ready - ${data.service_type}`,
      html: emailHtml,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`);
  }

  return await response.json();
}

async function sendQuoteResponseToPM(data: any) {
  const baseUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';
  const dashboardUrl = `${baseUrl}/admin`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote Response - ${data.action}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #2563eb, #059669); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin: 10px 0; }
        .status-approved { background: #dcfce7; color: #166534; }
        .status-revision { background: #fef3c7; color: #92400e; }
        .status-declined { background: #fecaca; color: #991b1b; }
        .quote-details { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #2563eb, #059669); color: white !important; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">
            ${data.action === 'approved' ? '✅ Quote Approved!' : 
              data.action === 'revision_requested' ? '📝 Revision Requested' : 
              '❌ Quote Declined'}
          </h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.client_name} has responded</p>
        </div>

        <div class="content">
          <div class="status-badge ${data.action === 'approved' ? 'status-approved' : 
            data.action === 'revision_requested' ? 'status-revision' : 'status-declined'}">
            ${data.action.toUpperCase().replace('_', ' ')}
          </div>

          <div class="quote-details">
            <h3 style="margin-top: 0;">Quote Details</h3>
            <p><strong>Client:</strong> ${data.client_name} (${data.client_email})</p>
            <p><strong>Service:</strong> ${data.service_type}</p>
            <p><strong>Amount:</strong> ${data.currency} ${data.price}</p>
            <p><strong>Action Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          ${data.message ? `
          <div style="background: #fffbeb; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #92400e; margin: 0 0 10px 0;">Client Message:</h4>
            <p style="color: #92400e; margin: 0;">"${data.message}"</p>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" class="cta-button">
              🔧 Manage in Admin Dashboard
            </a>
          </div>

          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #0c4a6e; margin: 0 0 10px 0;">Next Steps:</h4>
            <ul style="color: #0c4a6e; margin: 0; padding-left: 20px;">
              ${data.action === 'approved' ? `
                <li>Begin project work</li>
                <li>Set up project timeline</li>
                <li>Send welcome/onboarding materials</li>
              ` : data.action === 'revision_requested' ? `
                <li>Review client feedback</li>
                <li>Modify quote as requested</li>
                <li>Resend updated quote</li>
              ` : `
                <li>Follow up with client if appropriate</li>
                <li>Archive quote request</li>
                <li>Add notes for future reference</li>
              `}
            </ul>
          </div>
        </div>

        <div class="footer">
          <p><strong>NexaCore Innovations</strong> - Project Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'NexaCore Projects <projects@nexacore-innovations.com>',
      to: ['projects@nexacore-innovations.com'],
      subject: `Quote ${data.action === 'approved' ? 'APPROVED' : 
        data.action === 'revision_requested' ? 'REVISION REQUESTED' : 'DECLINED'} - ${data.client_name}`,
      html: emailHtml,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`);
  }

  return await response.json();
}

function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
