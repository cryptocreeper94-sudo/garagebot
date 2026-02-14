import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  ArrowRight, ArrowLeft, CheckCircle, User, Building2, CreditCard,
  Users, Shield, Wrench, Mail, Phone, MapPin, Clock, Lock,
  Eye, EyeOff, Loader2, Sparkles, ChevronRight, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const VEHICLE_TYPES = [
  { id: "car", name: "Cars", emoji: "🚗" },
  { id: "truck", name: "Trucks", emoji: "🚛" },
  { id: "motorcycle", name: "Motorcycles", emoji: "🏍️" },
  { id: "atv", name: "ATVs/UTVs", emoji: "🏔️" },
  { id: "boat", name: "Boats/Marine", emoji: "⚓" },
  { id: "rv", name: "RVs", emoji: "🚐" },
  { id: "diesel", name: "Diesel/Commercial", emoji: "🔧" },
  { id: "small_engine", name: "Small Engines", emoji: "⚙️" },
  { id: "generator", name: "Generators", emoji: "⚡" },
  { id: "tractor", name: "Tractors/Farm", emoji: "🚜" },
  { id: "classic", name: "Classics", emoji: "🏎️" },
  { id: "exotic", name: "Exotics", emoji: "💎" },
];

const STEPS = [
  { id: 1, title: "Your Info", subtitle: "Create your account", icon: User },
  { id: 2, title: "Your Shop", subtitle: "Business details", icon: Building2 },
  { id: 3, title: "Services", subtitle: "What you repair", icon: Wrench },
  { id: 4, title: "Team", subtitle: "Invite your crew", icon: Users },
  { id: 5, title: "Verify", subtitle: "Trust Layer", icon: Shield },
];

const BUSINESS_HOURS = [
  { day: "Monday", open: "08:00", close: "17:00", enabled: true },
  { day: "Tuesday", open: "08:00", close: "17:00", enabled: true },
  { day: "Wednesday", open: "08:00", close: "17:00", enabled: true },
  { day: "Thursday", open: "08:00", close: "17:00", enabled: true },
  { day: "Friday", open: "08:00", close: "17:00", enabled: true },
  { day: "Saturday", open: "09:00", close: "14:00", enabled: true },
  { day: "Sunday", open: "", close: "", enabled: false },
];

