import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Gift, Copy, Share2, Check, Star, Coins, 
  Trophy, ArrowRight, Clock, CheckCircle2, AlertCircle,
  Sparkles, Crown, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

interface ReferralSummary {
  referralCode: string;
  pointsBalance: number;
  totalInvites: number;
  signedUp: number;
  convertedToPro: number;
}

interface PointTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
  balanceAfter: number;
}

const REWARDS = [
  { 
    id: 'pro_month', 
    name: '1 Month Pro', 
    points: 500, 
    icon: Star,
    description: 'Get 1 month of Pro features free',
    color: 'text-blue-400',
    bgColor: 'from-blue-900/40 to-blue-800/20'
  },
  { 
    id: 'pro_year', 
    name: '1 Year Pro', 
    points: 1000, 
    icon: Crown,
    description: 'Get a full year of Pro features',
    color: 'text-purple-400',
    bgColor: 'from-purple-900/40 to-purple-800/20'
  },
  { 
    id: 'pro_lifetime', 
    name: 'Lifetime Pro', 
    points: 2500, 
    icon: Sparkles,
    description: 'Unlock Pro forever - become a Founder',
    color: 'text-yellow-400',
    bgColor: 'from-yellow-900/40 to-amber-800/20'
  },
];

export default function InviteFriends() {
  const [copied, setCopied] = useState(false);
  const [selectedReward, setSelectedReward] = useState<typeof REWARDS[0] | null>(null);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: summary, isLoading } = useQuery<ReferralSummary>({
    queryKey: ['referralSummary'],
    queryFn: async () => {
      const res = await fetch('/api/referrals/summary');
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json();
    },
  });

  const { data: transactions = [] } = useQuery<PointTransaction[]>({
    queryKey: ['referralTransactions'],
    queryFn: async () => {
      const res = await fetch('/api/referrals/transactions');
      if (!res.ok) throw new Error('Failed to fetch transactions');
      return res.json();
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async (rewardType: string) => {
      const res = await fetch('/api/referrals/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardType }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to redeem');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['referralSummary'] });
      queryClient.invalidateQueries({ queryKey: ['referralTransactions'] });
      setShowRedeemDialog(false);
      toast({
        title: "Reward Redeemed!",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Redemption Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const referralLink = `https://garagebot.io/?ref=${summary?.referralCode || ''}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join GarageBot',
          text: 'Check out GarageBot - the best way to find auto parts for any vehicle!',
          url: referralLink,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const handleRedeem = (reward: typeof REWARDS[0]) => {
    setSelectedReward(reward);
    setShowRedeemDialog(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-[85px] flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      
      <main className="pt-[85px] pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-green-400 mb-4">
              <Gift className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl md:text-4xl font-tech font-bold uppercase tracking-wide mb-2">
              Invite Friends
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Share GarageBot with friends and earn points toward free Pro membership!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 glass-card card-3d border-primary/30 text-center">
                <Coins className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary" data-testid="text-points-balance">
                  {summary?.pointsBalance || 0}
                </div>
                <div className="text-sm text-muted-foreground">Points Balance</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 glass-card card-3d border-green-500/30 text-center">
                <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-400" data-testid="text-total-signups">
                  {summary?.signedUp || 0}
                </div>
                <div className="text-sm text-muted-foreground">Friends Signed Up</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 glass-card card-3d border-purple-500/30 text-center">
                <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-400" data-testid="text-pro-conversions">
                  {summary?.convertedToPro || 0}
                </div>
                <div className="text-sm text-muted-foreground">Upgraded to Pro</div>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 mb-8 glass-ultra border-primary/30">
              <h2 className="font-tech text-lg mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Your Referral Link
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-sm text-primary overflow-x-auto">
                  {referralLink}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="border-primary/30 hover:bg-primary/10"
                    data-testid="button-copy-link"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                  <Button
                    onClick={shareLink}
                    className="bg-primary text-black hover:bg-primary/90"
                    data-testid="button-share-link"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                  <Zap className="w-4 h-4" />
                  How It Works
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">1</div>
                    <div>
                      <div className="font-medium">Share Link</div>
                      <div className="text-muted-foreground text-xs">Send to car-loving friends</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-400">2</div>
                    <div>
                      <div className="font-medium">They Sign Up</div>
                      <div className="text-muted-foreground text-xs">You earn 100 points</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">3</div>
                    <div>
                      <div className="font-medium">They Go Pro</div>
                      <div className="text-muted-foreground text-xs">You earn 500 more points</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="font-tech text-xl mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Redeem Rewards
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {REWARDS.map((reward) => {
                const canAfford = (summary?.pointsBalance || 0) >= reward.points;
                const Icon = reward.icon;
                
                return (
                  <Card
                    key={reward.id}
                    className={`p-6 border-2 transition-all glass-card card-3d ${
                      canAfford 
                        ? 'border-primary/50 hover:border-primary cursor-pointer hover:scale-[1.02]' 
                        : 'border-white/10 opacity-60'
                    }`}
                    onClick={() => canAfford && handleRedeem(reward)}
                    data-testid={`card-reward-${reward.id}`}
                  >
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-black/30 mb-3 ${reward.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-tech font-bold text-lg mb-1">{reward.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{reward.description}</p>
                      <Badge className={`${canAfford ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'}`}>
                        {reward.points} points
                      </Badge>
                      {canAfford && (
                        <div className="mt-3">
                          <Button size="sm" className="w-full bg-primary text-black hover:bg-primary/90 font-tech uppercase">
                            Redeem <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>

          {transactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="font-tech text-xl mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Points History
              </h2>
              
              <Card className="glass-card border-white/10 overflow-hidden">
                <div className="divide-y divide-white/10">
                  {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.amount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {tx.amount > 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{tx.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={`font-mono font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
        <DialogContent className="bg-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="font-tech text-xl flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Confirm Redemption
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem your points for this reward?
            </DialogDescription>
          </DialogHeader>
          
          {selectedReward && (
            <div className="py-4">
              <Card className={`p-4 bg-gradient-to-br ${selectedReward.bgColor} border-primary/30`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-black/30 flex items-center justify-center ${selectedReward.color}`}>
                    <selectedReward.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-tech font-bold">{selectedReward.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedReward.points} points</div>
                  </div>
                </div>
              </Card>
              
              <div className="mt-4 p-3 bg-primary/10 rounded-lg text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Current Balance:</span>
                  <span className="font-mono">{summary?.pointsBalance || 0} pts</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Cost:</span>
                  <span className="font-mono text-red-400">-{selectedReward.points} pts</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="font-medium">After Redemption:</span>
                  <span className="font-mono font-bold text-primary">
                    {(summary?.pointsBalance || 0) - selectedReward.points} pts
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowRedeemDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary text-black hover:bg-primary/90"
              onClick={() => selectedReward && redeemMutation.mutate(selectedReward.id)}
              disabled={redeemMutation.isPending}
              data-testid="button-confirm-redeem"
            >
              {redeemMutation.isPending ? 'Redeeming...' : 'Confirm Redemption'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
