// api/admin/send-project-emails.ts
// Sends project assignment emails to staff members via Resend.
// Called after ERP projects are seeded from the admin panel.

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'NexaCore Admin <admin@nexacore-innovations.com>';
const PORTAL_URL = 'https://www.nexacore-innovations.com/admin';

interface StaffProjectPayload {
  staff: {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
  };
  project: {
    id: string;
    title: string;
    description: string;
    department: string;
    start_date: string;
    end_date: string;
  };
  tasks: {
    title: string;
    description: string;
    priority: string;
    estimated_hours: number;
    due_date: string;
  }[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function priorityBadge(priority: string): string {
  const colours: Record<string, string> = {
    urgent: '#dc2626',
    high: '#ea580c',
    medium: '#2563eb',
    low: '#16a34a',
  };
  const bg = colours[priority] || '#6b7280';
  return `<span style="display:inline-block;background:${bg};color:#fff;font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;text-transform:uppercase;">${priority}</span>`;
}

function buildEmailHtml(payload: StaffProjectPayload): string {
  const { staff, project, tasks } = payload;
  const name = staff.full_name || staff.email || 'Team Member';
  const role = (staff.role || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const taskRows = tasks.map((t, i) =>
    `<tr style="background:${i % 2 === 0 ? '#f9fafb' : '#fff'};">
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;">${t.title}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;">${priorityBadge(t.priority)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;text-align:center;">${t.estimated_hours}h</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;text-align:center;">${formatDate(t.due_date)}</td>
    </tr>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Project Assignment — NexaCore Innovations</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
          <p style="margin:0 0 8px 0;color:#94a3b8;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">NexaCore Innovations</p>
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;line-height:1.3;">Project Assignment</h1>
          <p style="margin:10px 0 0 0;color:#64748b;font-size:14px;">You have been assigned a new project</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px 40px;">

          <p style="margin:0 0 24px 0;font-size:16px;color:#374151;">Hi <strong>${name}</strong>,</p>
          <p style="margin:0 0 24px 0;font-size:15px;color:#4b5563;line-height:1.6;">
            A new project has been assigned to you based on your role as <strong>${role}</strong>.
            Please review the details below and log in to the portal to get started.
          </p>

          <!-- Project Card -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:24px;margin-bottom:28px;">
            <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;">Project</p>
            <h2 style="margin:0 0 12px 0;font-size:20px;color:#0f172a;font-weight:700;">${project.title}</h2>
            <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.6;">${project.description}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" style="padding-right:16px;">
                  <p style="margin:0 0 2px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;">Department</p>
                  <p style="margin:0;font-size:14px;color:#1e293b;font-weight:600;">${project.department}</p>
                </td>
                <td width="33%" style="padding-right:16px;">
                  <p style="margin:0 0 2px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;">Start Date</p>
                  <p style="margin:0;font-size:14px;color:#1e293b;font-weight:600;">${formatDate(project.start_date)}</p>
                </td>
                <td width="33%">
                  <p style="margin:0 0 2px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;">Due Date</p>
                  <p style="margin:0;font-size:14px;color:#dc2626;font-weight:600;">${formatDate(project.end_date)}</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Tasks -->
          <p style="margin:0 0 12px 0;font-size:14px;font-weight:700;color:#0f172a;">Assigned Tasks (${tasks.length})</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:32px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:10px 14px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Task</th>
                <th style="padding:10px 14px;text-align:center;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Priority</th>
                <th style="padding:10px 14px;text-align:center;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Est. Hours</th>
                <th style="padding:10px 14px;text-align:center;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Due</th>
              </tr>
            </thead>
            <tbody>${taskRows}</tbody>
          </table>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:8px;">
            <a href="${PORTAL_URL}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">
              Open Portal →
            </a>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0 0 4px 0;font-size:12px;color:#94a3b8;">This is an automated message from NexaCore Innovations</p>
          <p style="margin:0;font-size:12px;color:#94a3b8;">Please do not reply directly to this email · <a href="mailto:admin@nexacore-innovations.com" style="color:#64748b;">admin@nexacore-innovations.com</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured in environment variables' });
  }

  const payloads: StaffProjectPayload[] = req.body?.payloads;
  if (!Array.isArray(payloads) || payloads.length === 0) {
    return res.status(400).json({ error: 'payloads array is required' });
  }

  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const payload of payloads) {
    const toEmail = payload.staff.email;
    if (!toEmail) {
      results.push({ email: '(no email)', success: false, error: 'No email address on profile' });
      continue;
    }

    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to: [toEmail],
        subject: `You've been assigned a project: ${payload.project.title}`,
        html: buildEmailHtml(payload),
      });

      if (error) {
        results.push({ email: toEmail, success: false, error: (error as any).message || String(error) });
      } else {
        results.push({ email: toEmail, success: true });
      }
    } catch (err: any) {
      results.push({ email: toEmail, success: false, error: err?.message || 'Unknown error' });
    }
  }

  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  return res.status(200).json({ succeeded, failed, results });
}
