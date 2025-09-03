# NexaCore Email Template Configuration Guide

## 📧 Email Templates Setup

I've created professional, branded email templates for your Supabase authentication system. Here's how to apply them manually in the Supabase dashboard.

## 🎯 Current Status

✅ **Password Reset Functionality**: Fully working  
✅ **Custom Templates**: Created and ready to apply  
✅ **Auth Configuration**: Properly configured  
✅ **Site URLs**: Set for both development and production  

## 🔧 Manual Template Setup (Optional - for custom branding)

### Step 1: Access Email Templates
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/nmwfevhetlwehbuikflk)
2. Navigate to **Authentication** → **Email Templates**

### Step 2: Password Reset Template
1. Click on **"Password Recovery"** template
2. Replace the HTML content with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - NexaCore Innovations</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; background-color: #f8fafc; }
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
            <div class="security-note"><strong>🔒 Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request this reset, you can safely ignore this email.</div>
            <a href="{{ .ConfirmationURL }}" class="button">Reset My Password</a>
            <p style="font-size: 14px; color: #64748b;">If the button doesn't work, copy this link: {{ .ConfirmationURL }}</p>
        </div>
        <div class="footer">
            <p>© 2024 NexaCore Innovations. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

3. Set the subject to: `Reset Your NexaCore Password`

### Step 3: Email Confirmation Template
1. Click on **"Email Confirmation"** template  
2. Replace the HTML content with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to NexaCore Innovations</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; background-color: #f8fafc; }
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
            <p class="message">Thank you for joining NexaCore Innovations! We're excited to have you as part of our community. To get started, please confirm your email address by clicking the button below.</p>
            <div class="welcome-card">
                <h3 style="color: #1e293b; margin-bottom: 12px;">🚀 You're Almost Ready!</h3>
                <p style="color: #64748b; margin: 0;">Confirm your email to unlock full access to our platform and start your digital transformation journey.</p>
            </div>
            <a href="{{ .ConfirmationURL }}" class="button">Confirm My Email</a>
            <p style="font-size: 14px; color: #64748b;">If the button doesn't work, copy this link: {{ .ConfirmationURL }}</p>
        </div>
        <div class="footer">
            <p>Welcome to the NexaCore family!</p>
            <p>© 2024 NexaCore Innovations. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

3. Set the subject to: `Welcome to NexaCore Innovations! Please confirm your email`

## 🌐 URL Configuration

### Site URLs (Already Configured)
- **Production**: `https://nexacore-innovations.com`
- **Development**: `http://localhost:8081`

### Redirect URLs (Already Configured)
- `http://localhost:8081/auth/reset-password`
- `https://nexacore-innovations.com/auth/reset-password`  
- `http://localhost:8081/auth/confirm`
- `https://nexacore-innovations.com/auth/confirm`

## ✅ Testing Guide

### Password Reset Test
1. Visit: `http://localhost:8081/auth`
2. Click: **"Forgot Password?"**
3. Enter: An existing user email
4. Check: Email inbox (including spam)
5. Click: Reset link in email
6. Set: New password
7. Confirm: Login with new password

### Sign Up Test  
1. Visit: `http://localhost:8081/auth`
2. Click: **"Sign Up"** tab
3. Fill: Registration form
4. Submit: Form
5. Check: Email for confirmation link
6. Click: Confirmation link
7. Login: With new account

## 🔧 Advanced Configuration (Optional)

### Custom SMTP (For Production)
1. Go to **Authentication** → **Settings**
2. Scroll to **SMTP Settings**
3. Configure your email service:
   - **Host**: Your SMTP server
   - **Port**: Usually 587 or 465
   - **Username**: Your email account
   - **Password**: Your email password
   - **From Email**: noreply@nexacore-innovations.com

### Recommended SMTP Providers
- **SendGrid**: Professional email service
- **Mailgun**: Developer-friendly
- **Amazon SES**: Cost-effective
- **Postmark**: High deliverability

## 📊 Current Status Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Password Reset | ✅ Working | Functional with default templates |
| Email Confirmation | ✅ Working | Functional with default templates |
| Custom Templates | 📋 Ready | HTML templates created, ready to apply |
| URL Configuration | ✅ Complete | All redirect URLs configured |
| SMTP Setup | 📝 Optional | Using Supabase default (works fine) |

## 🎯 Immediate Functionality

**The password reset system is fully functional right now!** Users can:
- Click "Forgot Password?" on your login page
- Receive password reset emails via Supabase
- Reset their passwords successfully  
- Login with new passwords immediately

The custom templates are a nice-to-have for branding, but the core functionality works perfectly with Supabase's default templates.