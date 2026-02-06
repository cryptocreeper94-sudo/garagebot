import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Wrench, BookOpen, Lightbulb, Video, Users, Star,
  Car, Truck, Ship, Cog, ArrowRight, Search, Filter,
  Hammer, Clock, DollarSign, Shield, Heart, Share2,
  CheckCircle, MessageSquare, ThumbsUp, Bookmark,
  Gamepad2, Radio, Plane, Trophy, Bike
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { id: "all", label: "All Guides", icon: BookOpen },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "repairs", label: "Repairs", icon: Hammer },
  { id: "diagnostics", label: "Diagnostics", icon: Search },
  { id: "upgrades", label: "Upgrades", icon: Star },
  { id: "tips", label: "Tips & Tricks", icon: Lightbulb }
];

const VEHICLE_TYPES = [
  { id: "car", label: "Cars", icon: Car },
  { id: "truck", label: "Trucks", icon: Truck },
  { id: "motorcycle", label: "Motorcycles", icon: Bike },
  { id: "boat", label: "Boats", icon: Ship },
  { id: "atv", label: "ATVs & Small Engine", icon: Cog },
  { id: "rc", label: "RC & Hobby", icon: Gamepad2 },
  { id: "drones", label: "Drones & FPV", icon: Radio },
  { id: "modelaircraft", label: "Model Aircraft", icon: Plane },
  { id: "slotcars", label: "Slot Cars", icon: Trophy }
];

