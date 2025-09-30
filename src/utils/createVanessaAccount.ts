import { supabase } from '@/integrations/supabase/client';

export const createVanessaAccount = async () => {
  const accountDetails = {
    email: 'vanessgar@msn.com',
    password: 'Daurice69!',
    displayName: 'Vanessa Gardner',
    jobTitle: 'Traveling Surgical Tech',
    location: 'Austin, Texas',
    bio: 'Traveling surgical technologist specializing in cardiovascular procedures. Currently based in Austin, Texas.'
  };

  try {
    // Create the account
    const { data, error } = await supabase.auth.signUp({
      email: accountDetails.email,
      password: accountDetails.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          display_name: accountDetails.displayName
        }
      }
    });

    if (error) {
      console.error('Account creation error:', error);
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Update profile with additional details
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: accountDetails.displayName,
          job_title: accountDetails.jobTitle,
          location: accountDetails.location,
          bio: accountDetails.bio,
          company: 'Cardiovascular Surgical Services'
        })
        .eq('user_id', data.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      console.log('Account created successfully for Vanessa Gardner');
      return { success: true, user: data.user };
    }

    return { success: false, error: 'No user data returned' };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};