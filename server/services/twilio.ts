import Twilio from "twilio";

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
  private client: Twilio.Twilio | null = null;
  private fromNumber: string | undefined;
  private isConfigured: boolean = false;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    this.isConfigured = !!(accountSid && authToken && this.fromNumber);

    if (this.isConfigured) {
      this.client = Twilio(accountSid!, authToken!);
      console.log("[Twilio] Service initialized and ready");
    } else {
      console.log("[Twilio] Not configured — missing credentials");
    }
  }

  async sendSMS(message: SMSMessage): Promise<SMSResult> {
    if (!this.isConfigured || !this.client) {
      console.log("[Twilio] SMS not sent — not configured:", message.to, message.body.substring(0, 50));
      return {
        success: false,
        error: "Twilio not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER secrets.",
        stubbed: true,
      };
    }

    try {
      const result = await this.client.messages.create({
        body: message.body,
        from: message.from || this.fromNumber,
        to: message.to,
      });

      console.log("[Twilio] SMS sent:", result.sid, "to:", message.to);
      return {
        success: true,
        messageSid: result.sid,
        stubbed: false,
      };
    } catch (error: any) {
      console.error("[Twilio] SMS failed:", error.message);
      return {
        success: false,
        error: error.message || "Failed to send SMS",
        stubbed: false,
      };
    }
  }

  async sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; code?: string; error?: string }> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if (!this.isConfigured) {
      console.log("[Twilio] Verification code for", phoneNumber, ":", code);
      return {
        success: true,
        code,
        error: "Twilio not configured — code returned for testing",
      };
    }

    const result = await this.sendSMS({
      to: phoneNumber,
      body: `Your GarageBot verification code is: ${code}. This code expires in 10 minutes.`,
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

  async sendWelcome(phoneNumber: string, userName: string): Promise<SMSResult> {
    const message = `Welcome to GarageBot, ${userName}! You're all set to search 104 retailers, get AI diagnoses, and manage your vehicles. Reply STOP to opt out. — garagebot.io`;
    return this.sendSMS({ to: phoneNumber, body: message });
  }

  async sendProUpgradeConfirmation(phoneNumber: string): Promise<SMSResult> {
    const message = `GarageBot: You're now a Pro member! Enjoy ad-free browsing, priority AI, marketplace selling, and Founders Circle perks. — garagebot.io`;
    return this.sendSMS({ to: phoneNumber, body: message });
  }

  getStatus(): { configured: boolean; message: string } {
    if (this.isConfigured) {
      return { configured: true, message: "Twilio is configured and ready" };
    }
    return {
      configured: false,
      message: "Twilio not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER secrets.",
    };
  }
}

export const twilioService = new TwilioService();
