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
  } | null;
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
    if (!profile) {
      toast({
        title: 'Profile not loaded',
        description: 'Please wait for the profile to load before saving.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const toTitleCase = (s: string) =>
        (s || '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

      // Get display name directly - this is what we'll use for the contact
      const displayName = (profile.display_name || profile.full_name || '').trim();
      
      if (!displayName) {
        toast({
          title: 'Missing name',
          description: 'This profile doesn\'t have a name set.',
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
        || (typeof profile.social_links?.phone === 'string' ? profile.social_links.phone : profile.social_links?.phone?.url) 
        || '';
      const phone = String(rawPhone).trim();

      // Extract LinkedIn URL from social links
      const linkedinUrl = typeof profile.social_links?.linkedin === 'string' 
        ? profile.social_links.linkedin 
        : profile.social_links?.linkedin?.url || '';

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
        profile.website_url ? `URL;TYPE=WORK:${esc(profile.website_url)}` : '',
        linkedinUrl ? `URL;TYPE=LinkedIn:${esc(linkedinUrl)}` : '',
        profile.location ? `ADR;TYPE=HOME:;;${esc(profile.location)};;;;` : '',
        profile.bio ? `NOTE:${esc(profile.bio)}` : '',
        photoData ? `PHOTO;ENCODING=BASE64;TYPE=JPEG:${photoData}` : '',
        'END:VCARD',
      ].filter(Boolean).join('\r\n');

      // Create blob and use native share API for contact transfer
      const mime = 'text/vcard;charset=utf-8'
      const blob = new Blob([vCard], { type: mime });
      const file = new File([blob], `${contactFileName}.vcf`, { type: mime });
      const url = window.URL.createObjectURL(blob);

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      // 1) Prefer native share with file support when available
      if (navigator.share && (navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: `${personName}'s Contact` });
          toast({ title: "Contact Shared", description: `${personName}'s contact has been shared` });
          return;
        } catch (err) {
          // User cancelled or share failed - continue to open directly on mobile
          if ((err as Error).name === 'AbortError') return;
        }
      }

      // 2) Mobile-first: open the vCard directly so OS shows "Add to Contacts"
      if (isIOS || isAndroid) {
        // Use a data URL with filename hint; iOS/Android will typically route to Contacts
        const dataUrl = `data:text/vcard;charset=utf-8;name=${encodeURIComponent(contactFileName)}.vcf,${encodeURIComponent(vCard)}`;
        // Direct navigation attempt
        window.location.href = dataUrl;
        // Fallback via hidden iframe in case navigation is blocked
        setTimeout(() => {
          try {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = dataUrl;
            document.body.appendChild(iframe);
            setTimeout(() => document.body.removeChild(iframe), 3000);
          } catch {}
        }, 250);

        toast({ title: "Opening Contacts", description: `Importing ${personName}'s contact...` });
        return;
      }

      // 3) Desktop fallback: download the file
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
      Save Contact
    </Button>
  );
};