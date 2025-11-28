import { type ReactNode, useState } from "react";
import { Lock, Clock, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ComingSoonBadgeProps {
  variant?: "badge" | "inline" | "pill";
  showNotify?: boolean;
}

export function ComingSoonBadge({ variant = "badge", showNotify = false }: ComingSoonBadgeProps) {
  if (variant === "pill") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[9px] font-mono uppercase">
        <Clock className="w-2.5 h-2.5" />
        Coming Soon
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-1 text-yellow-400 text-xs font-mono">
        <Lock className="w-3 h-3" />
        <span>COMING SOON</span>
      </span>
    );
  }

  return (
    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] font-mono uppercase">
      <Lock className="w-3 h-3 mr-1" />
      Coming Soon
    </Badge>
  );
}

interface ComingSoonCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  features?: string[];
  expectedDate?: string;
}

export function ComingSoonCard({ title, description, icon, features, expectedDate }: ComingSoonCardProps) {
  const [notified, setNotified] = useState(false);
  const { toast } = useToast();

  const handleNotify = () => {
    setNotified(true);
    toast({
      title: "You're on the list!",
      description: `We'll notify you when ${title} launches.`,
    });
  };

  return (
    <Card className="relative overflow-hidden bg-card/30 border-white/10 backdrop-blur-md p-6 group">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-3 right-3">
        <ComingSoonBadge />
      </div>
      
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        
        <h3 className="font-tech font-bold text-xl uppercase mb-2 flex items-center gap-2">
          <Lock className="w-4 h-4 text-yellow-400" />
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        {features && features.length > 0 && (
          <ul className="space-y-1 mb-4">
            {features.map((feature, idx) => (
              <li key={idx} className="text-xs text-muted-foreground/80 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-yellow-400/50" />
                {feature}
              </li>
            ))}
          </ul>
        )}
        
        {expectedDate && (
          <p className="text-[10px] font-mono text-yellow-400/60 mb-4">
            Expected: {expectedDate}
          </p>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className={`w-full font-mono uppercase text-xs ${
            notified 
              ? "border-green-500/30 text-green-400 bg-green-500/10" 
              : "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          }`}
          onClick={handleNotify}
          disabled={notified}
          data-testid={`button-notify-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Bell className="w-3 h-3 mr-2" />
          {notified ? "You'll Be Notified" : "Notify Me When Live"}
        </Button>
      </div>
    </Card>
  );
}

interface ComingSoonOverlayProps {
  children: ReactNode;
  featureName: string;
}

export function ComingSoonOverlay({ children, featureName }: ComingSoonOverlayProps) {
  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none select-none blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-lg">
        <div className="text-center p-4">
          <Lock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="font-tech font-bold uppercase text-sm">{featureName}</p>
          <ComingSoonBadge variant="pill" />
        </div>
      </div>
    </div>
  );
}
