import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles, DollarSign, Users, Wallet, CheckCircle, Copy, Check,
  Share2, ShoppingCart, CreditCard, Shield, ArrowRight, Loader2,
  Link2, Award, TrendingUp, Clock, AlertCircle, Crown, Globe,
  FileCode, Zap, Ban, Info
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import bgImage from "@assets/generated_images/al_watermark_background_texture.png";

interface AffiliateData {
  id: string;
  userId: string;
  code: string;
  paypalEmail: string | null;
  status: string;
  totalEarnings: number;
  availableBalance: number;
  totalReferrals: number;
  qualifiedReferrals: number;
  totalReferredRevenue: number;
  referrals: Referral[];
  earnings: Earning[];
  payouts: Payout[];
}

interface Referral {
  id: string;
  referredUserId: string;
  referredUsername?: string;
  referredDate: string;
  totalPurchases: number;
  commissionEarned: number;
  qualified: boolean;
  isProMember: boolean;
}

interface Earning {
  id: string;
  type: "purchase_commission" | "pro_bonus" | "pro_recurring";
  amount: number;
  sourceAmount: number;
  description: string;
  createdAt: string;
}

interface Payout {
  id: string;
  amount: number;
  status: "pending" | "approved" | "paid";
  requestedAt: string;
  paidAt: string | null;
}

