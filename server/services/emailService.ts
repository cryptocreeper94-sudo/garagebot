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
