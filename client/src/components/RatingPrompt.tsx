import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEYS = {
  SESSION_COUNT: "garagebot_session_count",
  DISMISSED: "garagebot_rating_dismissed",
  SUBMITTED: "garagebot_rating_submitted",
  SHOWN_THIS_SESSION: "garagebot_rating_shown_session",
};

const SHOW_DELAY_MS = 30000;
const MIN_SESSIONS = 3;
const MIN_DAYS = 7;

export default function RatingPrompt() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const shouldShow = useCallback(() => {
    if (localStorage.getItem(STORAGE_KEYS.DISMISSED) === "true") return false;
    if (localStorage.getItem(STORAGE_KEYS.SUBMITTED) === "true") return false;
    if (sessionStorage.getItem(STORAGE_KEYS.SHOWN_THIS_SESSION) === "true") return false;

    const sessionCount = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_COUNT) || "0", 10);
    if (sessionCount >= MIN_SESSIONS) return true;

    if (user?.createdAt) {
      const signupDate = new Date(user.createdAt);
      const daysSinceSignup = (Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceSignup >= MIN_DAYS) return true;
    }

    return false;
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const currentCount = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_COUNT) || "0", 10);
    const sessionKey = "garagebot_session_incremented";
    if (!sessionStorage.getItem(sessionKey)) {
      localStorage.setItem(STORAGE_KEYS.SESSION_COUNT, String(currentCount + 1));
      sessionStorage.setItem(sessionKey, "true");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const timer = setTimeout(() => {
      if (shouldShow()) {
        setVisible(true);
        sessionStorage.setItem(STORAGE_KEYS.SHOWN_THIS_SESSION, "true");
      }
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isAuthenticated, shouldShow]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEYS.DISMISSED, "true");
  };

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
    setExpanded(true);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/support/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Failed to submit rating");
      localStorage.setItem(STORAGE_KEYS.SUBMITTED, "true");
      toast({
        title: "Thanks for your feedback!",
        description: "Your rating helps us improve GarageBot.",
      });
      setVisible(false);
    } catch {
      toast({
        title: "Submission failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[340px] max-w-[calc(100vw-2rem)]"
          data-testid="panel-rating-prompt"
        >
          <div className="bg-[#0f1629] border border-primary/30 rounded-xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-primary" data-testid="text-rating-title">
                Enjoying GarageBot?
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={handleDismiss}
                data-testid="button-dismiss-rating"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 mb-2" data-testid="stars-rating">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <button
                  key={starValue}
                  type="button"
                  className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                  onClick={() => handleStarClick(starValue)}
                  onMouseEnter={() => setHoveredStar(starValue)}
                  onMouseLeave={() => setHoveredStar(0)}
                  data-testid={`button-star-${starValue}`}
                  aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      starValue <= (hoveredStar || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Textarea
                    rows={2}
                    placeholder="Any additional feedback? (optional)"
                    className="text-xs bg-transparent border-primary/20 resize-none mb-2 mt-1"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    data-testid="textarea-rating-comment"
                  />
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs"
                    disabled={isSubmitting || rating === 0}
                    onClick={handleSubmit}
                    data-testid="button-submit-rating"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Rating"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
