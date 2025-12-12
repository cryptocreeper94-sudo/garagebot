/**
 * Twilio SMS Service - Stub Implementation
 * This file contains placeholder functions for Twilio integration.
 * When Twilio API keys are provided, replace the stubs with actual implementation.
 */

interface SMSMessage {
  to: string;
  body: string;
  from?: string;
}

interface SMSResult {
  success: boolean;
  messageSid?: string;
  error?: string;
  stubbed: boolean;
}

class TwilioService {
  private accountSid: string | undefined;
  private authToken: string | undefined;
  private fromNumber: string | undefined;
  private isConfigured: boolean = false;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    this.isConfigured = !!(this.accountSid && this.authToken && this.fromNumber);
  }

  async sendSMS(message: SMSMessage): Promise<SMSResult> {
    if (!this.isConfigured) {
      console.log('[Twilio Stub] SMS not sent - Twilio not configured:', message.to, message.body.substring(0, 50));
      return {
        success: false,
        error: 'Twilio not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER secrets.',
        stubbed: true
      };
    }

    // TODO: Replace with actual Twilio implementation
    // const client = require('twilio')(this.accountSid, this.authToken);
    // const result = await client.messages.create({
    //   body: message.body,
    //   from: this.fromNumber,
    //   to: message.to
    // });
    
    console.log('[Twilio Stub] Would send SMS to:', message.to);
    return {
      success: false,
      error: 'Twilio integration pending - stub only',
      stubbed: true
    };
  }

  async sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; code?: string; error?: string }> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    if (!this.isConfigured) {
      console.log('[Twilio Stub] Verification code for', phoneNumber, ':', code);
      return {
        success: true,
        code, // Return code for testing purposes when not configured
        error: 'Twilio not configured - code returned for testing'
      };
    }

    const result = await this.sendSMS({
      to: phoneNumber,
      body: `Your GarageBot verification code is: ${code}. This code expires in 10 minutes.`
    });

    if (result.success) {
      return { success: true, code };
    }
    return { success: false, error: result.error };
  }

  async sendServiceReminder(phoneNumber: string, vehicleInfo: string, serviceType: string, dueDate?: string): Promise<SMSResult> {
    const message = dueDate
      ? `GarageBot Reminder: Your ${vehicleInfo} is due for ${serviceType} on ${dueDate}. Schedule service now at garagebot.io`
      : `GarageBot Reminder: Your ${vehicleInfo} is due for ${serviceType}. Schedule service now at garagebot.io`;

    return this.sendSMS({ to: phoneNumber, body: message });
  }

  async sendPriceDropAlert(phoneNumber: string, partName: string, oldPrice: string, newPrice: string, vendorName: string): Promise<SMSResult> {
    const message = `GarageBot Price Alert: ${partName} dropped from ${oldPrice} to ${newPrice} at ${vendorName}! Shop now at garagebot.io`;
    return this.sendSMS({ to: phoneNumber, body: message });
  }

  async sendOrderUpdate(phoneNumber: string, orderNumber: string, status: string): Promise<SMSResult> {
    const message = `GarageBot Order Update: Order #${orderNumber} is now ${status}. Track at garagebot.io`;
    return this.sendSMS({ to: phoneNumber, body: message });
  }

  getStatus(): { configured: boolean; message: string } {
    if (this.isConfigured) {
      return { configured: true, message: 'Twilio is configured and ready' };
    }
    return { 
      configured: false, 
      message: 'Twilio not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER secrets.' 
    };
  }
}

export const twilioService = new TwilioService();
