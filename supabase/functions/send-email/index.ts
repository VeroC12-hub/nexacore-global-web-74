import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Escape every string the caller supplies before it goes into email HTML,
// otherwise anyone can inject links or markup into a NexaCore-branded email
const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const sanitize = (value: any): any => {
  if (typeof value === 'string') return escapeHtml(value);
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitize(v)]));
  }
  return value;
};

// Emails addressed to a caller-chosen recipient with quote content are staff-only
const isStaffRequest = async (req: Request): Promise<boolean> => {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return false;
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return false;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return ['admin', 'staff', 'project_manager'].includes(profile?.role ?? '');
};

interface EmailRequest {
  type: 'quote_request' | 'quote_sent' | 'quote_approved' | 'quote_revision_requested' | 'quote_request_confirmation';
  to: string;
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    
    let requestData;
    try {
      requestData = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { type, to }: EmailRequest = requestData;
    const data = sanitize(requestData.data ?? {});
    console.log('Email request:', { type, to });

    if (!type) {
      throw new Error('Email type is required');
    }

    if (type === 'quote_sent' && !(await isStaffRequest(req))) {
      return new Response(JSON.stringify({ error: 'Not allowed' }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let emailResponse;

    switch (type) {
      case 'quote_request':
        emailResponse = await resend.emails.send({
          from: "NexaCore <noreply@nexacore-innovations.com>",
          to: ["projects@nexacore-innovations.com"],
          subject: `New Quote Request from ${data.full_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">New Quote Request</h2>
              <p>A new quote request has been submitted:</p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Client Information:</h3>
                <p><strong>Name:</strong> ${data.full_name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
                <p><strong>Company:</strong> ${data.company || 'Not provided'}</p>
                <p><strong>Country:</strong> ${data.country || 'Not provided'}</p>
              </div>

              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Project Details:</h3>
                <p><strong>Service:</strong> ${data.service_type}</p>
                <p><strong>Timeline:</strong> ${data.timeline || 'Not specified'}</p>
                <p><strong>Budget:</strong> ${data.budget_estimate ? 
                  '$' + data.budget_estimate.toLocaleString() : 'Not specified'}</p>
                <p><strong>Description:</strong></p>
                <p style="background: white; padding: 10px; border-left: 4px solid #2563eb;">${data.description}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('SITE_URL') || 'https://nexacore-innovations.com'}/admin" 
                   style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Review Request & Create Quote
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                This request is waiting for your response in the admin dashboard.
              </p>
            </div>
          `,
        });
        break;

      case 'quote_request_confirmation': {
        // Only the address on a just-submitted request, and only once, so the
        // endpoint cannot be used to mail arbitrary people
        const requestId = typeof requestData.data?.quote_request_id === 'string' ? requestData.data.quote_request_id : '';
        const { data: request } = await supabase
          .from('quote_requests')
          .update({ confirmation_sent_at: new Date().toISOString() })
          .eq('id', requestId)
          .is('confirmation_sent_at', null)
          .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
          .select('email, full_name, service_type')
          .maybeSingle();

        if (!request) {
          return new Response(JSON.stringify({ error: 'Not allowed' }), {
            status: 403,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        emailResponse = await resend.emails.send({
          from: "NexaCore <noreply@nexacore-innovations.com>",
          to: [request.email],
          subject: `We received your quote request`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Thanks, ${escapeHtml(request.full_name || 'there')}!</h2>
              <p>Your request for <strong>${escapeHtml(request.service_type || 'our services')}</strong> has been received.</p>
              <p>Our project team will review it and get back to you shortly.</p>
              <p style="color: #6b7280; font-size: 14px;">
                You can create an account or sign in anytime to track progress.
              </p>
            </div>
          `,
        });
        break;
      }

      case 'quote_sent':
        emailResponse = await resend.emails.send({
          from: "NexaCore <noreply@nexacore-innovations.com>",
          to: [to],
          subject: `Your Project Quote from NexaCore Innovations`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Your Project Quote is Ready</h2>
              <p>Hi ${data.client_name || 'there'},</p>
              
              <p>Thank you for your interest in our services. We've prepared a detailed quote for your project.</p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                <h3>Quote Summary</h3>
                <p><strong>Service:</strong> ${data.service_type}</p>
                <p><strong>Total Amount:</strong> ${data.currency || '$'} ${data.price?.toLocaleString() || 'N/A'}</p>
                ${data.timeline ? `<p><strong>Timeline:</strong> ${data.timeline}</p>` : ''}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('SITE_URL') || 'https://nexacore-innovations.com'}/quote/${data.quote_id}" 
                   style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Full Quote
                </a>
              </div>

              <p>Please review the quote and let us know if you have any questions.</p>
              
              <p>Best regards,<br>
              The NexaCore Team</p>
            </div>
          `,
        });
        break;

      case 'quote_approved':
        emailResponse = await resend.emails.send({
          from: "NexaCore <noreply@nexacore-innovations.com>",
          to: ["projects@nexacore-innovations.com"],
          subject: `Quote APPROVED - ${data.client_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">🎉 Quote Approved!</h2>
              
              <p>Great news! The client has approved the quote:</p>
              
              <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                <p><strong>Client:</strong> ${data.client_name}</p>
                <p><strong>Email:</strong> ${data.client_email}</p>
                <p><strong>Service:</strong> ${data.service_type}</p>
                <p><strong>Amount:</strong> ${data.currency} ${data.price}</p>
                ${data.message ? `<p><strong>Client Message:</strong></p><p style="background: white; padding: 10px; border-radius: 4px;">${data.message}</p>` : ''}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('SITE_URL') || 'https://nexacore-innovations.com'}/admin" 
                   style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Begin Project Setup
                </a>
              </div>

              <p>You can now:</p>
              <ul>
                <li>Set up project tasks and milestones</li>
                <li>Assign team members</li>
                <li>Begin client communication</li>
                <li>Create the first invoice</li>
              </ul>
            </div>
          `,
        });
        break;

      case 'quote_revision_requested':
        emailResponse = await resend.emails.send({
          from: "NexaCore <noreply@nexacore-innovations.com>",
          to: ["projects@nexacore-innovations.com"],
          subject: `Quote Revision Requested - ${data.client_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">Quote Revision Requested</h2>
              
              <p>The client has requested revisions to the quote:</p>
              
              <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p><strong>Client:</strong> ${data.client_name}</p>
                <p><strong>Email:</strong> ${data.client_email}</p>
                <p><strong>Service:</strong> ${data.service_type}</p>
                <p><strong>Current Amount:</strong> ${data.currency} ${data.price}</p>
                <p><strong>Revision Notes:</strong></p>
                <p style="background: white; padding: 10px; border-radius: 4px;">${data.message || 'No specific notes provided'}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('SITE_URL') || 'https://nexacore-innovations.com'}/admin" 
                   style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Review & Update Quote
                </a>
              </div>

              <p>Please review the client's feedback and update the quote accordingly.</p>
            </div>
          `,
        });
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
