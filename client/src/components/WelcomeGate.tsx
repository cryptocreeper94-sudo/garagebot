import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  X, Eye, EyeOff, Loader2, CheckCircle, AlertCircle,
  Car, Mail, User, Lock, ArrowRight, KeyRound, Shield,
  FileText, ChevronDown, Globe
} from "lucide-react";
import gbEmblem from "@assets/generated_images/gb_emblem_no_bg.png";

type View = "signup" | "signup-terms" | "login" | "forgot" | "reset-sent";

interface PasswordCheck {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

const TERMS_TEXT = `TERMS OF SERVICE — GarageBot by DarkWave Studios LLC
Last Updated: February 2026

1. ACCEPTANCE OF TERMS
By accessing or using GarageBot ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. GarageBot is operated by DarkWave Studios LLC ("we", "us", "our"). These terms apply to all users, including visitors, registered users, and Pro subscribers.

2. PLATFORM SERVICES
GarageBot provides:
• Parts Aggregation: Search across 68+ automotive and motorized vehicle retailers. We are an aggregator and do not sell parts directly.
• My Garage: Store and manage your vehicles, service history, and specifications.
• Genesis Hallmark: Blockchain-verified vehicle identity and ownership records on the Solana network.
• DIY Repair Guides: AI-generated step-by-step maintenance and repair instructions.
• Buddy AI Assistant: Conversational parts finding, recommendations, and vehicle diagnostics.
• Insurance Comparison: Compare quotes from insurance providers.
• Mechanics Garage: Shop management subscription service for professional mechanics.
• Motorized Hobby Section: Parts and resources for RC cars, drones/FPV, model aircraft, and slot cars.

3. ACCOUNT REGISTRATION
You must provide accurate, complete information when creating an account. Your account credentials (username, email, password) are your responsibility. You agree to maintain the security of your password and accept responsibility for all activities under your account. Your password works across all DarkWave Trust Layer connected applications.

4. SUBSCRIPTIONS & PAYMENTS
• Pro Subscription (Founders Circle): Current pricing at $4.99/month or $39.99/year. Founders Circle members lock in their rate permanently, even after price increases. Subscriptions auto-renew unless cancelled before the billing period ends.
• Mechanics Garage Subscription: Professional shop management tools with tiered pricing. See subscription details for current rates.
• Affiliate Purchases: When you purchase parts through our affiliate links, the transaction is with the retailer. All warranties, returns, and support are handled by the respective retailer. We may earn commissions on qualifying purchases at no additional cost to you.
• Refunds are processed in accordance with our refund policy.

5. USER CONDUCT
You agree not to:
• Use the Platform for any unlawful purpose
• Attempt to gain unauthorized access to any part of the Platform
• Interfere with or disrupt the Platform's operation
• Submit false or misleading information
• Use automated means to access the Platform without permission
• Harass, abuse, or harm other users
• Reverse engineer or attempt to extract source code

6. INTELLECTUAL PROPERTY
All content, features, and functionality of the Platform are owned by DarkWave Studios LLC and are protected by copyright, trademark, and other intellectual property laws. Genesis Hallmark NFTs grant ownership of the digital asset but not the underlying Platform technology.

7. DISCLAIMER OF WARRANTIES
The Platform is provided "as is" and "as available" without warranties of any kind. We do not guarantee the accuracy of parts information, pricing, or availability from third-party retailers. DIY guides and AI recommendations are for informational purposes only — always consult a certified mechanic for safety-critical repairs.

8. LIMITATION OF LIABILITY
DarkWave Studios LLC shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including but not limited to damages from parts purchased through affiliate links, vehicle repairs performed based on our guides, or data loss.

9. INDEMNIFICATION
You agree to indemnify and hold harmless DarkWave Studios LLC from any claims, damages, or expenses arising from your use of the Platform or violation of these Terms.

10. MODIFICATION OF TERMS
We reserve the right to modify these Terms at any time. We will notify registered users of material changes via email. Continued use of the Platform after changes constitutes acceptance of the modified Terms.

11. TERMINATION
We may suspend or terminate your account at our discretion for violations of these Terms. Upon termination, your right to use the Platform ceases immediately. Data associated with your account may be deleted after a reasonable retention period.

12. GOVERNING LAW
These Terms are governed by the laws of the State of Delaware, USA. Any disputes shall be resolved in the courts of Delaware.

13. CONTACT
For questions about these Terms, contact us at support@darkwavestudios.io or through our in-app support system.`;

const PRIVACY_TEXT = `PRIVACY POLICY — GarageBot by DarkWave Studios LLC
Last Updated: February 2026

1. INFORMATION WE COLLECT
GarageBot collects information you provide directly to us, including:
• Account information (first name, username, email, password)
• Vehicle information (VIN, year, make, model, service history)
• Transaction data for parts purchases and subscriptions
• Communication preferences and service requests
• Mechanic shop business information (for Mechanics Garage subscribers)

We automatically collect certain information when you use our platform:
• Device and browser information
• IP address and approximate location data (for local pickup features)
• Usage patterns and search history
• Cookie and session data

2. HOW WE USE YOUR INFORMATION
• To provide and improve our parts search and aggregation services
• To maintain your vehicle records and service history
• To process transactions and Genesis Hallmark minting
• To send service reminders and important notifications
• To connect you with mechanic shops and insurance providers
• To personalize your experience with relevant recommendations
• To detect and prevent fraud or unauthorized access
• To sync your credentials across DarkWave Trust Layer connected apps

3. INFORMATION SHARING
We do not sell your personal information. We may share information with:
• Parts Retailers: When you click through to purchase parts, the retailer receives necessary order information.
• Mechanic Shops: If you use our Shop Portal, service records are shared with shops you authorize.
• Insurance Partners: Quote request information is shared with carriers you select.
• Payment Processors: Stripe processes all payments securely. We do not store your full credit card information.
• DarkWave Ecosystem: Your account credentials are synced via Trust Layer for single-password access across DarkWave apps.
• Service Providers: Trusted vendors who help operate our platform under strict confidentiality agreements.
• Law Enforcement: When required by law or to protect our legal rights.

4. DATA SECURITY
We implement industry-standard security measures including:
• Encrypted password storage using bcrypt hashing
• HTTPS encryption for all data transmission
• Session-based authentication with secure cookie handling
• Blockchain verification for Genesis Hallmark records
• Regular security audits and monitoring

5. DATA RETENTION
We retain your data as long as your account is active or as needed to provide services. After account deletion:
• Personal data is removed within 30 days
• Transaction records are retained for 7 years for legal compliance
• Blockchain records (Genesis Hallmarks) are permanent and immutable

6. YOUR RIGHTS
You have the right to:
• Access your personal data
• Correct inaccurate information
• Request deletion of your account and data
• Opt out of marketing communications
• Export your vehicle and service data
• Restrict processing of your data

7. COOKIES & TRACKING
We use essential cookies for authentication and session management. Analytics cookies help us improve the platform. You can manage cookie preferences in your browser settings.

8. CHILDREN'S PRIVACY
GarageBot is not intended for users under 13 years of age. We do not knowingly collect information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.

9. INTERNATIONAL USERS
GarageBot is operated in the United States. By using the Platform, you consent to the transfer of your data to the US. We comply with applicable data protection regulations.

10. CHANGES TO THIS POLICY
We may update this Privacy Policy periodically. We will notify you of material changes via email or prominent notice on the Platform.

11. CONTACT US
For privacy-related inquiries:
Email: privacy@darkwavestudios.io
Support: Through our in-app support system
Address: DarkWave Studios LLC, Delaware, USA`;

export default function WelcomeGate() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>("signup");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [signupForm, setSignupForm] = useState({
    firstName: "",
    email: "",
    username: "",
    password: "",
    stayLoggedIn: false,
  });

  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: "",
    stayLoggedIn: false,
  });

  const [forgotEmail, setForgotEmail] = useState("");

  const [termsScrolled, setTermsScrolled] = useState(false);
  const [privacyScrolled, setPrivacyScrolled] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showingTerms, setShowingTerms] = useState(true);

  const termsRef = useRef<HTMLDivElement>(null);
  const privacyRef = useRef<HTMLDivElement>(null);

  const passwordChecks: PasswordCheck = {
    length: signupForm.password.length >= 8,
    uppercase: /[A-Z]/.test(signupForm.password),
    lowercase: /[a-z]/.test(signupForm.password),
    number: /[0-9]/.test(signupForm.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupForm.password),
  };
  const passwordValid = passwordChecks.length && passwordChecks.uppercase && passwordChecks.lowercase && passwordChecks.number && passwordChecks.special;

  const handleScroll = useCallback((ref: React.RefObject<HTMLDivElement | null>, setter: (v: boolean) => void) => {
    const el = ref.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
    if (atBottom) setter(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      setIsOpen(false);
      return;
    }
  }, [user, authLoading]);

  useEffect(() => {
    const openHandler = () => {
      setView("signup");
      setIsOpen(true);
    };
    const viewHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === "login") setView("login");
    };
    window.addEventListener("garagebot:open-welcome", openHandler);
    window.addEventListener("garagebot:welcome-view", viewHandler);
    return () => {
      window.removeEventListener("garagebot:open-welcome", openHandler);
      window.removeEventListener("garagebot:welcome-view", viewHandler);
    };
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("garagebot_welcome_dismissed", "true");
    setIsOpen(false);
  };

  const handleGoToTerms = () => {
    if (!signupForm.firstName.trim()) {
      toast({ title: "Missing info", description: "Please enter your first name", variant: "destructive" });
      return;
    }
    if (!signupForm.email.trim()) {
      toast({ title: "Missing info", description: "Please enter your email", variant: "destructive" });
      return;
    }
    if (!signupForm.username.trim()) {
      toast({ title: "Missing info", description: "Please choose a username", variant: "destructive" });
      return;
    }
    if (!passwordValid) {
      toast({ title: "Password requirements", description: "Please meet all password requirements", variant: "destructive" });
      return;
    }
    setView("signup-terms");
    setShowingTerms(true);
    setTermsScrolled(false);
    setPrivacyScrolled(false);
    setTermsAccepted(false);
    setPrivacyAccepted(false);
  };

  const handleSignup = async () => {
    if (!termsAccepted || !privacyAccepted) {
      toast({ title: "Required", description: "Please accept both Terms of Service and Privacy Policy", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: signupForm.firstName.trim(),
          email: signupForm.email.trim(),
          username: signupForm.username.trim(),
          mainPin: signupForm.password,
          enablePersistence: signupForm.stayLoggedIn,
          agreeTerms: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      await queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      localStorage.setItem("garagebot_onboarding_seen", "true");
      setIsOpen(false);
      toast({ title: `Welcome, ${signupForm.firstName}!`, description: "Your free Garage is ready. Let's set it up!" });
      setLocation("/garage");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.identifier.trim() || !loginForm.password.trim()) {
      toast({ title: "Missing info", description: "Please enter your username/email and password", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: loginForm.identifier.trim(),
          mainPin: loginForm.password,
          enablePersistence: loginForm.stayLoggedIn,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      await queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      localStorage.setItem("garagebot_onboarding_seen", "true");
      setIsOpen(false);

      const hour = new Date().getHours();
      const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
      toast({ title: `${greeting}, ${data.user?.firstName || data.user?.username}!`, description: "Welcome back to GarageBot" });
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      toast({ title: "Missing email", description: "Please enter your email address", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset email");

      setView("reset-sent");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleDismiss}
          data-testid="modal-welcome-gate"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#0f1629] to-[#0a0f1e] border border-primary/30 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-6">
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors z-10"
                data-testid="button-close-welcome"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <img
                  src={gbEmblem}
                  alt="GarageBot"
                  className="w-16 h-16 mx-auto mb-3 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                />
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-mono mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  RIGHT PART. FIRST TIME. EVERY ENGINE.
                </div>
                {view === "signup" && (
                  <>
                    <h2 className="text-2xl font-tech font-bold uppercase mb-1">
                      Get Your Free <span className="text-primary">Garage</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Search 68+ retailers, save vehicles, get AI recommendations
                    </p>
                  </>
                )}
                {view === "signup-terms" && (
                  <>
                    <h2 className="text-2xl font-tech font-bold uppercase mb-1">
                      Review & <span className="text-primary">Accept</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Please read and accept before creating your account
                    </p>
                  </>
                )}
                {view === "login" && (
                  <>
                    <h2 className="text-2xl font-tech font-bold uppercase mb-1">
                      Welcome <span className="text-primary">Back</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Log in to access your Garage
                    </p>
                  </>
                )}
                {view === "forgot" && (
                  <>
                    <h2 className="text-2xl font-tech font-bold uppercase mb-1">
                      Reset <span className="text-primary">Password</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      We'll send you an email with a reset link
                    </p>
                  </>
                )}
                {view === "reset-sent" && (
                  <>
                    <h2 className="text-2xl font-tech font-bold uppercase mb-1">
                      Check Your <span className="text-primary">Email</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      If an account exists, a reset link has been sent
                    </p>
                  </>
                )}
              </div>

              {view === "signup" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-mono flex items-center gap-1.5 mb-1.5">
                      <User className="w-3 h-3" /> First Name
                    </Label>
                    <Input
                      placeholder="Jason"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm(f => ({ ...f, firstName: e.target.value }))}
                      className="bg-white/5 border-white/10 focus:border-primary/50"
                      data-testid="input-signup-firstname"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-mono flex items-center gap-1.5 mb-1.5">
                      <Mail className="w-3 h-3" /> Email
                    </Label>
                    <Input
                      type="email"
                      placeholder="jason@example.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm(f => ({ ...f, email: e.target.value }))}
                      className="bg-white/5 border-white/10 focus:border-primary/50"
                      data-testid="input-signup-email"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-mono flex items-center gap-1.5 mb-1.5">
                      <User className="w-3 h-3" /> Choose Username
                    </Label>
                    <Input
                      placeholder="gearhead_jason"
                      value={signupForm.username}
                      onChange={(e) => setSignupForm(f => ({ ...f, username: e.target.value }))}
                      className="bg-white/5 border-white/10 focus:border-primary/50"
                      data-testid="input-signup-username"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-mono flex items-center gap-1.5 mb-1.5">
                      <Lock className="w-3 h-3" /> Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a secure password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(f => ({ ...f, password: e.target.value }))}
                        className="bg-white/5 border-white/10 focus:border-primary/50 pr-10"
                        data-testid="input-signup-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signupForm.password.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className={`flex items-center gap-1.5 text-[11px] ${passwordChecks.length ? "text-green-400" : "text-muted-foreground"}`}>
                          {passwordChecks.length ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          8+ characters
                        </div>
                        <div className={`flex items-center gap-1.5 text-[11px] ${passwordChecks.uppercase ? "text-green-400" : "text-muted-foreground"}`}>
                          {passwordChecks.uppercase ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          One uppercase letter
                        </div>
                        <div className={`flex items-center gap-1.5 text-[11px] ${passwordChecks.lowercase ? "text-green-400" : "text-muted-foreground"}`}>
                          {passwordChecks.lowercase ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          One lowercase letter
                        </div>
                        <div className={`flex items-center gap-1.5 text-[11px] ${passwordChecks.number ? "text-green-400" : "text-muted-foreground"}`}>
                          {passwordChecks.number ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          One number
                        </div>
                        <div className={`flex items-center gap-1.5 text-[11px] ${passwordChecks.special ? "text-green-400" : "text-muted-foreground"}`}>
                          {passwordChecks.special ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          One special character (!@#$%...)
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                    <Checkbox
                      id="signup-persist"
                      checked={signupForm.stayLoggedIn}
                      onCheckedChange={(checked) => setSignupForm(f => ({ ...f, stayLoggedIn: !!checked }))}
                      data-testid="checkbox-signup-persist"
                    />
                    <div>
                      <label htmlFor="signup-persist" className="text-xs cursor-pointer">Stay logged in for 30 days</label>
                      {signupForm.stayLoggedIn && (
                        <p className="text-[10px] text-yellow-400/80 mt-1">
                          Anyone with access to this device could access your account while you're logged in.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[11px] font-mono text-primary uppercase">DarkWave Ecosystem</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Your password works across all DarkWave Trust Layer apps — one password for GarageBot, ORBIT, and more.
                    </p>
                  </div>

                  <Button
                    className="w-full h-12 font-tech uppercase bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    onClick={handleGoToTerms}
                    disabled={isLoading}
                    data-testid="button-signup-continue"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Continue — Review Terms
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      onClick={() => setView("login")}
                      className="text-primary hover:underline font-medium"
                      data-testid="link-switch-to-login"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              )}

              {view === "signup-terms" && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowingTerms(true)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono uppercase transition-all ${showingTerms ? "bg-primary/20 text-primary border border-primary/40" : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"}`}
                      data-testid="tab-terms"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        Terms of Service
                        {termsScrolled && <CheckCircle className="w-3 h-3 text-green-400" />}
                      </div>
                    </button>
                    <button
                      onClick={() => setShowingTerms(false)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono uppercase transition-all ${!showingTerms ? "bg-primary/20 text-primary border border-primary/40" : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"}`}
                      data-testid="tab-privacy"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Shield className="w-3 h-3" />
                        Privacy Policy
                        {privacyScrolled && <CheckCircle className="w-3 h-3 text-green-400" />}
                      </div>
                    </button>
                  </div>

                  {showingTerms ? (
                    <div className="relative">
                      <div
                        ref={termsRef}
                        onScroll={() => handleScroll(termsRef, setTermsScrolled)}
                        className="h-56 overflow-y-auto rounded-lg bg-black/40 border border-white/10 p-4 text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono scrollbar-thin"
                        data-testid="scroll-terms"
                      >
                        {TERMS_TEXT}
                      </div>
                      {!termsScrolled && (
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg flex items-end justify-center pb-2 pointer-events-none">
                          <div className="flex items-center gap-1 text-[10px] text-primary animate-bounce pointer-events-none">
                            <ChevronDown className="w-3 h-3" />
                            Scroll to read all
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <div
                        ref={privacyRef}
                        onScroll={() => handleScroll(privacyRef, setPrivacyScrolled)}
                        className="h-56 overflow-y-auto rounded-lg bg-black/40 border border-white/10 p-4 text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono scrollbar-thin"
                        data-testid="scroll-privacy"
                      >
                        {PRIVACY_TEXT}
                      </div>
                      {!privacyScrolled && (
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg flex items-end justify-center pb-2 pointer-events-none">
                          <div className="flex items-center gap-1 text-[10px] text-primary animate-bounce pointer-events-none">
                            <ChevronDown className="w-3 h-3" />
                            Scroll to read all
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className={`flex items-start gap-2 p-3 rounded-lg border transition-all ${termsScrolled ? "bg-white/5 border-white/10" : "bg-white/[0.02] border-white/5 opacity-50"}`}>
                      <Checkbox
                        id="accept-terms"
                        checked={termsAccepted}
                        disabled={!termsScrolled}
                        onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                        data-testid="checkbox-accept-terms"
                      />
                      <label htmlFor="accept-terms" className={`text-xs cursor-pointer ${!termsScrolled ? "cursor-not-allowed" : ""}`}>
                        I have read and agree to the <span className="text-primary">Terms of Service</span>
                        {!termsScrolled && <span className="text-[10px] text-muted-foreground block mt-0.5">(scroll through to enable)</span>}
                      </label>
                    </div>

                    <div className={`flex items-start gap-2 p-3 rounded-lg border transition-all ${privacyScrolled ? "bg-white/5 border-white/10" : "bg-white/[0.02] border-white/5 opacity-50"}`}>
                      <Checkbox
                        id="accept-privacy"
                        checked={privacyAccepted}
                        disabled={!privacyScrolled}
                        onCheckedChange={(checked) => setPrivacyAccepted(!!checked)}
                        data-testid="checkbox-accept-privacy"
                      />
                      <label htmlFor="accept-privacy" className={`text-xs cursor-pointer ${!privacyScrolled ? "cursor-not-allowed" : ""}`}>
                        I have read and agree to the <span className="text-primary">Privacy Policy</span>
                        {!privacyScrolled && <span className="text-[10px] text-muted-foreground block mt-0.5">(scroll through to enable)</span>}
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 font-tech uppercase border-white/20"
                      onClick={() => setView("signup")}
                      data-testid="button-back-to-signup"
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 h-12 font-tech uppercase bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={handleSignup}
                      disabled={isLoading || !termsAccepted || !privacyAccepted}
                      data-testid="button-signup-submit"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Car className="w-5 h-5 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {view === "login" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-mono flex items-center gap-1.5 mb-1.5">
                      <User className="w-3 h-3" /> Username or Email
                    </Label>
                    <Input
                      placeholder="Your username or email"
                      value={loginForm.identifier}
                      onChange={(e) => setLoginForm(f => ({ ...f, identifier: e.target.value }))}
                      className="bg-white/5 border-white/10 focus:border-primary/50"
                      data-testid="input-login-identifier"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-mono flex items-center gap-1.5 mb-1.5">
                      <Lock className="w-3 h-3" /> Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(f => ({ ...f, password: e.target.value }))}
                        className="bg-white/5 border-white/10 focus:border-primary/50 pr-10"
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        data-testid="input-login-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="login-persist"
                        checked={loginForm.stayLoggedIn}
                        onCheckedChange={(checked) => setLoginForm(f => ({ ...f, stayLoggedIn: !!checked }))}
                        data-testid="checkbox-login-persist"
                      />
                      <label htmlFor="login-persist" className="text-xs cursor-pointer">Stay logged in</label>
                    </div>
                    <button
                      onClick={() => setView("forgot")}
                      className="text-xs text-primary hover:underline"
                      data-testid="link-forgot-password"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {loginForm.stayLoggedIn && (
                    <p className="text-[10px] text-yellow-400/80 px-1">
                      Anyone with access to this device could access your account while you're logged in (up to 30 days).
                    </p>
                  )}

                  <Button
                    className="w-full h-12 font-tech uppercase bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    onClick={handleLogin}
                    disabled={isLoading}
                    data-testid="button-login-submit"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-5 h-5 mr-2" />
                        Log In
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setView("signup")}
                      className="text-primary hover:underline font-medium"
                      data-testid="link-switch-to-signup"
                    >
                      Sign up free
                    </button>
                  </p>
                </div>
              )}

              {view === "forgot" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-mono flex items-center gap-1.5 mb-1.5">
                      <Mail className="w-3 h-3" /> Email Address
                    </Label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="bg-white/5 border-white/10 focus:border-primary/50"
                      onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                      data-testid="input-forgot-email"
                    />
                  </div>

                  <Button
                    className="w-full h-12 font-tech uppercase bg-primary text-black hover:bg-primary/90"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    data-testid="button-forgot-submit"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Remember your password?{" "}
                    <button
                      onClick={() => setView("login")}
                      className="text-primary hover:underline font-medium"
                      data-testid="link-back-to-login"
                    >
                      Back to login
                    </button>
                  </p>
                </div>
              )}

              {view === "reset-sent" && (
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Check your inbox for a password reset link. It expires in 1 hour.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full font-tech uppercase border-white/20"
                    onClick={() => setView("login")}
                    data-testid="button-back-to-login"
                  >
                    Back to Login
                  </Button>
                </div>
              )}

              {(view === "signup" || view === "login") && (
                <button
                  onClick={handleDismiss}
                  className="w-full text-center text-[11px] text-muted-foreground hover:text-white transition-colors py-3 mt-2"
                  data-testid="button-browse-first"
                >
                  Just browsing? Skip for now
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
