import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

console.log('Email function starting...');
console.log('Resend API Key available:', !!RESEND_API_KEY);

serve(async (req) => {
  console.log(`Incoming ${req.method} request`);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    console.log('Email request type:', type);
    console.log('Email data:', JSON.stringify(data, null, 2));

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable not set');
    }

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

    console.log('Email sent successfully:', emailResponse);

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
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});

async function sendQuoteRequestToPM(data: any) {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://nexacore-innovations.com';
  const loginUrl = `${baseUrl}/admin/create-quote?request_id=${data.quote_request_id}&token=${generateSecureToken()}`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🚨 URGENT: New Quote Request - NexaCore Innovations</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f8fafc; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 8px; 
          overflow: hidden; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #dc2626, #ef4444); 
          color: white; 
          padding: 30px; 
          text-align: center; 
        }
        .content { padding: 30px; }
        .urgent { 
          background: #fef2f2; 
          border: 2px solid #ef4444; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
          color: #dc2626;
          text-align: center;
          font-weight: bold;
        }
        .quote-details { 
          background: #f8fafc; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 20px 0; 
          border-left: 4px solid #2563eb; 
        }
        .detail-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 8px 0; 
          border-bottom: 1px solid #e2e8f0; 
        }
        .detail-label { 
          font-weight: 600; 
          color: #64748b; 
        }
        .detail-value { 
          color: #1e293b; 
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #dc2626, #ef4444); 
          color: white !important; 
          padding: 15px 30px; 
          border-radius: 8px; 
          text-decoration: none; 
          font-weight: 600; 
          margin: 20px 0;
          text-align: center;
          font-size: 18px;
        }
        .footer { 
          background: #f1f5f9; 
          padding: 20px; 
          text-align: center; 
          color: #64748b; 
          font-size: 14px; 
        }
        .highlight { 
          background: #fef3c7; 
          padding: 2px 6px; 
          border-radius: 4px; 
          font-weight: bold; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🚨 URGENT: New Quote Request!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">
            Action Required - Create Quote Now
          </p>
        </div>

        <div class="content">
          ${data.budget_estimate && data.budget_estimate > 10000 ? 
            '<div class="urgent">⚡ HIGH-VALUE LEAD: Budget estimate above $10,000 ⚡<br>Client is waiting for your response!</div>' 
            : '<div class="urgent">⚡ NEW QUOTE REQUEST REQUIRES IMMEDIATE ATTENTION ⚡<br>Client is waiting for your response!</div>'
          }

          <h3>👤 Client Information:</h3>
          <div class="quote-details">
            <div class="detail-row">
              <span class="detail-label">Client Name:</span>
              <span class="detail-value highlight">${data.full_name}</span>
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

          <h3>💼 Project Details:</h3>
          <div class="quote-details">
            <div class="detail-row">
              <span class="detail-label">Service Type:</span>
              <span class="detail-value highlight">${data.service_type}</span>
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
              <span class="detail-value highlight">$${data.budget_estimate.toLocaleString()}</span>
            </div>
            ` : ''}
          </div>

          <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1e293b;">Project Description:</h4>
            <p style="margin: 0; color: #64748b;">${data.description}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" class="cta-button">
              🎯 CREATE QUOTE NOW
            </a>
          </div>

          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; border-left: 4px solid #0284c7;">
            <h4 style="margin: 0 0 10px 0; color: #0369a1;">Next Steps:</h4>
            <ol style="margin: 0; padding-left: 20px; color: #0369a1;">
              <li>Click the button above to access the quote creation form</li>
              <li>Review client requirements carefully</li>
              <li>Create detailed scope and pricing</li>
              <li>Send quote to client within 24 hours</li>
            </ol>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              <strong>Quote Request ID:</strong> ${data.quote_request_id}<br>
              <strong>Submitted:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
        </div>

        <div class="footer">
          <p><strong>NexaCore Innovations</strong> - Project Management System</p>
          <p>This secure link expires in 7 days. Do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  console.log('Sending quote request email to PM...');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'NexaCore Projects <projects@nexacore-innovations.com>',
      to: ['projects@nexacore-innovations.com'],
      subject: `🚨 URGENT: New Quote Request - ${data.service_type} - ${data.full_name}`,
      html: emailHtml
    }),
  });

  const responseText = await response.text();
  console.log('Resend API response status:', response.status);
  console.log('Resend API response:', responseText);

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.status} - ${responseText}`);
  }

  return JSON.parse(responseText);
}

