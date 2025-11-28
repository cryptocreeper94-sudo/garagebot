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
      setShowPrompt(false);
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
        data-testid="pwa-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 50, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="relative w-full max-w-sm bg-gradient-to-b from-card to-background border-primary/30 p-6 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 w-8 h-8 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
              data-testid="pwa-dismiss"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="flex flex-col items-center text-center">
              <motion.img
                src={gbEmblem}
                alt="GarageBot"
                className="w-20 h-20 mb-4 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />

              <h2 className="font-tech text-xl font-bold text-primary uppercase tracking-wider mb-2">
                Install GarageBot
              </h2>

              <p className="text-sm text-muted-foreground mb-6">
                Add GarageBot to your home screen for quick access to parts search anytime, anywhere.
              </p>

              {isIOS ? (
                <div className="w-full space-y-4">
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <p className="text-xs font-medium text-primary mb-3">To install on iOS:</p>
                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Share className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tap the <span className="font-medium text-foreground">Share</span> button in Safari
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Plus className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Scroll down and tap <span className="font-medium text-foreground">Add to Home Screen</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Smartphone className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tap <span className="font-medium text-foreground">Add</span> to confirm
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-primary/30 hover:bg-primary/10"
                    onClick={handleDismiss}
                    data-testid="pwa-ios-dismiss"
                  >
                    Got it!
                  </Button>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  {canInstall ? (
                    <Button
                      onClick={handleInstall}
                      className="w-full bg-primary text-black hover:bg-primary/90 font-tech uppercase btn-glow h-12"
                      data-testid="pwa-install"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Add to Home Screen
                    </Button>
                  ) : (
                    <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 text-left">
                      <p className="text-xs font-medium text-primary mb-2">Install on your device:</p>
                      <p className="text-xs text-muted-foreground">
                        Use your browser menu (three dots) and select <span className="font-medium text-foreground">"Install app"</span> or <span className="font-medium text-foreground">"Add to Home Screen"</span> to install GarageBot.
                      </p>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={handleDismiss}
                    data-testid="pwa-later"
                  >
                    {canInstall ? "Maybe Later" : "Got it!"}
                  </Button>
                </div>
              )}

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["Offline Access", "Fast Launch", "No App Store"].map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 text-[10px] font-mono rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
