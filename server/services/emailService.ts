// Email service using Resend integration
import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendWelcomeEmail(toEmail: string, username: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const result = await client.emails.send({
      from: fromEmail || 'GarageBot <noreply@garagebot.io>',
      to: toEmail,
      subject: 'Welcome to GarageBot - Your Trust Layer Membership is Active!',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.2)); border: 1px solid rgba(6,182,212,0.4); border-radius: 12px; padding: 16px 24px; margin-bottom: 16px;">
        <span style="font-size: 28px; font-weight: bold; color: #06b6d4; text-transform: uppercase; letter-spacing: 2px;">GarageBot</span>
      </div>
      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Welcome, ${username}!</h1>
    </div>

    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, rgba(6,182,212,0.1), rgba(59,130,246,0.1)); border: 1px solid rgba(6,182,212,0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <span style="color: #06b6d4; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">✓ Trust Layer Membership Active</span>
      </div>
      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        Your GarageBot account includes <strong style="color: #ffffff;">free access to the entire DarkWave ecosystem</strong>. Use the same login credentials across all our platforms:
      </p>
    </div>

    <!-- Ecosystem Links -->
    <div style="margin-bottom: 24px;">
      <a href="https://dwtl.io" style="display: block; background: rgba(255,255,255,0.05); border: 1px solid rgba(6,182,212,0.3); border-radius: 8px; padding: 16px; margin-bottom: 12px; text-decoration: none;">
        <div style="display: flex; align-items: center;">
          <span style="width: 10px; height: 10px; background: #06b6d4; border-radius: 50%; margin-right: 12px;"></span>
          <span style="color: #06b6d4; font-family: monospace; font-size: 16px; font-weight: bold;">dwtl.io</span>
          <span style="color: #71717a; font-size: 12px; margin-left: auto;">Trust Layer Portal</span>
        </div>
      </a>
      <a href="https://dwsc.io" style="display: block; background: rgba(255,255,255,0.05); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 16px; margin-bottom: 12px; text-decoration: none;">
        <div style="display: flex; align-items: center;">
          <span style="width: 10px; height: 10px; background: #3b82f6; border-radius: 50%; margin-right: 12px;"></span>
          <span style="color: #3b82f6; font-family: monospace; font-size: 16px; font-weight: bold;">dwsc.io</span>
          <span style="color: #71717a; font-size: 12px; margin-left: auto;">DarkWave Studio</span>
        </div>
      </a>
      <a href="https://garagebot.io" style="display: block; background: rgba(255,255,255,0.05); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; padding: 16px; text-decoration: none;">
        <div style="display: flex; align-items: center;">
          <span style="width: 10px; height: 10px; background: #22c55e; border-radius: 50%; margin-right: 12px;"></span>
          <span style="color: #22c55e; font-family: monospace; font-size: 16px; font-weight: bold;">garagebot.io</span>
          <span style="color: #71717a; font-size: 12px; margin-left: auto;">GarageBot</span>
        </div>
      </a>
    </div>

    <!-- Features -->
    <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 12px 0;">With your GarageBot account, you can:</p>
      <ul style="color: #d4d4d8; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>Search 40+ auto parts retailers at once</li>
        <li>Manage your vehicle fleet with VIN decoding</li>
        <li>Get AI-powered part recommendations</li>
        <li>Access DIY repair guides</li>
        <li>Earn Genesis Hallmark NFTs as an early adopter</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="color: #71717a; font-size: 11px; margin: 0;">
        Right Part. First Time. Every Engine.<br>
        &copy; ${new Date().getFullYear()} GarageBot - Part of the DarkWave Ecosystem
      </p>
    </div>
  </div>
</body>
</html>
      `
    });

    console.log('[Email] Welcome email sent to:', toEmail, result);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('[Email] Failed to send welcome email:', error);
    return { success: false, error };
  }
}

export interface ShopInquiry {
  shopName: string;
  contactName: string;
  email: string;
  phone: string;
  shopType: string;
  currentSoftware?: string;
  employees?: string;
  message?: string;
}

export async function sendShopInquiryEmail(inquiry: ShopInquiry) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const result = await client.emails.send({
      from: fromEmail || 'GarageBot <noreply@garagebot.io>',
      to: 'jason@darkwavestudios.io',
      replyTo: inquiry.email,
      subject: `[GarageBot Lead] New Shop Inquiry: ${inquiry.shopName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(6,182,212,0.2)); border: 1px solid rgba(34,197,94,0.4); border-radius: 12px; padding: 16px 24px; margin-bottom: 16px;">
        <span style="font-size: 28px; font-weight: bold; color: #22c55e; text-transform: uppercase; letter-spacing: 2px;">New Lead</span>
      </div>
      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Mechanics Garage Inquiry</h1>
    </div>

    <div style="background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(6,182,212,0.1)); border: 1px solid rgba(34,197,94,0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #22c55e; font-size: 18px; margin: 0 0 20px 0; border-bottom: 1px solid rgba(34,197,94,0.3); padding-bottom: 12px;">Shop Information</h2>
      
      <div style="margin-bottom: 16px;">
        <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Shop Name</span>
        <p style="color: #ffffff; font-size: 16px; margin: 4px 0 0 0; font-weight: bold;">${inquiry.shopName}</p>
      </div>
      
      <div style="margin-bottom: 16px;">
        <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Shop Type</span>
        <p style="color: #ffffff; font-size: 16px; margin: 4px 0 0 0;">${inquiry.shopType}</p>
      </div>
      
      <div style="margin-bottom: 16px;">
        <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Employees</span>
        <p style="color: #ffffff; font-size: 16px; margin: 4px 0 0 0;">${inquiry.employees || 'Not specified'}</p>
      </div>
      
      <div style="margin-bottom: 16px;">
        <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Current Software</span>
        <p style="color: #ffffff; font-size: 16px; margin: 4px 0 0 0;">${inquiry.currentSoftware || 'Not specified'}</p>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, rgba(6,182,212,0.1), rgba(59,130,246,0.1)); border: 1px solid rgba(6,182,212,0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #06b6d4; font-size: 18px; margin: 0 0 20px 0; border-bottom: 1px solid rgba(6,182,212,0.3); padding-bottom: 12px;">Contact Details</h2>
      
      <div style="margin-bottom: 16px;">
        <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Contact Name</span>
        <p style="color: #ffffff; font-size: 16px; margin: 4px 0 0 0; font-weight: bold;">${inquiry.contactName}</p>
      </div>
      
      <div style="margin-bottom: 16px;">
        <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</span>
        <p style="color: #06b6d4; font-size: 16px; margin: 4px 0 0 0;">
          <a href="mailto:${inquiry.email}" style="color: #06b6d4; text-decoration: none;">${inquiry.email}</a>
        </p>
      </div>
      
      <div style="margin-bottom: 16px;">
        <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Phone</span>
        <p style="color: #ffffff; font-size: 16px; margin: 4px 0 0 0;">
          <a href="tel:${inquiry.phone}" style="color: #06b6d4; text-decoration: none;">${inquiry.phone}</a>
        </p>
      </div>
    </div>

    ${inquiry.message ? `
    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 16px 0;">Message</h2>
      <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${inquiry.message}</p>
    </div>
    ` : ''}

    <div style="text-align: center; padding: 20px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px;">
      <p style="color: #22c55e; font-size: 14px; margin: 0 0 8px 0; font-weight: bold;">Ready to Follow Up?</p>
      <a href="mailto:${inquiry.email}?subject=Re: Mechanics Garage - ${inquiry.shopName}" style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: #000000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Reply to ${inquiry.contactName}</a>
    </div>

    <div style="text-align: center; padding-top: 24px; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="color: #71717a; font-size: 11px; margin: 0;">
        Lead captured via GarageBot Mechanics Garage<br>
        ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
      </p>
    </div>
  </div>
</body>
</html>
      `
    });

    console.log('[Email] Shop inquiry email sent:', result);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('[Email] Failed to send shop inquiry email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(toEmail: string, resetToken: string, firstName: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const baseUrl = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'https://garagebot.io';
    const resetUrl = `${baseUrl}/auth?reset=${resetToken}`;
    
    const result = await client.emails.send({
      from: fromEmail || 'GarageBot <noreply@garagebot.io>',
      to: toEmail,
      subject: 'Reset Your GarageBot Password',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.2)); border: 1px solid rgba(6,182,212,0.4); border-radius: 12px; padding: 16px 24px; margin-bottom: 16px;">
        <span style="font-size: 28px; font-weight: bold; color: #06b6d4; text-transform: uppercase; letter-spacing: 2px;">GarageBot</span>
      </div>
      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Password Reset</h1>
    </div>

    <div style="background: linear-gradient(135deg, rgba(6,182,212,0.1), rgba(59,130,246,0.1)); border: 1px solid rgba(6,182,212,0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        Hi ${firstName},
      </p>
      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
        We received a request to reset your GarageBot password. Click the button below to create a new password. This link expires in 1 hour.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #000000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Reset Password</a>
      </div>
      <p style="color: #71717a; font-size: 12px; text-align: center; margin: 0;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>

    <div style="text-align: center; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="color: #71717a; font-size: 11px; margin: 0;">
        Right Part. First Time. Every Engine.<br>
        &copy; ${new Date().getFullYear()} GarageBot - Part of the DarkWave Ecosystem
      </p>
    </div>
  </div>
</body>
</html>
      `
    });

    console.log('[Email] Password reset email sent to:', toEmail, result);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('[Email] Failed to send password reset email:', error);
    return { success: false, error };
  }
}
