import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  Headphones, Mail, Phone, Star, Send, MessageSquare,
  HelpCircle, Crown, ChevronLeft, Search, Link2, Shield,
  Car, Sparkles, Store
} from "lucide-react";
import { Link } from "wouter";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const faqItems = [
  {
    question: "How do I search for parts?",
    answer: "Use the search bar on the home page to enter a part name, number, or description. You can also filter by vehicle year, make, and model to find exact-fit parts. GarageBot aggregates results from multiple retailers so you can compare prices instantly.",
    icon: Search,
  },
  {
    question: "How do affiliate links work?",
    answer: "When you click a product link and make a purchase through one of our retail partners, GarageBot may earn a small commission at no additional cost to you. This helps us keep the platform free for all users. We participate in programs including CJ Affiliate and Amazon Associates.",
    icon: Link2,
  },
  {
    question: "What is Genesis Hallmark?",
    answer: "Genesis Hallmark is our blockchain-verified certificate system. It creates an immutable digital record for your vehicle, verifying authenticity and ownership history. Early adopters receive a unique Genesis-series hallmark with a permanently low asset number.",
    icon: Shield,
  },
  {
    question: "How do I manage my vehicles?",
    answer: "Navigate to the Garage page from the main menu. There you can add vehicles manually or by scanning a VIN. Each vehicle gets its own passport with service history tracking, recall alerts, and personalized part recommendations.",
    icon: Car,
  },
  {
    question: "What is Pro / Founders Circle?",
    answer: "Pro is our premium subscription tier that unlocks advanced features like priority support, enhanced AI recommendations, price alerts, and the Mechanics Garage shop portal. Founders Circle members are early supporters who locked in lifetime benefits and receive exclusive perks.",
    icon: Sparkles,
  },
  {
    question: "How do I contact a retailer about my order?",
    answer: "Since GarageBot is a parts aggregator, orders are placed directly with retailers. Check your email for the order confirmation from the retailer, which will include their customer service contact information. You can also visit the retailer's website and use their support portal.",
    icon: Store,
  },
];

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();

  const isPriorityUser =
    (user as any)?.subscriptionTier === "pro" ||
    (user as any)?.subscriptionTier === "founder";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      toast({ title: "Ticket Submitted", description: "We've received your request and will respond shortly." });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast({ title: "Error", description: "Failed to submit ticket. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast({ title: "No Rating", description: "Please select a star rating before submitting.", variant: "destructive" });
      return;
    }
    setIsRatingSubmitting(true);
    try {
      await fetch("/api/support/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: ratingComment }),
      });
      toast({ title: "Thanks for your feedback!", description: `You rated GarageBot ${rating}/5 stars.` });
      setRating(0);
      setHoverRating(0);
      setRatingComment("");
    } catch {
      toast({ title: "Error", description: "Failed to submit rating. Please try again.", variant: "destructive" });
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="mb-10"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-primary/20">
              <Headphones className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-tech font-bold uppercase text-primary" data-testid="text-page-title">
                Support Center
              </h1>
              <p className="text-muted-foreground text-sm font-mono">GET HELP • SUBMIT TICKETS • FAQ</p>
            </div>
          </div>
        </motion.div>

        {isPriorityUser && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={sectionVariants}
            className="mb-8"
          >
            <Card className="p-6 bg-card/50 border-amber-500/40 relative overflow-hidden" data-testid="card-priority-support">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-6 h-6 text-amber-400" />
                <h2 className="text-xl font-tech uppercase text-amber-400">Mechanics Garage Subscribers</h2>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 font-tech" data-testid="badge-priority">
                  Priority Support
                </Badge>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">
                As a Pro / Founders Circle member, you have access to priority support channels with faster response times.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-mono mb-1">Email</p>
                    <a
                      href="mailto:support@darkwavestudios.io"
                      className="text-amber-300 hover:text-amber-200 transition-colors font-mono text-sm"
                      data-testid="link-priority-email"
                    >
                      support@darkwavestudios.io
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <Phone className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-mono mb-1">Phone</p>
                    <span className="text-amber-300 font-mono text-sm" data-testid="text-priority-phone">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="mb-8"
        >
          <Card className="p-6 bg-card/50" data-testid="card-contact-form">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-tech uppercase text-primary">Contact Support</h2>
            </div>
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="support-name" className="font-mono text-xs uppercase">Name</Label>
                  <Input
                    id="support-name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email" className="font-mono text-xs uppercase">Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    data-testid="input-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-subject" className="font-mono text-xs uppercase">Subject</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, subject: val }))}
                >
                  <SelectTrigger data-testid="select-subject">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Question">General Question</SelectItem>
                    <SelectItem value="Order Issue">Order Issue</SelectItem>
                    <SelectItem value="Account Problem">Account Problem</SelectItem>
                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                    <SelectItem value="Bug Report">Bug Report</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-message" className="font-mono text-xs uppercase">Message</Label>
                <Textarea
                  id="support-message"
                  placeholder="Describe your issue or question..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  data-testid="textarea-message"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto font-tech uppercase gap-2"
                data-testid="button-submit-ticket"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="mb-8"
        >
          <Card className="p-6 bg-card/50" data-testid="card-faq">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-tech uppercase text-primary">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border-border/40">
                  <AccordionTrigger
                    className="hover:no-underline hover:text-primary transition-colors"
                    data-testid={`accordion-faq-${index}`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <faq.icon className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pl-7">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="mb-8"
        >
          <Card className="p-6 bg-card/50" data-testid="card-rating">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-tech uppercase text-primary">Rate GarageBot</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-4">How would you rate your experience with GarageBot?</p>
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                  data-testid={`button-star-${star}`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm text-muted-foreground font-mono">{rating}/5</span>
              )}
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="rating-comment" className="font-mono text-xs uppercase">
                Comment (optional)
              </Label>
              <Textarea
                id="rating-comment"
                placeholder="Tell us more about your experience..."
                rows={3}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                data-testid="textarea-rating-comment"
              />
            </div>
            <Button
              onClick={handleRatingSubmit}
              disabled={isRatingSubmitting || rating === 0}
              className="font-tech uppercase gap-2"
              data-testid="button-submit-rating"
            >
              <Send className="w-4 h-4" />
              {isRatingSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
