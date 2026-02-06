import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Car, Warehouse, Moon, Target, Wrench, Crown, Users, Hexagon, MapPin,
  Lock, Trophy
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: typeof Search;
}

interface AchievementState {
  unlocked: boolean;
  unlockedAt: string | null;
}

type AchievementsMap = Record<string, AchievementState>;

const BADGES: AchievementBadge[] = [
  { id: "first_search", title: "First Search", description: "Complete your first parts search", icon: Search },
  { id: "garage_started", title: "Garage Started", description: "Add your first vehicle", icon: Car },
  { id: "garage_full", title: "Garage Full", description: "Add 5+ vehicles to garage", icon: Warehouse },
  { id: "night_owl", title: "Night Owl", description: "Search for parts between midnight and 5am", icon: Moon },
  { id: "parts_hunter", title: "Parts Hunter", description: "Complete 100+ searches", icon: Target },
  { id: "diy_master", title: "DIY Master", description: "View 10+ repair guides", icon: Wrench },
  { id: "pro_member", title: "Pro Member", description: "Subscribe to Pro", icon: Crown },
  { id: "social_butterfly", title: "Social Butterfly", description: "Refer a friend", icon: Users },
  { id: "hallmark_pioneer", title: "Hallmark Pioneer", description: "Mint a Genesis Hallmark", icon: Hexagon },
  { id: "road_warrior", title: "Road Warrior", description: "Search parts for 5+ different vehicle types", icon: MapPin },
];

const STORAGE_KEY = "garagebotAchievements";

function getStoredAchievements(): AchievementsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial: AchievementsMap = {};
  BADGES.forEach((b) => {
    initial[b.id] = { unlocked: false, unlockedAt: null };
  });
  return initial;
}

function saveAchievements(data: AchievementsMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function checkAndUnlockBadge(badgeId: string): boolean {
  const achievements = getStoredAchievements();
  if (achievements[badgeId]?.unlocked) return false;
  achievements[badgeId] = { unlocked: true, unlockedAt: new Date().toISOString() };
  saveAchievements(achievements);
  window.dispatchEvent(new CustomEvent("achievementUpdate"));
  return true;
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<AchievementsMap>(getStoredAchievements);

  const refresh = useCallback(() => {
    setAchievements(getStoredAchievements());
  }, []);

  useEffect(() => {
    window.addEventListener("achievementUpdate", refresh);
    return () => window.removeEventListener("achievementUpdate", refresh);
  }, [refresh]);

  const unlockedCount = useMemo(
    () => Object.values(achievements).filter((a) => a.unlocked).length,
    [achievements]
  );

  return { achievements, unlockedCount, totalCount: BADGES.length, refresh };
}

interface AchievementBadgesProps {
  compact?: boolean;
}

export default function AchievementBadges({ compact = true }: AchievementBadgesProps) {
  const { achievements, unlockedCount, totalCount } = useAchievements();
  const [recentUnlock, setRecentUnlock] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => {
      const updated = getStoredAchievements();
      const justUnlocked = Object.entries(updated).find(
        ([id, state]) => state.unlocked && !achievements[id]?.unlocked
      );
      if (justUnlocked) setRecentUnlock(justUnlocked[0]);
    };
    window.addEventListener("achievementUpdate", handler);
    return () => window.removeEventListener("achievementUpdate", handler);
  }, [achievements]);

  useEffect(() => {
    if (recentUnlock) {
      const timer = setTimeout(() => setRecentUnlock(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [recentUnlock]);

  const progressPercent = (unlockedCount / totalCount) * 100;

  return (
    <Card className="bento-glass border-primary/20 overflow-hidden relative" data-testid="achievement-badges">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary via-cyan-400 to-purple-500" />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-tech text-sm font-bold text-primary uppercase tracking-wide" data-testid="text-achievements-title">
              Achievements
            </h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground" data-testid="text-achievements-count">
            {unlockedCount} of {totalCount} earned
          </span>
        </div>

        <Progress value={progressPercent} className="h-2 mb-4" data-testid="progress-achievements" />

        <div
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          data-testid="badge-gallery"
        >
          {BADGES.map((badge) => {
            const state = achievements[badge.id] || { unlocked: false, unlockedAt: null };
            const Icon = badge.icon;
            const isUnlocked = state.unlocked;
            const isRecent = recentUnlock === badge.id;

            return (
              <motion.div
                key={badge.id}
                className="flex-shrink-0"
                initial={false}
                animate={isRecent ? { scale: [1, 1.2, 1], transition: { duration: 0.5 } } : {}}
                data-testid={`badge-${badge.id}`}
              >
                <div
                  className={`relative w-[72px] flex flex-col items-center text-center group cursor-default ${
                    !isUnlocked ? "opacity-50 grayscale" : ""
                  }`}
                >
                  <div
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center mb-1.5 border transition-all ${
                      isUnlocked
                        ? "bg-primary/20 border-primary/60 shadow-[0_0_16px_rgba(6,182,212,0.5)]"
                        : "bg-zinc-800/60 border-zinc-700/40"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${isUnlocked ? "text-primary" : "text-zinc-500"}`}
                    />
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                        <Lock className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                    )}
                    {isRecent && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 1.6, opacity: 0 }}
                        transition={{ duration: 1, repeat: 2 }}
                      />
                    )}
                  </div>

                  <span
                    className={`text-[9px] font-tech font-bold leading-tight ${
                      isUnlocked ? "text-foreground" : "text-zinc-500"
                    }`}
                    data-testid={`text-badge-title-${badge.id}`}
                  >
                    {badge.title}
                  </span>

                  {isUnlocked && state.unlockedAt && (
                    <span className="text-[8px] text-primary/70 font-mono mt-0.5" data-testid={`text-badge-date-${badge.id}`}>
                      {new Date(state.unlockedAt).toLocaleDateString()}
                    </span>
                  )}

                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-36 p-2 rounded-lg bg-zinc-900 border border-zinc-700 shadow-xl">
                    <p className="text-[10px] font-medium text-foreground">{badge.title}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{badge.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider">
            Gamification
          </span>
          <span className="w-1 h-1 rounded-full bg-primary/40" />
          <span className="text-[9px] font-mono text-primary/60">
            {totalCount} badges
          </span>
        </div>
      </div>
    </Card>
  );
}
