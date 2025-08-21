// supabase/functions/send-enhanced-quote-emails/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuoteRequestEmailData {
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  service_type: string;
  timeline?: string;
  budget_estimate?: number;
  description: string;
  quote_request_id: string;
}

interface QuoteToClientData {
  quote_id: string;
  client_email: string;
  client_name: string;
  service_type: string;
  price: number;
  currency: string;
  timeline: string;
  token: string;
}

interface QuoteActionNotificationData {
  quote_id: string;
  action_type: 'approved' | 'revision_requested' | 'new_service_requested';
  client_name: string;
  client_email: string;
  message?: string;
  new_service_type?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, to, data } = await req.json()

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Resend API key from environment
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not found')
    }

    let emailResponse;

    switch (type) {
      case 'quote_request_to_pm':
        emailResponse = await sendQuoteRequestToPM(data as QuoteRequestEmailData, RESEND_API_KEY, supabaseAdmin);
        break;
      
      case 'quote_to_client':
        emailResponse = await sendQuoteToClient(data as QuoteToClientData, RESEND_API_KEY);
        break;
      
      case 'quote_action_notification':
        emailResponse = await sendQuoteActionNotification(data as QuoteActionNotificationData, RESEND_API_KEY);
        break;
      
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    return new Response(JSON.stringify(emailResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

async function sendQuoteRequestToPM(
  data: QuoteRequestEmailData, 
  apiKey: string, 
  supabaseAdmin: any
): Promise<any> {
  // Create PM invitation token
  const { data: tokenData, error: tokenError } = await supabaseAdmin
    .from('pm_invitation_tokens')
    .insert({
      quote_request_id: data.quote_request_id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    })
    .select()
    .single();

  if (tokenError) {
    throw new Error(`Failed to create PM token: ${tokenError.message}`);
  }

  // Update quote request with token reference
  await supabaseAdmin
    .from('quote_requests')
    .update({ pm_token_id: tokenData.id })
    .eq('id', data.quote_request_id);

  const loginUrl = `https://nexacore-innovations.com/auth?pm_token=${tokenData.token}&redirect=/admin`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Quote Request - NexaCore Innovations</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; }
        .quote-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-label { font-weight: 600; color: #4a5568; }
        .detail-value { color: #2d3748; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; border-radius: 0 0 8px 8px; }
        .urgent { background: #fed7d7; border-left: 4px solid #e53e3e; padding: 15px; margin: 15px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 New Quote Request</h1>
          <p>A new client is requesting a quote for ${data.service_type}</p>
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
          <p>This secure link expires in 7 days. If you need assistance, contact: admin@nexacore-innovations.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'NexaCore Projects <projects@nexacore-innovations.com>',
      to: ['projects@nexacore-innovations.com'],
      subject: `🚀 New Quote Request: ${data.service_type} from ${data.full_name}`,
      html: emailHtml,
      reply_to: data.email,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return await response.json();
}

async function sendQuoteToClient(data: QuoteToClientData, apiKey: string): Promise<any> {
  const quoteUrl = `https://nexacore-innovations.com/quote/${data.quote_id}?token=${data.token}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Quote is Ready - NexaCore Innovations</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; }
        .quote-summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .price { font-size: 2em; font-weight: bold; color: #2d3748; margin: 10px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; border-radius: 0 0 8px 8px; }
        .features { background: #edf2f7; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Your Quote is Ready!</h1>
          <p>We've prepared a customized quote for your ${data.service_type} project</p>
        </div>
        
        <div class="content">
          <p>Dear ${data.client_name},</p>
          
          <p>Thank you for your interest in NexaCore Innovations! We've carefully reviewed your project requirements and prepared a detailed quote for you.</p>

          <div class="quote-summary">
            <h2>Project Quote Summary</h2>
            <div class="price">${data.currency} ${data.price.toLocaleString()}</div>
            <p><strong>Service:</strong> ${data.service_type}</p>
            <p><strong>Timeline:</strong> ${data.timeline}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${quoteUrl}" class="cta-button">
              📋 View Full Quote & Take Action
            </a>
          </div>

          <div class="features">
            <h3>What you can do with your quote:</h3>
            <ul style="text-align: left; display: inline-block;">
              <li>✅ <strong>Accept</strong> - Start your project immediately</li>
              <li>📝 <strong>Request Revision</strong> - Ask for adjustments</li>
              <li>🔄 <strong>Request Different Service</strong> - Explore other options</li>
              <li>💬 <strong>Ask Questions</strong> - Get clarification from our team</li>
            </ul>
          </div>

          <p><strong>Important:</strong> This quote is valid for 30 days. You can review all details, terms, and deliverables by clicking the link above.</p>
          
          <p>If you have any questions or need clarification, simply reply to this email or use the communication tools in your quote portal.</p>
        </div>

        <div class="footer">
          <p><strong>NexaCore Innovations</strong></p>
          <p>Innovative Engineering & Technology Solutions</p>
          <p>Questions? Reply to this email or call us at +233 54087377</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'NexaCore Innovations <quotes@nexacore-innovations.com>',
      to: [data.client_email],
      subject: `Your ${data.service_type} Quote is Ready - ${data.currency} ${data.price.toLocaleString()}`,
      html: emailHtml,
      reply_to: 'projects@nexacore-innovations.com',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return await response.json();
}

async function sendQuoteActionNotification(data: QuoteActionNotificationData, apiKey: string): Promise<any> {
  let actionEmoji = '';
  let actionText = '';
  let actionColor = '#667eea';

  switch (data.action_type) {
    case 'approved':
      actionEmoji = '🎉';
      actionText = 'APPROVED';
      actionColor = '#48bb78';
      break;
    case 'revision_requested':
      actionEmoji = '📝';
      actionText = 'REVISION REQUESTED';
      actionColor = '#ed8936';
      break;
    case 'new_service_requested':
      actionEmoji = '🔄';
      actionText = 'NEW SERVICE REQUESTED';
      actionColor = '#4299e1';
      break;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Quote ${actionText} - ${data.client_name}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${actionColor}; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; }
        .action-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; border-radius: 0 0 8px 8px; }
        .cta-button { display: inline-block; background: ${actionColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${actionEmoji} Quote ${actionText}</h1>
          <p>Action taken by ${data.client_name}</p>
        </div>
        
        <div class="content">
          <p><strong>Client:</strong> ${data.client_name} (${data.client_email})</p>
          <p><strong>Quote ID:</strong> ${data.quote_id}</p>
          <p><strong>Action:</strong> ${actionText}</p>

          ${data.message ? `
          <div class="action-details">
            <h3>Client Message:</h3>
            <p>"${data.message}"</p>
          </div>
          ` : ''}

          ${data.new_service_type ? `
          <div class="action-details">
            <h3>Requested New Service:</h3>
            <p><strong>${data.new_service_type}</strong></p>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://nexacore-innovations.com/admin" class="cta-button">
              📊 View in Admin Dashboard
            </a>
          </div>

          <div class="action-details">
            <h3>Next Steps:</h3>
            ${data.action_type === 'approved' ? 
              '<p>🎯 The client has approved the quote! You can now start the project and create tasks in the project management system.</p>' :
              data.action_type === 'revision_requested' ?
              '<p>📝 The client has requested revisions. Please review their feedback and update the quote accordingly.</p>' :
              '<p>🔄 The client is interested in a different service. Create a new quote for the requested service type.</p>'
            }
          </div>
        </div>

        <div class="footer">
          <p><strong>NexaCore Innovations</strong> - Project Management System</p>
          <p>Respond promptly to maintain excellent client relationships</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'NexaCore Projects <projects@nexacore-innovations.com>',
      to: ['projects@nexacore-innovations.com'],
      subject: `${actionEmoji} Quote ${actionText}: ${data.client_name}`,
      html: emailHtml,
      reply_to: data.client_email,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return await response.json();
}
