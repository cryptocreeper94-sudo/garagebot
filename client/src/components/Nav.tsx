import { Link, useLocation } from "wouter";
import { Search, User, ShoppingCart, Wrench, ChevronLeft, X, Menu, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Nav() {
  const [location] = useLocation();
  const isHome = location === "/";
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

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
                Auto<span className="text-primary">Ledger</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/garage">
            <span className={`text-sm font-medium transition-colors cursor-pointer ${location === '/garage' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>My Garage</span>
          </Link>
          <Link href="/dashboard">
            <span className={`text-sm font-medium transition-colors cursor-pointer ${location === '/dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>Dashboard</span>
          </Link>
          <Link href="/dashboard">
            <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">Track Order</span>
          </Link>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Support</a>
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
              <a href="/api/logout">
                <Button variant="ghost" size="icon" className="hover:text-red-400 hidden md:flex" title="Log out">
                  <LogOut className="w-5 h-5" />
                </Button>
              </a>
            </>
          ) : (
            <a href="/api/login">
              <Button variant="outline" className="hidden md:flex gap-2 border-primary/50 hover:bg-primary/10 hover:text-primary hover:border-primary font-tech">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </a>
          )}
          
          <Button variant="outline" className="hidden md:flex gap-2 border-primary/50 hover:bg-primary/10 hover:text-primary hover:border-primary">
            <ShoppingCart className="w-4 h-4" />
            <span className="font-tech">Cart (0)</span>
          </Button>
          
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
                    <span className="text-lg font-medium text-foreground py-2 border-b border-white/5 block">Home</span>
                  </Link>
                  <Link href="/garage" onClick={() => setIsOpen(false)}>
                    <span className="text-lg font-medium text-foreground py-2 border-b border-white/5 block">My Garage</span>
                  </Link>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <span className="text-lg font-medium text-foreground py-2 border-b border-white/5 block">Dashboard</span>
                  </Link>
                  <Link href="/account" onClick={() => setIsOpen(false)}>
                    <span className="text-lg font-medium text-foreground py-2 border-b border-white/5 block">Account</span>
                  </Link>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                     <span className="text-lg font-medium text-foreground py-2 border-b border-white/5 block">Track Order</span>
                  </Link>
                  <div className="pt-4 flex flex-col gap-3">
                    <Button className="w-full gap-2 font-tech uppercase">
                      <ShoppingCart className="w-4 h-4" /> Cart (0)
                    </Button>
                    {isAuthenticated ? (
                      <a href="/api/logout" className="w-full">
                        <Button variant="outline" className="w-full gap-2 font-tech uppercase border-red-500/50 text-red-400 hover:bg-red-500/10">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </Button>
                      </a>
                    ) : (
                      <a href="/api/login" className="w-full">
                        <Button variant="outline" className="w-full gap-2 font-tech uppercase border-primary/50 hover:bg-primary/10">
                          <LogIn className="w-4 h-4" /> Sign In
                        </Button>
                      </a>
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