interface TrustLayerData {
  handoff: Record<string, unknown>;
  explanation: string;
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const earningTypeBadge: Record<string, { label: string; cls: string }> = {
  purchase_commission: { label: "Purchase", cls: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  pro_bonus: { label: "Pro Bonus", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  pro_recurring: { label: "Recurring", cls: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

const payoutStatusBadge: Record<string, { cls: string }> = {
  pending: { cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  approved: { cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  paid: { cls: "bg-green-500/20 text-green-400 border-green-500/30" },
};

export default function AffiliateProgram() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paypalEmail, setPaypalEmail] = useState("");
  const [updatePaypalEmail, setUpdatePaypalEmail] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState("referrals");

  const { data: affiliate, isLoading } = useQuery<AffiliateData | null>({
    queryKey: ["affiliate-program-me"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate-program/me", { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const enrollMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/affiliate-program/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paypalEmail: email }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to enroll");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Welcome to the Affiliate Program!", description: "Your unique code has been generated." });
      queryClient.invalidateQueries({ queryKey: ["affiliate-program-me"] });
    },
    onError: (err: Error) => {
      toast({ title: "Enrollment Failed", description: err.message, variant: "destructive" });
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/affiliate-program/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paypalEmail: email }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "PayPal Email Updated" });
      queryClient.invalidateQueries({ queryKey: ["affiliate-program-me"] });
      setUpdatePaypalEmail("");
    },
    onError: () => {
      toast({ title: "Update Failed", variant: "destructive" });
    },
  });

  const payoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/affiliate-program/payout-request", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to request payout");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Payout Requested", description: "We'll process it within 5 business days." });
      queryClient.invalidateQueries({ queryKey: ["affiliate-program-me"] });
    },
    onError: () => {
      toast({ title: "Payout Failed", variant: "destructive" });
    },
  });

  const { data: trustLayerData, isLoading: loadingTrust } = useQuery<TrustLayerData | null>({
    queryKey: ["affiliate-trustlayer", affiliate?.code],
    queryFn: async () => {
      const res = await fetch(`/api/affiliate-program/trustlayer/${affiliate!.code}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!affiliate?.code && activeTab === "trustlayer",
  });

  const copyToClipboard = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isEnrolled = !!affiliate;

  return (
    <div className="min-h-screen text-foreground font-sans relative">
      <div
        className="fixed inset-0 z-[-1] bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      <Nav />

      <div className="pt-24 pb-16 max-w-6xl mx-auto px-4">
        {isLoading && isAuthenticated ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : isEnrolled ? (
          <EnrolledDashboard
            affiliate={affiliate}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            copiedCode={copiedCode}
            copiedLink={copiedLink}
            copyToClipboard={copyToClipboard}
            updatePaypalEmail={updatePaypalEmail}
            setUpdatePaypalEmail={setUpdatePaypalEmail}
            updateEmailMutation={updateEmailMutation}
            payoutMutation={payoutMutation}
            trustLayerData={trustLayerData}
            loadingTrust={loadingTrust}
          />
        ) : (
          <PublicLanding
            isAuthenticated={isAuthenticated}
            paypalEmail={paypalEmail}
            setPaypalEmail={setPaypalEmail}
            enrollMutation={enrollMutation}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

function PublicLanding({
  isAuthenticated,
  paypalEmail,
  setPaypalEmail,
  enrollMutation,
}: {
  isAuthenticated: boolean;
  paypalEmail: string;
  setPaypalEmail: (v: string) => void;
  enrollMutation: ReturnType<typeof useMutation<any, Error, string>>;
}) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-16">
      <motion.div variants={fadeUp} className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-tech text-sm uppercase text-cyan-400">Affiliate Program</span>
        </div>

        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-tech font-bold uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500"
          style={{ textShadow: "0 0 40px rgba(0,229,255,0.3)" }}
        >
          GarageBot Affiliate Program
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Earn Real Money Promoting the Future of Auto Parts
        </p>

        <motion.div
          className="mt-8 mx-auto max-w-md"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-2xl blur-lg" />
            <Card className="relative bg-black/40 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-2xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <DollarSign className="w-8 h-8 text-cyan-400" />
                <span className="font-tech text-2xl font-bold text-white">Start Earning Today</span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Join thousands of affiliates earning commissions on auto parts, Pro subscriptions, and more.
              </p>
            </Card>
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-tech font-bold uppercase text-center mb-8 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Share2, title: "Share Your Link", desc: "Get your unique GB-XXXXXX code and share it everywhere — social media, forums, YouTube, anywhere gearheads gather.", color: "text-cyan-400", glow: "rgba(0,229,255,0.2)" },
            { icon: ShoppingCart, title: "Friends Join & Shop", desc: "Your referrals sign up and use GarageBot to find and purchase auto parts from 50+ retailers.", color: "text-purple-400", glow: "rgba(168,85,247,0.2)" },
            { icon: DollarSign, title: "You Get Paid", desc: "Earn commissions on their purchases and subscriptions. Real money, deposited to your PayPal.", color: "text-green-400", glow: "rgba(74,222,128,0.2)" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-black/30 backdrop-blur-xl border border-cyan-500/20 p-6 h-full hover:border-cyan-500/40 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-shadow">
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <div className="text-sm font-mono text-cyan-400/60 mb-1">Step {i + 1}</div>
                <h3 className="font-tech text-lg font-bold uppercase text-white mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-tech font-bold uppercase text-center mb-8 flex items-center justify-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Commission Structure
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: TrendingUp, value: "10%", label: "of GarageBot's commission on referred purchases", color: "text-cyan-400", border: "border-cyan-500/30", glow: "shadow-[0_0_20px_rgba(0,229,255,0.15)]" },
            { icon: Crown, value: "$5", label: "bonus per Pro subscription conversion", color: "text-yellow-400", border: "border-yellow-500/30", glow: "shadow-[0_0_20px_rgba(250,204,21,0.15)]" },
            { icon: Zap, value: "$2/mo", label: "recurring per active Pro referral", color: "text-purple-400", border: "border-purple-500/30", glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]" },
          ].map((item) => (
            <motion.div key={item.value} whileHover={{ scale: 1.03 }}>
              <Card className={`bg-black/30 backdrop-blur-xl ${item.border} p-6 text-center ${item.glow} hover:shadow-lg transition-all`}>
                <item.icon className={`w-10 h-10 ${item.color} mx-auto mb-3`} />
                <div className={`text-3xl font-tech font-bold ${item.color} mb-2`}>{item.value}</div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-tech font-bold uppercase text-center mb-8 flex items-center justify-center gap-2">
          <Info className="w-5 h-5 text-cyan-400" />
          Program Rules
        </h2>
        <Card className="bg-black/30 backdrop-blur-xl border border-cyan-500/20 p-6 max-w-2xl mx-auto">
          <div className="space-y-4">
            {[
              { icon: CreditCard, text: "$100 minimum referred purchase total before earning begins" },
              { icon: Wallet, text: "$20 minimum payout threshold" },
              { icon: DollarSign, text: "PayPal payouts — get paid directly to your account" },
              { icon: Ban, text: "Only earn on real revenue — no credit for empty clicks" },
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <rule.icon className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-sm text-muted-foreground">{rule.text}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="bg-gradient-to-r from-purple-500/10 via-blue-500/5 to-cyan-500/10 border border-purple-500/20 p-6 max-w-2xl mx-auto text-center">
          <Shield className="w-10 h-10 text-purple-400 mx-auto mb-3" />
          <h3 className="font-tech text-lg font-bold uppercase text-white mb-2">Verified by DarkWave Trust Layer</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Cross-ecosystem recognition — your GB code works across all DarkWave apps.
          </p>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Globe className="w-3 h-3 mr-1" /> Cross-Ecosystem Tracking
          </Badge>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 p-8 max-w-lg mx-auto text-center">
          <h3 className="font-tech text-xl font-bold uppercase text-white mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Ready to Earn?
          </h3>

          {!isAuthenticated ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">Sign in to your GarageBot account to join the affiliate program.</p>
              <a href="/auth">
                <Button
                  className="w-full h-12 font-tech uppercase bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all"
                  data-testid="button-enroll-affiliate"
                >
                  <ArrowRight className="w-5 h-5 mr-2" /> Sign In to Join
                </Button>
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-left">
                <Label htmlFor="paypal-email" className="text-sm text-muted-foreground">PayPal Email</Label>
                <Input
                  id="paypal-email"
                  type="email"
                  placeholder="your@paypal.email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className="mt-1 bg-black/30 border-cyan-500/20 focus:border-cyan-500/50"
                  data-testid="input-paypal-email"
                />
              </div>
              <Button
                onClick={() => enrollMutation.mutate(paypalEmail)}
                disabled={!paypalEmail || enrollMutation.isPending}
                className="w-full h-12 font-tech uppercase bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all"
                data-testid="button-enroll-affiliate"
              >
                {enrollMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enrolling...</>
                ) : (
                  <><Award className="w-5 h-5 mr-2" /> Join the Affiliate Program</>
                )}
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}

function EnrolledDashboard({
  affiliate,
  activeTab,
  setActiveTab,
  copiedCode,
  copiedLink,
  copyToClipboard,
  updatePaypalEmail,
  setUpdatePaypalEmail,
  updateEmailMutation,
  payoutMutation,
  trustLayerData,
  loadingTrust,
}: {
  affiliate: AffiliateData;
  activeTab: string;
  setActiveTab: (v: string) => void;
  copiedCode: boolean;
  copiedLink: boolean;
  copyToClipboard: (text: string, type: "code" | "link") => void;
  updatePaypalEmail: string;
  setUpdatePaypalEmail: (v: string) => void;
  updateEmailMutation: any;
  payoutMutation: any;
  trustLayerData: TrustLayerData | null | undefined;
  loadingTrust: boolean;
}) {
  const shareUrl = `garagebot.io/?ref=${affiliate.code}`;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={fadeUp} className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-lg" />
        <Card className="relative bg-black/40 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-tech font-bold uppercase text-white" style={{ textShadow: "0 0 20px rgba(0,229,255,0.3)" }}>
                  Affiliate Dashboard
                </h1>
                <Badge className={affiliate.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                  {affiliate.status === "active" ? "Active" : "Suspended"}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 bg-black/30 border border-cyan-500/20 rounded-lg px-3 py-2">
                  <span className="text-xs text-muted-foreground">Code:</span>
                  <span className="font-mono font-bold text-cyan-400" data-testid="text-affiliate-code">{affiliate.code}</span>
                  <button
                    onClick={() => copyToClipboard(affiliate.code, "code")}
                    className="text-muted-foreground hover:text-cyan-400 transition-colors"
                    data-testid="button-copy-code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-black/30 border border-cyan-500/20 rounded-lg px-3 py-2">
                  <span className="text-xs text-muted-foreground">Link:</span>
                  <span className="font-mono text-sm text-cyan-400 truncate max-w-[200px]">{shareUrl}</span>
                  <button
                    onClick={() => copyToClipboard(`https://${shareUrl}`, "link")}
                    className="text-muted-foreground hover:text-cyan-400 transition-colors"
                    data-testid="button-copy-link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Link2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Shield className="w-3 h-3 mr-1" /> Trust Layer Verified
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Earnings", value: `$${affiliate.totalEarnings.toFixed(2)}`, icon: DollarSign, color: "text-cyan-400", glow: "shadow-[0_0_15px_rgba(0,229,255,0.15)]", testId: "text-total-earnings" },
          { label: "Available Balance", value: `$${affiliate.availableBalance.toFixed(2)}`, icon: Wallet, color: "text-green-400", glow: "shadow-[0_0_15px_rgba(74,222,128,0.15)]", testId: "text-available-balance" },
          { label: "Total Referrals", value: affiliate.totalReferrals.toString(), icon: Users, color: "text-purple-400", glow: "shadow-[0_0_15px_rgba(168,85,247,0.15)]", testId: undefined },
          { label: "Qualified Referrals", value: affiliate.qualifiedReferrals.toString(), icon: CheckCircle, color: "text-yellow-400", glow: "shadow-[0_0_15px_rgba(250,204,21,0.15)]", testId: undefined },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.03 }}>
            <Card className={`bg-black/30 backdrop-blur-xl border border-cyan-500/20 p-5 ${stat.glow} hover:shadow-lg transition-all`}>
              <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs uppercase mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                {stat.label}
              </div>
              <div className={`text-2xl md:text-3xl font-tech font-bold ${stat.color}`} data-testid={stat.testId}>
                {stat.value}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-black/30 backdrop-blur-xl border border-cyan-500/20 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Referred Revenue → $100 Threshold</span>
            <span className="text-xs font-mono text-cyan-400">${affiliate.totalReferredRevenue.toFixed(2)} / $100</span>
          </div>
          <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-cyan-500/10">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((affiliate.totalReferredRevenue / 100) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          {affiliate.totalReferredRevenue < 100 && (
            <p className="text-xs text-muted-foreground mt-1">${(100 - affiliate.totalReferredRevenue).toFixed(2)} more to qualify</p>
          )}
        </Card>

        <Card className="bg-black/30 backdrop-blur-xl border border-cyan-500/20 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Balance → $20 Payout Threshold</span>
            <span className="text-xs font-mono text-green-400">${affiliate.availableBalance.toFixed(2)} / $20</span>
          </div>
          <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-green-500/10">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((affiliate.availableBalance / 20) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          {affiliate.availableBalance < 20 && (
            <p className="text-xs text-muted-foreground mt-1">${(20 - affiliate.availableBalance).toFixed(2)} more to request payout</p>
          )}
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-black/30 backdrop-blur-xl border border-cyan-500/20 p-1">
            <TabsTrigger value="referrals" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 font-tech uppercase text-xs" data-testid="tab-referrals">
              <Users className="w-3 h-3 mr-1" /> Referrals
            </TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 font-tech uppercase text-xs" data-testid="tab-earnings">
              <DollarSign className="w-3 h-3 mr-1" /> Earnings
            </TabsTrigger>
            <TabsTrigger value="payouts" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 font-tech uppercase text-xs" data-testid="tab-payouts">
              <Wallet className="w-3 h-3 mr-1" /> Payouts
            </TabsTrigger>
            <TabsTrigger value="trustlayer" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 font-tech uppercase text-xs" data-testid="tab-trustlayer">
              <Shield className="w-3 h-3 mr-1" /> Trust Layer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="referrals" className="mt-4">
            <Card className="bg-black/30 backdrop-blur-xl border border-cyan-500/20 p-6">
              {affiliate.referrals.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <h3 className="font-tech text-lg font-bold text-white mb-2">No Referrals Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Share your affiliate link to start earning. When someone signs up using your code, they'll appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-2 text-xs font-mono text-muted-foreground uppercase border-b border-cyan-500/10 pb-3">
                    <span>Referred Date</span>
                    <span>Total Purchases</span>
                    <span>Commission</span>
                    <span>Status</span>
                    <span>Type</span>
                  </div>
                  {affiliate.referrals.map((ref) => (
                    <div key={ref.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 px-4 py-3 rounded-lg bg-black/20 border border-cyan-500/10 hover:border-cyan-500/30 transition-colors" data-testid={`referral-row-${ref.id}`}>
                      <span className="text-sm text-muted-foreground">
                        <span className="md:hidden text-xs text-cyan-400/60 mr-1">Date:</span>
                        {new Date(ref.referredDate).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-white font-medium">
                        <span className="md:hidden text-xs text-cyan-400/60 mr-1">Purchases:</span>
                        ${ref.totalPurchases.toFixed(2)}
                      </span>
                      <span className="text-sm text-cyan-400 font-mono">
                        <span className="md:hidden text-xs text-cyan-400/60 mr-1">Commission:</span>
                        ${ref.commissionEarned.toFixed(2)}
                      </span>
                      <span>
                        <Badge className={ref.qualified ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}>
                          {ref.qualified ? "Qualified" : "Pending"}
                        </Badge>
                      </span>
                      <span>
                        {ref.isProMember && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <Crown className="w-3 h-3 mr-1" /> Pro
                          </Badge>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="mt-4">
            <Card className="bg-black/30 backdrop-blur-xl border border-cyan-500/20 p-6">
              {affiliate.earnings.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <h3 className="font-tech text-lg font-bold text-white mb-2">No Earnings Yet</h3>
                  <p className="text-sm text-muted-foreground">Your commission earnings will appear here as your referrals make purchases.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {affiliate.earnings.map((earning) => (
                    <div key={earning.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 rounded-lg bg-black/20 border border-cyan-500/10 hover:border-cyan-500/30 transition-colors" data-testid={`earning-row-${earning.id}`}>
                      <div className="flex items-center gap-3">
                        <Badge className={earningTypeBadge[earning.type]?.cls || "bg-gray-500/20 text-gray-400"}>
                          {earningTypeBadge[earning.type]?.label || earning.type}
                        </Badge>
                        <div>
                          <p className="text-sm text-white">{earning.description}</p>
                          <p className="text-xs text-muted-foreground">Source: ${earning.sourceAmount.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-tech font-bold text-cyan-400">+${earning.amount.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">{new Date(earning.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="mt-4">
            <Card className="bg-black/30 backdrop-blur-xl border border-cyan-500/20 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-tech text-lg font-bold text-white">Payout Requests</h3>
                  <p className="text-xs text-muted-foreground">PayPal: {affiliate.paypalEmail || "Not set"}</p>
                </div>
                <Button
                  onClick={() => payoutMutation.mutate()}
                  disabled={affiliate.availableBalance < 20 || !affiliate.paypalEmail || payoutMutation.isPending}
                  className="font-tech uppercase bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-[0_0_15px_rgba(74,222,128,0.3)] disabled:opacity-50"
                  data-testid="button-request-payout"
                >
                  {payoutMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <><DollarSign className="w-4 h-4 mr-2" /> Request Payout</>
                  )}
                </Button>
              </div>

              {affiliate.availableBalance < 20 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Minimum $20 balance required to request a payout.
                </div>
              )}

              {affiliate.payouts.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No payout requests yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {affiliate.payouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-black/20 border border-cyan-500/10" data-testid={`payout-row-${payout.id}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-tech font-bold text-white">${payout.amount.toFixed(2)}</span>
                        <Badge className={payoutStatusBadge[payout.status]?.cls || "bg-gray-500/20 text-gray-400"}>
                          {payout.status}
                        </Badge>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>Requested: {new Date(payout.requestedAt).toLocaleDateString()}</p>
                        {payout.paidAt && <p className="text-green-400">Paid: {new Date(payout.paidAt).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-cyan-500/10 pt-4">
                <h4 className="font-tech text-sm font-bold uppercase text-white mb-3">Update PayPal Email</h4>
                <div className="flex gap-3">
                  <Input
                    type="email"
                    placeholder={affiliate.paypalEmail || "your@paypal.email"}
                    value={updatePaypalEmail}
                    onChange={(e) => setUpdatePaypalEmail(e.target.value)}
                    className="bg-black/30 border-cyan-500/20 focus:border-cyan-500/50"
                    data-testid="input-paypal-email"
                  />
                  <Button
                    onClick={() => updateEmailMutation.mutate(updatePaypalEmail)}
                    disabled={!updatePaypalEmail || updateEmailMutation.isPending}
                    variant="outline"
                    className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 shrink-0"
                  >
                    {updateEmailMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="trustlayer" className="mt-4">
            <Card className="bg-black/30 backdrop-blur-xl border border-cyan-500/20 p-6 space-y-6">
              <div>
                <h3 className="font-tech text-lg font-bold text-white flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-purple-400" /> DarkWave Trust Layer
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your affiliate identity is verified and recognized across the entire DarkWave ecosystem. When you refer someone,
                  Trust Layer ensures cross-app tracking and attribution.
                </p>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h4 className="font-tech text-sm font-bold uppercase text-purple-400 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Cross-Ecosystem Tracking
                </h4>
                <p className="text-xs text-muted-foreground">
                  Your code <span className="font-mono text-cyan-400">{affiliate.code}</span> is recognized by all DarkWave applications
                  including Orbit Staffing, BrewBoard, and future ecosystem partners. Referrals that start in GarageBot
                  can earn you credit in any connected app.
                </p>
              </div>

              <div>
                <h4 className="font-tech text-sm font-bold uppercase text-white mb-3 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" /> Trust Layer Handoff Format
                </h4>
                {loadingTrust ? (
                  <Skeleton className="h-40 w-full" />
                ) : trustLayerData ? (
                  <pre className="p-4 bg-black/50 border border-cyan-500/10 rounded-lg text-xs font-mono text-cyan-400 overflow-x-auto max-h-80">
                    {JSON.stringify(trustLayerData.handoff, null, 2)}
                  </pre>
                ) : (
                  <pre className="p-4 bg-black/50 border border-cyan-500/10 rounded-lg text-xs font-mono text-cyan-400 overflow-x-auto">
{JSON.stringify({
  schema: "darkwave-trust-layer-v1",
  source: "garagebot",
  affiliate: {
    code: affiliate.code,
    status: affiliate.status,
    totalEarnings: affiliate.totalEarnings,
    totalReferrals: affiliate.totalReferrals,
    qualifiedReferrals: affiliate.qualifiedReferrals,
  },
  verification: {
    verified: true,
    verifiedAt: new Date().toISOString(),
    ecosystem: "darkwave",
  },
}, null, 2)}
                  </pre>
                )}
                {trustLayerData?.explanation && (
                  <p className="text-xs text-muted-foreground mt-2">{trustLayerData.explanation}</p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}