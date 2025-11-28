import { useState } from "react";
import { Share2, Copy, Mail, MessageCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  partName: string;
  vendorName: string;
  searchUrl: string;
  className?: string;
}

export default function ShareButton({ partName, vendorName, searchUrl, className = "" }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareMessage = `Check out this part I found: ${partName} at ${vendorName}`;
  const fullMessage = `${shareMessage}\n\n${searchUrl}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Part from GarageBot: ${partName}`,
          text: shareMessage,
          url: searchUrl,
        });
        setIsOpen(false);
        toast({
          title: "Shared!",
          description: "Part link sent successfully",
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard - paste it anywhere",
      });
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Copy failed:', err);
      toast({
        title: "Couldn't copy",
        description: "Try selecting and copying manually",
        variant: "destructive",
      });
    }
  };

  const handleTextMessage = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(fullMessage)}`;
    window.open(smsUrl, '_blank');
    setIsOpen(false);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Part I found for you: ${partName}`);
    const body = encodeURIComponent(`Hey!\n\nI found this part for you on GarageBot:\n\n${partName}\nat ${vendorName}\n\nCheck it out here:\n${searchUrl}\n\n- Sent via GarageBot`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    setIsOpen(false);
  };

  const supportsNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10 ${className}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          data-testid="button-share"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-56 p-2 bg-card border-primary/20" 
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <div className="px-2 py-1.5 mb-2">
            <p className="text-xs font-tech text-primary uppercase tracking-wide">Share This Part</p>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{partName}</p>
          </div>

          {supportsNativeShare && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-9 text-sm hover:bg-primary/10 hover:text-primary"
              onClick={handleNativeShare}
              data-testid="share-native"
            >
              <Share2 className="w-4 h-4" />
              Share...
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-9 text-sm hover:bg-primary/10 hover:text-primary"
            onClick={handleCopyLink}
            data-testid="share-copy"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-9 text-sm hover:bg-primary/10 hover:text-primary"
            onClick={handleTextMessage}
            data-testid="share-text"
          >
            <MessageCircle className="w-4 h-4" />
            Text Message
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-9 text-sm hover:bg-primary/10 hover:text-primary"
            onClick={handleEmail}
            data-testid="share-email"
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
