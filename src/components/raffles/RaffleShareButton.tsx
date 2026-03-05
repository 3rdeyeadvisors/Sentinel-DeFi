import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface RaffleShareButtonProps {
  userId?: string;
}

const RaffleShareButton = ({ userId }: RaffleShareButtonProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!userId) return null;

  const referralUrl = `${window.location.origin}/auth?ref=${userId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Share this link to earn bonus raffle entries when someone signs up.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Sentinel DeFi Learn-to-Earn Raffle",
          text: "Learn about DeFi and earn raffle entries for crypto prizes!",
          url: referralUrl,
        });
      } catch (error) {
        // User cancelled or share failed
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Share2 className="w-4 h-4 mr-2" />
          Get Bonus Entries via Referrals
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share & Earn Bonus Entries</DialogTitle>
          <DialogDescription>
            Share your unique referral link. When someone signs up using your link, you'll automatically earn an extra raffle entry!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={referralUrl} 
              readOnly 
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          {navigator.share && (
            <Button onClick={handleShare} className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Share via...
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RaffleShareButton;
