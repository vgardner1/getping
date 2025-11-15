import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();

  const saveContact = async () => {
    if (!profile) {
      toast({
        title: 'Profile not loaded',
        description: 'Please wait for the profile to load.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to save contacts.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const displayName = (
        profile.display_name ||
        profile.full_name ||
        (profile.first_name && profile.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : profile.first_name) ||
        ''
      ).trim();
      
      if (!displayName) {
        toast({
          title: 'Missing name',
          description: 'This profile doesn\'t have a name set.',
          variant: 'destructive',
        });
        return;
      }

      const rawPhone = profile.phone_number 
        || (typeof profile.social_links?.phone === 'string' ? profile.social_links.phone : profile.social_links?.phone?.url) 
        || '';
      const phone = String(rawPhone).trim();

      const linkedinUrl = typeof profile.social_links?.linkedin === 'string' 
        ? profile.social_links.linkedin 
        : profile.social_links?.linkedin?.url || '';

      console.log('Attempting to save contact:', { displayName, email: userEmail, phone });

      // Open native contact card immediately via vCard without download prompt
      try {
        const parts = displayName.split(/\s+/).filter(Boolean);
        const first = parts[0] || '';
        const last = parts.length > 1 ? parts.slice(1).join(' ') : '';
        const esc = (s?: string) => String(s ?? '')
          .replace(/\\/g, "\\\\")
          .replace(/\n/g, "\\n")
          .replace(/,/g, "\\,")
          .replace(/;/g, "\\;");

        const lines = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${esc(last)};${esc(first)};;;`,
          `FN:${esc(displayName)}`,
          profile.job_title ? `TITLE:${esc(profile.job_title)}` : '',
          profile.company ? `ORG:${esc(profile.company)}` : '',
          userEmail ? `EMAIL;TYPE=INTERNET:${esc(userEmail)}` : '',
          phone ? `TEL;TYPE=CELL:${esc(phone)}` : '',
          profile.website_url ? `URL;TYPE=WORK:${esc(profile.website_url)}` : '',
          linkedinUrl ? `URL;TYPE=LinkedIn:${esc(linkedinUrl)}` : '',
          profile.bio ? `NOTE:${esc(profile.bio)}` : '',
          'END:VCARD',
        ].filter(Boolean);

        const vcardText = lines.join('\r\n');
        if (typeof window !== 'undefined') {
          const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.target = '_self'; // open in same tab to trigger native sheet
          a.rel = 'noopener';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 2000);
        }
      } catch (e) {
        console.warn('Inline vCard open skipped:', e);
      }


      // Robust duplicate check without .or() to avoid special-char issues
      let alreadyExists = false;

      // Check by email
      if (userEmail) {
        const { data: byEmail, error: byEmailErr } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', user.id)
          .eq('email', userEmail)
          .limit(1);
        if (byEmailErr) {
          console.warn('Duplicate check (email) skipped due to error:', byEmailErr);
        }
        alreadyExists = !!(byEmail && byEmail.length);
      }

      // Check by phone if not found
      if (!alreadyExists && phone) {
        const { data: byPhone, error: byPhoneErr } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', user.id)
          .eq('phone', phone)
          .limit(1);
        if (byPhoneErr) {
          console.warn('Duplicate check (phone) skipped due to error:', byPhoneErr);
        }
        alreadyExists = !!(byPhone && byPhone.length);
      }

      // Check by exact name if not found (last resort)
      if (!alreadyExists && displayName) {
        const { data: byName, error: byNameErr } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', displayName)
          .limit(1);
        if (byNameErr) {
          console.warn('Duplicate check (name) skipped due to error:', byNameErr);
        }
        alreadyExists = !!(byName && byName.length);
      }

      if (alreadyExists) {
        toast({
          title: 'Already saved',
          description: `${displayName} is already in your contacts.`,
        });
        return;
      }

      // Save to Supabase contacts table
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          name: displayName,
          email: userEmail || null,
          phone: phone || null,
          linkedin_url: linkedinUrl || null,
          company: profile.company || null,
          title: profile.job_title || null,
          where_met: 'Saved from Ping! profile',
          context_notes: profile.bio || null,
          profile_photo_url: profile.avatar_url || null,
          // source omitted to satisfy DB check constraint
          first_contact_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error saving contact:', error);
        toast({
          title: 'Failed to save',
          description: 'Unable to save contact. Please check your connection and try again.',
          variant: 'destructive',
        });
        return;
      }

      if (!data) {
        console.error('No data returned from contact insert');
        toast({
          title: 'Save incomplete',
          description: 'Contact may not have been saved properly.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Contact saved successfully:', data);
      toast({
        title: 'Contact saved!',
        description: `${displayName} has been added to your contacts.`,
      });
    } catch (error: any) {
      console.error('Unexpected error saving contact:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
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
