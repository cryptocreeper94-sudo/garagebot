import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Share2, X, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Prize {
  label: string;
  color: string;
}

const SEGMENTS: Prize[] = [
  { label: "10% Off Pro", color: "#0891b2" },
  { label: "25% Off Pro", color: "#7c3aed" },
  { label: "10% Off Pro", color: "#d97706" },
  { label: "Free Month Pro", color: "#059669" },
  { label: "10% Off Pro", color: "#0891b2" },
  { label: "AutoZone $100 Entry", color: "#dc2626" },
  { label: "25% Off Pro", color: "#7c3aed" },
  { label: "Mystery Bonus", color: "#ca8a04" },
];

const LAST_SPIN_KEY = "garagebotLastSpin";
const PRIZE_KEY = "garagebotLastPrize";

function hasSpunToday(): boolean {
  const last = localStorage.getItem(LAST_SPIN_KEY);
  if (!last) return false;
  const lastDate = new Date(last).toDateString();
  return lastDate === new Date().toDateString();
}

function pickWeightedIndex(): number {
  return Math.floor(Math.random() * SEGMENTS.length);
}

function Confetti() {
  const pieces = Array.from({ length: 40 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 1.5 + Math.random() * 1.5;
        const size = 4 + Math.random() * 6;
        const colors = ["#06b6d4", "#7c3aed", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rotation = Math.random() * 360;
        return (
          <motion.div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${left}%`,
              top: "-5%",
              width: size,
              height: size,
              backgroundColor: color,
              rotate: rotation,
            }}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: "110vh", opacity: 0, rotate: rotation + 360 }}
            transition={{ duration, delay, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}

function WheelCanvas({ rotation }: { rotation: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 4;
    const segCount = SEGMENTS.length;
    const arc = (2 * Math.PI) / segCount;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-center, -center);

    SEGMENTS.forEach((seg, i) => {
      const startAngle = i * arc - Math.PI / 2;
      const endAngle = startAngle + arc;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.round(size / 26)}px sans-serif`;
      const words = seg.label.split(" ");
      const lineHeight = Math.round(size / 24);
      const startY = -(words.length - 1) * (lineHeight / 2);
      words.forEach((word, wi) => {
        ctx.fillText(word, radius - 14, startY + wi * lineHeight + 4);
      });
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(center, center, 22, 0, 2 * Math.PI);
    ctx.fillStyle = "#111827";
    ctx.fill();
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#06b6d4";
    ctx.font = `bold ${Math.round(size / 22)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GB", center, center);

    ctx.restore();
  }, [rotation]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={320}
      className="w-full max-w-[320px] mx-auto"
      data-testid="spin-wheel-canvas"
    />
  );
}

export default function SpinToWin() {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [alreadySpun, setAlreadySpun] = useState(hasSpunToday);

  const handleSpin = useCallback(() => {
    if (spinning || alreadySpun) return;

    setResult(null);
    setShowConfetti(false);
    setSpinning(true);

    const winIndex = pickWeightedIndex();
    const segAngle = 360 / SEGMENTS.length;
    const segCenter = segAngle * winIndex + segAngle / 2;
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = fullSpins * 360 + (360 - segCenter);

    setRotation((prev) => prev + finalRotation);

    setTimeout(() => {
      const prize = SEGMENTS[winIndex].label;
      setResult(prize);
      setShowConfetti(true);
      setSpinning(false);
      setAlreadySpun(true);
      localStorage.setItem(LAST_SPIN_KEY, new Date().toISOString());
      localStorage.setItem(PRIZE_KEY, prize);
    }, 4000);
  }, [spinning, alreadySpun]);

  const handleShare = () => {
    const text = `I just won "${result}" on GarageBot's Spin to Win! 🎉🔧 Try your luck at garagebot.io`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-open-spin"
      >
        <Gift className="w-6 h-6 text-white" />
      </motion.button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-zinc-950 border-primary/30">
          <DialogTitle className="sr-only">Spin to Win</DialogTitle>

          <div className="relative p-6">
            {showConfetti && <Confetti />}

            <div className="text-center mb-4">
              <h2 className="font-tech text-2xl font-black uppercase text-primary tracking-wide" data-testid="text-spin-title">
                Spin to Win
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Try your luck — one free spin per day!
              </p>
            </div>

            {alreadySpun && !result ? (
              <div className="text-center py-12" data-testid="spin-cooldown">
                <RotateCw className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                <p className="text-lg font-tech text-foreground">Come back tomorrow!</p>
                <p className="text-sm text-muted-foreground mt-2">You already spun today. Daily reset at midnight.</p>
                {localStorage.getItem(PRIZE_KEY) && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-xs text-muted-foreground">Today's prize:</p>
                    <p className="text-sm font-bold text-primary" data-testid="text-last-prize">{localStorage.getItem(PRIZE_KEY)}</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
                    <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-primary drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                  </div>

                  <motion.div
                    animate={{ rotate: rotation }}
                    transition={{ duration: 4, ease: [0.2, 0.8, 0.3, 1] }}
                    data-testid="spin-wheel"
                  >
                    <WheelCanvas rotation={0} />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="text-center mt-4"
                      data-testid="spin-result"
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <span className="font-tech text-lg text-yellow-400 uppercase">You Won!</span>
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                      </div>
                      <p className="text-xl font-bold text-primary" data-testid="text-prize">{result}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 border-primary/40 text-primary hover:bg-primary/10"
                        onClick={handleShare}
                        data-testid="button-share-prize"
                      >
                        <Share2 className="w-4 h-4 mr-1.5" />
                        Share on X
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!result && (
                  <div className="text-center mt-4">
                    <Button
                      onClick={handleSpin}
                      disabled={spinning}
                      className="bg-gradient-to-r from-primary to-purple-600 text-white font-tech uppercase tracking-wider px-8 py-3 text-base shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                      data-testid="button-spin"
                    >
                      {spinning ? "Spinning..." : "SPIN!"}
                    </Button>
                  </div>
                )}
              </>
            )}

            <div className="mt-4 flex items-center justify-center gap-1.5">
              <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider">
                Daily Wheel
              </span>
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              <span className="text-[9px] font-mono text-primary/60">
                {SEGMENTS.length} prizes
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