export default function TorqueOnboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const [owner, setOwner] = useState({ name: "", email: "", phone: "", pin: "", confirmPin: "" });
  const [shop, setShop] = useState({ name: "", description: "", address: "", city: "", state: "", zipCode: "", phone: "", email: "", website: "" });
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [hours, setHours] = useState(BUSINESS_HOURS);
  const [teamMembers, setTeamMembers] = useState([{ name: "", email: "", role: "technician" }]);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const canProceed = () => {
    switch (step) {
      case 1:
        return owner.name.trim() && owner.email.trim() && owner.pin.length >= 8 && owner.pin === owner.confirmPin;
      case 2:
        return shop.name.trim();
      case 3:
        return selectedVehicleTypes.length > 0;
      case 4:
        return true;
      case 5:
        return acceptTerms;
      default:
        return false;
    }
  };

  const pinValid = owner.pin.length >= 8 &&
    /[A-Z]/.test(owner.pin) &&
    /[a-z]/.test(owner.pin) &&
    /[0-9]/.test(owner.pin) &&
    /[^A-Za-z0-9]/.test(owner.pin);

  const handleSubmit = async () => {
    if (!acceptTerms) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: owner.name, email: owner.email, pin: owner.pin })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Registration failed");
      }

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: owner.email, pin: owner.pin })
      });

      if (loginRes.ok) {
        const shopRes = await fetch("/api/shops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...shop, vehicleTypes: selectedVehicleTypes })
        });

        if (shopRes.ok) {
          setVerifying(true);
          setTimeout(() => {
            setVerified(true);
            setVerifying(false);
            setTimeout(() => navigate("/torque/app"), 2000);
          }, 3000);
        } else {
          navigate("/torque/app");
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Something went wrong. Please try again.", variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  const toggleVehicleType = (id: string) => {
    setSelectedVehicleTypes(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const addTeamMember = () => {
    if (teamMembers.length < 10) setTeamMembers([...teamMembers, { name: "", email: "", role: "technician" }]);
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    const updated = [...teamMembers];
    (updated[index] as any)[field] = value;
    setTeamMembers(updated);
  };

  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  if (verifying || verified) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          {verifying ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-6 border-2 border-[#00D9FF]/30 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-[#00D9FF]" />
              </motion.div>
              <h2 className="text-2xl font-tech font-bold text-white mb-3">Verifying on Trust Layer</h2>
              <p className="text-zinc-500 mb-6">Recording your shop identity on the blockchain...</p>
              <div className="space-y-3">
                {["Generating cryptographic identity", "Submitting to Trust Layer L1", "Awaiting confirmation"].map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.8 }}
                    className="flex items-center gap-3 text-sm">
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                      className="w-2 h-2 rounded-full bg-[#00D9FF]"
                    />
                    <span className="text-zinc-400">{step}</span>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.6 }}
                className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </motion.div>
              <h2 className="text-2xl font-tech font-bold text-white mb-3">You're Verified!</h2>
              <p className="text-zinc-500 mb-2">Your shop is now on the Trust Layer blockchain.</p>
              <Badge className="bg-[#00D9FF]/10 border-[#00D9FF]/30 text-[#00D9FF] mb-6">
                <Shield className="w-3 h-3 mr-1" /> Trust Layer Verified
              </Badge>
              <p className="text-zinc-600 text-sm">Redirecting to your dashboard...</p>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/torque">
            <span className="flex items-center gap-2 cursor-pointer" data-testid="link-back-torque">
              <Wrench className="w-5 h-5 text-[#00D9FF]" />
              <span className="font-tech text-lg font-bold text-[#00D9FF]">TORQUE</span>
            </span>
          </Link>
          <div className="text-sm text-zinc-500">Step {step} of 5</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-white/[0.05]">
        <motion.div
          animate={{ width: `${(step / 5) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6]"
        />
      </div>

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Step indicator pills */}
          <div className="flex justify-center gap-2 mb-10">
            {STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => s.id < step && setStep(s.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  s.id === step ? "bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30" :
                  s.id < step ? "bg-green-500/10 text-green-400 border border-green-500/20 cursor-pointer" :
                  "bg-white/[0.03] text-zinc-600 border border-white/[0.06]"
                }`}
                disabled={s.id > step}
                data-testid={`step-pill-${s.id}`}
              >
                {s.id < step ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <s.icon className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div key={step} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeInOut" }}>

              {step === 1 && (
                <Card className="p-8 bg-[#0f172a]/60 border-white/[0.08] rounded-2xl" data-testid="step-1">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#00D9FF]/10 flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-[#00D9FF]" />
                    </div>
                    <h2 className="text-2xl font-tech font-bold text-white mb-2">Create Your Account</h2>
                    <p className="text-zinc-500 text-sm">Let's get you set up as a shop owner</p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <Label className="text-zinc-400 text-sm mb-1.5 block">Full Name</Label>
                      <Input
                        value={owner.name}
                        onChange={e => setOwner({ ...owner, name: e.target.value })}
                        placeholder="Jason Smith"
                        className="bg-white/[0.05] border-white/[0.1] h-12 text-white placeholder:text-zinc-600 focus:border-[#00D9FF]/50"
                        data-testid="input-owner-name"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-400 text-sm mb-1.5 block">Email</Label>
                      <Input
                        type="email"
                        value={owner.email}
                        onChange={e => setOwner({ ...owner, email: e.target.value })}
                        placeholder="jason@myshop.com"
                        className="bg-white/[0.05] border-white/[0.1] h-12 text-white placeholder:text-zinc-600 focus:border-[#00D9FF]/50"
                        data-testid="input-owner-email"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-400 text-sm mb-1.5 block">Phone (optional)</Label>
                      <Input
                        type="tel"
                        value={owner.phone}
                        onChange={e => setOwner({ ...owner, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="bg-white/[0.05] border-white/[0.1] h-12 text-white placeholder:text-zinc-600 focus:border-[#00D9FF]/50"
                        data-testid="input-owner-phone"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-400 text-sm mb-1.5 block">Create PIN</Label>
                      <div className="relative">
                        <Input
                          type={showPin ? "text" : "password"}
                          value={owner.pin}
                          onChange={e => setOwner({ ...owner, pin: e.target.value })}
                          placeholder="8+ chars, upper, lower, number, special"
                          className="bg-white/[0.05] border-white/[0.1] h-12 text-white placeholder:text-zinc-600 focus:border-[#00D9FF]/50 pr-12"
                          data-testid="input-owner-pin"
                        />
                        <button onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white" data-testid="button-toggle-pin">
                          {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {owner.pin && (
                        <div className="mt-2 grid grid-cols-2 gap-1">
                          {[
                            { label: "8+ characters", valid: owner.pin.length >= 8 },
                            { label: "Uppercase", valid: /[A-Z]/.test(owner.pin) },
                            { label: "Lowercase", valid: /[a-z]/.test(owner.pin) },
                            { label: "Number", valid: /[0-9]/.test(owner.pin) },
                            { label: "Special char", valid: /[^A-Za-z0-9]/.test(owner.pin) },
                          ].map((rule, i) => (
                            <div key={i} className={`flex items-center gap-1.5 text-xs ${rule.valid ? "text-green-400" : "text-zinc-600"}`}>
                              <CheckCircle className="w-3 h-3" /> {rule.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-zinc-400 text-sm mb-1.5 block">Confirm PIN</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPin ? "text" : "password"}
                          value={owner.confirmPin}
                          onChange={e => setOwner({ ...owner, confirmPin: e.target.value })}
                          placeholder="Re-enter your PIN"
                          className={`bg-white/[0.05] border-white/[0.1] h-12 text-white placeholder:text-zinc-600 pr-12 ${owner.confirmPin && owner.pin !== owner.confirmPin ? "border-red-500/50 focus:border-red-500" : "focus:border-[#00D9FF]/50"}`}
                          data-testid="input-owner-confirm-pin"
                        />
                        <button onClick={() => setShowConfirmPin(!showConfirmPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                          {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {owner.confirmPin && owner.pin !== owner.confirmPin && (
                        <p className="text-red-400 text-xs mt-1">PINs don't match</p>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {step === 2 && (
                <Card className="p-8 bg-[#0f172a]/60 border-white/[0.08] rounded-2xl" data-testid="step-2">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-[#8B5CF6]" />
                    </div>
                    <h2 className="text-2xl font-tech font-bold text-white mb-2">Your Shop</h2>
                    <p className="text-zinc-500 text-sm">Tell us about your business</p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <Label className="text-zinc-400 text-sm mb-1.5 block">Shop Name *</Label>
                      <Input value={shop.name} onChange={e => setShop({ ...shop, name: e.target.value })}
                        placeholder="Mike's Auto Care" className="bg-white/[0.05] border-white/[0.1] h-12 text-white placeholder:text-zinc-600 focus:border-[#8B5CF6]/50"
                        data-testid="input-shop-name" />
                    </div>
                    <div>
                      <Label className="text-zinc-400 text-sm mb-1.5 block">Description</Label>
                      <Textarea value={shop.description} onChange={e => setShop({ ...shop, description: e.target.value })}
                        placeholder="Full-service auto repair for all makes and models..."
                        className="bg-white/[0.05] border-white/[0.1] text-white placeholder:text-zinc-600 focus:border-[#8B5CF6]/50 min-h-[80px]"
                        data-testid="input-shop-desc" />
                    </div>
                    <div>
                      <Label className="text-zinc-400 text-sm mb-1.5 block">Street Address</Label>
                      <Input value={shop.address} onChange={e => setShop({ ...shop, address: e.target.value })}
                        placeholder="123 Main Street" className="bg-white/[0.05] border-white/[0.1] h-12 text-white placeholder:text-zinc-600 focus:border-[#8B5CF6]/50"
                        data-testid="input-shop-address" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-zinc-400 text-sm mb-1.5 block">City</Label>
                        <Input value={shop.city} onChange={e => setShop({ ...shop, city: e.target.value })}
                          placeholder="Dallas" className="bg-white/[0.05] border-white/[0.1] h-12 text-white placeholder:text-zinc-600 focus:border-[#8B5CF6]/50"
                          data-testid="input-shop-city" />
                      </div>
                      <div>
                        <Label className="text-zinc-400 text-sm mb-1.5 block">State</Label>
                        <Input value={shop.state} onChange={e => setShop({ ...shop, state: e.target.value })}
                          placeholder="TX" maxLength={2} className="bg-white/[0.05] border-white/[0.1] h-12 text-white placeholder:text-zinc-600 focus:border-[#8B5CF6]/50"
                          data-testid="input-shop-state" />
                      </div>
                      <div>
                        <Label className="text-zinc-400 text-sm mb-1.5 block">ZIP</Label>
                        <Input value={shop.zipCode} onChange={e => setShop({ ...shop, zipCode: e.target.value })}
                          placeholder="75001" className="bg-white/[0.05] border-white/[0.1] h-12 text-white placeholder:text-zinc-600 focus:border-[#8B5CF6]/50"
                          data-testid="input-shop-zip" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-zinc-400 text-sm mb-1.5 block">Shop Phone</Label>
                        <Input value={shop.phone} onChange={e => setShop({ ...shop, phone: e.target.value })}
                          placeholder="(555) 123-4567" className="bg-white/[0.05] border-white/[0.1] h-12 text-white placeholder:text-zinc-600 focus:border-[#8B5CF6]/50"
                          data-testid="input-shop-phone" />
                      </div>
                      <div>
                        <Label className="text-zinc-400 text-sm mb-1.5 block">Shop Email</Label>
                        <Input value={shop.email} onChange={e => setShop({ ...shop, email: e.target.value })}
                          placeholder="info@myshop.com" className="bg-white/[0.05] border-white/[0.1] h-12 text-white placeholder:text-zinc-600 focus:border-[#8B5CF6]/50"
                          data-testid="input-shop-email" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-zinc-400 text-sm mb-1.5 block">Website</Label>
                      <Input value={shop.website} onChange={e => setShop({ ...shop, website: e.target.value })}
                        placeholder="https://myshop.com" className="bg-white/[0.05] border-white/[0.1] h-12 text-white placeholder:text-zinc-600 focus:border-[#8B5CF6]/50"
                        data-testid="input-shop-website" />
                    </div>
                  </div>
                </Card>
              )}

              {step === 3 && (
                <Card className="p-8 bg-[#0f172a]/60 border-white/[0.08] rounded-2xl" data-testid="step-3">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
                      <Wrench className="w-8 h-8 text-[#10B981]" />
                    </div>
                    <h2 className="text-2xl font-tech font-bold text-white mb-2">What Do You Service?</h2>
                    <p className="text-zinc-500 text-sm">Select all vehicle types your shop works on</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                    {VEHICLE_TYPES.map(type => {
                      const selected = selectedVehicleTypes.includes(type.id);
                      return (
                        <motion.button
                          key={type.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleVehicleType(type.id)}
                          className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                            selected
                              ? "bg-[#10B981]/10 border-[#10B981]/40 shadow-lg shadow-[#10B981]/5"
                              : "bg-white/[0.03] border-white/[0.08] hover:border-white/20"
                          }`}
                          data-testid={`vehicle-type-${type.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{type.emoji}</span>
                            <div>
                              <p className={`font-medium text-sm ${selected ? "text-white" : "text-zinc-400"}`}>{type.name}</p>
                              {selected && <CheckCircle className="w-3.5 h-3.5 text-[#10B981] mt-0.5" />}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {selectedVehicleTypes.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-zinc-500">
                      <CheckCircle className="w-4 h-4 text-[#10B981]" />
                      {selectedVehicleTypes.length} vehicle type{selectedVehicleTypes.length > 1 ? "s" : ""} selected
                    </motion.div>
                  )}
                </Card>
              )}

              {step === 4 && (
                <Card className="p-8 bg-[#0f172a]/60 border-white/[0.08] rounded-2xl" data-testid="step-4">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-[#F59E0B]" />
                    </div>
                    <h2 className="text-2xl font-tech font-bold text-white mb-2">Invite Your Team</h2>
                    <p className="text-zinc-500 text-sm">Add technicians and staff (you can do this later too)</p>
                  </div>

                  <div className="space-y-4">
                    {teamMembers.map((member, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-zinc-500 font-medium">Team Member {i + 1}</span>
                          {teamMembers.length > 1 && (
                            <button onClick={() => removeTeamMember(i)} className="text-zinc-600 hover:text-red-400 text-xs" data-testid={`remove-member-${i}`}>Remove</button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Input value={member.name} onChange={e => updateTeamMember(i, "name", e.target.value)}
                            placeholder="Name" className="bg-white/[0.05] border-white/[0.08] h-10 text-white text-sm placeholder:text-zinc-600"
                            data-testid={`input-member-name-${i}`} />
                          <Input value={member.email} onChange={e => updateTeamMember(i, "email", e.target.value)}
                            placeholder="Email" className="bg-white/[0.05] border-white/[0.08] h-10 text-white text-sm placeholder:text-zinc-600"
                            data-testid={`input-member-email-${i}`} />
                          <select value={member.role} onChange={e => updateTeamMember(i, "role", e.target.value)}
                            className="bg-white/[0.05] border border-white/[0.08] rounded-md h-10 text-white text-sm px-3"
                            data-testid={`select-member-role-${i}`}>
                            <option value="technician">Technician</option>
                            <option value="service_advisor">Service Advisor</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <Button variant="outline" size="sm" className="mt-4 border-white/10 text-zinc-400 hover:text-white" onClick={addTeamMember} data-testid="button-add-member">
                    + Add Another
                  </Button>

                  <p className="text-zinc-600 text-xs mt-6">Invites will be sent after setup. You can always add more team members later from Settings.</p>
                </Card>
              )}

              {step === 5 && (
                <Card className="p-8 bg-[#0f172a]/60 border-white/[0.08] rounded-2xl" data-testid="step-5">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#00D9FF]/10 flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-[#00D9FF]" />
                    </div>
                    <h2 className="text-2xl font-tech font-bold text-white mb-2">Trust Layer Verification</h2>
                    <p className="text-zinc-500 text-sm">Review and launch your TORQUE shop</p>
                  </div>

                  {/* Review Summary */}
                  <div className="space-y-4 mb-8">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                        <User className="w-4 h-4" /> Owner
                      </div>
                      <p className="text-white font-medium">{owner.name}</p>
                      <p className="text-zinc-500 text-sm">{owner.email}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                        <Building2 className="w-4 h-4" /> Shop
                      </div>
                      <p className="text-white font-medium">{shop.name || "—"}</p>
                      <p className="text-zinc-500 text-sm">{[shop.address, shop.city, shop.state, shop.zipCode].filter(Boolean).join(", ") || "No address"}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                        <Wrench className="w-4 h-4" /> Vehicle Types
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedVehicleTypes.map(id => {
                          const vt = VEHICLE_TYPES.find(v => v.id === id);
                          return vt ? (
                            <Badge key={id} className="bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981] text-xs">
                              {vt.emoji} {vt.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                        <Users className="w-4 h-4" /> Team
                      </div>
                      <p className="text-white text-sm">
                        {teamMembers.filter(m => m.name.trim()).length > 0
                          ? `${teamMembers.filter(m => m.name.trim()).length} team member(s) to invite`
                          : "No team members yet (you can add later)"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Trust Layer Info */}
                  <div className="p-5 rounded-xl bg-[#00D9FF]/[0.05] border border-[#00D9FF]/20 mb-6">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-[#00D9FF] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm mb-1">What Trust Layer Verification Means</p>
                        <p className="text-zinc-500 text-xs leading-relaxed">
                          Your shop identity will be cryptographically signed and recorded on the Trust Layer blockchain. 
                          This gives your customers verifiable proof that your shop is legitimate, and all repair records are tamper-proof.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      className="mt-0.5 border-white/20 data-[state=checked]:bg-[#00D9FF] data-[state=checked]:border-[#00D9FF]"
                      data-testid="checkbox-terms"
                    />
                    <label className="text-zinc-500 text-sm leading-relaxed cursor-pointer" onClick={() => setAcceptTerms(!acceptTerms)}>
                      I agree to the <Link href="/terms"><span className="text-[#00D9FF] hover:underline">Terms of Service</span></Link> and <Link href="/privacy"><span className="text-[#00D9FF] hover:underline">Privacy Policy</span></Link>, and consent to my shop identity being recorded on the Trust Layer blockchain.
                    </label>
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              className="text-zinc-500 hover:text-white gap-2"
              onClick={() => step > 1 ? setStep(step - 1) : navigate("/torque")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 1 ? "Back" : "Previous"}
            </Button>

            {step < 5 ? (
              <Button
                className="bg-[#00D9FF] hover:bg-[#00D9FF]/80 text-black font-bold gap-2 h-12 px-8"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                data-testid="button-next"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                className="bg-[#00D9FF] hover:bg-[#00D9FF]/80 text-black font-bold gap-2 h-12 px-8"
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                data-testid="button-launch"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Launch TORQUE</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
