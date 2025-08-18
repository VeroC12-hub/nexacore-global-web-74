import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'quote' | 'request';
  name: string;
  email: string;
  company?: string;
  phone?: string;
  service?: string;
  description: string;
  budget?: string;
  timeline?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailRequest = await req.json();
    
    // Determine email subject and content based on type
    const subject = emailData.type === 'quote' 
      ? `New Quote Request from ${emailData.name}` 
      : `New Service Request from ${emailData.name}`;

    const emailHtml = `
      <h2>${emailData.type === 'quote' ? 'New Quote Request' : 'New Service Request'}</h2>
      <p><strong>Name:</strong> ${emailData.name}</p>
      <p><strong>Email:</strong> ${emailData.email}</p>
      ${emailData.company ? `<p><strong>Company:</strong> ${emailData.company}</p>` : ''}
      ${emailData.phone ? `<p><strong>Phone:</strong> ${emailData.phone}</p>` : ''}
      ${emailData.service ? `<p><strong>Service:</strong> ${emailData.service}</p>` : ''}
      ${emailData.budget ? `<p><strong>Budget:</strong> ${emailData.budget}</p>` : ''}
      ${emailData.timeline ? `<p><strong>Timeline:</strong> ${emailData.timeline}</p>` : ''}
      <p><strong>Description:</strong></p>
      <p>${emailData.description}</p>
      
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        This ${emailData.type} was submitted through the NexaCore Innovations website.
      </p>
    `;

    // Send email to company
    const emailResponse = await resend.emails.send({
      from: "NexaCore Innovations <noreply@nexacore-innovations.com>",
      to: ["info@nexacore-innovations.com"],
      replyTo: emailData.email,
      subject: subject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
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