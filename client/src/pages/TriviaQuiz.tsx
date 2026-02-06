import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Timer, Zap, Trophy, RotateCw, Share2, ChevronRight, Sparkles, Star, CheckCircle2, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

interface TriviaQuestion {
  id: number;
  category: string;
  question: string;
  answers: string[];
  correct: number;
}

const ALL_QUESTIONS: TriviaQuestion[] = [
  { id: 1, category: "History", question: "Who is credited with building the first practical automobile in 1885?", answers: ["Henry Ford", "Karl Benz", "Gottlieb Daimler", "Ransom Olds"], correct: 1 },
  { id: 2, category: "History", question: "What year was the Ford Model T introduced?", answers: ["1903", "1908", "1913", "1920"], correct: 1 },
  { id: 3, category: "History", question: "Which company produced the first mass-market electric car, the Nissan Leaf?", answers: ["Toyota", "Tesla", "Nissan", "Chevrolet"], correct: 2 },
  { id: 4, category: "History", question: "The Volkswagen Beetle was originally commissioned by which leader?", answers: ["Mussolini", "Churchill", "Hitler", "Stalin"], correct: 2 },
  { id: 5, category: "Engineering", question: "What does 'DOHC' stand for in engine terminology?", answers: ["Double Overhead Cam", "Dual Octane High Compression", "Direct Output Hybrid Control", "Double Output Hydraulic Cylinder"], correct: 0 },
  { id: 6, category: "Engineering", question: "How many cylinders does a typical inline-6 engine have?", answers: ["4", "6", "8", "12"], correct: 1 },
  { id: 7, category: "Engineering", question: "What component converts reciprocating motion to rotational motion in an engine?", answers: ["Camshaft", "Crankshaft", "Piston", "Flywheel"], correct: 1 },
  { id: 8, category: "Engineering", question: "Which braking system uses fluid pressure to stop a vehicle?", answers: ["Drum brakes", "Hydraulic brakes", "Air brakes", "Electromagnetic brakes"], correct: 1 },
  { id: 9, category: "Pop Culture", question: "What car does Dominic Toretto drive in the original Fast and Furious?", answers: ["1970 Dodge Charger", "1969 Camaro", "1968 Mustang", "1971 Cuda"], correct: 0 },
  { id: 10, category: "Pop Culture", question: "What is the name of the sentient car in the movie 'Cars'?", answers: ["Flash McSpeed", "Lightning McQueen", "Thunder McRace", "Blaze McWheels"], correct: 1 },
  { id: 11, category: "Pop Culture", question: "In Back to the Future, what car is the time machine?", answers: ["Corvette", "Camaro", "DeLorean DMC-12", "Pontiac Firebird"], correct: 2 },
  { id: 12, category: "Pop Culture", question: "Which James Bond film features an Aston Martin DB5 for the first time?", answers: ["Dr. No", "Goldfinger", "Thunderball", "Casino Royale"], correct: 1 },
  { id: 13, category: "Speed Records", question: "What is the fastest production car as of 2024?", answers: ["Bugatti Chiron", "SSC Tuatara", "Koenigsegg Jesko", "Hennessey Venom F5"], correct: 1 },
  { id: 14, category: "Speed Records", question: "What speed did the Thrust SSC achieve to break the land speed record?", answers: ["500 mph", "633 mph", "763 mph", "850 mph"], correct: 2 },
  { id: 15, category: "Speed Records", question: "Which F1 team has won the most Constructors' Championships?", answers: ["McLaren", "Mercedes", "Ferrari", "Red Bull"], correct: 2 },
  { id: 16, category: "Speed Records", question: "What is the top speed of a NASCAR stock car on a superspeedway?", answers: ["Around 150 mph", "Around 180 mph", "Around 200 mph", "Around 220 mph"], correct: 2 },
  { id: 17, category: "Weird Facts", question: "In which country is it illegal to drive a dirty car?", answers: ["Japan", "Germany", "Russia", "Singapore"], correct: 2 },
  { id: 18, category: "Weird Facts", question: "What percentage of its lifetime does the average car spend parked?", answers: ["60%", "75%", "85%", "95%"], correct: 3 },
  { id: 19, category: "Weird Facts", question: "The inventor of cruise control was:", answers: ["Legally blind", "Completely blind", "Deaf", "An astronaut"], correct: 1 },
  { id: 20, category: "Weird Facts", question: "The average car horn honks in which musical key?", answers: ["C", "D", "E", "F"], correct: 3 },
  { id: 21, category: "History", question: "Which car company's logo features a trident?", answers: ["Alfa Romeo", "Maserati", "Lamborghini", "Bugatti"], correct: 1 },
  { id: 22, category: "Engineering", question: "What does ABS stand for in automotive braking?", answers: ["Auto Brake System", "Anti-lock Braking System", "Automatic Balance Stabilizer", "Advanced Brake Support"], correct: 1 },
  { id: 23, category: "Pop Culture", question: "What car does the 'Ghostbusters' team drive?", answers: ["1959 Cadillac", "1961 Lincoln", "1957 Chevy", "1963 Pontiac"], correct: 0 },
  { id: 24, category: "Weird Facts", question: "How many individual parts does the average car contain?", answers: ["5,000", "10,000", "20,000", "30,000"], correct: 3 },
  { id: 25, category: "Speed Records", question: "What is the 0-60 mph time of a Tesla Model S Plaid?", answers: ["2.5 seconds", "1.99 seconds", "3.1 seconds", "2.1 seconds"], correct: 1 },
];

