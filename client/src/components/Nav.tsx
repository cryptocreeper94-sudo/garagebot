import { Link, useLocation } from "wouter";
import { Search, User, ShoppingCart, Wrench, ChevronLeft, X, Menu, LogIn, LogOut, Shield, FileText, Star, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CartButton, MobileCartButton } from "@/components/CartDrawer";
import { useCart } from "@/hooks/useCart";

export default function Nav() {
  const [location] = useLocation();
  const isHome = location === "/";
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <nav className="w-full h-16 border-b border-border/40 bg-background/80 backdrop-blur-md fixed top-0 z-50">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {!isHome && (
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-2 hover:bg-primary/10 text-muted-foreground hover:text-primary">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
          )}
          
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 bg-primary/10 border border-primary/50 rounded-sm flex items-center justify-center transform group-hover:rotate-180 transition-transform duration-700">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <span className="font-tech font-bold text-xl md:text-2xl tracking-wide uppercase text-foreground">
                Garage<span className="text-primary">Bot</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/garage">
            <span className={`text-sm font-medium transition-colors cursor-pointer ${location === '/garage' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`} data-testid="nav-garage">My Garage</span>
          </Link>
          <Link href="/dashboard">
            <span className={`text-sm font-medium transition-colors cursor-pointer ${location === '/dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`} data-testid="nav-dashboard">Dashboard</span>
          </Link>
          <Link href="/shop-portal">
            <span className={`text-sm font-medium transition-colors cursor-pointer ${location === '/shop-portal' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`} data-testid="nav-shop-portal">Shop Portal</span>
          </Link>
          <Link href="/insurance">
            <span className={`text-sm font-medium transition-colors cursor-pointer ${location === '/insurance' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`} data-testid="nav-insurance">Insurance</span>
          </Link>
          <span className="text-sm font-medium text-muted-foreground/50 cursor-not-allowed flex items-center gap-1" data-testid="nav-services">
            Services
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[8px] px-1 py-0 font-mono">SOON</Badge>
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="icon" className="hover:text-primary hidden md:flex">
            <Search className="w-5 h-5" />
          </Button>
          
          {isAuthenticated ? (
            <>
              <Link href="/account">
                <Button variant="ghost" size="icon" className={`hover:text-primary hidden md:flex ${location === '/account' ? 'text-primary bg-primary/10' : ''}`}>
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="hover:text-red-400 hidden md:flex" title="Log out" onClick={logout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button variant="outline" className="hidden md:flex gap-2 border-primary/50 hover:bg-primary/10 hover:text-primary hover:border-primary font-tech">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </Link>
          )}
          
          <div className="hidden md:block">
            <CartButton />
          </div>
          
          {/* Mobile Hamburger Menu */}
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-foreground hover:bg-primary/10">
                <Menu className="w-6 h-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-card border-t-primary/20">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                   <span className="font-tech font-bold text-xl uppercase">Menu</span>
                   <DrawerClose asChild>
                     <Button variant="ghost" size="icon"><X className="w-5 h-5" /></Button>
                   </DrawerClose>
                </div>
                
                {isAuthenticated && user && (
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{user.firstName || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4 flex flex-col">
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    <span className="text-lg font-medium text-foreground py-2 border-b border-white/5 block" data-testid="mobile-nav-home">Home</span>
                  </Link>
                  <Link href="/garage" onClick={() => setIsOpen(false)}>
                    <span className="text-lg font-medium text-foreground py-2 border-b border-white/5 block" data-testid="mobile-nav-garage">My Garage</span>
                  </Link>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <span className="text-lg font-medium text-foreground py-2 border-b border-white/5 block" data-testid="mobile-nav-dashboard">Dashboard</span>
                  </Link>
                  <Link href="/shop-portal" onClick={() => setIsOpen(false)}>
                    <span className="text-lg font-medium text-foreground py-2 border-b border-white/5 flex items-center gap-2" data-testid="mobile-nav-shop-portal">
                      <Store className="w-4 h-4" /> Shop Portal
                    </span>
                  </Link>
                  <Link href="/account" onClick={() => setIsOpen(false)}>
                    <span className="text-lg font-medium text-foreground py-2 border-b border-white/5 block" data-testid="mobile-nav-account">Account</span>
                  </Link>
                  
                  {/* Coming Soon Features */}
                  <div className="pt-2 pb-2">
                    <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Coming Soon</span>
                  </div>
                  <span className="text-lg font-medium text-muted-foreground/50 py-2 border-b border-white/5 flex items-center justify-between" data-testid="mobile-nav-services">
                    <span className="flex items-center gap-2"><Wrench className="w-4 h-4" /> Services</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">SOON</Badge>
                  </span>
                  <Link href="/insurance" onClick={() => setIsOpen(false)}>
                    <span className="text-lg font-medium text-foreground py-2 border-b border-white/5 flex items-center gap-2" data-testid="mobile-nav-insurance">
                      <Shield className="w-4 h-4" /> Insurance
                    </span>
                  </Link>
                  <span className="text-lg font-medium text-muted-foreground/50 py-2 border-b border-white/5 flex items-center justify-between" data-testid="mobile-nav-ratings">
                    <span className="flex items-center gap-2"><Star className="w-4 h-4" /> Ratings</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">SOON</Badge>
                  </span>
                  <span className="text-lg font-medium text-muted-foreground/50 py-2 border-b border-white/5 flex items-center justify-between" data-testid="mobile-nav-hallmark">
                    <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Genesis Hallmark</span>
                    <Badge className="bg-secondary/20 text-secondary border-secondary/30 text-[9px] font-mono">NFT</Badge>
                  </span>
                  <div className="pt-4 flex flex-col gap-3">
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
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  );
}
