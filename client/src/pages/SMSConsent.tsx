import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { MessageSquare, Phone, ShieldCheck, Bell, Ban, ChevronLeft, HelpCircle, FileText } from "lucide-react";

export default function SMSConsent() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/20">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-tech font-bold uppercase text-primary" data-testid="text-page-title">SMS Consent & Terms</h1>
              <p className="text-muted-foreground text-sm font-mono">Last Updated: February 2026</p>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            DarkWave Studios LLC
          </Badge>
        </div>

        <div className="space-y-8">
          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Phone className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3" data-testid="text-section-program">SMS Messaging Program</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>GarageBot, operated by DarkWave Studios LLC, offers an optional SMS messaging program to keep you informed about your vehicles and account activity. By providing your mobile phone number and opting in, you consent to receive text messages from GarageBot.</p>
                  <p>Our SMS program is used to send the following types of messages:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Appointment Reminders:</strong> Notifications about upcoming service appointments at Mechanics Garage partner shops (24 hours and 2 hours before your appointment).</li>
                    <li><strong>Vehicle Ready Alerts:</strong> Notification when your vehicle service is complete and ready for pickup.</li>
                    <li><strong>Service Confirmations:</strong> Confirmation messages when appointments are booked, modified, or cancelled.</li>
                    <li><strong>Account & Security Alerts:</strong> Important account notifications such as login verifications and security updates.</li>
                    <li><strong>Order Updates:</strong> Status updates related to parts orders placed through GarageBot.</li>
                    <li><strong>Promotional Messages:</strong> Occasional deals, discounts, and special offers from GarageBot and our retail partners (only if you opt in to marketing messages).</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <ShieldCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3" data-testid="text-section-consent">How You Consent</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>You may opt in to receive SMS messages from GarageBot by:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Providing your mobile phone number during account registration and checking the SMS opt-in box.</li>
                    <li>Enabling SMS notifications in your Account Settings.</li>
                    <li>Requesting SMS reminders when booking appointments through a Mechanics Garage partner shop.</li>
                  </ul>
                  <p className="mt-3"><strong>Consent is not required</strong> to purchase any goods or services from GarageBot. You can use all GarageBot features without opting in to SMS.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Bell className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3" data-testid="text-section-frequency">Message Frequency & Rates</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Message frequency varies.</strong> The number of messages you receive depends on your account activity, scheduled appointments, and notification preferences. Typical users receive 1–10 messages per month.</p>
                  <p><strong>Message and data rates may apply.</strong> Standard messaging and data rates from your wireless carrier may apply to any messages sent or received. GarageBot does not charge for SMS messages, but your carrier may. Please contact your wireless provider for details about your text messaging plan.</p>
                  <p>Supported carriers include, but are not limited to: AT&T, T-Mobile, Verizon, Sprint, and most other major U.S. wireless carriers.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-red-500/20">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Ban className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3" data-testid="text-section-optout">How to Opt Out</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>You can opt out of receiving SMS messages from GarageBot at any time by:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Replying STOP</strong> to any message you receive from GarageBot. You will receive a one-time confirmation message that you have been unsubscribed.</li>
                    <li>Updating your notification preferences in your <strong>Account Settings</strong> on the GarageBot platform.</li>
                    <li>Contacting us directly at <a href="mailto:support@garagebot.io" className="text-primary hover:underline">support@garagebot.io</a>.</li>
                  </ul>
                  <p className="mt-3">After opting out, you will no longer receive SMS messages from GarageBot unless you re-subscribe. Please note that opting out of SMS does not affect email or in-app notifications.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <HelpCircle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3" data-testid="text-section-help">Need Help?</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>If you are experiencing issues with our SMS program, you can:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Reply HELP</strong> to any message from GarageBot for assistance.</li>
                    <li>Email us at <a href="mailto:support@garagebot.io" className="text-primary hover:underline">support@garagebot.io</a>.</li>
                    <li>Visit our <Link href="/support"><span className="text-primary hover:underline cursor-pointer">Support page</span></Link> for additional resources.</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3" data-testid="text-section-privacy">Privacy & Data Protection</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>Your phone number and SMS consent status are stored securely and will never be sold, rented, or shared with third parties for their marketing purposes. We use your phone number solely for the purposes described in this policy.</p>
                  <p>For full details on how we collect, use, and protect your personal information, please review our <Link href="/privacy"><span className="text-primary hover:underline cursor-pointer">Privacy Policy</span></Link>.</p>
                  <p>For our full terms of use, please review our <Link href="/terms"><span className="text-primary hover:underline cursor-pointer">Terms of Service</span></Link>.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <FileText className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3" data-testid="text-section-contact">Contact Information</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>DarkWave Studios LLC</strong></p>
                  <p>Email: <a href="mailto:support@garagebot.io" className="text-primary hover:underline">support@garagebot.io</a></p>
                  <p>Website: <a href="https://garagebot.io" className="text-primary hover:underline">https://garagebot.io</a></p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}