const QUESTIONS_PER_QUIZ = 10;
const SECONDS_PER_QUESTION = 15;
const HIGH_SCORE_KEY = "garagebotTriviaHighScore";

function getTitle(score: number): string {
  if (score === 10) return "Master Mechanic";
  if (score >= 8) return "Gear Head";
  if (score >= 6) return "Shade Tree Pro";
  if (score >= 4) return "Weekend Warrior";
  if (score >= 2) return "Grease Monkey";
  return "Backseat Driver";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CATEGORY_COLORS: Record<string, string> = {
  History: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Engineering: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Pop Culture": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Speed Records": "bg-red-500/20 text-red-400 border-red-500/30",
  "Weird Facts": "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default function TriviaQuiz() {
  const [phase, setPhase] = useState<"start" | "playing" | "results">("start");
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  const startQuiz = useCallback(() => {
    const shuffled = shuffle(ALL_QUESTIONS).slice(0, QUESTIONS_PER_QUIZ);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(SECONDS_PER_QUESTION);
    setSelected(null);
    setAnswered(false);
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing" || answered) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft, answered]);

  const handleTimeout = useCallback(() => {
    setAnswered(true);
    setStreak(0);
    setTimeout(advanceQuestion, 1500);
  }, [currentIdx, questions.length]);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (answered) return;
      setSelected(idx);
      setAnswered(true);
      const q = questions[currentIdx];
      if (idx === q.correct) {
        const newStreak = streak + 1;
        setScore((s) => s + 1);
        setStreak(newStreak);
        if (newStreak > bestStreak) setBestStreak(newStreak);
      } else {
        setStreak(0);
      }
      setTimeout(advanceQuestion, 1500);
    },
    [answered, questions, currentIdx, streak, bestStreak]
  );

  const advanceQuestion = useCallback(() => {
    if (currentIdx + 1 >= questions.length) {
      setPhase("results");
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelected(null);
    setAnswered(false);
    setTimeLeft(SECONDS_PER_QUESTION);
  }, [currentIdx, questions.length]);

  useEffect(() => {
    if (phase === "results" && score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }
  }, [phase, score, highScore]);

  const currentQ = questions[currentIdx];
  const progressPercent = phase === "playing" ? ((currentIdx) / questions.length) * 100 : 100;
  const timerPercent = (timeLeft / SECONDS_PER_QUESTION) * 100;

  const handleShare = () => {
    const title = getTitle(score);
    const text = `I scored ${score}/${QUESTIONS_PER_QUIZ} on GarageBot Trivia! 🏆 "${title}" — Think you can beat me? garagebot.io/trivia`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen text-foreground font-sans overflow-x-hidden relative">
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
          <span className="text-[40vw] font-tech font-black tracking-tighter select-none text-primary">?</span>
        </div>
      </div>

      <Nav />

      <div className="pt-[85px] pb-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-2xl">
          <AnimatePresence mode="wait">
            {phase === "start" && (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
                <h1 className="font-tech text-4xl font-black uppercase text-foreground mb-2" data-testid="text-trivia-title">
                  Vehicle <span className="text-primary">Trivia</span>
                </h1>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Test your automotive knowledge! {QUESTIONS_PER_QUIZ} questions, {SECONDS_PER_QUESTION} seconds each.
                </p>

                {highScore > 0 && (
                  <Card className="bento-glass border-primary/20 p-4 mb-6 inline-block" data-testid="card-high-score">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">High Score:</span>
                      <span className="font-bold text-primary" data-testid="text-high-score">{highScore}/{QUESTIONS_PER_QUIZ}</span>
                    </div>
                  </Card>
                )}

                <div>
                  <Button
                    onClick={startQuiz}
                    className="bg-gradient-to-r from-primary to-purple-600 text-white font-tech uppercase tracking-wider px-8 py-3 text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                    data-testid="button-start-quiz"
                  >
                    Start Quiz
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-md mx-auto">
                  {Object.entries(CATEGORY_COLORS).map(([cat, cls]) => (
                    <Badge key={cat} variant="outline" className={`text-[10px] ${cls}`} data-testid={`badge-category-${cat.toLowerCase().replace(/ /g, "-")}`}>
                      {cat}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === "playing" && currentQ && (
              <motion.div
                key={`q-${currentQ.id}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground" data-testid="text-question-number">
                      Q{currentIdx + 1}/{questions.length}
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[currentQ.category] || ""}`} data-testid="badge-question-category">
                      {currentQ.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    {streak > 1 && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-xs font-bold text-yellow-400" data-testid="text-streak">{streak}x</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Timer className={`w-4 h-4 ${timeLeft <= 5 ? "text-red-400" : "text-muted-foreground"}`} />
                      <span
                        className={`text-sm font-mono font-bold ${timeLeft <= 5 ? "text-red-400" : "text-foreground"}`}
                        data-testid="text-timer"
                      >
                        {timeLeft}s
                      </span>
                    </div>
                  </div>
                </div>

                <Progress value={progressPercent} className="h-1 mb-2" data-testid="progress-quiz" />

                <div className="relative h-1.5 w-full rounded-full bg-zinc-800 mb-6 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${timeLeft <= 5 ? "bg-red-500" : "bg-primary"}`}
                    initial={{ width: "100%" }}
                    animate={{ width: `${timerPercent}%` }}
                    transition={{ duration: 0.3 }}
                    data-testid="progress-timer"
                  />
                </div>

                <Card className="glass-ultra border-primary/20 p-6 mb-6" data-testid="card-question">
                  <p className="text-lg font-medium text-foreground leading-relaxed" data-testid="text-question">
                    {currentQ.question}
                  </p>
                </Card>

                <div className="grid gap-3">
                  {currentQ.answers.map((answer, idx) => {
                    let borderClass = "border-zinc-700/50 hover:border-primary/50";
                    let bgClass = "glass-card hover:bg-primary/5";

                    if (answered) {
                      if (idx === currentQ.correct) {
                        borderClass = "border-green-500/60";
                        bgClass = "bg-green-500/10";
                      } else if (idx === selected && idx !== currentQ.correct) {
                        borderClass = "border-red-500/60";
                        bgClass = "bg-red-500/10";
                      } else {
                        borderClass = "border-zinc-800/30";
                        bgClass = "glass-card opacity-50";
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={answered}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${borderClass} ${bgClass}`}
                        whileHover={!answered ? { scale: 1.01 } : {}}
                        whileTap={!answered ? { scale: 0.99 } : {}}
                        data-testid={`button-answer-${idx}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-sm text-foreground">{answer}</span>
                          {answered && idx === currentQ.correct && (
                            <CheckCircle2 className="w-5 h-5 text-green-400 ml-auto flex-shrink-0" />
                          )}
                          {answered && idx === selected && idx !== currentQ.correct && (
                            <XCircle className="w-5 h-5 text-red-400 ml-auto flex-shrink-0" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span data-testid="text-current-score">Score: {score}</span>
                  <span>Best Streak: {bestStreak}</span>
                </div>
              </motion.div>
            )}

            {phase === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(6,182,212,0.3)]"
                >
                  <Trophy className="w-12 h-12 text-yellow-400" />
                </motion.div>

                <h2 className="font-tech text-3xl font-black uppercase text-foreground mb-1" data-testid="text-result-title">
                  {getTitle(score)}
                </h2>
                <p className="text-muted-foreground mb-6">Quiz Complete!</p>

                <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm mx-auto">
                  <Card className="bento-glass border-primary/20 p-4" data-testid="card-result-score">
                    <Star className="w-6 h-6 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold text-foreground" data-testid="text-final-score">{score}/{QUESTIONS_PER_QUIZ}</p>
                    <p className="text-[10px] text-muted-foreground">Score</p>
                  </Card>
                  <Card className="bento-glass border-primary/20 p-4" data-testid="card-result-accuracy">
                    <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-foreground" data-testid="text-accuracy">{Math.round((score / QUESTIONS_PER_QUIZ) * 100)}%</p>
                    <p className="text-[10px] text-muted-foreground">Accuracy</p>
                  </Card>
                  <Card className="bento-glass border-primary/20 p-4" data-testid="card-result-streak">
                    <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-foreground" data-testid="text-best-streak">{bestStreak}</p>
                    <p className="text-[10px] text-muted-foreground">Best Streak</p>
                  </Card>
                </div>

                {score > highScore - 1 && score === highScore && highScore > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6"
                  >
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-3 py-1" data-testid="badge-new-high-score">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New High Score!
                    </Badge>
                  </motion.div>
                )}

                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={startQuiz}
                    className="bg-gradient-to-r from-primary to-purple-600 text-white font-tech uppercase tracking-wider px-6"
                    data-testid="button-play-again"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Play Again
                  </Button>
                  <Button
                    variant="outline"
                    className="border-primary/40 text-primary hover:bg-primary/10 font-tech uppercase tracking-wider"
                    onClick={handleShare}
                    data-testid="button-share-score"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Score
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}
