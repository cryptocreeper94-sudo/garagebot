import Nav from "@/components/Nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { FileText, Scale, AlertTriangle, CreditCard, Shield, Ban, ChevronLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/20">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-tech font-bold uppercase text-primary">Terms of Service</h1>
              <p className="text-muted-foreground text-sm font-mono">Last Updated: November 2024</p>
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
                <Scale className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3">Acceptance of Terms</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>By accessing or using GarageBot ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.</p>
                  <p>GarageBot is operated by DarkWave Studios LLC ("we", "us", "our"). These terms apply to all users, including visitors, registered users, and Pro subscribers.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <FileText className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3">Platform Services</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>GarageBot provides:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Parts Aggregation:</strong> Search across 40+ automotive retailers. We are an aggregator and do not sell parts directly.</li>
                    <li><strong>My Garage:</strong> Store and manage your vehicles, service history, and specifications.</li>
                    <li><strong>Genesis Hallmark:</strong> Blockchain-verified vehicle identity and ownership records.</li>
                    <li><strong>DIY Repair Guides:</strong> AI-generated step-by-step maintenance instructions.</li>
                    <li><strong>Buddy AI Assistant:</strong> Conversational parts finding and recommendations.</li>
                    <li><strong>Insurance Comparison:</strong> Compare quotes from insurance providers.</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3">Subscriptions & Payments</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Pro Subscription (Founders Circle):</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Current Founders Circle pricing: $4.99/month or $39.99/year</li>
                    <li>Founders Circle members lock in their rate permanently, even after V2 price increases</li>
                    <li>Subscriptions auto-renew unless cancelled before the billing period ends</li>
                    <li>Refunds are processed in accordance with our refund policy</li>
                  </ul>
                  <p className="mt-4"><strong>Affiliate Purchases:</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>When you purchase parts through our affiliate links, the transaction is with the retailer</li>
                    <li>All warranties, returns, and support are handled by the respective retailer</li>
                    <li>We may earn commissions on qualifying purchases at no additional cost to you</li>
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
                <h2 className="text-xl font-tech uppercase mb-3">Genesis Hallmark Terms</h2>
                <div className="space-y-3 text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Each user may mint one Genesis Hallmark per account</li>
                    <li>Hallmarks are recorded on the Solana blockchain and are permanent</li>
                    <li>Vehicle information associated with Hallmarks cannot be altered after minting</li>
                    <li>Hallmarks are non-transferable and tied to your GarageBot account</li>
                    <li>We do not guarantee any future value or utility of Genesis Hallmarks</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3">Disclaimers & Limitations</h2>
                <div className="space-y-3 text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Parts Information:</strong> We aggregate data from third parties. Verify fitment and specifications with retailers before purchasing.</li>
                    <li><strong>DIY Guides:</strong> Guides are for informational purposes. Always follow manufacturer recommendations and safety precautions.</li>
                    <li><strong>AI Recommendations:</strong> Buddy AI provides suggestions based on available data. Professional advice should be sought for complex repairs.</li>
                    <li><strong>Insurance Quotes:</strong> Quotes are estimates. Final rates are determined by insurance providers.</li>
                    <li><strong>No Warranty:</strong> The Platform is provided "as is" without warranties of any kind.</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Ban className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-tech uppercase mb-3">Prohibited Conduct</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>You agree not to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Use the Platform for any unlawful purpose</li>
                    <li>Attempt to gain unauthorized access to any systems or data</li>
                    <li>Scrape, copy, or redistribute Platform content without permission</li>
                    <li>Submit false vehicle information or fraudulent claims</li>
                    <li>Interfere with or disrupt the Platform's operation</li>
                    <li>Impersonate other users or entities</li>
                  </ul>
                  <p className="mt-4">Violation of these terms may result in account suspension or termination.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-primary/30">
            <h2 className="text-xl font-tech uppercase mb-3">Contact & Governing Law</h2>
            <div className="text-muted-foreground">
              <p className="font-bold text-foreground">DarkWave Studios LLC</p>
              <p>GarageBot Platform</p>
              <p className="mt-4">These terms are governed by the laws of the State of Texas, USA.</p>
              <p className="mt-2">
                For questions about these terms: <a href="mailto:legal@garagebot.io" className="text-primary hover:underline">legal@garagebot.io</a>
              </p>
              <p>
                For general support: <a href="mailto:support@garagebot.io" className="text-primary hover:underline">support@garagebot.io</a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
