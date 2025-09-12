import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const defaultMessage = isInvite 
    ? `Hey! I'm using this amazing NFC ring called ping! that lets me share my contact info instantly just by tapping it on phones.

Check out my profile: ${window.location.origin}/ping/${userProfile?.user_id}

You should totally get one too! Use my referral link and we both get 1 month free:
${window.location.origin}/signup?ref=${userProfile?.user_id}

It's so much easier than typing out contact info every time!`
    : `Hey! Check out my ping! profile: ${window.location.origin}/ping/${userProfile?.user_id}

I just got this cool NFC ring that lets me share my contact info instantly. You should get one too! 

Get your free trial: ${window.location.origin}/signup`;

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
      // Simulate SMS sending (in real app, this would call an SMS API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Invite sent!",
        description: isInvite 
          ? `Your referral invitation has been sent to ${phoneNumber}. You'll both get 1 month free when they sign up!`
          : `Your ping! profile has been shared with ${phoneNumber}`,
      });
      
      onClose();
      setPhoneNumber("");
      setMessage(defaultMessage);
    } catch (error) {
      toast({
        title: "Failed to send",
        description: "There was an error sending your message. Please try again.",
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
              onClick={onClose}
              className="flex-1 border-border text-muted-foreground hover:bg-secondary/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendSMS}
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {isInvite ? "Send Invite" : "Send SMS"}
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