import { useState } from "react";
import { useLocation } from "wouter";
import Nav from "@/components/Nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  User, Lock, Phone, Mail, MapPin, Shield, Eye, EyeOff, 
  AlertTriangle, CheckCircle, Copy, Download, Loader2, KeyRound
} from "lucide-react";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showQuickPin, setShowQuickPin] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);

  const [signupForm, setSignupForm] = useState({
    username: "",
    mainPin: "",
    quickPin: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    enablePersistence: false,
    agreeTerms: false
  });

  const [loginForm, setLoginForm] = useState({
    username: "",
    mainPin: "",
    enablePersistence: false
  });

  const [recoveryForm, setRecoveryForm] = useState({
    phone: "",
    code: "",
    newPin: "",
    step: "phone" as "phone" | "code" | "backup"
  });

  const [backupForm, setBackupForm] = useState({
    username: "",
    code: "",
    newPin: ""
  });

  const handleSignup = async () => {
    if (!signupForm.agreeTerms) {
      toast({ title: "Error", description: "You must agree to the terms", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }
      
      setRecoveryCodes(data.recoveryCodes);
      setShowRecoveryDialog(true);
      
      toast({ title: "Account Created!", description: "Please save your recovery codes" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      
      toast({ title: "Welcome back!", description: `Logged in as ${data.user.username}` });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoveryRequest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/send-recovery-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: recoveryForm.phone })
      });
      
      if (res.ok) {
        setRecoveryForm(prev => ({ ...prev, step: "code" }));
        toast({ title: "Code Sent", description: "Check your phone for the recovery code" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send recovery code", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoveryVerify = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: recoveryForm.code, newPin: recoveryForm.newPin })
      });
      
      if (res.ok) {
        toast({ title: "PIN Reset", description: "You can now login with your new PIN" });
        setActiveTab("login");
        setRecoveryForm({ phone: "", code: "", newPin: "", step: "phone" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to verify recovery code", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupCodeVerify = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-backup-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupForm)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify backup code");
      }
      
      toast({ 
        title: "PIN Reset", 
        description: `You can now login with your new PIN. ${data.remainingCodes} recovery codes remaining.` 
      });
      setActiveTab("login");
      setBackupForm({ username: "", code: "", newPin: "" });
      setRecoveryForm({ ...recoveryForm, step: "phone" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    toast({ title: "Copied!", description: "Recovery codes copied to clipboard" });
  };

  const downloadRecoveryCodes = () => {
    const content = `GarageBot Recovery Codes\n${"=".repeat(30)}\n\n${recoveryCodes.join("\n")}\n\nKeep these codes safe. Each code can only be used once.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "garagebot-recovery-codes.txt";
    a.click();
  };

  const finishSignup = () => {
    setShowRecoveryDialog(false);
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-tech font-bold uppercase text-primary">GarageBot</h1>
              <p className="text-muted-foreground text-sm font-mono mt-1">SECURE ACCESS</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="login" className="font-tech uppercase text-xs" data-testid="tab-login">Login</TabsTrigger>
                <TabsTrigger value="signup" className="font-tech uppercase text-xs" data-testid="tab-signup">Sign Up</TabsTrigger>
                <TabsTrigger value="recovery" className="font-tech uppercase text-xs" data-testid="tab-recovery">Recovery</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card className="p-6 glass-ultra border-primary/20">
                  <div className="space-y-4">
                    {/* Trust Layer SSO Login */}
                    <div className="mb-4">
                      <Button
                        type="button"
                        onClick={async () => {
                          setIsLoading(true);
                          try {
                            const res = await fetch("/api/auth/sso/login");
                            const data = await res.json();
                            if (data.loginUrl) {
                              window.location.href = data.loginUrl;
                            }
                          } catch (err) {
                            toast({ title: "Error", description: "Could not connect to Trust Layer", variant: "destructive" });
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-tech uppercase"
                        data-testid="button-sso-login"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Shield className="w-4 h-4 mr-2" />
                        )}
                        Sign in with Trust Layer
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground mt-2">
                        One account for all DarkWave ecosystem apps
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with PIN</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Username</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          value={loginForm.username}
                          onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                          className="pl-10"
                          placeholder="Enter username"
                          data-testid="input-login-username"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Secure PIN</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type={showPin ? "text" : "password"}
                          value={loginForm.mainPin}
                          onChange={(e) => setLoginForm({ ...loginForm, mainPin: e.target.value })}
                          className="pl-10 pr-10 font-mono"
                          placeholder="Enter your secure PIN"
                          data-testid="input-login-pin"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          id="login-persistence"
                          checked={loginForm.enablePersistence}
                          onCheckedChange={(checked) => setLoginForm({ ...loginForm, enablePersistence: checked as boolean })}
                          data-testid="checkbox-login-persistence"
                        />
                        <div className="flex-1">
                          <Label htmlFor="login-persistence" className="text-sm font-medium cursor-pointer">
                            Stay logged in for 30 days
                          </Label>
                          {loginForm.enablePersistence && (
                            <div className="flex items-start gap-2 mt-2 text-xs text-amber-400">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>WARNING: Anyone who accesses this browser/device in the next 30 days will be able to access your account. Only enable on trusted devices.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full font-tech uppercase glow-primary"
                      onClick={handleLogin}
                      disabled={isLoading || !loginForm.username || loginForm.mainPin.length < 8}
                      data-testid="button-login"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                      Login
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="signup">
                <Card className="p-6 glass-ultra border-primary/20">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Name *</Label>
                      <Input 
                        value={signupForm.firstName}
                        onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                        className="mt-1"
                        placeholder="Your full name"
                        data-testid="input-signup-firstname"
                      />
                    </div>

                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Email *</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type="email"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          className="pl-10"
                          placeholder="your@email.com"
                          data-testid="input-signup-email"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Secure PIN *</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type={showPin ? "text" : "password"}
                          value={signupForm.mainPin}
                          onChange={(e) => setSignupForm({ ...signupForm, mainPin: e.target.value })}
                          className="pl-10 pr-10 font-mono"
                          placeholder="Create secure PIN"
                          data-testid="input-signup-mainpin"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <p className={signupForm.mainPin.length >= 8 ? "text-green-500" : ""}>• Minimum 8 characters {signupForm.mainPin.length >= 8 && "✓"}</p>
                        <p className={/[A-Z]/.test(signupForm.mainPin) ? "text-green-500" : ""}>• At least 1 uppercase letter {/[A-Z]/.test(signupForm.mainPin) && "✓"}</p>
                        <p className={/[a-z]/.test(signupForm.mainPin) ? "text-green-500" : ""}>• At least 1 lowercase letter {/[a-z]/.test(signupForm.mainPin) && "✓"}</p>
                        <p className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupForm.mainPin) ? "text-green-500" : ""}>• At least 1 special character {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupForm.mainPin) && "✓"}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Phone (Optional)</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type="tel"
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                          className="pl-10"
                          placeholder="(555) 123-4567"
                          data-testid="input-signup-phone"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Address</Label>
                      <Input 
                        value={signupForm.address}
                        onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })}
                        className="mt-1"
                        placeholder="Street address"
                        data-testid="input-signup-address"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs uppercase text-muted-foreground">City</Label>
                        <Input 
                          value={signupForm.city}
                          onChange={(e) => setSignupForm({ ...signupForm, city: e.target.value })}
                          className="mt-1"
                          data-testid="input-signup-city"
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase text-muted-foreground">State</Label>
                        <Input 
                          value={signupForm.state}
                          onChange={(e) => setSignupForm({ ...signupForm, state: e.target.value.toUpperCase().slice(0, 2) })}
                          className="mt-1"
                          maxLength={2}
                          data-testid="input-signup-state"
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase text-muted-foreground">ZIP</Label>
                        <Input 
                          value={signupForm.zipCode}
                          onChange={(e) => setSignupForm({ ...signupForm, zipCode: e.target.value })}
                          className="mt-1"
                          data-testid="input-signup-zip"
                        />
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          id="signup-persistence"
                          checked={signupForm.enablePersistence}
                          onCheckedChange={(checked) => setSignupForm({ ...signupForm, enablePersistence: checked as boolean })}
                          data-testid="checkbox-signup-persistence"
                        />
                        <div className="flex-1">
                          <Label htmlFor="signup-persistence" className="text-sm font-medium cursor-pointer">
                            Stay logged in for 30 days
                          </Label>
                          {signupForm.enablePersistence && (
                            <div className="flex items-start gap-2 mt-2 text-xs text-amber-400">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>WARNING: Anyone who accesses this browser/device in the next 30 days will be able to access your account. Only enable on trusted devices.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox 
                        id="agree-terms"
                        checked={signupForm.agreeTerms}
                        onCheckedChange={(checked) => setSignupForm({ ...signupForm, agreeTerms: checked as boolean })}
                        data-testid="checkbox-agree-terms"
                      />
                      <Label htmlFor="agree-terms" className="text-sm cursor-pointer">
                        I agree to the <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> and Terms of Service
                      </Label>
                    </div>

                    <Button 
                      className="w-full font-tech uppercase glow-primary"
                      onClick={handleSignup}
                      disabled={isLoading || !signupForm.firstName || !signupForm.email || signupForm.mainPin.length < 8 || !/[A-Z]/.test(signupForm.mainPin) || !/[a-z]/.test(signupForm.mainPin) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupForm.mainPin) || !signupForm.agreeTerms}
                      data-testid="button-signup"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                      Create Account
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="recovery">
                <Card className="p-6 glass-ultra border-primary/20">
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="font-tech uppercase text-lg">Account Recovery</h3>
                      <p className="text-sm text-muted-foreground">Reset your PIN via SMS or backup codes</p>
                    </div>

                    {recoveryForm.step === "phone" && (
                      <>
                        <div>
                          <Label className="text-xs uppercase text-muted-foreground">Phone Number</Label>
                          <div className="relative mt-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              type="tel"
                              value={recoveryForm.phone}
                              onChange={(e) => setRecoveryForm({ ...recoveryForm, phone: e.target.value })}
                              className="pl-10"
                              placeholder="(555) 123-4567"
                              data-testid="input-recovery-phone"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Enter the phone linked to your account</p>
                        </div>
                        <Button 
                          className="w-full font-tech uppercase"
                          onClick={handleRecoveryRequest}
                          disabled={isLoading || !recoveryForm.phone}
                          data-testid="button-send-recovery"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Send Recovery Code
                        </Button>
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/50" />
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="bg-card px-2 text-muted-foreground">OR</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline"
                          className="w-full font-tech uppercase border-secondary/50 text-secondary hover:bg-secondary/10"
                          onClick={() => setRecoveryForm({ ...recoveryForm, step: "backup" })}
                          data-testid="button-use-backup-code"
                        >
                          <KeyRound className="w-4 h-4 mr-2" />
                          Use Backup Recovery Code
                        </Button>
                      </>
                    )}

                    {recoveryForm.step === "code" && (
                      <>
                        <div>
                          <Label className="text-xs uppercase text-muted-foreground">SMS Recovery Code</Label>
                          <Input 
                            value={recoveryForm.code}
                            onChange={(e) => setRecoveryForm({ ...recoveryForm, code: e.target.value })}
                            className="mt-1 font-mono text-center tracking-widest text-lg"
                            placeholder="000000"
                            maxLength={6}
                            data-testid="input-recovery-code"
                          />
                        </div>
                        <div>
                          <Label className="text-xs uppercase text-muted-foreground">New Secure PIN</Label>
                          <Input 
                            type="password"
                            value={recoveryForm.newPin}
                            onChange={(e) => setRecoveryForm({ ...recoveryForm, newPin: e.target.value })}
                            className="mt-1 font-mono"
                            placeholder="Create new PIN"
                            data-testid="input-recovery-newpin"
                          />
                          <p className="text-xs text-muted-foreground mt-1">8+ chars, upper, lower, special</p>
                        </div>
                        <Button 
                          className="w-full font-tech uppercase"
                          onClick={handleRecoveryVerify}
                          disabled={isLoading || recoveryForm.code.length !== 6 || recoveryForm.newPin.length < 8}
                          data-testid="button-verify-recovery"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Reset PIN
                        </Button>
                        <Button 
                          variant="ghost"
                          className="w-full"
                          onClick={() => setRecoveryForm({ ...recoveryForm, step: "phone" })}
                        >
                          Back
                        </Button>
                      </>
                    )}

                    {recoveryForm.step === "backup" && (
                      <>
                        <div>
                          <Label className="text-xs uppercase text-muted-foreground">Username</Label>
                          <div className="relative mt-1">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              value={backupForm.username}
                              onChange={(e) => setBackupForm({ ...backupForm, username: e.target.value })}
                              className="pl-10"
                              placeholder="Enter your username"
                              data-testid="input-backup-username"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs uppercase text-muted-foreground">Backup Recovery Code</Label>
                          <Input 
                            value={backupForm.code}
                            onChange={(e) => setBackupForm({ ...backupForm, code: e.target.value.toUpperCase() })}
                            className="mt-1 font-mono text-center tracking-widest text-lg"
                            placeholder="XXXX-XXXX"
                            data-testid="input-backup-code"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Enter one of your saved recovery codes</p>
                        </div>
                        <div>
                          <Label className="text-xs uppercase text-muted-foreground">New Secure PIN</Label>
                          <Input 
                            type="password"
                            value={backupForm.newPin}
                            onChange={(e) => setBackupForm({ ...backupForm, newPin: e.target.value })}
                            className="mt-1 font-mono"
                            placeholder="Create new PIN"
                            data-testid="input-backup-newpin"
                          />
                          <p className="text-xs text-muted-foreground mt-1">8+ chars, upper, lower, special</p>
                        </div>
                        <Button 
                          className="w-full font-tech uppercase"
                          onClick={handleBackupCodeVerify}
                          disabled={isLoading || !backupForm.username || backupForm.code.length < 9 || backupForm.newPin.length < 8}
                          data-testid="button-verify-backup"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Reset PIN with Backup Code
                        </Button>
                        <Button 
                          variant="ghost"
                          className="w-full"
                          onClick={() => setRecoveryForm({ ...recoveryForm, step: "phone" })}
                        >
                          Back to SMS Recovery
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-tech uppercase flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Save Your Recovery Codes
            </DialogTitle>
            <DialogDescription>
              These codes can be used to recover your account if you forget your PIN. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="glass-card rounded-lg p-4 font-mono text-sm">
              <div className="grid grid-cols-2 gap-2">
                {recoveryCodes.map((code, i) => (
                  <div key={i} className="bg-background/50 px-3 py-2 rounded border">
                    {code}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={copyRecoveryCodes}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
              <Button variant="outline" className="flex-1" onClick={downloadRecoveryCodes}>
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-200">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Store these codes in a safe place. You will not be able to see them again.
            </div>

            {/* Trust Layer Membership Confirmation */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-tech uppercase text-sm font-bold">
                <Shield className="w-5 h-5" />
                Trust Layer Membership Included
              </div>
              <p className="text-xs text-muted-foreground">
                Your GarageBot account includes free access to the entire DarkWave ecosystem. Use your credentials at:
              </p>
              <div className="grid gap-2 text-xs">
                <a href="https://dwtl.io" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 bg-background/50 rounded px-3 py-2 hover:bg-background/80 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span className="font-mono text-cyan-300">dwtl.io</span>
                  <span className="text-muted-foreground ml-auto">Trust Layer Portal</span>
                </a>
                <a href="https://dwsc.io" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-background/50 rounded px-3 py-2 hover:bg-background/80 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span className="font-mono text-blue-300">dwsc.io</span>
                  <span className="text-muted-foreground ml-auto">DarkWave Studio</span>
                </a>
                <a href="https://garagebot.io" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-background/50 rounded px-3 py-2 hover:bg-background/80 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  <span className="font-mono text-green-300">garagebot.io</span>
                  <span className="text-muted-foreground ml-auto">GarageBot (You're here!)</span>
                </a>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                A welcome email with these links has been sent to your inbox
              </p>
            </div>

            <Button className="w-full font-tech uppercase" onClick={finishSignup}>
              I've Saved My Codes - Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
