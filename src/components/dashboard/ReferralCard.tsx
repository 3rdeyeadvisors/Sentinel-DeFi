import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Users, Copy, Check, Gift, Share2, FileText, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ReferredUsersList } from "./ReferredUsersList";

interface ReferralStats {
  totalReferrals: number;
}

export const ReferralCard = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats>({ 
    totalReferrals: 0
  });
  const [loading, setLoading] = useState(true);
  const [showReferrals, setShowReferrals] = useState(false);

  const referralLink = user ? `${window.location.origin}/auth?ref=${user.id}&tab=signup` : "";

  useEffect(() => {
    if (user) {
      loadReferralStats();
    }
  }, [user]);

  const loadReferralStats = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Count referrals where current user is the referrer
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', user.id);

      if (error) throw error;

      setStats({ totalReferrals: referrals?.length || 0 });
    } catch (error) {
      console.error('Error loading referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Sentinel DeFi",
          text: "Join me on Sentinel DeFi and start your journey into decentralized finance education!",
          url: referralLink,
        });
      } catch (error) {
        // User cancelled share, not an error
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  if (!user) return null;

  return (
    <>
      <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Gift className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Invite Friends & Grow the Community</h3>
                <p className="text-sm text-white/50">
                  Share your link and help others start their DeFi journey.
                </p>
              </div>
            </div>
          </div>

          {/* Stats badges */}
          {!loading && stats.totalReferrals > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {stats.totalReferrals} Friend{stats.totalReferrals !== 1 ? 's' : ''} Invited
              </Badge>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Input
                value={referralLink}
                readOnly
                className="pr-10 bg-black/50 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="default"
                onClick={copyToClipboard}
                className="flex-1 sm:flex-none"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-awareness" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                onClick={shareLink}
                className="flex-1 sm:flex-none"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Expandable Referrals List */}
          {stats.totalReferrals > 0 && (
            <Collapsible open={showReferrals} onOpenChange={setShowReferrals}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between text-sm text-white/50 hover:text-foreground">
                  <span>View Your Referrals ({stats.totalReferrals})</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showReferrals ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 border-t border-white/8 mt-2">
                <ReferredUsersList />
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Direct link to terms if needed or remove if gone */}
          <div className="flex items-center justify-between text-xs text-white/50 border-t border-white/8 pt-3">
             <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Help us grow our community of DeFi researchers.
              </span>
          </div>
        </div>
      </Card>
    </>
  );
};
