-- Configure Supabase Auth email templates and settings
-- This migration sets up professional email templates for NexaCore Innovations

-- Update auth configuration
UPDATE auth.config 
SET 
  site_url = 'https://nexacore-innovations.com',
  external_email_enabled = true,
  external_phone_enabled = false,
  email_confirm_enabled = true,
  email_double_confirm_enabled = false,
  password_min_length = 6,
  password_require_letters = true,
  password_require_numbers = false,
  password_require_symbols = false,
  password_require_uppercase = false
WHERE id = 1;

-- Insert or update email templates
INSERT INTO auth.email_templates (id, type, subject, body_html, body_text)
VALUES 
  (
    'password_reset',
    'recovery',
    'Reset Your NexaCore Password',
    -- HTML template for password reset
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - NexaCore Innovations</title>
    <style>
        body { margin: 0; padding: 0; font-family: ''Segoe UI'', system-ui, sans-serif; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; }
        .logo { color: #ffffff; font-size: 28px; font-weight: bold; margin-bottom: 8px; }
        .tagline { color: #e2e8f0; font-size: 14px; }
        .content { padding: 40px 30px; }
        .title { font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 16px; }
        .message { font-size: 16px; line-height: 1.6; color: #64748b; margin-bottom: 32px; }
        .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-bottom: 32px; }
        .security-note { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; font-size: 14px; color: #92400e; margin-bottom: 32px; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NexaCore Innovations</div>
            <div class="tagline">Transforming Ideas into Digital Excellence</div>
        </div>
        <div class="content">
            <h1 class="title">Reset Your Password</h1>
            <p class="message">Hello,<br><br>We received a request to reset your password for your NexaCore Innovations account. If you made this request, click the button below to set a new password.</p>
            <div class="security-note"><strong>🔒 Security Notice:</strong> This link will expire in 1 hour for your security. If you didn''t request this reset, you can safely ignore this email.</div>
            <a href="{{ .ConfirmationURL }}" class="button">Reset My Password</a>
            <p style="font-size: 14px; color: #64748b;">If the button doesn''t work, copy this link: {{ .ConfirmationURL }}</p>
        </div>
        <div class="footer">
            <p>© 2024 NexaCore Innovations. All rights reserved.</p>
        </div>
    </div>
</body>
</html>',
    -- Text version for password reset
    'Hello,

We received a request to reset your password for your NexaCore Innovations account.

To reset your password, please click the following link:
{{ .ConfirmationURL }}

This link will expire in 1 hour for your security.

If you did not request this password reset, you can safely ignore this email.

Best regards,
The NexaCore Innovations Team

© 2024 NexaCore Innovations. All rights reserved.'
  ),
  (
    'email_confirmation',
    'signup',
    'Welcome to NexaCore Innovations! Please confirm your email',
    -- HTML template for email confirmation  
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to NexaCore Innovations</title>
    <style>
        body { margin: 0; padding: 0; font-family: ''Segoe UI'', system-ui, sans-serif; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; }
        .logo { color: #ffffff; font-size: 28px; font-weight: bold; margin-bottom: 8px; }
        .tagline { color: #e2e8f0; font-size: 14px; }
        .content { padding: 40px 30px; }
        .title { font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 16px; }
        .message { font-size: 16px; line-height: 1.6; color: #64748b; margin-bottom: 32px; }
        .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-bottom: 32px; }
        .welcome-card { background: linear-gradient(135deg, #f0f9ff 0%, #f3e8ff 100%); border: 1px solid #e0e7ff; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NexaCore Innovations</div>
            <div class="tagline">Transforming Ideas into Digital Excellence</div>
        </div>
        <div class="content">
            <h1 class="title">Welcome to NexaCore! 🎉</h1>
            <p class="message">Thank you for joining NexaCore Innovations! We''re excited to have you as part of our community. To get started, please confirm your email address by clicking the button below.</p>
            <div class="welcome-card">
                <h3 style="color: #1e293b; margin-bottom: 12px;">🚀 You''re Almost Ready!</h3>
                <p style="color: #64748b; margin: 0;">Confirm your email to unlock full access to our platform and start your digital transformation journey.</p>
            </div>
            <a href="{{ .ConfirmationURL }}" class="button">Confirm My Email</a>
            <p style="font-size: 14px; color: #64748b;">If the button doesn''t work, copy this link: {{ .ConfirmationURL }}</p>
        </div>
        <div class="footer">
            <p>Welcome to the NexaCore family!</p>
            <p>© 2024 NexaCore Innovations. All rights reserved.</p>
        </div>
    </div>
</body>
</html>',
    -- Text version for email confirmation
    'Welcome to NexaCore Innovations!

Thank you for joining our community of innovators and creators. 

To complete your registration, please confirm your email address by clicking the following link:
{{ .ConfirmationURL }}

Once confirmed, you''ll have access to:
- Client Dashboard with project tracking
- Direct communication with our team  
- Service request submission
- Secure payment handling

We''re excited to work with you!

Best regards,
The NexaCore Innovations Team

© 2024 NexaCore Innovations. All rights reserved.'
  )
ON CONFLICT (id) 
DO UPDATE SET 
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text;