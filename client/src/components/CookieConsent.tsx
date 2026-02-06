import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, Shield, X } from "lucide-react";
import { Link } from "wouter";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("garagebot_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("garagebot_cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("garagebot_cookie_consent", "essential-only");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-[90] p-4"
          data-testid="banner-cookie-consent"
        >
          <div className="max-w-4xl mx-auto bg-[#0f1629] border border-primary/30 rounded-xl p-4 md:p-5 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0 hidden sm:block">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Cookie className="w-4 h-4 text-primary sm:hidden" />
                  <h3 className="text-sm font-tech uppercase text-primary">Cookie Notice</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  GarageBot uses essential cookies for authentication and session management. We also use analytics cookies to improve your experience. 
                  By clicking "Accept All," you consent to all cookies. Read our{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-primary text-black hover:bg-primary/90 font-tech uppercase text-xs h-8"
                    onClick={handleAccept}
                    data-testid="button-accept-cookies"
                  >
                    Accept All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 font-tech uppercase text-xs h-8"
                    onClick={handleDecline}
                    data-testid="button-essential-cookies"
                  >
                    Essential Only
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDecline}
                className="text-muted-foreground hover:text-white transition-colors shrink-0"
                data-testid="button-close-cookies"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
              <Shield className="w-3 h-3 text-green-400" />
              <span className="text-[10px] text-muted-foreground">
                You must be 13 or older to use GarageBot. By continuing, you confirm you meet this age requirement.
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
