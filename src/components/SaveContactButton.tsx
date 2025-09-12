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
    avatar_url?: string;
  };
  userEmail: string;
}

export const SaveContactButton = ({ profile, userEmail }: SaveContactButtonProps) => {
  const { toast } = useToast();

  const imageToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove the data:image/...;base64, prefix
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return '';
    }
  };

  const saveContact = async () => {
    try {
      const displayName = profile.display_name || 'Contact';
      
      let photoData = '';
      if (profile.avatar_url && !profile.avatar_url.includes('placeholder.svg')) {
        photoData = await imageToBase64(profile.avatar_url);
      }
      
      // Create comprehensive vCard format with photo
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
${photoData ? `PHOTO;ENCODING=BASE64;TYPE=JPEG:${photoData}` : ''}
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
        description: `${displayName}'s contact with photo has been saved to your device`,
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