import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SaveContactButtonProps {
  profile: {
    display_name?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    social_links?: any;
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
      const toTitleCase = (s: string) =>
        (s || '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

      // Get display name directly - this is what we'll use for the contact
      const displayName = (profile.display_name || profile.full_name || '').trim();
      
      if (!displayName) {
        toast({
          title: 'Missing name',
          description: 'Please set your name in your profile before saving the contact.',
          variant: 'destructive',
        });
        return;
      }

      // Split display name into parts for vCard format
      const nameParts = displayName.split(/\s+/).filter(Boolean);
      let firstName = nameParts[0] || '';
      let lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      let middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

      // Title case
      firstName = toTitleCase(firstName);
      if (middleName) middleName = toTitleCase(middleName);
      if (lastName) lastName = toTitleCase(lastName);

      const personName = displayName;
      const contactFileName = `contact_name_-_${personName.replace(/\s+/g, '_')}`;
      
      let photoData = '';
      if (profile.avatar_url && !profile.avatar_url.includes('placeholder.svg')) {
        photoData = await imageToBase64(profile.avatar_url);
      }

      // Determine phone from profile or social links
      const rawPhone = profile.phone_number 
        || (typeof (profile as any).social_links?.phone === 'string' ? (profile as any).social_links.phone : (profile as any).social_links?.phone?.url) 
        || '';
      const phone = String(rawPhone).trim();

      // Create comprehensive vCard format with proper person fields
      const esc = (val: string) =>
        (val ?? '')
          .replace(/\\/g, '\\\\')
          .replace(/\n/g, '\\n')
          .replace(/,/g, '\\,')
          .replace(/;/g, '\\;');

      // Build vCard lines and join with CRLF as per spec
      const vCard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${esc(lastName)};${esc(firstName)};${esc(middleName)};;`,
        `FN:${esc(personName)}`,
        'X-ABShowAs:PERSON',
        profile.job_title ? `TITLE:${esc(profile.job_title)}` : '',
        profile.company ? `ORG:${esc(profile.company)}` : '',
        userEmail ? `EMAIL;TYPE=INTERNET:${esc(userEmail)}` : '',
        phone ? `TEL;TYPE=CELL:${esc(phone)}` : '',
        profile.website_url ? `URL:${esc(profile.website_url)}` : '',
        profile.location ? `ADR:;;;;;;${esc(profile.location)}` : '',
        profile.bio ? `NOTE:${esc(profile.bio)}` : '',
        photoData ? `PHOTO;ENCODING=BASE64;TYPE=JPEG:${photoData}` : '',
        'END:VCARD',
      ].filter(Boolean).join('\r\n');

      // Create blob and use native share API for contact transfer
      const blob = new Blob([vCard], { type: 'text/vcard' });
      const file = new File([blob], `${contactFileName}.vcf`, { type: 'text/vcard' });

      // Try native share API (works on iOS for contact transfer)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `${personName}'s Contact`,
          });
          
          toast({
            title: "Contact Shared",
            description: `${personName}'s contact has been shared`,
          });
        } catch (err) {
          // User cancelled or share failed
          if ((err as Error).name !== 'AbortError') {
            throw err;
          }
        }
      } else {
        // Fallback to download for non-supporting devices
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${contactFileName}.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Contact Saved",
          description: `${personName}'s contact has been saved to your device`,
        });
      }
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
      className="bg-transparent border-none text-primary hover:bg-transparent hover:text-primary/80 text-sm font-medium w-full py-3 animate-pulse-scale"
    >
      <Download className="w-4 h-4 mr-2" />
      transfer contact
    </Button>
  );
};