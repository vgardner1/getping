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
        description: 'Please wait for the profile to load before saving.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Not logged in',
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
          source: 'ping_profile',
          first_contact_date: new Date().toISOString().split('T')[0],
        })
        .select();

      if (error) {
        console.error('Error saving contact:', error);
        throw error;
      }

      console.log('Contact saved successfully:', data);
      toast({
        title: 'Contact saved!',
        description: `${displayName} has been added to your contacts.`,
      });
    } catch (error: any) {
      console.error('Error saving contact:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save contact. Please try again.',
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
