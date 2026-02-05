import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Trophy, Star, Gift, Users, Zap, Target, Crown, Medal,
  ChevronRight, Sparkles, TrendingUp, Calendar
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface RewardTier {
  referrals: number;
  name: string;
  reward: string;
  icon: typeof Trophy;
  color: string;
}

const REWARD_TIERS: RewardTier[] = [
  { referrals: 1, name: "Early Supporter", reward: "Exclusive Badge", icon: Star, color: "text-zinc-400" },
  { referrals: 3, name: "Part Finder", reward: "1 Month Pro FREE", icon: Zap, color: "text-cyan-400" },
  { referrals: 5, name: "Gear Head", reward: "Genesis Hallmark NFT", icon: Medal, color: "text-purple-400" },
  { referrals: 10, name: "Crew Chief", reward: "3 Months Pro + Founding Member Status", icon: Trophy, color: "text-yellow-400" },
  { referrals: 25, name: "Shop Foreman", reward: "1 Year Pro + Featured Profile", icon: Crown, color: "text-orange-400" },
  { referrals: 50, name: "Legend", reward: "LIFETIME Pro + Custom Hallmark", icon: Sparkles, color: "text-red-400" },
];

const BADGES = [
  { id: "early_supporter", name: "Early Supporter", description: "Joined during launch", icon: Star, earned: true },
  { id: "first_search", name: "First Search", description: "Completed first parts search", icon: Target, earned: true },
  { id: "parts_hunter_bronze", name: "Parts Hunter", description: "Found 10 parts", icon: Zap, earned: false, progress: 7, target: 10 },
  { id: "diy_starter", name: "DIY Starter", description: "Completed first guide", icon: Trophy, earned: false, progress: 0, target: 1 },
  { id: "savings_master", name: "Savings Master", description: "Saved $100+ on parts", icon: TrendingUp, earned: false, progress: 42, target: 100 },
];

interface RewardsProgressProps {
  userId?: string;
  compact?: boolean;
}

export default function RewardsProgress({ userId, compact = false }: RewardsProgressProps) {
  const [showAllTiers, setShowAllTiers] = useState(false);

  // Mock data - would fetch from API
  const userStats = {
    referralCount: 2,
    pointsBalance: 450,
    totalSavings: 42,
    partsSearched: 7,
    guidesCompleted: 0,
    currentTier: 0,
    nextTier: 1,
    giveawayEntries: 2,
  };

  const currentTier = REWARD_TIERS[userStats.currentTier];
  const nextTier = REWARD_TIERS[userStats.nextTier];
  const progressToNext = nextTier ? (userStats.referralCount / nextTier.referrals) * 100 : 100;

  if (compact) {
    return (
      <Card className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Your Referrals</p>
              <p className="text-xl font-bold text-white">{userStats.referralCount}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Next reward at {nextTier?.referrals}</p>
            <Progress value={progressToNext} className="w-24 h-2 mt-1" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-zinc-900/50 border-zinc-800">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-cyan-400" />
            <div>
              <p className="text-2xl font-bold text-white">{userStats.referralCount}</p>
              <p className="text-xs text-zinc-500">Referrals</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900/50 border-zinc-800">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">{userStats.pointsBalance}</p>
              <p className="text-xs text-zinc-500">Points</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900/50 border-zinc-800">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">${userStats.totalSavings}</p>
              <p className="text-xs text-zinc-500">Saved</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900/50 border-zinc-800">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">{userStats.giveawayEntries}</p>
              <p className="text-xs text-zinc-500">Giveaway Entries</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Referral Tiers Progress */}
      <Card className="p-6 bg-zinc-900/50 border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Referral Rewards
          </h3>
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
            {userStats.referralCount} / {nextTier?.referrals || "MAX"} to next tier
          </Badge>
        </div>

        <div className="space-y-3">
          {(showAllTiers ? REWARD_TIERS : REWARD_TIERS.slice(0, 4)).map((tier, i) => {
            const isCompleted = userStats.referralCount >= tier.referrals;
            const isCurrent = i === userStats.currentTier;
            const isNext = i === userStats.nextTier;
            const TierIcon = tier.icon;

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                  isCompleted ? "bg-green-500/10 border border-green-500/30" :
                  isNext ? "bg-cyan-500/10 border border-cyan-500/30" :
                  "bg-zinc-800/50 border border-zinc-700/50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? "bg-green-500/20" : "bg-zinc-700/50"
                }`}>
                  <TierIcon className={`w-5 h-5 ${isCompleted ? "text-green-400" : tier.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isCompleted ? "text-green-400" : "text-white"}`}>
                      {tier.name}
                    </span>
                    <span className="text-xs text-zinc-500">({tier.referrals} referrals)</span>
                  </div>
                  <p className="text-sm text-zinc-400">{tier.reward}</p>
                </div>
                {isCompleted && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Unlocked
                  </Badge>
                )}
                {isNext && (
                  <div className="text-right">
                    <p className="text-xs text-cyan-400">{tier.referrals - userStats.referralCount} more</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {!showAllTiers && REWARD_TIERS.length > 4 && (
          <Button
            variant="ghost"
            className="w-full mt-4 text-zinc-400 hover:text-white"
            onClick={() => setShowAllTiers(true)}
          >
            Show All Tiers
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </Card>

      {/* Badges */}
      <Card className="p-6 bg-zinc-900/50 border-zinc-800">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Medal className="w-5 h-5 text-purple-400" />
          Your Badges
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {BADGES.map((badge) => {
            const BadgeIcon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`text-center p-4 rounded-lg border transition-all ${
                  badge.earned
                    ? "bg-purple-500/10 border-purple-500/30"
                    : "bg-zinc-800/30 border-zinc-700/30 opacity-60"
                }`}
              >
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  badge.earned ? "bg-purple-500/20" : "bg-zinc-700/30"
                }`}>
                  <BadgeIcon className={`w-6 h-6 ${badge.earned ? "text-purple-400" : "text-zinc-500"}`} />
                </div>
                <p className={`text-sm font-medium ${badge.earned ? "text-white" : "text-zinc-500"}`}>
                  {badge.name}
                </p>
                <p className="text-xs text-zinc-500 mt-1">{badge.description}</p>
                {!badge.earned && badge.progress !== undefined && (
                  <div className="mt-2">
                    <Progress value={(badge.progress / badge.target!) * 100} className="h-1" />
                    <p className="text-xs text-zinc-500 mt-1">{badge.progress}/{badge.target}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Monthly Giveaway */}
      <Card className="p-6 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border-orange-500/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-orange-400" />
              February Giveaway
            </h3>
            <p className="text-zinc-400 mt-1">
              Win a <span className="text-orange-400 font-bold">$100 AutoZone Gift Card</span>
            </p>
            <p className="text-sm text-zinc-500 mt-2">
              Every referral = 1 entry. You have <span className="text-white font-bold">{userStats.giveawayEntries} entries</span> this month.
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Drawing: Feb 28</span>
            </div>
            <Button className="mt-3 bg-orange-500 hover:bg-orange-600 text-black">
              Get More Entries
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
