import { Link, useLocation } from "wouter";
import { Search, User, ShoppingCart, Wrench, ChevronLeft, X, Menu, LogIn, LogOut, Shield, FileText, Star, Store, Crown, Sparkles, Home, LayoutDashboard, Car, Settings, BadgeCheck, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { CartButton, MobileCartButton } from "@/components/CartDrawer";
import { useCart } from "@/hooks/useCart";
import { QRCodeSVG } from "qrcode.react";
import gbEmblem from "@assets/generated_images/gb_emblem_no_bg.png";
import buddyWaving from "@assets/mascot_transparent/robot_mascot_waving_hello.png";

interface Subscription {
  status: 'active' | 'inactive' | 'canceled';
  tier?: string;
  isFounder?: boolean;
}

interface Release {
  id: number;
  version: string;
  versionType: string;
  isPublished: boolean;
}

interface Hallmark {
  id: number;
  tokenId: string;
  entityType: string;
  blockchainSignature?: string;
  solanaSignature?: string;
}

interface UserHallmark {
  id: string;
  assetNumber: number;
  vehicleInfo?: {
    year: number;
    make: string;
    model: string;
  };
}

export default function Nav() {
  const [location] = useLocation();
  const isHome = location === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [showVerifiedDetails, setShowVerifiedDetails] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const { data: subscription } = useQuery<Subscription | null>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/subscription/status');
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: latestRelease } = useQuery<Release | null>({
    queryKey: ['latestRelease'],
    queryFn: async () => {
      const res = await fetch('/api/releases/latest');
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: appHallmark } = useQuery<Hallmark | null>({
    queryKey: ['appHallmark'],
    queryFn: async () => {
      const res = await fetch('/api/hallmarks/app');
      if (!res.ok) return null;
      const data = await res.json();
      return data.hallmark || null;
    },
  });

  const { data: userHallmark } = useQuery<UserHallmark | null>({
    queryKey: ['userHallmark'],
    queryFn: async () => {
      const res = await fetch('/api/hallmark');
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const isPro = subscription?.status === 'active';
  const isFounder = subscription?.isFounder === true || (user as any)?.isFounder === true;
  const isVerified = appHallmark?.solanaSignature || appHallmark?.blockchainSignature;

  return (
    <nav className="w-full h-16 border-b border-border/40 bg-background/80 backdrop-blur-md fixed top-0 z-50">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        {/* Left side: Logo and Title */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <div className="flex items-center gap-1 cursor-pointer group">
              <img 
                src={gbEmblem} 
                alt="GB" 
                className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] group-hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.9)] transition-all duration-300 group-hover:scale-105 -my-2"
              />
              <span className="font-tech font-bold text-sm md:text-base tracking-wide uppercase text-foreground">
                <span className="text-primary">G</span>arage<span className="text-primary">B</span>ot<span className="text-muted-foreground hidden sm:inline">.io</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Version and App Hallmark Badge */}
        <div className="flex items-center gap-2">
          {latestRelease && (
            <Badge 
              variant="outline" 
              className="bg-primary/10 border-primary/30 text-primary font-mono text-[10px] px-2 py-0.5"
              data-testid="badge-version"
            >
              v{latestRelease.version}
            </Badge>
          )}
          
          {/* App Official Hallmark Badge - Always Shows, Opens Popup */}
          <div className="relative">
            <button
              onClick={() => setShowVerifiedDetails(!showVerifiedDetails)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all cursor-pointer group hover:scale-105"
              data-testid="badge-app-hallmark"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              <span className="text-[10px] font-mono text-purple-400 font-bold hidden sm:inline">
                GB-000001
              </span>
              {isVerified && <BadgeCheck className="w-3 h-3 text-green-500" />}
            </button>
              
              {showVerifiedDetails && (
                <div 
                  className="fixed sm:absolute top-16 sm:top-full left-4 right-4 sm:left-auto sm:right-0 sm:mt-2 z-[100] w-auto sm:w-[420px] p-4 rounded-xl border-2 border-purple-500/40 max-h-[80vh] overflow-y-auto"
                  style={{
                    background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.9), 0 0 40px rgba(168,85,247,0.25)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-tech uppercase text-purple-400 flex items-center gap-2">
                      <Shield className="w-5 h-5" /> Genesis Hallmark
                    </span>
                    <button
                      onClick={() => setShowVerifiedDetails(false)}
                      className="text-muted-foreground hover:text-white p-1.5 rounded hover:bg-white/10"
                      data-testid="button-close-verified"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* QR Code with Buddy */}
                  <div className="flex items-end gap-4 mb-4">
                    <div className="relative flex-shrink-0 bg-white p-3 rounded-xl" style={{ boxShadow: '0 0 30px rgba(168,85,247,0.4)' }}>
                      <QRCodeSVG 
                        value="https://garagebot.io/verify/GB-000001"
                        size={120}
                        level="H"
                        includeMargin={false}
                        bgColor="#FFFFFF"
                        fgColor="#0d1117"
                      />
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full font-mono whitespace-nowrap">
                        GB-000001
                      </div>
                    </div>
                    <img 
                      src={buddyWaving} 
                      alt="Buddy" 
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain transform -scale-x-100"
                      style={{ filter: 'drop-shadow(0 0 10px rgba(6,182,212,0.5))' }}
                    />
                  </div>
                  
                  {/* Serial Number */}
                  <div className="bg-black/40 rounded-lg p-3 mb-3 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-500 uppercase font-mono">Serial Number</span>
                      <BadgeCheck className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-lg font-mono font-bold text-purple-400">GB-000001</p>
                    <p className="text-[10px] text-gray-500">GarageBot Application Genesis Certificate</p>
                  </div>
                  
                  {/* Blockchain Verification Details */}
                  <div className="bg-black/40 rounded-lg p-3 mb-3 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] text-green-400 uppercase font-mono font-bold">Blockchain Verified</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[9px] text-gray-500 block mb-0.5">Network</span>
                        <span className="text-xs text-gray-300 font-mono">Solana Mainnet</span>
                      </div>
                      {latestRelease && (
                        <div>
                          <span className="text-[9px] text-gray-500 block mb-0.5">Latest Version</span>
                          <span className="text-xs text-gray-300 font-mono">v{latestRelease.version}</span>
                        </div>
                      )}
                      {appHallmark?.solanaSignature && (
                        <div>
                          <span className="text-[9px] text-gray-500 block mb-0.5">Transaction Hash</span>
                          <p className="text-[10px] text-primary font-mono break-all leading-relaxed">
                            {appHallmark.solanaSignature}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
                    Scan the QR code to verify this is the authentic GarageBot application. This Genesis Hallmark is permanently recorded on the Solana blockchain.
                  </p>
                  
                  {appHallmark?.solanaSignature && (
                    <a
                      href={`https://solscan.io/tx/${appHallmark.solanaSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-xs text-primary hover:underline bg-primary/10 px-3 py-2.5 rounded-lg w-full font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Solscan
                    </a>
                  )}
                </div>
              )}
          </div>

          {/* User's Hallmark Badge */}
          {userHallmark && (
            <Link href="/hallmark">
              <div 
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors cursor-pointer group"
                data-testid="badge-user-hallmark"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400 group-hover:drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                <span className="text-[10px] font-mono text-purple-400 font-bold">
                  GB-{userHallmark.assetNumber.toString().padStart(6, '0')}
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Right side: Hamburger Menu */}
        <div className="flex items-center gap-2">
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-primary/10 hover:text-primary" data-testid="button-menu">
                <Menu className="w-6 h-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-card border-t-primary/20">
              <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-tech font-bold text-xl uppercase text-primary">Menu</span>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon"><X className="w-5 h-5" /></Button>
                  </DrawerClose>
                </div>
                
                {/* User Profile Section */}
                {isAuthenticated && user && (
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{user.firstName || 'User'}</p>
                        {isPro && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px] font-tech">
                            {isFounder ? 'FOUNDER' : 'PRO'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}
                
                {/* Desktop: Two Column Layout / Mobile: Single Column */}
                <div className="lg:grid lg:grid-cols-2 lg:gap-6">
                  {/* Column 1: Main Navigation */}
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider px-3 mb-2 block">Navigation</span>
                    
                    <Link href="/" onClick={() => setIsOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location === '/' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-white/5'}`} data-testid="menu-home">
                        <Home className="w-5 h-5" />
                        <span className="font-medium">Home</span>
                      </div>
                    </Link>
                    
                    <Link href="/garage" onClick={() => setIsOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location === '/garage' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-white/5'}`} data-testid="menu-garage">
                        <Car className="w-5 h-5" />
                        <span className="font-medium">My Garage</span>
                      </div>
                    </Link>
                    
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location === '/dashboard' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-white/5'}`} data-testid="menu-dashboard">
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                      </div>
                    </Link>
                    
                    <Link href="/guides" onClick={() => setIsOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location === '/guides' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-white/5'}`} data-testid="menu-guides">
                        <FileText className="w-5 h-5" />
                        <span className="font-medium">DIY Guides</span>
                      </div>
                    </Link>
                    
                    <Link href="/shop-portal" onClick={() => setIsOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location === '/shop-portal' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-white/5'}`} data-testid="menu-shop-portal">
                        <Store className="w-5 h-5" />
                        <span className="font-medium">Mechanics Garage</span>
                      </div>
                    </Link>
                  </div>
                  
                  {/* Column 2: Features & Services */}
                  <div className="space-y-1 mt-4 lg:mt-0">
                    <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider px-3 mb-2 block">Features</span>
                    
                    <Link href="/hallmark" onClick={() => setIsOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location === '/hallmark' ? 'bg-purple-500/10 text-purple-400' : 'text-foreground hover:bg-purple-500/5'}`} data-testid="menu-hallmark">
                        <Shield className="w-5 h-5 text-purple-400" />
                        <span className="font-medium">View Hallmark</span>
                        {userHallmark && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[9px] font-mono ml-auto">
                            GB-{userHallmark.assetNumber.toString().padStart(6, '0')}
                          </Badge>
                        )}
                        {!userHallmark && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[9px] font-mono ml-auto">NFT</Badge>
                        )}
                      </div>
                    </Link>
                    
                    <Link href="/insurance" onClick={() => setIsOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location === '/insurance' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-white/5'}`} data-testid="menu-insurance">
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">Insurance</span>
                      </div>
                    </Link>
                    
                    <Link href="/invite" onClick={() => setIsOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location === '/invite' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-white/5'}`} data-testid="menu-invite">
                        <User className="w-5 h-5" />
                        <span className="font-medium">Invite Friends</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px] font-mono ml-auto">+100 pts</Badge>
                      </div>
                    </Link>
                    
                    <Link href="/account" onClick={() => setIsOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location === '/account' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-white/5'}`} data-testid="menu-account">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Account Settings</span>
                      </div>
                    </Link>
                    
                    {/* Coming Soon Items */}
                    <div className="pt-2 mt-2 border-t border-white/10">
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider px-3 mb-1 block">Coming Soon</span>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground/50" data-testid="menu-services">
                        <Wrench className="w-4 h-4" />
                        <span className="text-sm">Services</span>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[8px] font-mono ml-auto">SOON</Badge>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground/50" data-testid="menu-ratings">
                        <Star className="w-4 h-4" />
                        <span className="text-sm">Ratings</span>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[8px] font-mono ml-auto">SOON</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Pro Section */}
                <div className="pt-2">
                  {isPro ? (
                    <div className="py-3 px-4 rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      <span className="text-lg font-tech uppercase text-yellow-500">
                        {isFounder ? 'Founders Circle' : 'Pro Member'}
                      </span>
                      {isFounder && <Sparkles className="w-4 h-4 text-yellow-400" />}
                    </div>
                  ) : (
                    <Link href="/pro" onClick={() => setIsOpen(false)}>
                      <div className="py-3 px-4 rounded-lg bg-gradient-to-r from-primary/20 to-yellow-500/20 border border-primary/30 flex items-center justify-between hover:from-primary/30 hover:to-yellow-500/30 transition-colors">
                        <span className="flex items-center gap-2 font-medium">
                          <Crown className="w-5 h-5 text-yellow-500" /> Join Founders Circle
                        </span>
                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-[9px] font-mono">$4.99/mo</Badge>
                      </div>
                    </Link>
                  )}
                </div>
                
                {/* Cart and Auth Section */}
                <div className="pt-4 flex flex-col gap-3 border-t border-white/10">
                  <MobileCartButton />
                  {isAuthenticated ? (
                    <Button variant="outline" className="w-full gap-2 font-tech uppercase border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={() => { setIsOpen(false); logout(); }}>
                      <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                  ) : (
                    <Link href="/auth" onClick={() => setIsOpen(false)} className="w-full">
                      <Button variant="outline" className="w-full gap-2 font-tech uppercase border-primary/50 hover:bg-primary/10">
                        <LogIn className="w-4 h-4" /> Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  );
}
