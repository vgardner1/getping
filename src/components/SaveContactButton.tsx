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
      // Determine person name (first and last) robustly; never use company or handles
      const toTitleCase = (s: string) =>
        (s || '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

      let firstName = (profile as any).first_name?.trim() || '';
      let lastName = (profile as any).last_name?.trim() || '';
      let middleName = '';

      const fromFull = ((profile as any).full_name || profile.display_name || '').trim();

      if (!firstName && !lastName && fromFull) {
        const parts = fromFull.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
          firstName = parts[0];
          lastName = parts[parts.length - 1];
          if (parts.length > 2) middleName = parts.slice(1, -1).join(' ');
        }
      }

      // Use the actual profile display name
      const nameParts = (profile.display_name || '').split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts[nameParts.length - 1] || '';
      if (nameParts.length > 2) {
        middleName = nameParts.slice(1, -1).join(' ');
      }

      // Title case
      if (firstName) firstName = toTitleCase(firstName);
      if (middleName) middleName = toTitleCase(middleName);
      if (lastName) lastName = toTitleCase(lastName);

      // Validate: require full first and last names (>= 2 chars each)
      if (firstName.length < 2 || lastName.length < 2) {
        toast({
          title: 'Missing full name',
          description: 'Please set your full first and last name in your profile before saving the contact.',
          variant: 'destructive',
        });
        return;
      }

      const personName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();
      const contactFileName = `contact_name_-_${personName.replace(/\s+/g, '_')}`;
      
      let photoData = '';
      if (profile.avatar_url && !profile.avatar_url.includes('placeholder.svg')) {
        photoData = await imageToBase64(profile.avatar_url);
      }
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
        profile.phone_number ? `TEL;TYPE=CELL:${esc(profile.phone_number)}` : '',
        profile.website_url ? `URL:${esc(profile.website_url)}` : '',
        profile.location ? `ADR:;;;;;;${esc(profile.location)}` : '',
        profile.bio ? `NOTE:${esc(profile.bio)}` : '',
        photoData ? `PHOTO;ENCODING=BASE64;TYPE=JPEG:${photoData}` : '',
        'END:VCARD',
      ].filter(Boolean).join('\r\n');

      // Create blob and download
      const blob = new Blob([vCard], { type: 'text/vcard' });
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
      className="bg-transparent border-none text-primary hover:bg-transparent hover:text-primary/80 text-sm font-medium w-full py-3"
    >
      <Download className="w-4 h-4 mr-2" />
      save contact
    </Button>
  );
};