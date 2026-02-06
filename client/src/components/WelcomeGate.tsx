import { useState, useEffect } from "react";
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
  Car, Mail, User, Lock, ArrowRight, KeyRound
} from "lucide-react";
import gbEmblem from "@assets/generated_images/gb_emblem_no_bg.png";

type View = "signup" | "login" | "forgot" | "reset-sent";

interface PasswordCheck {
  length: boolean;
  uppercase: boolean;
  special: boolean;
}

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

  const passwordChecks: PasswordCheck = {
    length: signupForm.password.length >= 8,
    uppercase: /[A-Z]/.test(signupForm.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupForm.password),
  };
  const passwordValid = passwordChecks.length && passwordChecks.uppercase && passwordChecks.special;

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      setIsOpen(false);
      return;
    }
    const hasDismissed = sessionStorage.getItem("garagebot_welcome_dismissed");
    if (!hasDismissed) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading]);

  const handleDismiss = () => {
    sessionStorage.setItem("garagebot_welcome_dismissed", "true");
    setIsOpen(false);
  };

  const handleSignup = async () => {
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
                      Search 50+ retailers, save vehicles, get AI recommendations
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

                  <Button
                    className="w-full h-12 font-tech uppercase bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    onClick={handleSignup}
                    disabled={isLoading}
                    data-testid="button-signup-submit"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Car className="w-5 h-5 mr-2" />
                        Get My Free Garage
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
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