const DIFFICULTY_LEVELS = [
  { id: "beginner", label: "Beginner", color: "text-green-400 bg-green-500/10 border-green-500/30" },
  { id: "intermediate", label: "Intermediate", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  { id: "advanced", label: "Advanced", color: "text-red-400 bg-red-500/10 border-red-500/30" }
];

const FEATURED_GUIDES = [
  {
    id: "oil-change",
    title: "Complete Oil Change Guide",
    description: "Step-by-step instructions for changing your oil like a pro. Save money and extend your engine's life.",
    category: "maintenance",
    vehicleType: "car",
    difficulty: "beginner",
    duration: "30-45 min",
    savings: "$40-80",
    views: 12453,
    likes: 892,
    image: "/guides/oil-change.jpg"
  },
  {
    id: "brake-pads",
    title: "How to Replace Brake Pads",
    description: "Don't overpay at the shop. Learn to replace your own brake pads safely and correctly.",
    category: "repairs",
    vehicleType: "car",
    difficulty: "intermediate",
    duration: "1-2 hours",
    savings: "$150-300",
    views: 9821,
    likes: 654,
    image: "/guides/brake-pads.jpg"
  },
  {
    id: "spark-plugs",
    title: "Spark Plug Replacement",
    description: "Improve fuel economy and performance with fresh spark plugs. Easier than you think!",
    category: "maintenance",
    vehicleType: "car",
    difficulty: "beginner",
    duration: "30 min",
    savings: "$60-120",
    views: 8234,
    likes: 521,
    image: "/guides/spark-plugs.jpg"
  },
  {
    id: "check-engine",
    title: "Reading Check Engine Codes",
    description: "Learn to diagnose check engine lights yourself with an OBD2 scanner. Know before you go to the shop.",
    category: "diagnostics",
    vehicleType: "car",
    difficulty: "beginner",
    duration: "15 min",
    savings: "$100+",
    views: 15672,
    likes: 1243,
    image: "/guides/check-engine.jpg"
  },
  {
    id: "winterize-boat",
    title: "Winterizing Your Boat Engine",
    description: "Protect your investment through the off-season. Complete winterization guide for outboard and inboard motors.",
    category: "maintenance",
    vehicleType: "boat",
    difficulty: "intermediate",
    duration: "2-3 hours",
    savings: "$200-400",
    views: 4521,
    likes: 312,
    image: "/guides/boat-winterize.jpg"
  },
  {
    id: "atv-carb",
    title: "ATV Carburetor Cleaning",
    description: "Fix rough idling and poor performance by cleaning your ATV's carburetor. Common issue, easy fix.",
    category: "repairs",
    vehicleType: "atv",
    difficulty: "intermediate",
    duration: "1-2 hours",
    savings: "$150-250",
    views: 3892,
    likes: 287,
    image: "/guides/atv-carb.jpg"
  },
  {
    id: "rc-motor-swap",
    title: "RC Brushless Motor Upgrade",
    description: "Swap your brushed motor for a brushless setup. Massive speed and runtime improvements for any RC car.",
    category: "upgrades",
    vehicleType: "rc",
    difficulty: "intermediate",
    duration: "45 min",
    savings: "$30-60",
    views: 5123,
    likes: 467,
    image: "/guides/rc-motor.jpg"
  },
  {
    id: "fpv-drone-build",
    title: "Build Your First FPV Drone",
    description: "Complete build guide for a 5-inch FPV racing drone. Soldering, flashing firmware, and maiden flight tips.",
    category: "repairs",
    vehicleType: "drones",
    difficulty: "advanced",
    duration: "3-4 hours",
    savings: "$100-200",
    views: 7845,
    likes: 621,
    image: "/guides/fpv-build.jpg"
  },
  {
    id: "slot-car-tune",
    title: "Slot Car Motor Tuning",
    description: "Get faster lap times by tuning your slot car motor, adjusting gear mesh, and optimizing tire grip.",
    category: "upgrades",
    vehicleType: "slotcars",
    difficulty: "beginner",
    duration: "30 min",
    savings: "$20-40",
    views: 2341,
    likes: 189,
    image: "/guides/slot-tune.jpg"
  }
];

const COMMUNITY_TIPS = [
  {
    author: "Mike R.",
    tip: "Always take photos before you start a repair. They're a lifesaver when you forget where something goes!",
    likes: 234
  },
  {
    author: "Sarah T.",
    tip: "Harbor Freight torque wrenches are surprisingly good for the price. Great for beginners building their toolkit.",
    likes: 187
  },
  {
    author: "Carlos M.",
    tip: "YouTube is your friend, but always cross-reference with a repair manual for torque specs and sequences.",
    likes: 156
  }
];

export default function ShadeTreeMechanics() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const filteredGuides = FEATURED_GUIDES.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || guide.category === selectedCategory;
    const matchesVehicle = !selectedVehicle || guide.vehicleType === selectedVehicle;
    return matchesSearch && matchesCategory && matchesVehicle;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-400 text-sm mb-6"
            >
              <Wrench className="w-4 h-4" />
              DIY Repair Community
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold text-white mb-6"
            >
              Shade Tree Mechanics
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                Fix It Yourself. Save Money.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8"
            >
              Free guides, tips, and a community of DIY enthusiasts who work on their own rides.
              No shop required - just your driveway and a little know-how.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guides... (e.g., 'oil change', 'brake pads')"
                  className="pl-12 h-14 bg-black/30 border-white/10 focus:border-primary/50 text-lg"
                  data-testid="input-search-guides"
                />
              </div>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { value: "500+", label: "Free Guides", icon: BookOpen },
              { value: "$50K+", label: "Saved by Users", icon: DollarSign },
              { value: "25K+", label: "Community Members", icon: Users },
              { value: "4.8★", label: "Average Rating", icon: Star }
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 glass-ultra rounded-xl">
                <stat.icon className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="divider-gradient" />

      {/* Filters */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id 
                    ? "glass-card-accent bg-orange-500 hover:bg-orange-600 text-black" 
                    : "glass-card border-zinc-700 text-zinc-400 hover:text-white"
                  }
                  data-testid={`filter-category-${cat.id}`}
                >
                  <cat.icon className="w-4 h-4 mr-1" />
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Vehicle Type Filter */}
            <div className="flex gap-2">
              {VEHICLE_TYPES.map((type) => (
                <Button
                  key={type.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVehicle(selectedVehicle === type.id ? null : type.id)}
                  className={selectedVehicle === type.id 
                    ? "glass-card-accent bg-amber-500/10 text-amber-400 border border-amber-500/30" 
                    : "glass-card text-zinc-500 hover:text-white"
                  }
                  data-testid={`filter-vehicle-${type.id}`}
                >
                  <type.icon className="w-4 h-4 mr-1" />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="divider-gradient" />

      {/* Guides Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">
              {selectedCategory === "all" ? "Popular Guides" : CATEGORIES.find(c => c.id === selectedCategory)?.label}
            </h2>
            <Link href="/diy-guides">
              <Button variant="ghost" className="text-orange-400 hover:text-orange-300">
                View All Guides
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {filteredGuides.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500">No guides found matching your filters.</p>
              <Button
                variant="ghost"
                className="mt-4 text-orange-400"
                onClick={() => { setSelectedCategory("all"); setSelectedVehicle(null); setSearchQuery(""); }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide, i) => {
                const difficulty = DIFFICULTY_LEVELS.find(d => d.id === guide.difficulty);
                return (
                  <motion.div
                    key={guide.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="glass-card card-3d hover:border-orange-500/30 transition-all overflow-hidden group cursor-pointer h-full">
                      {/* Image Placeholder */}
                      <div className="aspect-video bg-gradient-to-br from-orange-500/10 to-amber-500/10 flex items-center justify-center relative">
                        <Wrench className="w-12 h-12 text-orange-400/50" />
                        <div className="absolute top-3 left-3">
                          <Badge className={`${difficulty?.color} border`}>
                            {difficulty?.label}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Button variant="ghost" size="icon" className="w-8 h-8 bg-black/50 hover:bg-black/70">
                            <Bookmark className="w-4 h-4 text-white" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          {VEHICLE_TYPES.find(v => v.id === guide.vehicleType) && (
                            <span className="text-xs text-zinc-500 flex items-center gap-1">
                              {(() => {
                                const VIcon = VEHICLE_TYPES.find(v => v.id === guide.vehicleType)?.icon;
                                return VIcon ? <VIcon className="w-3 h-3" /> : null;
                              })()}
                              {VEHICLE_TYPES.find(v => v.id === guide.vehicleType)?.label}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                          {guide.title}
                        </h3>
                        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                          {guide.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {guide.duration}
                          </span>
                          <span className="flex items-center gap-1 text-green-400">
                            <DollarSign className="w-3 h-3" />
                            Save {guide.savings}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {guide.likes.toLocaleString()}
                            </span>
                            <span>{guide.views.toLocaleString()} views</span>
                          </div>
                          <Button size="sm" variant="ghost" className="text-orange-400 hover:text-orange-300">
                            Read Guide
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="divider-gradient" />

      {/* Community Tips */}
      <section className="py-12 px-4 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Community Tips</h2>
            <p className="text-zinc-400">Wisdom from fellow shade tree mechanics</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {COMMUNITY_TIPS.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 glass-card h-full">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{tip.author}</p>
                      <p className="text-xs text-zinc-500">Community Member</p>
                    </div>
                  </div>
                  <p className="text-zinc-300 italic mb-4">"{tip.tip}"</p>
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <ThumbsUp className="w-4 h-4" />
                    {tip.likes} found this helpful
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-gradient" />

      {/* Tool Recommendations */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 glass-card">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Hammer className="w-7 h-7 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Starter Tool Kit</h3>
                  <p className="text-zinc-400 mb-4">
                    New to DIY? Check out our recommended starter tool list - everything you need for basic maintenance without breaking the bank.
                  </p>
                  <Link href="/diy-guides">
                    <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                      View Recommendations
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            <Card className="p-8 glass-card">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Search className="w-7 h-7 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Find the Right Part</h3>
                  <p className="text-zinc-400 mb-4">
                    Search 50+ retailers at once. Compare prices, check availability, and get the best deal on quality parts.
                  </p>
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black">
                      Search Parts
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <div className="divider-gradient" />

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-t from-orange-500/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the <span className="text-orange-400">Shade Tree</span> Community
          </h2>
          <p className="text-zinc-400 mb-8">
            Create a free account to save guides, track your projects, and share your own tips with fellow DIYers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-bold px-8">
                <Users className="w-5 h-5 mr-2" />
                Join Free
              </Button>
            </Link>
            <Link href="/diy-guides">
              <Button size="lg" variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                <BookOpen className="w-5 h-5 mr-2" />
                Browse All Guides
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
