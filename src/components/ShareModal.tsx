import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share2, Copy, MessageSquare, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPublicProfileUrl } from "@/lib/environment";
import { generateReferralMessage } from "@/utils/referralMessage";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  displayName: string;
}

const ShareModal = ({ isOpen, onClose, userId, displayName }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const shareUrl = getPublicProfileUrl(userId);
  const firstName = displayName.split(' ')[0] || 'User';
  const referralMessage = generateReferralMessage({ userId, isOnboarded: true });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied!",
        description: "Profile URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out my smart ring!",
          text: referralMessage
        });
      } catch (error) {
        // User cancelled share or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      handleCopyLink();
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: "💬",
      color: "bg-green-500 hover:bg-green-600",
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(referralMessage)}`, '_blank');
      }
    },
    {
      name: "Instagram",
      icon: "📷",
      color: "bg-pink-500 hover:bg-pink-600", 
      action: () => {
        // Instagram doesn't support direct link sharing, so copy to clipboard
        handleCopyLink();
        toast({
          title: "Link copied for Instagram",
          description: "Paste this link in your Instagram story or bio",
        });
      }
    },
    {
      name: "Snapchat",
      icon: "👻",
      color: "bg-yellow-400 hover:bg-yellow-500",
      action: () => {
        // Snapchat doesn't support direct link sharing, so copy to clipboard
        handleCopyLink();
        toast({
          title: "Link copied for Snapchat", 
          description: "Paste this link in your Snapchat story or message",
        });
      }
    },
    {
      name: "SMS",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => {
        window.open(`sms:?body=${encodeURIComponent(referralMessage)}`, '_blank');
      }
    },
    {
      name: "Email",
      icon: <Mail className="w-5 h-5" />,
      color: "bg-gray-600 hover:bg-gray-700",
      action: () => {
        const subject = "Check out my smart ring!";
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(referralMessage)}`, '_blank');
      }
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 iridescent-text">
            <Share2 className="w-5 h-5 text-primary" />
            Share {firstName}'s Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* URL Display and Copy */}
          <div>
            <label className="block text-sm font-medium iridescent-text mb-2">
              Profile URL
            </label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="bg-secondary/20 border-border focus:ring-primary flex-1"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-500 mt-1">✓ Copied to clipboard</p>
            )}
          </div>

          {/* Native Share Button */}
          {navigator.share && (
            <Button
              onClick={handleNativeShare}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share via Device
            </Button>
          )}

          {/* Share Options Grid */}
          <div>
            <p className="text-sm font-medium iridescent-text mb-3">Share via:</p>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => (
                <Button
                  key={option.name}
                  onClick={option.action}
                  variant="outline"
                  className={`${option.color} text-white border-0 flex items-center gap-2 p-3 h-auto`}
                >
                  {typeof option.icon === 'string' ? (
                    <span className="text-lg">{option.icon}</span>
                  ) : (
                    option.icon
                  )}
                  <span className="text-sm font-medium">{option.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-border text-muted-foreground hover:bg-secondary/20"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;