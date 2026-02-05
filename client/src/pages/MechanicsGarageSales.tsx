import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { 
  Wrench, FileText, Calendar, Users, BarChart3, DollarSign,
  CheckCircle, ArrowRight, Play, Building2, Phone, Mail,
  Clock, Shield, Zap, TrendingUp, MessageSquare, Send,
  Car, Truck, Ship, Cog, Star, ChevronRight, ChevronLeft,
  Sparkles, Target, Award, HeartHandshake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const SHOP_TYPES = [
  { id: "auto", label: "Auto Repair", icon: Car },
  { id: "truck", label: "Truck / Heavy Duty", icon: Truck },
  { id: "marine", label: "Boat / Marine", icon: Ship },
  { id: "small-engine", label: "Small Engine / ATV", icon: Cog },
  { id: "tire", label: "Tire Shop", icon: Target },
  { id: "other", label: "Other", icon: Wrench }
];

const FEATURES = [
  {
    icon: FileText,
    title: "Repair Orders & Estimates",
    description: "Create professional estimates and repair orders in seconds. Convert estimates to work orders with one click.",
    highlight: "Save 2+ hours daily"
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Online booking, automated reminders, and a visual calendar that keeps your bays full and customers happy.",
    highlight: "Reduce no-shows by 60%"
  },
  {
    icon: Users,
    title: "Customer Management",
    description: "Complete customer history, vehicle records, and communication tools all in one place.",
    highlight: "Build lasting relationships"
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track revenue, technician productivity, and shop efficiency with live dashboards.",
    highlight: "Data-driven decisions"
  },
  {
    icon: DollarSign,
    title: "Integrated Payments",
    description: "Accept cards, send digital invoices, and get paid faster with built-in payment processing.",
    highlight: "Get paid same-day"
  },
  {
    icon: MessageSquare,
    title: "Customer Communication",
    description: "Text and email customers directly. Send estimates, approvals, and updates automatically.",
    highlight: "95% open rates on texts"
  }
];

const COMPARISON = [
  { feature: "Monthly Price", us: "$49", them: "$179+" },
  { feature: "Repair Orders", us: "Unlimited", them: "Unlimited" },
  { feature: "Users", us: "Unlimited", them: "Per-seat pricing" },
  { feature: "Parts Search (40+ retailers)", us: true, them: false },
  { feature: "AI Assistant (Buddy)", us: true, them: false },
  { feature: "DIY Guides Library", us: true, them: false },
  { feature: "Marketing Hub", us: "Add-on", them: "$345+/mo" },
  { feature: "QuickBooks Sync", us: "Coming Soon", them: true },
  { feature: "Customer Portal", us: true, them: true },
  { feature: "Mobile Access", us: true, them: true },
];

const TESTIMONIALS = [
  {
    name: "Mike's Auto Care",
    location: "Dallas, TX",
    quote: "Finally, software that doesn't cost more than my rent. The parts search alone saves me hours every week.",
    rating: 5
  },
  {
    name: "Coastal Marine Repair",
    location: "Tampa, FL",
    quote: "Works great for our boat repair shop. Other software only handles cars - this handles everything.",
    rating: 5
  },
  {
    name: "Summit Truck Service",
    location: "Denver, CO",
    quote: "Switched from AutoLeap. Same features, a third of the price. No brainer.",
    rating: 5
  }
];

const SLIDES = [
  {
    title: "Dashboard Overview",
    description: "See your entire shop at a glance - active jobs, pending estimates, today's appointments, and revenue tracking.",
    image: "/marketing/dashboard-preview.png",
    fallbackGradient: "from-cyan-500/20 via-blue-500/10 to-purple-500/20"
  },
  {
    title: "Repair Orders",
    description: "Create detailed work orders with labor, parts, and notes. Track progress from check-in to completion.",
    image: "/marketing/repair-orders-preview.png",
    fallbackGradient: "from-green-500/20 via-emerald-500/10 to-cyan-500/20"
  },
  {
    title: "Estimates & Invoicing",
    description: "Professional estimates customers can approve online. Convert to invoices with one click.",
    image: "/marketing/estimates-preview.png",
    fallbackGradient: "from-amber-500/20 via-orange-500/10 to-red-500/20"
  },
  {
    title: "Scheduling Calendar",
    description: "Visual bay management and appointment scheduling. Customers can book online 24/7.",
    image: "/marketing/calendar-preview.png",
    fallbackGradient: "from-purple-500/20 via-pink-500/10 to-rose-500/20"
  },
  {
    title: "Customer Portal",
    description: "Customers view their vehicle history, approve estimates, and pay invoices from their phone.",
    image: "/marketing/portal-preview.png",
    fallbackGradient: "from-blue-500/20 via-indigo-500/10 to-violet-500/20"
  }
];

export default function MechanicsGarageSales() {
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    shopName: "",
    contactName: "",
    email: "",
    phone: "",
    shopType: "",
    currentSoftware: "",
    employees: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/shop-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitted(true);
        toast({
          title: "Request Sent!",
          description: "We'll be in touch within 24 hours.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or call us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-green-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Now Available for All Shop Types
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-bold text-white mb-6"
            >
              Shop Management Software
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
                That Doesn't Break the Bank
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-zinc-400 max-w-3xl mx-auto mb-8"
            >
              Everything you need to run your auto, truck, marine, or small engine repair shop.
              All the features of $179/month software for just <span className="text-green-400 font-bold">$49/month</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/mechanics-garage">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-black font-bold px-8 h-14 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Try Demo Mode
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 h-14 text-lg"
                onClick={() => document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" })}
              >
                Request Information
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {[
              { value: "$49", label: "per month", sublabel: "vs $179+ competitors" },
              { value: "40+", label: "parts retailers", sublabel: "instant search" },
              { value: "∞", label: "users", sublabel: "no per-seat fees" },
              { value: "24/7", label: "customer booking", sublabel: "online scheduling" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-cyan-400">{stat.value}</div>
                <div className="text-white font-medium">{stat.label}</div>
                <div className="text-xs text-zinc-500">{stat.sublabel}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Slideshow */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">See It In Action</h2>
            <p className="text-zinc-400">Click through to explore each feature</p>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 rounded-2xl border border-white/10 overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-8 p-8">
                  <div className="flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs mb-4 w-fit">
                      {currentSlide + 1} of {SLIDES.length}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{SLIDES[currentSlide].title}</h3>
                    <p className="text-zinc-400 text-lg leading-relaxed">{SLIDES[currentSlide].description}</p>
                  </div>
                  <div className={`aspect-video rounded-xl bg-gradient-to-br ${SLIDES[currentSlide].fallbackGradient} flex items-center justify-center border border-white/10`}>
                    <div className="text-center text-zinc-500">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Feature Preview</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button variant="ghost" size="icon" onClick={prevSlide} className="text-zinc-400 hover:text-white">
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <div className="flex gap-2">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? "w-8 bg-cyan-400" : "bg-zinc-600 hover:bg-zinc-500"}`}
                  />
                ))}
              </div>
              <Button variant="ghost" size="icon" onClick={nextSlide} className="text-zinc-400 hover:text-white">
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Everything You Need to Run Your Shop</h2>
            <p className="text-zinc-400">Professional tools without the professional price tag</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 bg-zinc-900/50 border-zinc-800 hover:border-cyan-500/30 transition-all h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-green-500/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm mb-4">{feature.description}</p>
                  <div className="inline-flex items-center gap-1 text-green-400 text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    {feature.highlight}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-green-500/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How We Compare</h2>
            <p className="text-zinc-400">Same features. Fraction of the cost.</p>
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-800/50 border-b border-zinc-700">
              <div className="font-bold text-zinc-400">Feature</div>
              <div className="text-center">
                <div className="font-bold text-cyan-400">Mechanics Garage</div>
                <div className="text-xs text-green-400">$49/mo</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-zinc-500">Others</div>
                <div className="text-xs text-zinc-600">$179+/mo</div>
              </div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 p-4 border-b border-zinc-800 last:border-0">
                <div className="text-zinc-300">{row.feature}</div>
                <div className="text-center">
                  {typeof row.us === "boolean" ? (
                    row.us ? <CheckCircle className="w-5 h-5 text-green-400 mx-auto" /> : <span className="text-zinc-600">—</span>
                  ) : (
                    <span className={row.us.includes("$49") ? "text-green-400 font-bold" : "text-cyan-400"}>{row.us}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof row.them === "boolean" ? (
                    row.them ? <CheckCircle className="w-5 h-5 text-zinc-500 mx-auto" /> : <span className="text-zinc-600">—</span>
                  ) : (
                    <span className="text-zinc-500">{row.them}</span>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </section>

      {/* Shop Types */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Built for Every Shop</h2>
            <p className="text-zinc-400">From auto repair to marine service, we've got you covered</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {SHOP_TYPES.map((type) => (
              <Card key={type.id} className="p-6 bg-zinc-900/50 border-zinc-800 hover:border-cyan-500/30 transition-all text-center cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/10 to-green-500/10 flex items-center justify-center mx-auto mb-4 group-hover:from-cyan-500/20 group-hover:to-green-500/20 transition-all">
                  <type.icon className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="text-white font-medium text-sm">{type.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">What Shop Owners Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 bg-zinc-900/50 border-zinc-800 h-full">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-zinc-300 italic mb-4">"{testimonial.quote}"</p>
                  <div className="border-t border-zinc-800 pt-4">
                    <p className="text-white font-medium">{testimonial.name}</p>
                    <p className="text-zinc-500 text-sm">{testimonial.location}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Information Form */}
      <section id="request-form" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border-cyan-500/20 overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Left side - Info */}
              <div className="p-8 bg-gradient-to-br from-cyan-500/10 to-green-500/10">
                <h2 className="text-2xl font-bold text-white mb-4">Ready to Transform Your Shop?</h2>
                <p className="text-zinc-400 mb-8">
                  Fill out the form and we'll reach out within 24 hours to discuss how Mechanics Garage can help your business.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <HeartHandshake className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Personal Demo</p>
                      <p className="text-zinc-500 text-sm">We'll walk you through every feature</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">30-Day Free Trial</p>
                      <p className="text-zinc-500 text-sm">No credit card required to start</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Free Data Migration</p>
                      <p className="text-zinc-500 text-sm">We'll import your existing data</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Form */}
              <div className="p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Request Received!</h3>
                    <p className="text-zinc-400 mb-6">We'll be in touch within 24 hours.</p>
                    <Link href="/mechanics-garage">
                      <Button className="bg-gradient-to-r from-cyan-500 to-green-500 text-black">
                        Try Demo Mode Now
                      </Button>
                    </Link>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-wide">Shop Name *</label>
                        <Input
                          required
                          value={formData.shopName}
                          onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                          placeholder="Mike's Auto Care"
                          className="bg-zinc-800/50 border-zinc-700 mt-1"
                          data-testid="input-shop-name"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-wide">Your Name *</label>
                        <Input
                          required
                          value={formData.contactName}
                          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                          placeholder="Mike Johnson"
                          className="bg-zinc-800/50 border-zinc-700 mt-1"
                          data-testid="input-contact-name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-wide">Email *</label>
                        <Input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="mike@example.com"
                          className="bg-zinc-800/50 border-zinc-700 mt-1"
                          data-testid="input-email"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-wide">Phone *</label>
                        <Input
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                          className="bg-zinc-800/50 border-zinc-700 mt-1"
                          data-testid="input-phone"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-500 uppercase tracking-wide">Shop Type *</label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        {SHOP_TYPES.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, shopType: type.label })}
                            className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                              formData.shopType === type.label
                                ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                                : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
                            }`}
                            data-testid={`button-shop-type-${type.id}`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-wide">Current Software</label>
                        <Input
                          value={formData.currentSoftware}
                          onChange={(e) => setFormData({ ...formData, currentSoftware: e.target.value })}
                          placeholder="e.g., AutoLeap, pen & paper"
                          className="bg-zinc-800/50 border-zinc-700 mt-1"
                          data-testid="input-current-software"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-wide"># of Employees</label>
                        <Input
                          value={formData.employees}
                          onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                          placeholder="e.g., 3"
                          className="bg-zinc-800/50 border-zinc-700 mt-1"
                          data-testid="input-employees"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-500 uppercase tracking-wide">Message (optional)</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your shop or any questions you have..."
                        className="bg-zinc-800/50 border-zinc-700 mt-1 min-h-[80px]"
                        data-testid="input-message"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.shopType}
                      className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-black font-bold h-12"
                      data-testid="button-submit-inquiry"
                    >
                      {isSubmitting ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Request Information
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-t from-cyan-500/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to See What <span className="text-cyan-400">$49/month</span> Gets You?
          </h2>
          <p className="text-zinc-400 mb-8">
            Jump into demo mode and explore every feature. No sign-up required.
          </p>
          <Link href="/mechanics-garage">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-black font-bold px-12 h-14 text-lg">
              <Play className="w-5 h-5 mr-2" />
              Launch Demo Mode
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-bold">Mechanics Garage</span>
            <span className="text-zinc-600">by GarageBot</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:support@garagebot.io" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
