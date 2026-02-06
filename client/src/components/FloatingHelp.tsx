import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  HelpCircle,
  X,
  Bug,
  MessageSquare,
  Star,
  ExternalLink,
  Send,
  Loader2,
} from "lucide-react";

export default function FloatingHelp() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (location === "/support") return null;

  const handleSubmit = async () => {
    if (!subject || !message.trim()) {
      toast({
        title: "Missing fields",
        description: "Please select a subject and enter a message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message: message.trim() }),
      });

      if (!res.ok) throw new Error("Failed to submit ticket");

      toast({
        title: "Ticket submitted!",
        description: "We'll get back to you as soon as possible.",
      });
      setSubject("");
      setMessage("");
      setIsOpen(false);
    } catch {
      toast({
        title: "Submission failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickActions = [
    { label: "Report an Issue", icon: Bug, action: () => setSubject("Bug Report") },
    { label: "Give Feedback", icon: MessageSquare, action: () => setSubject("General Feedback") },
    { label: "Rate GarageBot", icon: Star, action: () => setSubject("General Feedback") },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-16 right-0 w-80 rounded-xl border border-primary/30 bg-[#0f1629] p-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
            data-testid="panel-floating-help"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Need Help?
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
                data-testid="button-close-help"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2 mb-3">
              {quickActions.map((qa) => (
                <Button
                  key={qa.label}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs px-2 py-1.5 h-auto border-primary/20 hover:bg-primary/10 hover:text-primary"
                  onClick={qa.action}
                  data-testid={`button-${qa.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <qa.icon className="w-3.5 h-3.5 mr-1" />
                  {qa.label}
                </Button>
              ))}
            </div>

            <Link href="/support" onClick={() => setIsOpen(false)}>
              <div
                className="flex items-center gap-2 text-xs text-primary hover:underline mb-4 cursor-pointer"
                data-testid="link-visit-support"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Visit Support Center
              </div>
            </Link>

            <div className="space-y-2 border-t border-primary/10 pt-3">
              <Label className="text-xs text-muted-foreground">Quick Ticket</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger
                  className="h-8 text-xs bg-transparent border-primary/20"
                  data-testid="select-subject"
                >
                  <SelectValue placeholder="Select subject..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bug Report" data-testid="option-bug-report">Bug Report</SelectItem>
                  <SelectItem value="Feature Request" data-testid="option-feature-request">Feature Request</SelectItem>
                  <SelectItem value="General Feedback" data-testid="option-general-feedback">General Feedback</SelectItem>
                  <SelectItem value="Order Issue" data-testid="option-order-issue">Order Issue</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                rows={3}
                placeholder="Describe your issue or feedback..."
                className="text-xs bg-transparent border-primary/20 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                data-testid="textarea-message"
              />
              <Button
                size="sm"
                className="w-full h-8 text-xs"
                disabled={isSubmitting || !subject || !message.trim()}
                onClick={handleSubmit}
                data-testid="button-submit-ticket"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Send className="w-3.5 h-3.5 mr-1" />
                )}
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse-glow"
        data-testid="button-floating-help"
        aria-label="Help"
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(6,182,212,0.4); }
          50% { box-shadow: 0 0 30px rgba(6,182,212,0.6); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
