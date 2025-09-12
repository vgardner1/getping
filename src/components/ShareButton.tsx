import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { getPublicProfileUrl, isProduction } from "@/lib/environment";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  userId: string;
  label?: string;
  className?: string;
}

export function ShareButton({ userId, label = "Share Profile", className }: ShareButtonProps) {
  const handleShare = useCallback(async () => {
    const shareUrl = getPublicProfileUrl(userId);

    try {
      // Debug logs to validate generation
      // eslint-disable-next-line no-console
      console.log("Current URL:", window.location.href);
      // eslint-disable-next-line no-console
      console.log("Generated Share URL:", shareUrl);
      // eslint-disable-next-line no-console
      console.log("Is Production?:", isProduction());

      if (navigator.share) {
        await navigator.share({ title: "My Ping Profile", url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied", description: "Public profile URL copied to clipboard." });
      }
    } catch (err) {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied", description: "Public profile URL copied to clipboard." });
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
