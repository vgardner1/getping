import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Creating account for Vaness Gardner');

    const accountDetails = {
      email: 'vanessgar@msn.com',
      password: 'Daurice69!',
      displayName: 'Vaness Gardner',
      jobTitle: 'Traveling Surgical Tech',
      location: 'Austin, Texas',
      bio: 'Traveling surgical technologist specializing in cardiovascular procedures. Currently based in Austin, Texas.'
    };

    // Create the user account using service role
    const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
      email: accountDetails.email,
      password: accountDetails.password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        display_name: accountDetails.displayName
      }
    });

    if (userError) {
      console.error('User creation error:', userError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: userError.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    if (userData.user) {
      // Update the profile with additional details
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({
          display_name: accountDetails.displayName,
          job_title: accountDetails.jobTitle,
          location: accountDetails.location,
          bio: accountDetails.bio,
          company: 'Cardiovascular Surgical Services'
        })
        .eq('user_id', userData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      console.log('Account created successfully for Vaness Gardner');
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Account created successfully for Vaness Gardner',
        user: userData.user 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'No user data returned' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});