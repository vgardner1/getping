import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { safeRedirect } from "@/lib/utils";

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

      const displayName = (profile.display_name || profile.full_name || '').trim();
      
      if (!displayName) {
        toast({
          title: 'Missing name',
          description: 'This profile doesn\'t have a name set.',
          variant: 'destructive',
        });
        return;
      }

      const nameParts = displayName.split(/\s+/).filter(Boolean);
      let firstName = nameParts[0] || '';
      let lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      let middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

      firstName = toTitleCase(firstName);
      if (middleName) middleName = toTitleCase(middleName);
      if (lastName) lastName = toTitleCase(lastName);

      const personName = displayName;
      const contactFileName = `${personName.replace(/\s+/g, '_')}-contact`;
      
      let photoData = '';
      if (profile.avatar_url && !profile.avatar_url.includes('placeholder.svg')) {
        photoData = await imageToBase64(profile.avatar_url);
      }

      const rawPhone = profile.phone_number 
        || (typeof profile.social_links?.phone === 'string' ? profile.social_links.phone : profile.social_links?.phone?.url) 
        || '';
      const phone = String(rawPhone).trim();

      const linkedinUrl = typeof profile.social_links?.linkedin === 'string' 
        ? profile.social_links.linkedin 
        : profile.social_links?.linkedin?.url || '';

      // Build Supabase Edge Function vCard URL for reliable native handling
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const functionsBase = supabaseUrl ? supabaseUrl.replace('.supabase.co', '.functions.supabase.co') : '';
      const params = new URLSearchParams({
        fullName: personName,
        title: profile.job_title || '',
        company: profile.company || '',
        email: userEmail || '',
        phone,
        website: profile.website_url || '',
        linkedin: linkedinUrl,
        location: profile.location || '',
        note: profile.bio || '',
      });
      const vcardUrl = functionsBase ? `${functionsBase}/vcard?${params.toString()}` : '';

      // On mobile or inside sandboxed iframes, redirect to the vCard URL to trigger native Contacts
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      let inIframe = false;
      try { inIframe = !!(window.top && window.top !== window); } catch { inIframe = true; }

      if ((isMobile || inIframe) && vcardUrl) {
        safeRedirect(vcardUrl);
        toast({
          title: 'Opening Contacts',
          description: `Adding ${personName}...`,
        });
        return;
      }


      const esc = (val: string) =>
        (val ?? '')
          .replace(/\\/g, '\\\\')
          .replace(/\n/g, '\\n')
          .replace(/,/g, '\\,')
          .replace(/;/g, '\\;');

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

      const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
      const file = new File([blob], `${contactFileName}.vcf`, { type: 'text/vcard' });

      // Try Web Share API first (works best on mobile)
      if (navigator.share && (navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
        try {
          await navigator.share({ 
            files: [file], 
            title: `Add ${personName} to Contacts`,
            text: `Save ${personName}'s contact`
          });
          toast({ 
            title: "Contact Shared", 
            description: `Choose "Add to Contacts" to save ${personName}` 
          });
          return;
        } catch (err) {
          if ((err as Error).name === 'AbortError') return;
          console.log('Share failed, trying download fallback');
        }
      }

      // Fallback: Download vCard (mobile browsers will recognize and offer to import)
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contactFileName}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => window.URL.revokeObjectURL(url), 100);

      toast({
        title: "Contact Ready",
        description: `Tap the file to add ${personName} to your contacts`,
      });
    } catch (error) {
      console.error('Save contact error:', error);
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