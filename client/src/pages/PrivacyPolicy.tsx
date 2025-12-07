import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Shield, Lock, Eye, Database, Users, Mail, ChevronLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/20">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-tech font-bold uppercase text-primary">Privacy Policy</h1>
              <p className="text-muted-foreground text-sm font-mono">Last Updated: December 2024</p>
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
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3">Information We Collect</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>GarageBot collects information you provide directly to us, including:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Account information (username, PIN, contact details)</li>
                    <li>Vehicle information (VIN, year, make, model, service history)</li>
                    <li>Transaction data for parts purchases and subscriptions</li>
                    <li>Communication preferences and service requests</li>
                  </ul>
                  <p className="mt-4">We automatically collect certain information when you use our platform:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Device and browser information</li>
                    <li>IP address and location data (for local pickup features)</li>
                    <li>Usage patterns and search history</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Database className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3">How We Use Your Information</h2>
                <div className="space-y-3 text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>To provide and improve our parts search and aggregation services</li>
                    <li>To maintain your Vehicle Passport and service history</li>
                    <li>To process transactions and Genesis Hallmark minting</li>
                    <li>To send service reminders and important notifications</li>
                    <li>To connect you with mechanic shops and insurance providers</li>
                    <li>To personalize your experience with relevant recommendations</li>
                    <li>To detect and prevent fraud or unauthorized access</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3">Information Sharing</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>We do not sell your personal information. We may share information with:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Parts Retailers:</strong> When you click through to purchase parts, the retailer receives necessary order information</li>
                    <li><strong>Mechanic Shops:</strong> If you use our Shop Portal, service records are shared with shops you authorize</li>
                    <li><strong>Insurance Partners:</strong> Quote request information is shared with carriers you select</li>
                    <li><strong>Payment Processors:</strong> Stripe processes all payments securely</li>
                    <li><strong>Service Providers:</strong> Trusted vendors who help operate our platform</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Lock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3">Data Security</h2>
                <div className="space-y-3 text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All PINs are hashed using industry-standard cryptographic algorithms</li>
                    <li>Sensitive data is encrypted in transit and at rest</li>
                    <li>We use secure session management with configurable persistence</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Recovery codes are provided for account access restoration</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3">Genesis Hallmark & Blockchain</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p className="font-medium text-blue-400">Blockchain verification is always opt-in.</p>
                  <p>We never automatically record your personal information or vehicle data on the blockchain. You must explicitly choose to create a hallmark.</p>
                  <p>When you mint a Genesis Hallmark:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Your vehicle information is recorded on-chain as part of the immutable vehicle passport</li>
                    <li>Hallmark asset numbers are publicly visible but not linked to personal identity</li>
                    <li>You control your Hallmark and can display or hide it as you choose</li>
                    <li>Blockchain transactions are permanent and cannot be deleted</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Mail className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3">Your Rights & Choices</h2>
                <div className="space-y-3 text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Correction:</strong> Update inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your account and data (excluding blockchain records)</li>
                    <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                    <li><strong>SMS Reminders:</strong> Enable or disable service notifications</li>
                  </ul>
                  <p className="mt-4">Contact us at <a href="mailto:privacy@garagebot.io" className="text-primary hover:underline">privacy@garagebot.io</a> for any privacy-related requests.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-primary/30">
            <h2 className="text-xl font-tech uppercase mb-3">Contact Information</h2>
            <div className="text-muted-foreground">
              <p className="font-bold text-foreground">DarkWave Studios LLC</p>
              <p>GarageBot Platform</p>
              <p className="mt-2">
                For privacy inquiries: <a href="mailto:privacy@garagebot.io" className="text-primary hover:underline">privacy@garagebot.io</a>
              </p>
              <p>
                For general support: <a href="mailto:support@garagebot.io" className="text-primary hover:underline">support@garagebot.io</a>
              </p>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
