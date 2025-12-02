import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Smartphone, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import gbEmblem from "@assets/generated_images/gb_emblem_no_bg.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AddToHomeScreen() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const checkIfInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (checkIfInstalled) {
      setIsInstalled(true);
      return;
    }

    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    if (dismissedTime > oneDayAgo) {
      return;
    }

    // Wait for onboarding modal to be seen/dismissed before showing PWA prompt
    const hasSeenOnboarding = localStorage.getItem('garagebot_onboarding_seen');
    if (!hasSeenOnboarding) {
      // Check periodically if onboarding was dismissed
      const checkInterval = setInterval(() => {
        if (localStorage.getItem('garagebot_onboarding_seen')) {
          clearInterval(checkInterval);
          setTimeout(() => setShowPrompt(true), 500);
        }
      }, 500);
      
      // Cleanup after 30 seconds if never dismissed
      setTimeout(() => clearInterval(checkInterval), 30000);
      return;
    }

    const isIOSDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent) && 
                        !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    setTimeout(() => setShowPrompt(true), 1500);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      handleDismiss();
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };

  const handleDismiss = () => {
    setIsExiting(true);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    setTimeout(() => {
      setShowPrompt(false);
      setIsExiting(false);
    }, 800);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
          onClick={handleDismiss}
          data-testid="pwa-overlay"
        >
          {/* Card runs in from left, exits to right */}
          <motion.div
            initial={{ x: "-100vw", opacity: 0, rotate: -15 }}
            animate={{ 
              x: isExiting ? "100vw" : 0, 
              opacity: isExiting ? 0 : 1,
              rotate: isExiting ? 15 : 0,
              transition: {
                type: "spring",
                damping: isExiting ? 15 : 18,
                stiffness: isExiting ? 100 : 120,
                mass: 1
              }
            }}
            exit={{ x: "100vw", opacity: 0, rotate: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[90vw] sm:max-w-sm pointer-events-auto"
          >
            <Card className="relative bg-gradient-to-b from-card to-background border-primary/30 p-4 sm:p-6 shadow-[0_0_40px_rgba(6,182,212,0.2)] max-h-[85vh] overflow-y-auto">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 w-8 h-8 text-muted-foreground hover:text-foreground z-10"
                onClick={handleDismiss}
                data-testid="pwa-dismiss"
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="flex flex-col items-center text-center">
                <motion.img
                  src={gbEmblem}
                  alt="GarageBot"
                  className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                <h2 className="font-tech text-lg sm:text-xl font-bold text-primary uppercase tracking-wider mb-2">
                  Install GarageBot
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                  Add to your home screen for quick access anytime, anywhere.
                </p>

                {isIOS ? (
                  <div className="w-full space-y-3 sm:space-y-4">
                    <div className="bg-primary/10 rounded-lg p-3 sm:p-4 border border-primary/20">
                      <p className="text-xs font-medium text-primary mb-2 sm:mb-3">To install on iOS:</p>
                      <div className="space-y-2 sm:space-y-3 text-left">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Share className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Tap <span className="font-medium text-foreground">Share</span> in Safari
                          </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Tap <span className="font-medium text-foreground">Add to Home Screen</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Tap <span className="font-medium text-foreground">Add</span> to confirm
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-primary/30 hover:bg-primary/10 h-10 sm:h-11"
                      onClick={handleDismiss}
                      data-testid="pwa-ios-dismiss"
                    >
                      Got it!
                    </Button>
                  </div>
                ) : (
                  <div className="w-full space-y-2 sm:space-y-3">
                    {canInstall ? (
                      <Button
                        onClick={handleInstall}
                        className="w-full bg-primary text-black hover:bg-primary/90 font-tech uppercase btn-glow h-10 sm:h-12"
                        data-testid="pwa-install"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Add to Home Screen
                      </Button>
                    ) : (
                      <div className="bg-primary/10 rounded-lg p-3 sm:p-4 border border-primary/20 text-left">
                        <p className="text-xs font-medium text-primary mb-2">Install on your device:</p>
                        <p className="text-xs text-muted-foreground">
                          Use your browser menu and select <span className="font-medium text-foreground">"Install app"</span> or <span className="font-medium text-foreground">"Add to Home Screen"</span>.
                        </p>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-foreground h-10"
                      onClick={handleDismiss}
                      data-testid="pwa-later"
                    >
                      {canInstall ? "Maybe Later" : "Got it!"}
                    </Button>
                  </div>
                )}

                <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-1 sm:gap-2">
                  {["Offline", "Fast", "No Store"].map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-mono rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
