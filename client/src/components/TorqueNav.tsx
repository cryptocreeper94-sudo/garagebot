import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, Wrench, LayoutDashboard, ClipboardList, Calendar, Users, Package, Settings, CreditCard, BarChart3, LogOut, ChevronRight, ExternalLink, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import torqueEmblem from "/torque-icon-192.png";

export default function TorqueNav() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/torque/app", icon: LayoutDashboard },
    { label: "Repair Orders", href: "/torque/app?tab=orders", icon: ClipboardList },
    { label: "Scheduling", href: "/torque/app?tab=schedule", icon: Calendar },
    { label: "Customers", href: "/torque/app?tab=customers", icon: Users },
    { label: "Inventory", href: "/torque/app?tab=inventory", icon: Package },
    { label: "Payments", href: "/torque/app?tab=payments", icon: CreditCard },
    { label: "Reports", href: "/torque/app?tab=reports", icon: BarChart3 },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-[#0a0e1a]/95 backdrop-blur-xl" data-testid="torque-nav">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/torque" className="flex items-center gap-3 group" data-testid="torque-nav-logo">
            <img src={torqueEmblem} alt="TORQUE" className="w-9 h-9 rounded-lg" />
            <div className="flex flex-col">
              <span className="font-tech font-bold text-lg uppercase tracking-wider text-white group-hover:text-primary transition-colors leading-tight">TORQUE</span>
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest leading-tight">Shop Management OS</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 5).map((item) => (
              <Link key={item.label} href={item.href}>
                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    location === item.href
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  data-testid={`torque-nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <Link href="/torque/app?tab=settings">
                <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" data-testid="torque-nav-settings">
                  <Settings className="w-4 h-4" />
                </button>
              </Link>
              {user && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{(user.firstName || user.username)?.charAt(0)?.toUpperCase() || "T"}</span>
                  </div>
                  <span className="text-xs font-medium text-foreground max-w-[100px] truncate">{user.firstName || user.username || "Shop Owner"}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              data-testid="torque-nav-mobile-toggle"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-primary/10 bg-[#0a0e1a]/98 backdrop-blur-xl" data-testid="torque-nav-mobile-menu">
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)}>
                  <div
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      location === item.href
                        ? "bg-primary/15 text-primary"
                        : "text-foreground hover:bg-white/5"
                    }`}
                    data-testid={`torque-nav-mobile-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}

              <div className="pt-3 mt-3 border-t border-white/10 space-y-1">
                <Link href="/torque/app?tab=settings" onClick={() => setMobileOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-white/5 transition-colors">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                  </div>
                </Link>

                <a href="/" className="block">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-white/5 transition-colors">
                    <ExternalLink className="w-5 h-5" />
                    <span className="font-medium">Back to GarageBot</span>
                  </div>
                </a>

                {user && (
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    data-testid="torque-nav-logout"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                )}
              </div>

              <div className="pt-3 mt-2 border-t border-white/10">
                <div className="flex items-center gap-2 px-4 py-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Powered by Trust Layer</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
