import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SaveContactButtonProps {
  profile: {
    display_name?: string;
    phone_number?: string;
    user_id: string;
    bio?: string;
    company?: string;
    job_title?: string;
    website_url?: string;
    location?: string;
  };
  userEmail: string;
}

export const SaveContactButton = ({ profile, userEmail }: SaveContactButtonProps) => {
  const { toast } = useToast();

  const saveContact = () => {
    try {
      const displayName = (profile.display_name?.toLowerCase() === 'vgardner') ? 'Vaness Gardner' : (profile.display_name || 'Contact');
      
      // Create comprehensive vCard format
      const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${displayName}
${profile.job_title ? `TITLE:${profile.job_title}` : ''}
${profile.company ? `ORG:${profile.company}` : ''}
EMAIL:${userEmail}
${profile.phone_number ? `TEL:${profile.phone_number}` : ''}
${profile.website_url ? `URL:${profile.website_url}` : ''}
${profile.location ? `ADR:;;;;;;${profile.location}` : ''}
${profile.bio ? `NOTE:${profile.bio}` : ''}
END:VCARD`;

      // Create blob and download
      const blob = new Blob([vCard], { type: 'text/vcard' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${displayName.replace(/\s+/g, '_')}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Contact Saved",
        description: `${displayName}'s contact has been saved to your device`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save contact. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button 
      onClick={saveContact}
      variant="ghost"
      className="bg-transparent border-none text-primary hover:bg-transparent hover:text-primary/80 text-sm font-medium"
    >
      <Download className="w-4 h-4 mr-2" />
      Save Contact
    </Button>
  );
};