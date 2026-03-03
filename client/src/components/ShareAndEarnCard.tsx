import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Share2, Copy, Check, TrendingUp, Users, Coins, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

interface AffiliateLink {
  referralLink: string;
  uniqueHash: string;
}

interface AffiliateDashboard {
  tier: string;
  tierLabel: string;
  commissionRate: number;
  referralCount: number;
  convertedCount: number;
  totalEarned: string;
  pendingPayout: string;
  currency: string;
}

export default function ShareAndEarnCard() {
  const [copied, setCopied] = useState(false);
  const [, navigate] = useLocation();

  const { data: linkData } = useQuery<AffiliateLink>({
    queryKey: ["/api/ecosystem-affiliate/link"],
    retry: false,
  });

  const { data: dashboard } = useQuery<AffiliateDashboard>({
    queryKey: ["/api/ecosystem-affiliate/dashboard"],
    retry: false,
  });

  const copyLink = () => {
    if (linkData?.referralLink) {
      navigator.clipboard.writeText(linkData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!linkData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 p-4"
      data-testid="card-share-and-earn"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <Share2 className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-sm font-semibold text-white font-['Rajdhani']">Share & Earn SIG</h3>
        </div>
        {dashboard && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            {dashboard.tierLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 px-3 py-1.5 rounded-lg bg-black/30 border border-gray-700/50 font-mono text-xs text-gray-300 truncate">
          {linkData.referralLink}
        </div>
        <button
          onClick={copyLink}
          className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
          data-testid="button-copy-referral-link"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      {dashboard && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2 rounded-lg bg-black/20 border border-gray-800/50 text-center">
            <Users className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xs font-mono text-white">{dashboard.referralCount}</p>
            <p className="text-[9px] text-gray-500">Referrals</p>
          </div>
          <div className="p-2 rounded-lg bg-black/20 border border-gray-800/50 text-center">
            <TrendingUp className="w-3.5 h-3.5 text-green-400 mx-auto mb-1" />
            <p className="text-xs font-mono text-white">{dashboard.convertedCount}</p>
            <p className="text-[9px] text-gray-500">Converted</p>
          </div>
          <div className="p-2 rounded-lg bg-black/20 border border-gray-800/50 text-center">
            <Coins className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
            <p className="text-xs font-mono text-white">{dashboard.totalEarned}</p>
            <p className="text-[9px] text-gray-500">{dashboard.currency}</p>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate("/affiliates")}
        className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/5 transition-colors"
        data-testid="button-view-affiliate-dashboard"
      >
        View Full Dashboard <ChevronRight className="w-3 h-3" />
      </button>
    </motion.div>
  );
}