async function sendQuoteToClient(data: any) {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://nexacore-innovations.com';
  const quoteUrl = `${baseUrl}/quote/${data.quote_id}`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Quote from NexaCore Innovations</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f8fafc; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 8px; 
          overflow: hidden; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #2563eb, #059669); 
          color: white; 
          padding: 30px; 
          text-align: center; 
        }
        .content { padding: 30px; }
        .quote-summary { 
          background: #f8fafc; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 20px 0; 
          border-left: 4px solid #059669; 
        }
        .price-highlight { 
          font-size: 32px; 
          font-weight: bold; 
          color: #059669; 
          text-align: center; 
          margin: 20px 0; 
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #2563eb, #059669); 
          color: white !important; 
          padding: 15px 30px; 
          border-radius: 8px; 
          text-decoration: none; 
          font-weight: 600; 
          margin: 20px 0; 
          font-size: 16px;
        }
        .footer { 
          background: #f1f5f9; 
          padding: 20px; 
          text-align: center; 
          color: #64748b; 
          font-size: 14px; 
        }
        .deliverables { 
          list-style: none; 
          padding: 0; 
        }
        .deliverables li { 
          padding: 8px 0; 
          border-bottom: 1px solid #e2e8f0; 
        }
        .deliverables li:before { 
          content: "✓"; 
          color: #059669; 
          font-weight: bold; 
          margin-right: 10px; 
        }
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
            <p><strong>Scope:</strong> ${data.scope.substring(0, 200)}...</p>
          </div>

          ${data.deliverables && data.deliverables.length > 0 ? `
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #059669;">What's Included:</h4>
            <ul class="deliverables">
              ${data.deliverables.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${quoteUrl}" class="cta-button">
              📄 Review Full Quote & Respond
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

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e;">
              <strong>Quote expires:</strong> ${new Date(data.expires_at).toLocaleDateString()}<br>
              Please review and respond by this date to secure your spot.
            </p>
          </div>

          <p>We're excited about the possibility of working with you and bringing your vision to life!</p>
          
          <p>Best regards,<br>
          <strong>The NexaCore Team</strong></p>
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

  console.log('Sending quote to client...');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'NexaCore Projects <projects@nexacore-innovations.com>',
      to: [data.client_email],
      subject: `Your Quote is Ready - ${data.service_type} Project`,
      html: emailHtml
    }),
  });

  const responseText = await response.text();
  console.log('Resend API response status:', response.status);
  console.log('Resend API response:', responseText);

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.status} - ${responseText}`);
  }

  return JSON.parse(responseText);
}

async function sendQuoteResponseToPM(data: any) {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://nexacore-innovations.com';
  const dashboardUrl = `${baseUrl}/admin`;
  
  const statusColors = {
    approved: { bg: '#dcfce7', color: '#166534', header: '#059669' },
    revision_requested: { bg: '#fef3c7', color: '#92400e', header: '#f59e0b' },
    declined: { bg: '#fecaca', color: '#991b1b', header: '#dc2626' }
  };

  const currentStatus = statusColors[data.action] || statusColors.declined;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote ${data.action.toUpperCase()} - ${data.client_name}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f8fafc; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 8px; 
          overflow: hidden; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
        }
        .header { 
          background: ${currentStatus.header}; 
          color: white; 
          padding: 30px; 
          text-align: center; 
        }
        .content { padding: 30px; }
        .status-badge { 
          display: inline-block; 
          background: ${currentStatus.bg}; 
          color: ${currentStatus.color}; 
          padding: 8px 16px; 
          border-radius: 20px; 
          font-weight: 600; 
          font-size: 14px; 
          margin: 10px 0; 
          text-transform: uppercase;
        }
        .quote-details { 
          background: #f8fafc; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 20px 0; 
          border-left: 4px solid #2563eb; 
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #2563eb, #059669); 
          color: white !important; 
          padding: 15px 30px; 
          border-radius: 8px; 
          text-decoration: none; 
          font-weight: 600; 
          margin: 20px 0; 
        }
        .footer { 
          background: #f1f5f9; 
          padding: 20px; 
          text-align: center; 
          color: #64748b; 
          font-size: 14px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">
            Quote ${data.action === 'approved' ? 'Approved! 🎉' : 
                  data.action === 'revision_requested' ? 'Revision Requested 📝' : 'Declined 📋'}
          </h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Client Response Received</p>
        </div>

        <div class="content">
          <div style="text-align: center; margin: 20px 0;">
            <span class="status-badge">${data.action.replace('_', ' ')}</span>
          </div>

          <div class="quote-details">
            <h3 style="margin-top: 0;">Quote Details</h3>
            <p><strong>Client:</strong> ${data.client_name}</p>
            <p><strong>Email:</strong> ${data.client_email}</p>
            <p><strong>Service:</strong> ${data.service_type}</p>
            <p><strong>Quote Value:</strong> ${data.currency} ${data.price.toLocaleString()}</p>
            <p><strong>Action Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          ${data.message ? `
            <div style="background: #fffbeb; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #92400e; margin: 0 0 10px 0;">Client Message:</h4>
              <p style="color: #92400e; margin: 0; font-style: italic;">"${data.message}"</p>
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
                <li>Begin project work immediately</li>
                <li>Set up project timeline and milestones</li>
                <li>Send welcome/onboarding materials to client</li>
                <li>Create project in management system</li>
              ` : data.action === 'revision_requested' ? `
                <li>Review client feedback carefully</li>
                <li>Modify quote based on requested changes</li>
                <li>Resend updated quote to client</li>
                <li>Follow up to ensure satisfaction</li>
              ` : `
                <li>Follow up with client if appropriate</li>
                <li>Archive quote request</li>
                <li>Add notes for future reference</li>
                <li>Consider feedback for future quotes</li>
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

  console.log('Sending quote response notification to PM...');

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
      html: emailHtml
    }),
  });

  const responseText = await response.text();
  console.log('Resend API response status:', response.status);
  console.log('Resend API response:', responseText);

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.status} - ${responseText}`);
  }

  return JSON.parse(responseText);
}

function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
