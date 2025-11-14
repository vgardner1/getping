import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ContactRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUserId: string;
  profileName?: string;
}

export const ContactRequestModal = ({ 
  isOpen, 
  onClose, 
  profileUserId,
  profileName 
}: ContactRequestModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate at least one contact method
    if (!formData.email && !formData.phone) {
      toast({
        title: "Contact info required",
        description: "Please provide either an email or phone number",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("profile_contact_requests")
        .insert({
          profile_user_id: profileUserId,
          visitor_name: formData.name,
          visitor_email: formData.email || null,
          visitor_phone: formData.phone || null,
          message: formData.message || null
        });

      if (error) throw error;

      toast({
        title: "Contact info sent! 🎉",
        description: `${profileName || "They"} will be notified of your interest to connect`,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: ""
      });

      onClose();
    } catch (error) {
      console.error("Error submitting contact request:", error);
      toast({
        title: "Failed to send",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Contact Info</DialogTitle>
          <DialogDescription>
            {profileName ? `Let ${profileName} know` : "Let them know"} how to reach you
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Great meeting you at..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            * Provide at least email or phone number
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Skip
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Contact"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
