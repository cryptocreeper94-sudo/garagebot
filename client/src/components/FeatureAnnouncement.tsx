import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Sparkles, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

interface FeatureAnnouncementProps {
  featureId: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  ctaText: string;
  ctaLink: string;
  accentColor?: string;
  delay?: number;
}

export function FeatureAnnouncement({
  featureId,
  title,
  subtitle,
  description,
  icon,
  ctaText,
  ctaLink,
  accentColor = 'cyan',
  delay = 2000,
}: FeatureAnnouncementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const storageKey = `garagebot_feature_${featureId}_seen`;

  useEffect(() => {
    const hasSeen = localStorage.getItem(storageKey);
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), delay);
      return () => clearTimeout(timer);
    }
  }, [storageKey, delay]);

  const handleDismiss = () => {
    setIsExiting(true);
    localStorage.setItem(storageKey, 'true');
    setTimeout(() => {
      setIsOpen(false);
      setIsExiting(false);
    }, 300);
  };

  const handleCTA = () => {
    localStorage.setItem(storageKey, 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={handleDismiss}
          data-testid="modal-feature-announcement"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-full max-w-md bg-gradient-to-b from-[#0f1629] to-[#0a0f1e] border border-cyan-500/30 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.15)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
              
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors z-10"
                data-testid="button-close-announcement"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative p-6 pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px] font-mono">
                    <Sparkles className="w-3 h-3 mr-1" />
                    NEW FEATURE
                  </Badge>
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-tech font-bold uppercase text-white mb-1">
                      {title}
                    </h2>
                    <p className="text-sm text-cyan-400 font-medium">
                      {subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {description}
                </p>

                <div className="flex items-center gap-3">
                  <Link href={ctaLink} onClick={handleCTA}>
                    <Button 
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-tech uppercase text-sm"
                      data-testid="button-announcement-cta"
                    >
                      {ctaText}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    onClick={handleDismiss}
                    className="text-muted-foreground hover:text-white text-sm"
                    data-testid="button-announcement-dismiss"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function BlockchainAnnouncement() {
  return (
    <FeatureAnnouncement
      featureId="blockchain_verification_v1"
      title="Blockchain Verified"
      subtitle="Powered by Solana"
      description="Your vehicles and Genesis Hallmarks can now be permanently verified on the Solana blockchain. Create tamper-proof digital certificates with cryptographic proof of ownership."
      icon={<Shield className="w-7 h-7 text-cyan-400" />}
      ctaText="Verify Now"
      ctaLink="/hallmark"
      delay={3000}
    />
  );
}

export function AnnouncementBanner({ 
  text, 
  ctaText, 
  ctaLink,
  onDismiss,
  icon
}: { 
  text: string; 
  ctaText: string; 
  ctaLink: string;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border-b border-cyan-500/20 py-2 px-4"
      data-testid="banner-announcement"
    >
      <div className="container mx-auto flex items-center justify-center gap-3 text-sm">
        {icon && <span className="text-cyan-400">{icon}</span>}
        <span className="text-gray-300">{text}</span>
        <Link href={ctaLink}>
          <Button 
            variant="link" 
            className="text-cyan-400 hover:text-cyan-300 p-0 h-auto text-sm font-medium"
            data-testid="link-banner-cta"
          >
            {ctaText}
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
        {onDismiss && (
          <button 
            onClick={() => { setIsVisible(false); onDismiss(); }}
            className="text-gray-500 hover:text-white ml-2"
            data-testid="button-dismiss-banner"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
