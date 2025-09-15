import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { getPublicProfileUrl, isProduction } from "@/lib/environment";
import { cn } from "@/lib/utils";
import { generateReferralMessage } from "@/utils/referralMessage";

interface ShareButtonProps {
  userId: string;
  label?: string;
  className?: string;
}

export function ShareButton({ userId, label = "Share Profile", className }: ShareButtonProps) {
  const handleShare = useCallback(async () => {
    const referralMessage = generateReferralMessage({ userId, isOnboarded: true });

    try {
      if (navigator.share) {
        await navigator.share({ 
          title: "Check out my smart ring!", 
          text: referralMessage 
        });
      } else {
        await navigator.clipboard.writeText(referralMessage);
        toast({ title: "Message copied", description: "Referral message copied to clipboard." });
      }
    } catch (err) {
      await navigator.clipboard.writeText(referralMessage);
      toast({ title: "Message copied", description: "Referral message copied to clipboard." });
    }
  }, [userId]);

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      className={cn("border-primary text-primary hover:bg-primary/10", className)}
      aria-label={label}
    >
      <Share2 className="w-4 h-4 mr-2" /> {label}
    </Button>
  );
}
