import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Send, MessageSquare, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getShareableUrl } from "@/lib/environment";
import { supabase } from "@/integrations/supabase/client";
import { generateReferralMessage } from "@/utils/referralMessage";

interface SMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  isInvite?: boolean;
}

const SMSModal = ({ isOpen, onClose, userProfile, isInvite = false }: SMSModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const profileUrl = getShareableUrl(`/ping/${userProfile?.user_id}`);
  const signupUrl = isInvite
    ? getShareableUrl(`/signup?ref=${userProfile?.user_id}`)
    : getShareableUrl(`/signup`);

  const defaultMessage = isInvite 
    ? generateReferralMessage({ userId: userProfile?.user_id, isOnboarded: true })
    : `Hey! Check out my ping! profile: ${profileUrl}

I just got this cool NFC ring that lets me share my contact info instantly. You should get one too! 

Get your free trial: ${signupUrl}`;

  useEffect(() => {
    if (isOpen) {
      setMessage(defaultMessage);
    }
  }, [isOpen, defaultMessage]);

  const handleSendSMS = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number to send the message.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create iMessage URL with pre-filled content
      const encodedMessage = encodeURIComponent(message);
      const iMessageUrl = `sms:${phoneNumber}&body=${encodedMessage}`;
      
      // Open iMessage/SMS app
      window.open(iMessageUrl, '_self');
      
      // For referral tracking, the signup URL includes the ref parameter
      // which will be handled when the user signs up
      
      toast({
        title: "Opening Messages",
        description: isInvite 
          ? `Opening your messages app to send the referral invitation. You'll both get 1 month free when they sign up!`
          : `Opening your messages app to share your ping! profile`,
      });
      
      onClose();
      setPhoneNumber("");
      setMessage(defaultMessage);
    } catch (error) {
      toast({
        title: "Failed to open messages",
        description: "Unable to open your messages app. Please copy the message and send it manually.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 iridescent-text">
            <MessageSquare className="w-5 h-5 text-primary" />
            {isInvite ? "Invite a Friend" : "Share via SMS"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium iridescent-text mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-secondary/20 border-border focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium iridescent-text mb-2">
              Message
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={isInvite ? 8 : 6}
              className="bg-secondary/20 border-border focus:ring-primary resize-none"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(message);
                toast({
                  title: "Copied!",
                  description: "Message copied to clipboard",
                });
              }}
              className="flex-1 border-border text-muted-foreground hover:bg-secondary/20"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={handleSendSMS}
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  Opening...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Open Messages
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SMSModal;